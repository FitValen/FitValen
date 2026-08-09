import { cookies } from "next/headers";
import { logout, sessionCookie } from "../../../../lib/secure-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  await logout(cookieStore.get(sessionCookie.name)?.value);
  const response = Response.json({ loggedOut: true });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "set-cookie",
    `${sessionCookie.name}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
