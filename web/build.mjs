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

/*
 * Runtime visual contract:
 * one Web stylesheet is emitted: fv-web-foundation-v1.css.
 * Final QA rules live in a small source module and are concatenated at build
 * time so the browser still receives a single visual owner.
 */
const foundationOutPath = resolve(out, "fv-web-foundation-v1.css");
const foundationCss = await readFile(resolve(here, "fv-web-foundation-v1.css"), "utf8");
const qaCss = await readFile(resolve(here, "fv-web-qa-v1.css"), "utf8");
await writeFile(foundationOutPath, foundationCss + "\n\n" + qaCss, "utf8");

/*
 * Web-only compatibility patches.
 * We keep the proven functional Mini App modules, but remove the pieces that
 * mutate browser chrome or inject Telegram-only visual CSS at runtime.
 * Source files under miniapp/ remain untouched for Telegram production.
 */
const guardsPath = resolve(out, "advanced-guards-v1.js");
let guards = await readFile(guardsPath, "utf8");
const guardsBefore = guards;
guards = guards.replace(
  /  function patchChrome\(\)\{[^\n]*\}\n  function patchProgress\(\)\{/,
  "  function patchChrome(){var status=document.getElementById('status');if(status&&text(status).indexOf('Conectado')===0&&text(status)!=='Conectado'){status.textContent='Conectado'}}\n  function patchProgress(){"
);
if (guards === guardsBefore) {
  throw new Error("FitValen Web build guard: patchChrome signature changed");
}

/*
 * advanced-guards used to intercept progress_v2 fetches and mutate the same
 * progress DOM several times after the main renderer had already painted it.
 * On Web, advanced-v1 is the single owner of the Progress view. Keep the
 * non-progress guards (manual food / finish confirmations) but remove the
 * secondary progress fetch wrapper and initial visual patch.
 */
const guardsFetchBefore = guards;
guards = guards.replace(
  /\n  if\(nativeFetch\)\{window\.fetch=function\(\)\{[^\n]*\}\}\n/,
  "\n"
);
if (guards === guardsFetchBefore) {
  throw new Error("FitValen Web build guard: progress fetch interceptor signature changed");
}
const guardsObserveBefore = guards;
guards = guards.replace(
  "function observe(){augmentProductSheet();patchChrome();patchProgress();",
  "function observe(){augmentProductSheet();patchChrome();"
);
if (guards === guardsObserveBefore) {
  throw new Error("FitValen Web build guard: progress observer signature changed");
}
await writeFile(guardsPath, guards, "utf8");

const advancedPath = resolve(out, "advanced-v1.js");
let advanced = await readFile(advancedPath, "utf8");
const advancedBefore = advanced;
advanced = advanced.replace(
  "if(tab==='progress')setTimeout(function(){loadProgress(false)},150)",
  "if(tab==='progress')loadProgress(false)"
);
if (advanced === advancedBefore) {
  throw new Error("FitValen Web build guard: progress nav binding signature changed");
}

/*
 * Cached Progress data must not repaint the complete DOM every time the user
 * revisits the tab. A forced refresh remains available through one explicit
 * global hook used only by the top refresh button.
 */
const advancedProgressBefore = advanced;
advanced = advanced.replace(
  "function loadProgress(force){var now=Date.now();if(progressData&&!force&&now-progressLoadedAt<30000){renderProgress(progressData);return}request('progress_v2',{}).then(function(d){progressLoadedAt=Date.now();renderProgress(d)}).catch(function(e){notify(friendly(e))})}",
  "function loadProgress(force){var now=Date.now(),root=document.getElementById('progress');if(progressData&&!force&&now-progressLoadedAt<30000){if(root&&root.querySelector('.fvAdvancedProgress')){return}renderProgress(progressData);return}request('progress_v2',{}).then(function(d){progressLoadedAt=Date.now();renderProgress(d)}).catch(function(e){notify(friendly(e))})}window.__fvLoadProgress=function(force){loadProgress(!!force)}"
);
if (advanced === advancedProgressBefore) {
  throw new Error("FitValen Web build guard: progress loader signature changed");
}
await writeFile(advancedPath, advanced, "utf8");

const enhancePath = resolve(out, "enhance-v2.js");
let enhance = await readFile(enhancePath, "utf8");
const enhanceBefore = enhance;
enhance = enhance.replace(
  /\n\(function\(\)\{\n  function loadSafeArea\(\)[\s\S]*?\n\}\)\(\);\s*$/,
  "\n"
);
if (enhance === enhanceBefore) {
  throw new Error("FitValen Web build guard: Telegram safe-area loader signature changed");
}
await writeFile(enhancePath, enhance, "utf8");

const autoDayPath = resolve(out, "auto-day-v1.js");
let autoDay = await readFile(autoDayPath, "utf8");
const autoDayBefore = autoDay;
autoDay = autoDay.replace(
  /  function installGoalStyles\(\)\{[\s\S]*?\n  \}\n  function currentCalories\(\)\{/,
  "  function installGoalStyles(){/* Web visual ownership: fv-web-foundation-v1.css */}\n  function currentCalories(){"
);
if (autoDay === autoDayBefore) {
  throw new Error("FitValen Web build guard: dashboard goal style signature changed");
}
await writeFile(autoDayPath, autoDay, "utf8");

const indexPath = resolve(out, "index.html");
let html = await readFile(indexPath, "utf8");

/*
 * Base Mini App also owns a legacy Progress renderer. Running it together with
 * advanced-v1 caused a first render followed by a second full innerHTML render,
 * perceived as a page refresh. Disable the legacy Progress render on Web.
 */
const progressOwnerBefore = html;
html = html.replace(
  "if(name==='progress'){load('progress','progress',renderProgress,false)}",
  "if(name==='progress'){/* Web: advanced-v1 is the only Progress renderer. */}"
);
if (html === progressOwnerBefore) {
  throw new Error("FitValen Web build guard: base progress renderer signature changed");
}

const refreshBefore = html;
html = html.replace(
  "refresh.onclick=function(){var key=currentTab,action=key==='work'?'workouts':key,renderer=key==='home'?renderHome:key==='diet'?renderDiet:key==='work'?renderWork:renderProgress;showSkeleton(key);load(action,key,renderer,true);haptic()};",
  "refresh.onclick=function(){var key=currentTab;if(key==='progress'){if(window.__fvLoadProgress){window.__fvLoadProgress(true)}else{var pb=document.querySelector('.nav button[data-tab=\"progress\"]');if(pb){pb.click()}}haptic();return}var action=key==='work'?'workouts':key,renderer=key==='home'?renderHome:key==='diet'?renderDiet:renderWork;showSkeleton(key);load(action,key,renderer,true);haptic()};"
);
if (html === refreshBefore) {
  throw new Error("FitValen Web build guard: refresh handler signature changed");
}

const gateStyle = `<style data-fv-web-login-gate="1">html.fv-web-logged-out .nav{display:none!important}html.fv-web-logged-out body{padding-bottom:0!important}</style>`;

/*
 * CSS architecture for Web:
 * 1) inline base from Mini App = structural fallback
 * 2) workout/advanced/note = structural styles for generated functional DOM
 * 3) fv-web-foundation-v1.css = the only Web visual owner, loaded last
 */
const productionCss = [
  "workout-v1.css",
  "advanced-v1.css",
  "exercise-note-v1.css",
  "fv-web-foundation-v1.css"
].map(function(x){return '<link rel="stylesheet" href="/'+x+'?web=12">'}).join("");

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

/*
 * Only functional runtime modules are loaded here.
 * Removed from Web: fullscreen chrome, home-performance, web-performance and
 * ux-polish visual mutators. They remain in repository history, not runtime.
 */
const productionLoader = `<script data-fv-web-production-loader="1">(function(){
  function token(){try{return localStorage.getItem('fitvalen_web_session')||''}catch(e){return ''}}
  if(!token()){return}
  var files=['enhance-v2.js','@wait-workout','workout-input-context-v1.js','advanced-v1.js','exercise-note-v2.js','advanced-guards-v1.js','manual-food-validation-v1.js','diet-reopen-refresh-v1.js','auto-day-v1.js','header-logo-v1.js'];
  var i=0;
  function next(){
    if(i>=files.length){return}
    var file=files[i++];
    if(file==='@wait-workout'){
      var tries=0;
      (function wait(){var s=document.querySelector('script[src*="workout-v2.js"]');if(s||tries>20){setTimeout(next,80);return}tries++;setTimeout(wait,25)})();
      return;
    }
    var s=document.createElement('script');s.src='/'+file+'?web=12';s.setAttribute('data-fv-web-production','1');s.onload=next;s.onerror=next;document.body.appendChild(s)
  }
  next();
})();</script>`;

html = html
  .replace('<html lang="es">', '<html lang="es" class="fv-web">')
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
    b.id='fvWebLogout';b.className='iconbtn';b.title='Cerrar sesión';b.setAttribute('aria-label','Cerrar sesión');b.textContent='↪';
    b.onclick=function(){try{localStorage.removeItem('fitvalen_web_session');localStorage.removeItem('fitvalen_web_session_expires')}catch(e){}location.reload()};
    top.appendChild(b);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();</script>`;
html = html.replace("</body>", productionLoader + logout + "</body>");

/* Build-time invariants: old Web visual layers must never return to runtime. */
const forbiddenRuntimeLayers = [
  "home-performance-v1.css","home-performance-v1.js","light-performance-v1.css",
  "web-performance-v2.css","web-performance-v2.js","ux-polish-v3.css","ux-polish-v3.js",
  "premium-product-v4.css","premium-product-v4.js","production-polish-v1.css","fullscreen-v1.css"
];
for (const layer of forbiddenRuntimeLayers) {
  if (html.includes(layer)) {
    throw new Error("FitValen Web build guard: forbidden runtime layer " + layer);
  }
}

await writeFile(indexPath, html, "utf8");
console.log("FitValen Web V1 built -> Final QA + stable Progress + single visual owner");
