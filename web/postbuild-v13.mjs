import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(here, "dist", "index.html");
let html = await readFile(indexPath, "utf8");

html = html
  .replace(/\?web=12/g, "?web=14")
  .replaceAll("https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-api", "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-v2")
  .replaceAll("https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-day", "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-v2")
  .replaceAll("https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-weight", "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-v2")
  .replaceAll("https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-gateway", "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-v2")
  .replace('id="fvWebUser" type="text" autocomplete="username" value="Dani"', 'id="fvWebUser" type="text" autocomplete="username"');

for (const legacy of ["fitvalen-web-api", "fitvalen-web-day", "fitvalen-web-weight", "fitvalen-web-gateway"]) {
  if (html.includes(`/functions/v1/${legacy}`)) {
    throw new Error(`FitValen Web v2 guard: legacy endpoint still present: ${legacy}`);
  }
}
if (!html.includes("/functions/v1/fitvalen-web-v2")) {
  throw new Error("FitValen Web v2 guard: isolated endpoint missing");
}

await writeFile(indexPath, html, "utf8");
console.log("FitValen Web preview -> isolated multiuser v2 · cache web=14");
