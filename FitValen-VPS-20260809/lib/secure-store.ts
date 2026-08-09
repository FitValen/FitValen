import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";
import {
  createDefaultState,
  type FitValenRole,
  type FitValenState,
} from "../app/fitvalen-state";

const SESSION_DAYS = 400;

type PinRecord = { salt: string; hash: string };
type StoredUser = {
  id: string;
  username: string;
  displayName: string;
  role: FitValenRole;
  pin: PinRecord;
  state: FitValenState;
};
type StoredSession = {
  tokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};
type Store = { version: 1; users: StoredUser[]; sessions: StoredSession[] };
type Envelope = {
  version: 1;
  algorithm: "aes-256-gcm";
  iv: string;
  tag: string;
  ciphertext: string;
};

let queue: Promise<unknown> = Promise.resolve();

function dataFile(): string {
  return join(process.cwd(), "data", "fitvalen.enc.json");
}

function encryptionKey(): Buffer {
  const configured = process.env.FITVALEN_ENCRYPTION_KEY?.trim();
  if (!configured) throw new Error("Falta FITVALEN_ENCRYPTION_KEY en el entorno de la VPS.");
  const key = /^[a-f0-9]{64}$/i.test(configured)
    ? Buffer.from(configured, "hex")
    : Buffer.from(configured, "base64");
  if (key.length !== 32) {
    throw new Error("FITVALEN_ENCRYPTION_KEY debe contener exactamente 32 bytes.");
  }
  return key;
}

function encrypt(store: Store): Envelope {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(store), "utf8"),
    cipher.final(),
  ]);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

function decrypt(envelope: Envelope): Store {
  if (envelope.version !== 1 || envelope.algorithm !== "aes-256-gcm") {
    throw new Error("El archivo de datos usa un formato no compatible.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(envelope.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
  const value = JSON.parse(plaintext) as Store;
  if (value.version !== 1 || !Array.isArray(value.users) || !Array.isArray(value.sessions)) {
    throw new Error("El contenido descifrado no tiene un formato válido.");
  }
  return value;
}

async function hashPin(pin: string, salt = randomBytes(16)): Promise<PinRecord> {
  const derived = await new Promise<Buffer>((resolveValue, reject) => {
    nodeScrypt(pin, salt, 32, {
      N: 32768,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    }, (error, key) => error ? reject(error) : resolveValue(key));
  });
  return { salt: salt.toString("base64"), hash: derived.toString("base64") };
}

async function verifyPin(pin: string, record: PinRecord): Promise<boolean> {
  const candidate = await hashPin(pin, Buffer.from(record.salt, "base64"));
  const expected = Buffer.from(record.hash, "base64");
  const received = Buffer.from(candidate.hash, "base64");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function requiredPin(name: string): string {
  const pin = process.env[name]?.trim() || "";
  if (!/^\d{4,12}$/.test(pin)) {
    throw new Error(`${name} debe ser un PIN numérico de entre 4 y 12 cifras.`);
  }
  return pin;
}

function normalizeUsername(value: string): string {
  return value.trim().toLocaleLowerCase("es-ES").replace(/[^a-z0-9._-]/g, "").slice(0, 40);
}

async function bootstrapStore(): Promise<Store> {
  const definitions = [
    {
      username: normalizeUsername(process.env.FITVALEN_ADMIN_USERNAME || "daniel"),
      displayName: process.env.FITVALEN_ADMIN_NAME?.trim() || "Daniel Valenzuela",
      role: "admin" as const,
      pin: requiredPin("FITVALEN_ADMIN_PIN"),
    },
    {
      username: normalizeUsername(process.env.FITVALEN_MEMBER_USERNAME || "usuario2"),
      displayName: process.env.FITVALEN_MEMBER_NAME?.trim() || "Usuario 2",
      role: "member" as const,
      pin: requiredPin("FITVALEN_MEMBER_PIN"),
    },
  ];
  if (definitions[0].username === definitions[1].username) {
    throw new Error("Los dos nombres de usuario deben ser diferentes.");
  }
  return {
    version: 1,
    users: await Promise.all(definitions.map(async (definition) => ({
      id: randomUUID(),
      username: definition.username,
      displayName: definition.displayName,
      role: definition.role,
      pin: await hashPin(definition.pin),
      state: createDefaultState(definition.displayName, definition.role),
    }))),
    sessions: [],
  };
}

async function readStore(): Promise<Store> {
  try {
    return decrypt(JSON.parse(await readFile(dataFile(), "utf8")) as Envelope);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const store = await bootstrapStore();
    await writeStore(store);
    return store;
  }
}

async function writeStore(store: Store): Promise<void> {
  const target = dataFile();
  await mkdir(dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(encrypt(store), null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporary, target);
}

async function locked<T>(operation: (store: Store) => Promise<T>): Promise<T> {
  const current = queue.then(async () => {
    const store = await readStore();
    const result = await operation(store);
    await writeStore(store);
    return result;
  });
  queue = current.catch(() => undefined);
  return current;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function publicUser(user: StoredUser) {
  return { id: user.id, username: user.username, displayName: user.displayName, role: user.role };
}

export async function login(username: string, pin: string) {
  return locked(async (store) => {
    const user = store.users.find((candidate) => candidate.username === normalizeUsername(username));
    if (!user || !(await verifyPin(pin, user.pin))) return null;
    const token = randomBytes(32).toString("base64url");
    const now = Date.now();
    store.sessions = store.sessions.filter((session) => new Date(session.expiresAt).getTime() > now);
    store.sessions.push({
      tokenHash: tokenHash(token),
      userId: user.id,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_DAYS * 86400_000).toISOString(),
    });
    return { token, user: publicUser(user) };
  });
}

export async function sessionUser(token: string | undefined) {
  if (!token) return null;
  return locked(async (store) => {
    const hash = tokenHash(token);
    const now = Date.now();
    store.sessions = store.sessions.filter((session) => new Date(session.expiresAt).getTime() > now);
    const session = store.sessions.find((candidate) => candidate.tokenHash === hash);
    const user = session && store.users.find((candidate) => candidate.id === session.userId);
    return user ? publicUser(user) : null;
  });
}

export async function logout(token: string | undefined): Promise<void> {
  if (!token) return;
  await locked(async (store) => {
    const hash = tokenHash(token);
    store.sessions = store.sessions.filter((session) => session.tokenHash !== hash);
  });
}

function authorizedUser(store: Store, token: string | undefined): StoredUser | undefined {
  if (!token) return undefined;
  const hash = tokenHash(token);
  const session = store.sessions.find(
    (candidate) => candidate.tokenHash === hash && new Date(candidate.expiresAt).getTime() > Date.now(),
  );
  return session && store.users.find((candidate) => candidate.id === session.userId);
}

export async function getUserState(token: string | undefined): Promise<FitValenState | null> {
  if (!token) return null;
  return locked(async (store) => {
    const user = authorizedUser(store, token);
    return user ? structuredClone(user.state) : null;
  });
}

export async function saveUserState(token: string | undefined, state: FitValenState) {
  if (!token) return null;
  return locked(async (store) => {
    const user = authorizedUser(store, token);
    if (!user) return null;
    user.state = sanitizeState(state, user);
    return structuredClone(user.state);
  });
}

function bounded(value: unknown, fallback: number, maximum: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(maximum, value))
    : fallback;
}

function sanitizeState(value: FitValenState, user: StoredUser): FitValenState {
  const fallback = user.state;
  const sets = Array.isArray(value?.workout?.completedSets)
    ? value.workout.completedSets.slice(0, 50).map(Boolean)
    : fallback.workout.completedSets;
  const weights = Array.isArray(value?.workout?.weightsKg)
    ? value.workout.weightsKg.slice(0, sets.length).map((item, index) =>
        bounded(item, fallback.workout.weightsKg[index] ?? 0, 1000))
    : fallback.workout.weightsKg;
  const repetitions = Array.isArray(value?.workout?.repetitions)
    ? value.workout.repetitions.slice(0, sets.length).map((item, index) =>
        Math.round(bounded(item, fallback.workout.repetitions[index] ?? 0, 1000)))
    : fallback.workout.repetitions;
  while (weights.length < sets.length) weights.push(0);
  while (repetitions.length < sets.length) repetitions.push(0);

  return {
    version: 1,
    profile: { displayName: user.displayName, username: user.username, role: user.role },
    hydration: {
      waterMl: Math.round(bounded(value?.hydration?.waterMl, fallback.hydration.waterMl, 20_000)),
      dailyGoalMl: Math.round(bounded(value?.hydration?.dailyGoalMl, fallback.hydration.dailyGoalMl, 20_000)),
    },
    workout: { completedSets: sets, weightsKg: weights, repetitions },
    activity: Array.isArray(value?.activity)
      ? value.activity.slice(-200).filter((entry) =>
          entry && ["water", "workout", "weight", "meal"].includes(entry.type),
        ).map((entry) => ({
          id: String(entry.id || randomUUID()).slice(0, 80),
          type: entry.type,
          message: String(entry.message || "Actividad actualizada").slice(0, 160),
          createdAt: String(entry.createdAt || new Date().toISOString()).slice(0, 40),
        }))
      : fallback.activity,
    updatedAt: new Date().toISOString(),
  };
}

export const sessionCookie = { name: "fitvalen_session", maxAge: SESSION_DAYS * 86400 };
