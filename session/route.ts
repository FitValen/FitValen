import { cookies } from "next/headers";
import { sessionCookie, sessionUser } from "../../../../lib/secure-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = (await cookies()).get(sessionCookie.name)?.value;
    const user = await sessionUser(token);
    return user
      ? Response.json({ user })
      : Response.json({ error: "Sesión no iniciada." }, { status: 401 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo comprobar la sesión." },
      { status: 500 },
    );
  }
}
