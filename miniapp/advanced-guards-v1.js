(function(){
  var progressData=null;
  var nativeFetch=window.fetch;
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function initData(){var x=tg();try{return x&&x.initData?x.initData:''}catch(e){return ''}}
  function text(el){return el?String(el.textContent||''):''}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function num(v){var n=Number(String(v==null?'':v).replace(',','.'));return isFinite(n)?n:0}
  function fmt(v,d){return num(v).toLocaleString('es-ES',{maximumFractionDigits:d==null?0:d})}
  function notify(t){var e=document.getElementById('toast');if(!e){return}e.textContent=t;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function closeSheet(){var o=document.getElementById('overlay');if(o){o.className='overlay'}}
  function stop(e){try{e.preventDefault();e.stopImmediatePropagation()}catch(ignore){}}
  function request(action,payload){return window.fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':initData()},body:JSON.stringify({action:action,payload:payload||{}})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(ignore){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.reason||j.error||('HTTP '+r.status))}return j.data})})}
  function confirmFinish(e){
    var t=e&&e.target?e.target:null;
    if(!t||t.id!=='fvConfirmFinish'){return}
    var sheet=document.getElementById('sheet');
    var pending=sheet?sheet.querySelector('.fvPending'):null;
    var p=text(pending);
    if((p.indexOf('Dieta abierta')>=0||p.indexOf('Entrenamiento abierto')>=0)&&!window.confirm('Hay elementos abiertos. ¿Quieres cerrarlos automáticamente y finalizar el día?')){stop(e);return}
    if(p.indexOf('Comida registrada después de cerrar dieta')>=0&&!window.confirm('Hay comida posterior al cierre de dieta. ¿Quieres incorporarla al día antes de cerrarlo?')){stop(e);return}
  }
  function slotOptions(){return '<option value="desayuno">Desayuno</option><option value="almuerzo">Almuerzo</option><option value="comida">Comida</option><option value="merienda">Merienda</option><option value="post-entreno">Post-entreno</option><option value="cena">Cena</option><option value="postre">Postre</option><option value="snacks" selected>Snacks / otros</option>'}
  function manualSheet(){
    var sheet=document.getElementById('sheet');if(!sheet){return}
    sheet.innerHTML='<div class="row"><div><div class="ey">➕ ALIMENTO MANUAL</div><div class="stat" style="margin-top:5px">Registrar datos reales</div></div><button class="iconbtn" id="fvManualClose">×</button></div><div class="fvField"><label>Comida</label><select class="fvSelect" id="fvManualSlot">'+slotOptions()+'</select></div><div class="fvField"><label>Nombre</label><input class="fvText" id="fvManualName" type="text" placeholder="Ej. Pan artesanal"></div><div class="fvChoiceRow"><div class="fvField"><label>Cantidad</label><input class="fvText" id="fvManualQty" type="text" inputmode="decimal" placeholder="100"></div><div class="fvField"><label>Unidad</label><input class="fvText" id="fvManualUnit" type="text" value="g"></div></div><div class="fvField"><label>Valores totales para esa cantidad</label></div><div class="fvChoiceRow"><div class="fvField"><label>kcal</label><input class="fvText" id="fvManualKcal" type="text" inputmode="decimal" placeholder="0"></div><div class="fvField"><label>Proteína g</label><input class="fvText" id="fvManualProtein" type="text" inputmode="decimal" placeholder="0"></div></div><div class="fvChoiceRow"><div class="fvField"><label>Hidratos g</label><input class="fvText" id="fvManualCarbs" type="text" inputmode="decimal" placeholder="0"></div><div class="fvField"><label>Grasas g</label><input class="fvText" id="fvManualFat" type="text" inputmode="decimal" placeholder="0"></div></div><button class="actionbtn primary wide" style="margin-top:14px" id="fvManualSave">Añadir alimento</button>';
    document.getElementById('fvManualClose').onclick=closeSheet;
    document.getElementById('fvManualSave').onclick=function(){var b=this,name=document.getElementById('fvManualName').value,qty=document.getElementById('fvManualQty').value;if(!String(name||'').trim()||num(qty)<=0){notify('Revisa nombre y cantidad');return}b.disabled=true;b.textContent='Guardando…';request('add_manual_food',{slot:document.getElementById('fvManualSlot').value,name:name,quantity:qty,unit:document.getElementById('fvManualUnit').value||'g',calories:document.getElementById('fvManualKcal').value||0,protein:document.getElementById('fvManualProtein').value||0,carbs:document.getElementById('fvManualCarbs').value||0,fat:document.getElementById('fvManualFat').value||0}).then(function(){closeSheet();notify('Alimento añadido');var n=document.querySelector('.nav button[data-tab="diet"]');if(n){n.click()}}).catch(function(e){b.disabled=false;b.textContent='Añadir alimento';notify(e&&e.message?e.message:String(e))})}
  }
  function augmentProductSheet(){
    var sheet=document.getElementById('sheet');if(!sheet||document.getElementById('fvManualFoodBtn')){return}
    var stat=sheet.querySelector('.stat');if(!stat||text(stat).indexOf('Buscar en Productos actuales')<0){return}
    var results=document.getElementById('fvProductResults');if(!results){return}
    var b=document.createElement('button');b.id='fvManualFoodBtn';b.className='actionbtn wide';b.style.marginTop='10px';b.textContent='✍️ Introducir alimento manualmente';b.onclick=manualSheet;results.parentNode.insertBefore(b,results)
  }
  function weightDelta(weights,days){
    if(!weights||weights.length<2){return null}
    var end=weights[weights.length-1],endT=new Date(end.entry_date+'T12:00:00').getTime(),target=endT-days*86400000,start=null;
    for(var i=weights.length-2;i>=0;i--){var t=new Date(weights[i].entry_date+'T12:00:00').getTime();if(t<=target){start=weights[i];break}}
    if(!start){return null}
    return num(end.weight_kg)-num(start.weight_kg)
  }
  function weightDeltaText(v){if(v==null){return '—'}return (v>0?'+':'')+fmt(v,2)+' kg'}
  function patchProgress(){
    if(!progressData){return}
    var root=document.querySelector('#progress .fvAdvancedProgress');if(!root){return}
    var hero=root.querySelector('.fvTrendHero'),weightGrid=hero?hero.nextElementSibling:null,weights=progressData.weights||[];
    if(weightGrid&&String(weightGrid.className).indexOf('fvPeriodGrid')>=0&&weightGrid.children&&weightGrid.children.length>=3){var ds=[7,28,90];for(var w=0;w<3;w++){var b=weightGrid.children[w].querySelector('b');if(b){b.textContent=weightDeltaText(weightDelta(weights,ds[w]))}}}
    var heads=root.querySelectorAll('.sectionhead'),head=null;for(var i=0;i<heads.length;i++){var t=heads[i].querySelector('.sectiontitle');if(t&&text(t)==='Nutrición'){head=heads[i];break}}
    if(!head){return}
    var grid=head.nextElementSibling;if(!grid||String(grid.className).indexOf('grid2')<0){return}
    var n=progressData.nutrition||{},c7=n.current7||{},l14=n.last14||{},l28=n.last28||{};
    var row=document.getElementById('fvNutritionPeriods');if(!row){row=document.createElement('div');row.id='fvNutritionPeriods';row.className='fvPeriodGrid';grid.parentNode.insertBefore(row,grid)}
    row.innerHTML='<div class="fvPeriod"><b>'+(c7.avg_kcal==null?'—':fmt(c7.avg_kcal,0))+'</b><span>kcal · 7d</span></div><div class="fvPeriod"><b>'+(l14.avg_kcal==null?'—':fmt(l14.avg_kcal,0))+'</b><span>kcal · 14d</span></div><div class="fvPeriod"><b>'+(l28.avg_kcal==null?'—':fmt(l28.avg_kcal,0))+'</b><span>kcal · 28d</span></div>';
    if(grid.children&&grid.children.length>=2){grid.children[0].style.display='none';grid.children[1].style.display='none'}
  }
  function inspectFetch(args,r){
    try{var init=args&&args.length>1?args[1]:null,body=init&&init.body?String(init.body):'',q=body?JSON.parse(body):null;if(!q||q.action!=='progress_v2'||!r||typeof r.clone!=='function'){return}r.clone().text().then(function(t){var j;try{j=JSON.parse(t)}catch(ignore){return}if(j&&j.ok&&j.data){progressData=j.data;setTimeout(patchProgress,40);setTimeout(patchProgress,160);setTimeout(patchProgress,500)}}).catch(function(){})}catch(ignore){}
  }
  if(nativeFetch){window.fetch=function(){var args=arguments;return nativeFetch.apply(window,args).then(function(r){inspectFetch(args,r);return r})}}
  function observe(){augmentProductSheet();patchProgress();var sheet=document.getElementById('sheet');if(sheet&&window.MutationObserver){new MutationObserver(function(){augmentProductSheet()}).observe(sheet,{childList:true,subtree:true})}}
  document.addEventListener('click',confirmFinish,true);
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',observe)}else{observe()}
})();
