import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(here, "dist", "index.html");
let html = await readFile(indexPath, "utf8");

html = html
  .replace(/\?web=12/g, "?web=18")
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

/* Web-only owner-aware dashboard goals. Telegram source remains untouched. */
const autoDayPath = resolve(here, "dist", "auto-day-v1.js");
const autoDayWeb = `(function(){
  var autoStarting=false,goalLoading=false,goalLoaded=false,GOAL_MIN=0,GOAL_MAX=0,WATER_LITERS=null;
  function username(){
    try{
      var token=localStorage.getItem('fitvalen_web_session')||'';
      var part=token.split('.')[1]||'';
      if(!part){return ''}
      part=part.replace(/-/g,'+').replace(/_/g,'/');
      while(part.length%4){part+='='}
      var p=JSON.parse(atob(part));
      return String(p&&p.username||'').toLowerCase();
    }catch(e){return ''}
  }
  function removeManualEnd(){}
  function autoStart(){
    var b=document.getElementById('startDay');
    if(!b||autoStarting){return}
    autoStarting=true;
    try{b.style.display='none'}catch(ignore){}
    setTimeout(function(){try{b.click()}catch(ignore){autoStarting=false}},0);
  }
  function currentCalories(){
    var home=document.getElementById('home');
    if(!home){return 0}
    var big=home.querySelector('.hero .big');
    if(!big){return 0}
    var text=String(big.textContent||'').replace(/\\./g,'');
    var m=text.match(/(\\d+)/);
    return m?Number(m[1]):0;
  }
  function formatInt(v){try{return Number(v).toLocaleString('es-ES')}catch(e){return String(v)}}
  function goalStatus(k){
    if(!GOAL_MIN||!GOAL_MAX){return {text:'—',className:'pill'}}
    if(k<GOAL_MIN){return {text:'Faltan '+Math.max(0,GOAL_MIN-k)+' kcal',className:'pill warn'}}
    if(k<=GOAL_MAX){return {text:'En rango',className:'pill good'}}
    return {text:'+'+(k-GOAL_MAX)+' kcal',className:'pill above'};
  }
  function loadGoal(){
    if(goalLoading||goalLoaded){return}
    goalLoading=true;
    fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':'web-session'},body:JSON.stringify({action:'home',payload:{}})})
      .then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('invalid_goal_response')}if(!r.ok||!j.ok){throw new Error(j.error||'goal_request_failed')}return j.data})})
      .then(function(d){
        var t=d&&d.brain&&d.brain.target?d.brain.target:null;
        GOAL_MIN=t&&Number(t.min_kcal)>0?Number(t.min_kcal):0;
        GOAL_MAX=t&&Number(t.max_kcal)>0?Number(t.max_kcal):0;
        WATER_LITERS=username()==='dani'?4:null;
        goalLoaded=true;goalLoading=false;syncGoals();
      })
      .catch(function(){goalLoaded=true;goalLoading=false;GOAL_MIN=0;GOAL_MAX=0;syncGoals()});
  }
  function syncGoals(){
    var home=document.getElementById('home');
    if(!home){return}
    var hero=home.querySelector('.hero');
    if(!hero){return}
    if(!goalLoaded){loadGoal();return}
    var card=document.getElementById('fvGoalsCard');
    if(!GOAL_MIN||!GOAL_MAX){if(card&&card.parentNode){card.parentNode.removeChild(card)}return}
    if(!card){
      card=document.createElement('div');
      card.id='fvGoalsCard';
      card.className='card fvGoalCard';
      card.innerHTML='<div class="row"><div><div class="ey">OBJETIVOS ACTUALES</div><div class="fvGoalRange"><span id="fvGoalRangeText"></span> <span>kcal/día</span></div></div><span id="fvGoalState" class="pill">—</span></div><div class="fvGoalTrack"><span class="fvGoalBand"></span><i id="fvGoalFill" style="width:0%"></i></div><div class="fvGoalScale"><span class="fvGoalZero">0</span><span class="fvGoalMin"></span><span class="fvGoalMax"></span></div><div class="fvGoalFooter"><span>💧 Hidratación diaria</span><b></b></div>';
      if(hero.nextSibling){hero.parentNode.insertBefore(card,hero.nextSibling)}else{hero.parentNode.appendChild(card)}
    }
    card.style.display='';
    var range=document.getElementById('fvGoalRangeText');
    if(range){range.textContent=formatInt(GOAL_MIN)+'–'+formatInt(GOAL_MAX)}
    var minEl=card.querySelector('.fvGoalMin'),maxEl=card.querySelector('.fvGoalMax'),band=card.querySelector('.fvGoalBand');
    var minPct=Math.max(0,Math.min(100,(GOAL_MIN/GOAL_MAX)*100));
    if(minEl){minEl.textContent=formatInt(GOAL_MIN);minEl.style.left=minPct.toFixed(2)+'%'}
    if(maxEl){maxEl.textContent=formatInt(GOAL_MAX)+' kcal'}
    if(band){band.style.left=minPct.toFixed(2)+'%'}
    var k=currentCalories(),pct=Math.max(0,Math.min(100,(k/GOAL_MAX)*100)),state=goalStatus(k);
    var fill=document.getElementById('fvGoalFill');if(fill){fill.style.width=pct.toFixed(1)+'%'}
    var badge=document.getElementById('fvGoalState');if(badge){if(badge.textContent!==state.text){badge.textContent=state.text}if(badge.className!==state.className){badge.className=state.className}}
    var footer=card.querySelector('.fvGoalFooter'),footerValue=footer&&footer.querySelector('b');
    if(footer){footer.style.display=WATER_LITERS?'flex':'none'}
    if(footerValue&&WATER_LITERS){footerValue.textContent=WATER_LITERS+' L de agua'}
  }
  function sync(){removeManualEnd();autoStart();syncGoals()}
  function install(){
    sync();
    var home=document.getElementById('home');
    if(home&&window.MutationObserver){new MutationObserver(function(){setTimeout(syncGoals,0)}).observe(home,{childList:true,subtree:true,characterData:true})}
    else{window.setInterval(syncGoals,750)}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
`;
await writeFile(autoDayPath, autoDayWeb, "utf8");

html = html.replace(
  "</body>",
  '<script src="/web-multiuser-guard-v1.js?web=18" data-fv-web-multiuser-guard="1"></script><script src="/web-admin-v1.js?web=18" data-fv-web-admin="1"></script></body>'
);
if (!html.includes("web-multiuser-guard-v1.js") || !html.includes("web-admin-v1.js")) {
  throw new Error("FitValen Web guard: multiuser/admin runtime missing");
}

await writeFile(indexPath, html, "utf8");
console.log("FitValen Web multiuser v2 · owner-aware calorie goals · cache web=18");
