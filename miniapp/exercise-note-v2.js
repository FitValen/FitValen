(function(){
  var current=null,loading=false;
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function initData(){var x=tg();try{return x&&x.initData?x.initData:''}catch(e){return ''}}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function request(action,payload){return fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':initData()},body:JSON.stringify({action:action,payload:payload||{}})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.reason||j.error||('HTTP '+r.status))}return j.data})})}
  function notify(text){var e=document.getElementById('toast');if(!e){return}e.textContent=text;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function alertMsg(text){var x=tg();try{if(x&&x.showAlert){x.showAlert(text);return}}catch(e){}window.alert(text)}
  function closeSheet(){var o=document.getElementById('overlay');if(o){o.className='overlay'}}
  function openSheet(html){var o=document.getElementById('overlay'),s=document.getElementById('sheet');if(!o||!s){return}s.innerHTML=html;o.className='overlay on';var c=document.getElementById('fvExerciseNoteClose');if(c){c.onclick=closeSheet}}
  function paint(d){
    current=d||null;
    var card=document.querySelector('#fvWorkoutControls .fvFocusCard');
    if(!card){return}
    var old=document.getElementById('fvExerciseNoteVisible');
    if(!d||!d.note){if(old&&old.parentNode){old.parentNode.removeChild(old)}return}
    if(!old){old=document.createElement('div');old.id='fvExerciseNoteVisible';old.className='fvExerciseNoteVisible';var ref=card.querySelector('.fvReference');if(ref){card.insertBefore(old,ref)}else{card.appendChild(old)}}
    old.innerHTML='<div class="fvExerciseNoteLabel">📝 Nota del ejercicio</div><div class="fvExerciseNoteText">'+esc(d.note)+'</div>';
  }
  function refresh(){
    if(loading||!document.querySelector('#fvWorkoutControls .fvFocusCard')){return}
    loading=true;
    request('get_exercise_note',{}).then(function(d){loading=false;paint(d)}).catch(function(){loading=false})
  }
  function noteSheet(){
    request('get_exercise_note',{}).then(function(d){
      var html='<div class="row"><div><div class="ey">📝 NOTA DEL EJERCICIO</div><div class="stat" style="margin-top:5px">'+esc((d.exercise_code?d.exercise_code+' · ':'')+(d.exercise_name||'Ejercicio actual'))+'</div></div><button class="iconbtn" id="fvExerciseNoteClose">×</button></div><div class="fvField"><label>Nota</label><textarea class="fvArea" id="fvExerciseNoteInput" placeholder="Observación del ejercicio">'+esc(d.note||'')+'</textarea></div><button class="actionbtn primary wide" style="margin-top:12px" id="fvExerciseNoteSave">Guardar</button>';
      openSheet(html);
      var save=document.getElementById('fvExerciseNoteSave');
      if(save){save.onclick=function(){var note=document.getElementById('fvExerciseNoteInput').value;save.disabled=true;request('save_exercise_note',{note:note}).then(function(x){save.disabled=false;closeSheet();paint(x);notify('Nota de ejercicio guardada')}).catch(function(e){save.disabled=false;alertMsg(e&&e.message?e.message:String(e))})}}
    }).catch(function(e){alertMsg(e&&e.message?e.message:String(e))})
  }
  function patchCardioCount(){
    var grid=document.querySelector('#sheet .fvMenuGrid');
    if(!grid){return}
    var buttons=grid.querySelectorAll('button'),cardio=null;
    for(var i=0;i<buttons.length;i++){if(String(buttons[i].textContent||'').toLowerCase().indexOf('cardio')>=0){cardio=buttons[i];break}}
    if(!cardio){return}
    request('workout_extras',{}).then(function(d){var n=d&&d.cardio?d.cardio.length:0;cardio.textContent='🏃 Cardio'+(n?' · '+n:'')}).catch(function(){})
  }
  function patchMenu(){
    var grid=document.querySelector('#sheet .fvMenuGrid');
    if(!grid){return}
    var buttons=grid.querySelectorAll('button');
    var found=null;
    for(var i=0;i<buttons.length;i++){if(String(buttons[i].textContent||'').toLowerCase().indexOf('nota ejercicio')>=0){found=buttons[i];break}}
    if(!found){
      found=document.createElement('button');
      found.className='fvMenuBtn';
      found.textContent='📝 Nota ejercicio';
      grid.appendChild(found);
    }
    if(found.getAttribute('data-fv-note-v2')!=='1'){
      found.setAttribute('data-fv-note-v2','1');
      found.onclick=noteSheet;
    }
    setTimeout(patchCardioCount,40);
  }
  document.addEventListener('click',function(e){
    var t=e.target;
    while(t&&t!==document&&String(t.tagName||'').toLowerCase()!=='button'){t=t.parentNode}
    if(!t||t===document){return}
    if(t.id==='fvMore'){setTimeout(patchMenu,60);return}
    if(t.id==='fvNext'||t.id==='fvPrev'||String(t.className||'').indexOf('fvRoutineBtn')>=0){setTimeout(refresh,220);return}
    if(t.getAttribute&&t.getAttribute('data-tab')==='work'){setTimeout(refresh,220)}
  },false);
  function install(){setTimeout(refresh,300)}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
