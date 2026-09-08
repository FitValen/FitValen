import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(here, "dist", "index.html");
let html = await readFile(indexPath, "utf8");
html = html.replace(/\?web=12/g, "?web=13");
await writeFile(indexPath, html, "utf8");
console.log("FitValen Web postbuild -> cache bust web=13");
