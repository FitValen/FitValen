const CORE_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp";
const ADVANCED_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp-v7";
const MANUAL_FOOD_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp-manual-food";
const EXERCISE_NOTE_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp-exercise-note";
const BUILD = "advanced-v1-auto-advance-223480c";
const ADVANCED_ACTIONS = new Set([
  "workout_extras","edit_set","set_exercise_note","set_workout_note","add_cardio","delete_cardio",
  "products","add_food","edit_food","delete_food","diet_free_day","full_free_day","reopen_diet",
  "day_summary","finish_day","progress_v2"
]);

const INLINE_SET_EDIT = `<script data-fv-inline-set-edit="1">(function(){
  var lastTouch=0,busy=false;
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function initData(){var x=tg();try{return x&&x.initData?x.initData:''}catch(e){return ''}}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function request(action,payload){return fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':initData()},body:JSON.stringify({action:action,payload:payload||{}})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.reason||j.error||('HTTP '+r.status))}return j.data})})}
  function closeSheet(){var o=document.getElementById('overlay');if(o){o.className='overlay'}}
  function openSheet(html){var o=document.getElementById('overlay'),s=document.getElementById('sheet');if(!o||!s){return}s.innerHTML=html;o.className='overlay on';var c=document.getElementById('fvInlineSetClose');if(c){c.onclick=closeSheet}}
  function alertMsg(text){var x=tg();try{if(x&&x.showAlert){x.showAlert(text);return}}catch(e){}window.alert(text)}
  function notify(text){var e=document.getElementById('toast');if(!e){return}e.textContent=text;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function hasBallast(notes){return String(notes||'').indexOf('[LASTRE]')>=0}
  function cleanNote(notes){return String(notes||'').replace('[LASTRE]','').replace(/^\\s+|\\s+$/g,'')}
  function findChip(t){while(t&&t!==document){if(String(t.className||'').indexOf('fvSetChip')>=0){return t}t=t.parentNode}return null}
  function chipIndex(chip){var chips=document.querySelectorAll('#fvWorkoutControls .fvSetChip');for(var i=0;i<chips.length;i++){if(chips[i]===chip){return i}}return -1}
  function editSheet(s){var html='<div class="row"><div><div class="ey">✏️ EDITAR SERIE</div><div class="stat" style="margin-top:5px">Serie '+esc(s.set_order)+'</div></div><button class="iconbtn" id="fvInlineSetClose">×</button></div>'+
    '<div class="fvChoiceRow"><div class="fvField"><label>Peso kg</label><input class="fvText" id="fvInlineSetWeight" type="text" inputmode="decimal" value="'+esc(s.weight_kg==null?'':s.weight_kg)+'"></div><div class="fvField"><label>Reps</label><input class="fvText" id="fvInlineSetReps" type="text" inputmode="numeric" value="'+esc(s.reps==null?'':s.reps)+'"></div></div>'+
    '<div class="fvChoiceRow"><label class="fvCheck"><input type="checkbox" id="fvInlineSetFailure" '+(s.to_failure?'checked':'')+'>🔥 Fallo</label><label class="fvCheck"><input type="checkbox" id="fvInlineSetAssist" '+(s.assisted?'checked':'')+'>🤝 Asistida</label></div>'+
    '<label class="fvCheck" style="margin-top:8px"><input type="checkbox" id="fvInlineSetBallast" '+(hasBallast(s.notes)?'checked':'')+'>🎒 Lastre</label>'+
    '<div class="fvField"><label>Observación de serie</label><textarea class="fvArea" id="fvInlineSetNote" placeholder="Opcional">'+esc(cleanNote(s.notes))+'</textarea></div>'+
    '<button class="actionbtn primary wide" style="margin-top:12px" id="fvInlineSetSave">Guardar serie</button>';
    openSheet(html);
    var save=document.getElementById('fvInlineSetSave');
    if(save){save.onclick=function(){if(busy){return}busy=true;save.disabled=true;request('edit_set',{set_id:s.id,weight:document.getElementById('fvInlineSetWeight').value,reps:document.getElementById('fvInlineSetReps').value,to_failure:document.getElementById('fvInlineSetFailure').checked,assisted:document.getElementById('fvInlineSetAssist').checked,ballast:document.getElementById('fvInlineSetBallast').checked,note:document.getElementById('fvInlineSetNote').value}).then(function(){busy=false;save.disabled=false;closeSheet();notify('Serie actualizada');var r=document.getElementById('refresh');if(r){setTimeout(function(){r.click()},50)}}).catch(function(e){busy=false;save.disabled=false;alertMsg(e&&e.message?e.message:String(e))})}}
  }
  function openFor(chip){var idx=chipIndex(chip);request('workout_extras',{}).then(function(d){var sets=d&&d.currentSets?d.currentSets:[];if(idx<0||!sets[idx]){alertMsg('No se pudo localizar esa serie.');return}editSheet(sets[idx])}).catch(function(e){alertMsg(e&&e.message?e.message:String(e))})}
  function handle(e,isTouch){var chip=findChip(e.target);if(!chip){return}if(!isTouch&&Date.now()-lastTouch<700){return}if(isTouch){lastTouch=Date.now()}e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation){e.stopImmediatePropagation()}openFor(chip)}
  document.addEventListener('touchend',function(e){handle(e,true)},true);
  document.addEventListener('click',function(e){handle(e,false)},true);
})();</script>`;

const INLINE_MENU_EXTRAS = `<script data-fv-inline-menu-extras="1">(function(){
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function initData(){var x=tg();try{return x&&x.initData?x.initData:''}catch(e){return ''}}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function request(action,payload){return fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':initData()},body:JSON.stringify({action:action,payload:payload||{}})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.reason||j.error||('HTTP '+r.status))}return j.data})})}
  function alertMsg(text){var x=tg();try{if(x&&x.showAlert){x.showAlert(text);return}}catch(e){}window.alert(text)}
  function notify(text){var e=document.getElementById('toast');if(!e){return}e.textContent=text;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function closeSheet(){var o=document.getElementById('overlay');if(o){o.className='overlay'}}
  function openSheet(html){var o=document.getElementById('overlay'),s=document.getElementById('sheet');if(!o||!s){return}s.innerHTML=html;o.className='overlay on';var c=document.getElementById('fvInlineMenuClose');if(c){c.onclick=closeSheet}}
  function head(ey,title){return '<div class="row"><div><div class="ey">'+ey+'</div><div class="stat" style="margin-top:5px">'+esc(title)+'</div></div><button class="iconbtn" id="fvInlineMenuClose">×</button></div>'}
  function cardioSheet(){request('workout_extras',{}).then(function(d){var rows=d&&d.cardio?d.cardio:[],html=head('🏃 CARDIO','Cardio de la sesión');if(rows.length){html+='<div class="card" style="margin-top:12px">';for(var i=0;i<rows.length;i++){html+='<div class="fvCardioRow"><div><b>'+esc(rows[i].cardio_type||'Cardio')+'</b><span>'+esc(rows[i].duration_min)+' min'+(rows[i].avg_hr?' · FC '+esc(rows[i].avg_hr):'')+'</span></div><button class="fvMiniBtn danger" data-fv-cardio-delete="'+esc(rows[i].id)+'">×</button></div>'}html+='</div>'}html+='<div class="fvField"><label>Tipo</label><input class="fvText" id="fvInlineCardioType" type="text" value="HIIT"></div><div class="fvChoiceRow"><div class="fvField"><label>Minutos</label><input class="fvText" id="fvInlineCardioDuration" type="text" inputmode="numeric" placeholder="15"></div><div class="fvField"><label>FC media</label><input class="fvText" id="fvInlineCardioHr" type="text" inputmode="numeric" placeholder="Opcional"></div></div><div class="fvField"><label>Nota</label><input class="fvText" id="fvInlineCardioNote" type="text" placeholder="Opcional"></div><button class="actionbtn primary wide" style="margin-top:12px" id="fvInlineCardioAdd">Añadir cardio</button>';openSheet(html);var dels=document.querySelectorAll('[data-fv-cardio-delete]');for(var z=0;z<dels.length;z++){dels[z].onclick=function(){var id=this.getAttribute('data-fv-cardio-delete');request('delete_cardio',{id:id}).then(function(){notify('Cardio eliminado');cardioSheet()}).catch(function(e){alertMsg(e&&e.message?e.message:String(e))})}}var add=document.getElementById('fvInlineCardioAdd');if(add){add.onclick=function(){add.disabled=true;request('add_cardio',{type:document.getElementById('fvInlineCardioType').value,duration:document.getElementById('fvInlineCardioDuration').value,avg_hr:document.getElementById('fvInlineCardioHr').value,note:document.getElementById('fvInlineCardioNote').value}).then(function(){add.disabled=false;notify('Cardio añadido');cardioSheet()}).catch(function(e){add.disabled=false;alertMsg(e&&e.message?e.message:String(e))})}}}).catch(function(e){alertMsg(e&&e.message?e.message:String(e))})}
  function sessionNoteSheet(){request('workout_extras',{}).then(function(d){var html=head('🗒️ NOTA DE SESIÓN','Entrenamiento')+'<div class="fvField"><label>Nota</label><textarea class="fvArea" id="fvInlineSessionNote">'+esc(d&&d.session_note?d.session_note:'')+'</textarea></div><button class="actionbtn primary wide" style="margin-top:12px" id="fvInlineSessionSave">Guardar</button>';openSheet(html);var save=document.getElementById('fvInlineSessionSave');if(save){save.onclick=function(){save.disabled=true;request('set_workout_note',{note:document.getElementById('fvInlineSessionNote').value}).then(function(){save.disabled=false;closeSheet();notify('Nota de sesión guardada')}).catch(function(e){save.disabled=false;alertMsg(e&&e.message?e.message:String(e))})}}}).catch(function(e){alertMsg(e&&e.message?e.message:String(e))})}
  function ensureMenu(){var grid=document.querySelector('#sheet .fvMenuGrid');if(!grid){return}var cardio=document.getElementById('fvInlineCardio');if(!cardio){cardio=document.createElement('button');cardio.id='fvInlineCardio';cardio.className='fvMenuBtn';cardio.textContent='🏃 Cardio';grid.appendChild(cardio)}cardio.onclick=cardioSheet;var session=document.getElementById('fvInlineSessionNoteBtn');if(!session){session=document.createElement('button');session.id='fvInlineSessionNoteBtn';session.className='fvMenuBtn';session.textContent='🗒️ Nota sesión';grid.appendChild(session)}session.onclick=sessionNoteSheet;request('workout_extras',{}).then(function(d){var count=d&&d.cardio?d.cardio.length:0;cardio.textContent='🏃 Cardio'+(count?' · '+count:'')}).catch(function(){})}
  document.addEventListener('click',function(e){var t=e.target;while(t&&t!==document&&String(t.tagName||'').toLowerCase()!=='button'){t=t.parentNode}if(t&&t.id==='fvMore'){setTimeout(ensureMenu,60)}},true);
})();</script>`;

function enhanceHtml(html) {
  if (!html.includes("enhance-v2.css")) {
    html = html.replace(
      "</head>",
      '<link rel="stylesheet" href="/enhance-v2.css?v=e7791a8"><link rel="stylesheet" href="/workout-v1.css?v=fb0cc79"><link rel="stylesheet" href="/fullscreen-v1.css?v=3bd38c8"><link rel="stylesheet" href="/advanced-v1.css?v=364a392"><link rel="stylesheet" href="/logo-fix-v1.css?v=88c6692"><link rel="stylesheet" href="/exercise-note-v1.css?v=2c5a0fe"></head>',
    );
  } else {
    if (!html.includes("workout-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/workout-v1.css?v=fb0cc79"></head>');
    if (!html.includes("fullscreen-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/fullscreen-v1.css?v=3bd38c8"></head>');
    if (!html.includes("advanced-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/advanced-v1.css?v=364a392"></head>');
    if (!html.includes("logo-fix-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/logo-fix-v1.css?v=88c6692"></head>');
    if (!html.includes("exercise-note-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/exercise-note-v1.css?v=2c5a0fe"></head>');
  }
  if (!html.includes("enhance-v2.js")) html = html.replace("</body>", '<script src="/enhance-v2.js?v=396d91c"></script></body>');
  if (!html.includes("workout-v2.js")) html = html.replace("</body>", '<script src="/workout-v2.js?v=223480c"></script></body>');
  if (!html.includes("workout-input-context-v1.js")) html = html.replace("</body>", '<script src="/workout-input-context-v1.js?v=10964f1"></script></body>');
  if (!html.includes("advanced-v1.js")) html = html.replace("</body>", '<script src="/advanced-v1.js?v=b2fc32e"></script></body>');
  if (!html.includes('data-fv-inline-set-edit="1"')) html = html.replace("</body>", INLINE_SET_EDIT+"</body>");
  if (!html.includes('data-fv-inline-menu-extras="1"')) html = html.replace("</body>", INLINE_MENU_EXTRAS+"</body>");
  if (!html.includes("exercise-note-v2.js")) html = html.replace("</body>", '<script src="/exercise-note-v2.js?v=2eafa8d"></script></body>');
  if (!html.includes("advanced-guards-v1.js")) html = html.replace("</body>", '<script src="/advanced-guards-v1.js?v=3bff704"></script></body>');
  if (!html.includes("manual-food-validation-v1.js")) html = html.replace("</body>", '<script src="/manual-food-validation-v1.js?v=8fd68c6"></script></body>');
  if (!html.includes("diet-reopen-refresh-v1.js")) html = html.replace("</body>", '<script src="/diet-reopen-refresh-v1.js?v=ac17789"></script></body>');
  if (!html.includes("auto-day-v1.js")) html = html.replace("</body>", '<script src="/auto-day-v1.js?v=df4eb38"></script></body>');
  if (!html.includes("header-logo-v1.js")) html = html.replace("</body>", '<script src="/header-logo-v1.js?v=438fbc8"></script></body>');
  if (!html.includes("fullscreen-v1.js")) html = html.replace("</body>", '<script src="/fullscreen-v1.js?v=452c0f7"></script></body>');
  return html;
}

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const headers = new Headers();
      headers.set("content-type", request.headers.get("content-type") || "application/json");
      const initData = request.headers.get("x-telegram-init-data");
      if (initData) headers.set("x-telegram-init-data", initData);
      try {
        const bodyText = await request.text();
        let action = "";
        try { action = String(JSON.parse(bodyText)?.action || ""); } catch (_) {}
        const noteAction = action === "get_exercise_note" || action === "save_exercise_note";
        const target = action === "add_manual_food" ? MANUAL_FOOD_API : (noteAction ? EXERCISE_NOTE_API : (ADVANCED_ACTIONS.has(action) ? ADVANCED_API : CORE_API));
        const response = await fetch(target, { method: "POST", headers, body: bodyText });
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set("cache-control", "no-store");
        responseHeaders.set("x-fitvalen-build", BUILD);
        responseHeaders.delete("content-length");
        return new Response(response.body, { status: response.status, headers: responseHeaders });
      } catch (error) {
        return Response.json(
          { ok: false, error: "proxy_error", reason: String(error) },
          { status: 502, headers: { "cache-control": "no-store", "x-fitvalen-build": BUILD } },
        );
      }
    }
    if (request.method === "GET" || request.method === "HEAD") {
      const response = await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      headers.set("x-fitvalen-build", BUILD);
      headers.set("cache-control", "no-store, no-cache, must-revalidate");
      headers.delete("content-length");
      if (request.method === "HEAD") return new Response(null, { status: response.status, headers });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return new Response(response.body, { status: response.status, headers });
      headers.set("content-type", "text/html; charset=utf-8");
      return new Response(enhanceHtml(await response.text()), { status: response.status, headers });
    }
    return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD, POST", "x-fitvalen-build": BUILD } });
  },
};
