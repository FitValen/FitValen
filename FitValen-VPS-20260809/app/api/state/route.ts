import { cookies } from "next/headers";
import { getUserState, saveUserState, sessionCookie } from "../../../lib/secure-store";
import type { FitValenState } from "../../fitvalen-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 256_000;

async function token() {
  return (await cookies()).get(sessionCookie.name)?.value;
}

export async function GET() {
  try {
    const state = await getUserState(await token());
    return state
      ? Response.json({ state })
      : Response.json({ error: "Sesión no iniciada." }, { status: 401 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudieron cargar los datos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      return Response.json({ error: "Los datos superan el tamaño permitido." }, { status: 413 });
    }
    const state = await saveUserState(await token(), JSON.parse(raw) as FitValenState);
    return state
      ? Response.json({ state, saved: true })
      : Response.json({ error: "Sesión no iniciada." }, { status: 401 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudieron guardar los datos." },
      { status: 400 },
    );
  }
}
