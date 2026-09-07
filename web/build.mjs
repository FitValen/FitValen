import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = resolve(root, "miniapp");
const out = resolve(here, "dist");

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(source, out, { recursive: true });

const indexPath = resolve(out, "index.html");
let html = await readFile(indexPath, "utf8");

// Web V1 starts from the current Telegram Mini App source without touching production.
// Until web authentication is connected, never fabricate data or call the Telegram-only API.
html = html
  .replace("<title>FitValen</title>", "<title>FitValen Web</title>")
  .replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>', "")
  .replace("status.textContent='Abre desde Telegram';get('home').innerHTML='<div class=\"hero\"><div class=\"ey\">FitValen Mini App</div><div class=\"big\" style=\"font-size:27px\">Sesión no disponible</div><div class=\"small\">Abre FitValen desde el botón del bot.</div></div>';return", "status.textContent='Web V1 · acceso privado';get('home').innerHTML='<div class=\"hero\"><div class=\"ey\">FitValen Web</div><div class=\"big\" style=\"font-size:27px\">Base web preparada</div><div class=\"small\">Esta versión parte de la Mini App actual. El siguiente paso es conectar autenticación web segura y después los mismos datos reales de FitValen.</div></div><div class=\"card brain\"><div class=\"ey\">⚡ Transición segura</div><div class=\"braintext\">Telegram y producción siguen intactos mientras construimos y validamos la web.</div></div>';return");

await writeFile(indexPath, html, "utf8");
console.log("FitValen Web V1 built from miniapp source -> web/dist");
