import { randomBytes } from "node:crypto";
import { access, chmod, copyFile, readFile, writeFile } from "node:fs/promises";

const envPath = new URL("../.env", import.meta.url);
const examplePath = new URL("../.env.example", import.meta.url);
const adminPin = process.argv[2]?.trim();

if (!/^\d{4,12}$/.test(adminPin ?? "")) {
  console.error("Uso: npm run setup-access -- <PIN administrador de 4 a 12 cifras>");
  process.exit(1);
}

try {
  await access(envPath);
  console.error("El archivo .env ya existe. No se ha sobrescrito.");
  process.exit(1);
} catch {
  await copyFile(examplePath, envPath);
}

const replaceSetting = (source, name, value) =>
  source.replace(new RegExp(`^${name}=.*$`, "m"), `${name}=${value}`);

let contents = await readFile(envPath, "utf8");
contents = replaceSetting(contents, "FITVALEN_ENCRYPTION_KEY", randomBytes(32).toString("base64"));
contents = replaceSetting(contents, "FITVALEN_ADMIN_PIN", adminPin);
contents = replaceSetting(contents, "FITVALEN_MEMBER_PIN", randomBytes(6).readUIntBE(0, 6).toString().slice(0, 12));
await writeFile(envPath, contents, { encoding: "utf8", mode: 0o600 });
await chmod(envPath, 0o600);

console.log("Acceso configurado. Usuario administrador: admin");
