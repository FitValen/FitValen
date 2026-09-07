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
await cp(resolve(here, "home-performance-v1.css"), resolve(out, "home-performance-v1.css"));
await cp(resolve(here, "home-performance-v1.js"), resolve(out, "home-performance-v1.js"));
await cp(resolve(here, "light-performance-v1.css"), resolve(out, "light-performance-v1.css"));
await cp(resolve(here, "web-performance-v2.css"), resolve(out, "web-performance-v2.css"));
await cp(resolve(here, "web-performance-v2.js"), resolve(out, "web-performance-v2.js"));
await cp(resolve(here, "ux-polish-v3.css"), resolve(out, "ux-polish-v3.css"));
await cp(resolve(here, "ux-polish-v3.js"), resolve(out, "ux-polish-v3.js"));

const indexPath = resolve(out, "index.html");
let html = await readFile(indexPath, "utf8");

const gateStyle = `<style data-fv-web-login-gate="1">html.fv-web-logged-out .nav{display:none!important}html.fv-web-logged-out body{padding-bottom:0!important}</style>`;

const productionCss = [
  "enhance-v2.css",
  "workout-v1.css",
  "fullscreen-v1.css",
  "advanced-v1.css",
  "logo-fix-v1.css",
  "exercise-note-v1.css",
  "production-polish-v1.css",
  "home-performance-v1.css",
  "light-performance-v1.css",
  "web-performance-v2.css",
  "ux-polish-v3.css"
].map(function(x){return '<link rel="stylesheet" href="/'+x+'?web=7">'}).join("");

const adapter = `<script data-fv-web-adapter="1">(function(){
  var WEB_API='https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-api';
  var WEB_DAY='https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-day';
  var WEB_WEIGHT='https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-weight';
  var WEB_GATEWAY='https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-gateway';
  var nativeFetch=window.fetch.bind(window);
  function token(){try{return localStorage.getItem('fitvalen_web_session')||''}catch(e){return ''}}
  function syncGate(){var root=document.documentElement,loggedOut=!token();if(loggedOut){if((' '+root.className+' ').indexOf(' fv-web-logged-out ')<0){root.className=(root.className+' fv-web-logged-out').replace(/^\\s+|\\s+$/g,'')}}else{root.className=(' '+root.className+' ').replace(' fv-web-logged-out ',' ').replace(/^\\s+|\\s+$/g,'')}}
  syncGate();
  function isMiniAppCall(input,init){
    if(!init||String(init.method||'GET').toUpperCase()!=='POST'){return false}
    var url=typeof input==='string'?input:(input&&input.url?input.url:'');
    if(url!==window.location.href){return false}
    var h=init.headers||{};
    if(typeof Headers!=='undefined'&&h instanceof Headers){return h.has('x-telegram-init-data')}
    return Object.prototype.hasOwnProperty.call(h,'x-telegram-init-data')||Object.prototype.hasOwnProperty.call(h,'X-Telegram-Init-Data');
  }
  function actionFromBody(body){
    var raw='';
    try{raw=typeof body==='string'?body:String(body||'')}catch(e){raw=''}
    try{var j=JSON.parse(raw);if(j&&j.action){return String(j.action)}}catch(e){}
    return '';
  }
  function readAction(a){return a==='home'||a==='diet'||a==='workouts'||a==='progress'}
  window.fetch=function(input,init){
    if(!isMiniAppCall(input,init)){return nativeFetch(input,init)}
    var t=token();
    if(!t){return Promise.resolve(new Response(JSON.stringify({ok:false,error:'unauthorized'}),{status:401,headers:{'content-type':'application/json'}}))}
    var h=new Headers(init.headers||{});
    h.delete('x-telegram-init-data');
    h.set('authorization','Bearer '+t);
    h.set('content-type','application/json');
    var action=actionFromBody(init.body),endpoint=WEB_GATEWAY;
    if(readAction(action)){endpoint=WEB_API}
    if(action==='start_day'){endpoint=WEB_DAY}
    if(action==='set_weight'){endpoint=WEB_WEIGHT}
    return nativeFetch(endpoint,{method:'POST',headers:h,body:init.body}).then(function(r){
      if(r.status===401){try{localStorage.removeItem('fitvalen_web_session');localStorage.removeItem('fitvalen_web_session_expires')}catch(e){}setTimeout(function(){location.reload()},30)}
      return r;
    });
  };
})();</script>`;

const productionLoader = `<script data-fv-web-production-loader="1">(function(){
  function token(){try{return localStorage.getItem('fitvalen_web_session')||''}catch(e){return ''}}
  if(!token()){return}
  var files=['fullscreen-safe-v2.js','enhance-v2.js','@wait-workout','workout-input-context-v1.js','advanced-v1.js','exercise-note-v2.js','advanced-guards-v1.js','manual-food-validation-v1.js','diet-reopen-refresh-v1.js','auto-day-v1.js','header-logo-v1.js','fullscreen-v1.js','home-performance-v1.js','web-performance-v2.js','ux-polish-v3.js'];
  var i=0;
  function next(){
    if(i>=files.length){return}
    var file=files[i++];
    if(file==='@wait-workout'){
      var tries=0;
      (function wait(){var s=document.querySelector('script[src*="workout-v2.js"]');if(s||tries>20){setTimeout(next,80);return}tries++;setTimeout(wait,25)})();
      return;
    }
    var s=document.createElement('script');s.src='/'+file+'?web=7';s.setAttribute('data-fv-web-production','1');s.onload=next;s.onerror=next;document.body.appendChild(s)
  }
  next();
})();</script>`;

html = html
  .replace("<title>FitValen</title>", "<title>FitValen Web</title>")
  .replace('<meta name="theme-color" content="#090b0f">', '<meta name="theme-color" content="#f5f7f6">')
  .replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>', "")
  .replace("</head>", gateStyle + productionCss + adapter + "</head>")
  .replace(/Entreno editable en la siguiente fase/g, "Entrenamiento disponible")
  .replace(/\?'En curso':'Lectura'/g, "?'En curso':'Disponible'")
  .replace(
    "status.textContent='Abre desde Telegram';get('home').innerHTML='<div class=\"hero\"><div class=\"ey\">FitValen Mini App</div><div class=\"big\" style=\"font-size:27px\">Sesión no disponible</div><div class=\"small\">Abre FitValen desde el botón del bot.</div></div>';return",
    "var webToken='';try{webToken=localStorage.getItem('fitvalen_web_session')||''}catch(ignore){}if(!webToken){status.textContent='Acceso privado';get('home').innerHTML='<div class=\"hero\"><div class=\"ey\">FitValen Web</div><div class=\"big\" style=\"font-size:27px\">Iniciar sesión</div><div class=\"small\">Acceso privado a FitValen.</div></div><div class=\"card\"><div class=\"fvField\"><label>Usuario</label><input class=\"input\" id=\"fvWebUser\" type=\"text\" autocomplete=\"username\" value=\"Dani\"></div><div class=\"fvField\" style=\"margin-top:10px\"><label>Contraseña</label><input class=\"input\" id=\"fvWebPass\" type=\"password\" autocomplete=\"current-password\" placeholder=\"••••••••\"></div><button class=\"actionbtn primary wide\" style=\"margin-top:12px\" id=\"fvWebLogin\">Entrar</button><div class=\"small\" id=\"fvWebLoginMsg\" style=\"margin-top:10px\"></div></div>';var loginBtn=get('fvWebLogin'),userInput=get('fvWebUser'),passInput=get('fvWebPass'),msg=get('fvWebLoginMsg');function doWebLogin(){if(!loginBtn||loginBtn.disabled){return}var u=String(userInput&&userInput.value||'').replace(/^\\s+|\\s+$/g,''),p=String(passInput&&passInput.value||'');if(!u||!p){if(msg){msg.textContent='Introduce usuario y contraseña.'}return}loginBtn.disabled=true;if(msg){msg.textContent='Comprobando…'}fetch('https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-web-auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:u,password:p})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok||!j.data||!j.data.token){if(j&&j.error==='too_many_attempts'){throw new Error('Demasiados intentos. Prueba de nuevo más tarde.')}throw new Error('Usuario o contraseña incorrectos.')}return j.data})}).then(function(d){try{localStorage.setItem('fitvalen_web_session',d.token);localStorage.setItem('fitvalen_web_session_expires',d.expires_at||'')}catch(e){}if(passInput){passInput.value=''}location.reload()}).catch(function(e){loginBtn.disabled=false;if(passInput){passInput.value=''}if(msg){msg.textContent=e&&e.message?e.message:String(e)}})}if(loginBtn){loginBtn.onclick=doWebLogin}if(passInput){passInput.onkeydown=function(e){if(e.key==='Enter'){doWebLogin()}}}return}initData='web-session';status.textContent='Web · conectado'"
  );

const logout = `<script data-fv-web-logout="1">(function(){
  function install(){
    var top=document.querySelector('.topactions');
    if(!top||document.getElementById('fvWebLogout')){return}
    var b=document.createElement('button');
    b.id='fvWebLogout';b.className='iconbtn';b.title='Cerrar sesión';b.textContent='↪';
    b.onclick=function(){try{localStorage.removeItem('fitvalen_web_session');localStorage.removeItem('fitvalen_web_session_expires')}catch(e){}location.reload()};
    top.appendChild(b);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();</script>`;
html = html.replace("</body>", productionLoader + logout + "</body>");

await writeFile(indexPath, html, "utf8");
console.log("FitValen Web V1 built -> authenticated full gateway + Light Performance v2 + UX Polish v3");
