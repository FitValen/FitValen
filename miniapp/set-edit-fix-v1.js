(function(){
  var busy=false;
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function initData(){var x=tg();try{return x&&x.initData?x.initData:''}catch(e){return ''}}
  function haptic(){var x=tg();try{if(x&&x.HapticFeedback){x.HapticFeedback.impactOccurred('medium')}}catch(e){}}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function fmt(v){var n=Number(v||0);if(!isFinite(n)){return '0'}return String(Math.round(n*100)/100).replace('.',',')}
  function request(action,payload){return fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':initData()},body:JSON.stringify({action:action,payload:payload||{}})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.reason||j.error||('HTTP '+r.status))}return j.data})})}
  function alertMsg(text){var x=tg();try{if(x&&x.showAlert){x.showAlert(text);return}}catch(e){}window.alert(text)}
  function notify(text){var e=document.getElementById('toast');if(!e){return}e.textContent=text;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function closeSheet(){var o=document.getElementById('overlay');if(o){o.className='overlay'}}
  function openSheet(html){var o=document.getElementById('overlay'),s=document.getElementById('sheet');if(!o||!s){return}s.innerHTML=html;o.className='overlay on';var c=document.getElementById('fvSetFixClose');if(c){c.onclick=closeSheet}}
  function hasBallast(notes){return String(notes||'').indexOf('[LASTRE]')>=0}
  function cleanNote(notes){return String(notes||'').replace('[LASTRE]','').replace(/^\s+|\s+$/g,'')}
  function setText(s){var w=Number(s.weight_kg||0),x='';if(w>0){x+=fmt(w)+'×'}x+=(s.reps==null?'?':String(s.reps));if(s.to_failure){x+=' 🔥'}if(s.assisted){x+=' 🤝'}if(hasBallast(s.notes)){x+=' 🎒'}return x}
  function patchChips(data){var chips=document.querySelectorAll('#fvWorkoutControls .fvSetChip'),sets=data&&data.currentSets?data.currentSets:[];for(var i=0;i<chips.length&&i<sets.length;i++){chips[i].setAttribute('data-fv-set',sets[i].id);chips[i].innerHTML='<i>'+(i+1)+'</i>'+esc(setText(sets[i]))}}
  function editSheet(s){
    var html='<div class="row"><div><div class="ey">✏️ EDITAR SERIE</div><div class="stat" style="margin-top:5px">Serie '+esc(s.set_order)+'</div></div><button class="iconbtn" id="fvSetFixClose">×</button></div>'+
      '<div class="fvChoiceRow"><div class="fvField"><label>Peso kg</label><input class="fvText" id="fvSetFixWeight" type="text" inputmode="decimal" value="'+esc(s.weight_kg==null?'':s.weight_kg)+'"></div><div class="fvField"><label>Reps</label><input class="fvText" id="fvSetFixReps" type="text" inputmode="numeric" value="'+esc(s.reps==null?'':s.reps)+'"></div></div>'+
      '<div class="fvChoiceRow"><label class="fvCheck"><input type="checkbox" id="fvSetFixFailure" '+(s.to_failure?'checked':'')+'>🔥 Fallo</label><label class="fvCheck"><input type="checkbox" id="fvSetFixAssist" '+(s.assisted?'checked':'')+'>🤝 Asistida</label></div>'+
      '<label class="fvCheck" style="margin-top:8px"><input type="checkbox" id="fvSetFixBallast" '+(hasBallast(s.notes)?'checked':'')+'>🎒 Lastre</label>'+
      '<div class="fvField"><label>Observación de serie</label><textarea class="fvArea" id="fvSetFixNote" placeholder="Opcional">'+esc(cleanNote(s.notes))+'</textarea></div>'+
      '<button class="actionbtn primary wide" style="margin-top:12px" id="fvSetFixSave">Guardar serie</button>';
    openSheet(html);
    var save=document.getElementById('fvSetFixSave');
    if(save){save.onclick=function(){if(busy){return}busy=true;save.disabled=true;request('edit_set',{set_id:s.id,weight:document.getElementById('fvSetFixWeight').value,reps:document.getElementById('fvSetFixReps').value,to_failure:document.getElementById('fvSetFixFailure').checked,assisted:document.getElementById('fvSetFixAssist').checked,ballast:document.getElementById('fvSetFixBallast').checked,note:document.getElementById('fvSetFixNote').value}).then(function(d){busy=false;save.disabled=false;closeSheet();patchChips(d);notify('Serie actualizada');haptic()}).catch(function(e){busy=false;save.disabled=false;alertMsg(e&&e.message?e.message:String(e))})}}
  }
  function findChip(target){var t=target;while(t&&t!==document){if(String(t.className||'').indexOf('fvSetChip')>=0){return t}t=t.parentNode}return null}
  function openForChip(chip){
    var chips=document.querySelectorAll('#fvWorkoutControls .fvSetChip'),idx=-1,id=chip.getAttribute('data-fv-set');
    for(var i=0;i<chips.length;i++){if(chips[i]===chip){idx=i;break}}
    request('workout_extras',{}).then(function(d){var sets=d&&d.currentSets?d.currentSets:[],s=null;for(var z=0;z<sets.length;z++){if(id&&String(sets[z].id)===String(id)){s=sets[z];break}}if(!s&&idx>=0&&sets[idx]){s=sets[idx]}if(!s){alertMsg('No se pudo localizar esa serie.');return}patchChips(d);editSheet(s)}).catch(function(e){alertMsg(e&&e.message?e.message:String(e))})
  }
  document.addEventListener('click',function(e){var chip=findChip(e.target);if(!chip){return}e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation){e.stopImmediatePropagation()}openForChip(chip)},true);
})();
