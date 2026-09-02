(function(){
  var timer=null,inFlight=false,lastCode='';
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function initData(){var x=tg();try{return x&&x.initData?x.initData:''}catch(e){return ''}}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function request(action,payload){return fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':initData()},body:JSON.stringify({action:action,payload:payload||{}})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.reason||j.error||('HTTP '+r.status))}return j.data})})}
  function notify(text){var e=document.getElementById('toast');if(!e){return}e.textContent=text;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function alertMsg(text){var x=tg();try{if(x&&x.showAlert){x.showAlert(text);return}}catch(e){}window.alert(text)}
  function closeSheet(){var o=document.getElementById('overlay');if(o){o.className='overlay'}}
  function openSheet(html){var o=document.getElementById('overlay'),s=document.getElementById('sheet');if(!o||!s){return}s.innerHTML=html;o.className='overlay on';var c=document.getElementById('fvExerciseNoteClose');if(c){c.onclick=closeSheet}}
  function renderVisible(d){
    var card=document.querySelector('#fvWorkoutControls .fvFocusCard');
    if(!card||!d){return}
    lastCode=String(d.exercise_code||'');
    var old=document.getElementById('fvExerciseNoteVisible');
    if(!d.note){if(old&&old.parentNode){old.parentNode.removeChild(old)}return}
    if(!old){old=document.createElement('div');old.id='fvExerciseNoteVisible';old.className='fvExerciseNoteVisible';var ref=card.querySelector('.fvReference');if(ref){card.insertBefore(old,ref)}else{card.appendChild(old)}}
    old.innerHTML='<div class="fvExerciseNoteLabel">📝 Nota del ejercicio</div><div class="fvExerciseNoteText">'+esc(d.note)+'</div>';
  }
  function refresh(){
    if(inFlight||!document.querySelector('#fvWorkoutControls .fvFocusCard')){return}
    inFlight=true;
    request('get_exercise_note',{}).then(function(d){inFlight=false;renderVisible(d)}).catch(function(){inFlight=false})
  }
  function schedule(){if(timer){clearTimeout(timer)}timer=setTimeout(refresh,120)}
  function noteSheet(){
    request('get_exercise_note',{}).then(function(d){
      var html='<div class="row"><div><div class="ey">📝 NOTA DEL EJERCICIO</div><div class="stat" style="margin-top:5px">'+esc((d.exercise_code?d.exercise_code+' · ':'')+(d.exercise_name||'Ejercicio actual'))+'</div></div><button class="iconbtn" id="fvExerciseNoteClose">×</button></div><div class="fvField"><label>Nota</label><textarea class="fvArea" id="fvExerciseNoteInput" placeholder="Observación del ejercicio">'+esc(d.note||'')+'</textarea></div><button class="actionbtn primary wide" style="margin-top:12px" id="fvExerciseNoteSave">Guardar</button>';
      openSheet(html);
      var save=document.getElementById('fvExerciseNoteSave');
      if(save){save.onclick=function(){var note=document.getElementById('fvExerciseNoteInput').value;save.disabled=true;request('save_exercise_note',{note:note}).then(function(x){save.disabled=false;closeSheet();renderVisible(x);notify('Nota de ejercicio guardada')}).catch(function(e){save.disabled=false;alertMsg(e&&e.message?e.message:String(e))})}}
    }).catch(function(e){alertMsg(e&&e.message?e.message:String(e))})
  }
  document.addEventListener('click',function(e){
    var t=e.target;
    while(t&&t!==document&&String(t.tagName||'').toLowerCase()!=='button'){t=t.parentNode}
    if(!t||t===document){return}
    var text=String(t.textContent||'').toLowerCase();
    if(text.indexOf('nota ejercicio')>=0){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation){e.stopImmediatePropagation()}noteSheet()}
  },true);
  function install(){
    var work=document.getElementById('work');
    if(work&&window.MutationObserver){new MutationObserver(function(){schedule()}).observe(work,{childList:true,subtree:true})}
    var nav=document.querySelectorAll('.nav button');
    for(var i=0;i<nav.length;i++){if(nav[i].getAttribute('data-tab')==='work'){nav[i].addEventListener('click',function(){setTimeout(schedule,120)})}}
    schedule();
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
