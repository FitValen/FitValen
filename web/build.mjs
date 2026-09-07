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
// Web authentication is isolated from Telegram and never stores the raw password in the frontend.
html = html
  .replace("<title>FitValen</title>", "<title>FitValen Web</title>")
  .replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>', "")
  .replace(
    "status.textContent='Abre desde Telegram';get('home').innerHTML='<div class=\"hero\"><div class=\"ey\">FitValen Mini App</div><div class=\"big\" style=\"font-size:27px\">Sesión no disponible</div><div class=\"small\">Abre FitValen desde el botón del bot.</div></div>';return",
    "var webToken='';try{webToken=localStorage.getItem('fitvalen_web_session')||''}catch(ignore){}if(!webToken){status.textContent='Acceso privado';get('home').innerHTML='<div class=\"hero\"><div class=\"ey\">FitValen Web</div><div class=\"big\" style=\"font-size:27px\">Iniciar sesión</div><div class=\"small\">Acceso privado a FitValen.</div></div><div class=\"card\"><div class=\"fvField\"><label>Usuario</label><input class=\"input\" id=\"fvWebUser\" type=\"text\" autocomplete=\"username\" value=\"Dani\"></div><div class=\"fvField\" style=\"margin-top:10px\"><label>Contraseña</label><input class=\"input\" id=\"fvWebPass\" type=\"password\" autocomplete=\"current-password\" placeholder=\"••••••••\"></div><button class=\"actionbtn primary wide\" style=\"margin-top:12px\" id=\"fvWebLogin\">Entrar</button><div class=\"small\" id=\"fvWebLoginMsg\" style=\"margin-top:10px\"></div></div>';var loginBtn=get('fvWebLogin'),userInput=get('fvWebUser'),passInput=get('fvWebPass'),msg=get('fvWebLoginMsg');function doWebLogin(){if(!loginBtn||loginBtn.disabled){return}var u=String(userInput&&userInput.value||'').replace(/^\\s+|\\s+$/g,''),p=String(passInput&&passInput.value||'');if(!u||!p){if(msg){msg.textContent='Introduce usuario y contraseña.'}return}loginBtn.disabled=true;if(msg){msg.textContent='Comprobando…'}fetch('https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:u,password:p})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok||!j.data||!j.data.token){if(j&&j.error==='too_many_attempts'){throw new Error('Demasiados intentos. Prueba de nuevo más tarde.')}throw new Error('Usuario o contraseña incorrectos.')}return j.data})}).then(function(d){try{localStorage.setItem('fitvalen_web_session',d.token);localStorage.setItem('fitvalen_web_session_expires',d.expires_at||'')}catch(e){}if(passInput){passInput.value=''}location.reload()}).catch(function(e){loginBtn.disabled=false;if(passInput){passInput.value=''}if(msg){msg.textContent=e&&e.message?e.message:String(e)}})}if(loginBtn){loginBtn.onclick=doWebLogin}if(passInput){passInput.onkeydown=function(e){if(e.key==='Enter'){doWebLogin()}}}return}status.textContent='Web · sesión activa';get('home').innerHTML='<div class=\"hero\"><div class=\"ey\">FitValen Web</div><div class=\"big\" style=\"font-size:27px\">Sesión web activa</div><div class=\"small\">Autenticación web correcta. El siguiente paso es conectar esta sesión a los mismos datos reales de FitValen.</div></div><div class=\"card brain\"><div class=\"ey\">⚡ Transición segura</div><div class=\"braintext\">Telegram y producción siguen intactos.</div></div><button class=\"actionbtn wide\" id=\"fvWebLogout\">Cerrar sesión</button>';var logout=get('fvWebLogout');if(logout){logout.onclick=function(){try{localStorage.removeItem('fitvalen_web_session');localStorage.removeItem('fitvalen_web_session_expires')}catch(e){}location.reload()}}return"
  );

await writeFile(indexPath, html, "utf8");
console.log("FitValen Web V1 built from miniapp source -> web/dist");
