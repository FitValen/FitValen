import { login, sessionCookie } from "../../../../lib/secure-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();
const LIMIT = 5;
const WINDOW_MS = 15 * 60_000;

function clientKey(request: Request, username: string): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  return `${ip}:${username.toLocaleLowerCase("es-ES")}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; pin?: string };
    const username = String(body.username || "").trim();
    const pin = String(body.pin || "");
    const key = clientKey(request, username);
    const now = Date.now();
    const attempt = attempts.get(key);
    if (attempt && attempt.resetAt > now && attempt.count >= LIMIT) {
      return Response.json(
        { error: "Demasiados intentos. Prueba de nuevo dentro de 15 minutos." },
        { status: 429 },
      );
    }
    if (!username || !/^\d{4,12}$/.test(pin)) {
      return Response.json({ error: "Usuario o PIN incorrectos." }, { status: 401 });
    }
    const result = await login(username, pin);
    if (!result) {
      attempts.set(key, {
        count: attempt && attempt.resetAt > now ? attempt.count + 1 : 1,
        resetAt: attempt && attempt.resetAt > now ? attempt.resetAt : now + WINDOW_MS,
      });
      return Response.json({ error: "Usuario o PIN incorrectos." }, { status: 401 });
    }
    attempts.delete(key);
    const response = Response.json({ user: result.user });
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    response.headers.append(
      "set-cookie",
      `${sessionCookie.name}=${result.token}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${sessionCookie.maxAge}`,
    );
    return response;
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo iniciar sesión." },
      { status: 500 },
    );
  }
}
