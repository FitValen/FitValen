import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(here, "dist", "index.html");
let html = await readFile(indexPath, "utf8");

html = html
  .replace(/\?web=12/g, "?web=15")
  .replaceAll("https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-api", "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-v2")
  .replaceAll("https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-day", "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-v2")
  .replaceAll("https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-weight", "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-v2")
  .replaceAll("https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-gateway", "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-v2")
  .replace('id="fvWebUser" type="text" autocomplete="username" value="Dani"', 'id="fvWebUser" type="text" autocomplete="username"')
  .replace("?'En curso':'Disponible'", "?'En curso':'Consulta'");

for (const legacy of ["fitvalen-web-api", "fitvalen-web-day", "fitvalen-web-weight", "fitvalen-web-gateway"]) {
  if (html.includes(`/functions/v1/${legacy}`)) {
    throw new Error(`FitValen Web v2 guard: legacy endpoint still present: ${legacy}`);
  }
}
if (!html.includes("/functions/v1/fitvalen-web-v2")) {
  throw new Error("FitValen Web v2 guard: isolated endpoint missing");
}

const workoutPath = resolve(here, "dist", "workout-v2.js");
let workout = await readFile(workoutPath, "utf8");
const workoutBefore = workout;
workout = workout.replace(
  `function inactiveHtml(day){return '<div class="fvStartCard"><div><div class="fvEy">MODO BESTIA</div><div class="fvStartTitle">Día '+day+'</div><div class="fvStartMeta">Elige el día y entra en modo foco.</div></div><button id="fvStart" class="fvPrimary">▶ Empezar Día '+day+'</button></div>'}`,
  `function inactiveHtml(day){return '<div class="fvStartCard"><div><div class="fvEy">CONSULTA · NO INICIADO</div><div class="fvStartTitle">Día '+day+'</div><div class="fvStartMeta">Ver la rutina no inicia el entrenamiento. Solo el botón lo inicia.</div></div><button id="fvStart" class="fvPrimary">▶ Empezar entrenamiento · Día '+day+'</button></div>'}`
);
if (workout === workoutBefore) {
  throw new Error("FitValen Web guard: inactive workout card signature changed");
}
await writeFile(workoutPath, workout, "utf8");

const enhancePath = resolve(here, "dist", "enhance-v2.js");
let enhance = await readFile(enhancePath, "utf8");
const enhanceBefore = enhance;
enhance = enhance.replace("/workout-v2.js?v=cfe81f1", "/workout-v2.js?v=consult-v1");
if (enhance === enhanceBefore) {
  throw new Error("FitValen Web guard: workout loader cache signature changed");
}
await writeFile(enhancePath, enhance, "utf8");

await writeFile(indexPath, html, "utf8");
console.log("FitValen Web multiuser v2 · workout consultation guard · cache web=15");
