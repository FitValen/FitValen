(function(){
  var awaitingReopen=false;
  var awaitingClose=false;
  var repairLock=false;
  var observer=null;
  function dietRoot(){return document.getElementById('diet')}
  function dietState(){
    var root=dietRoot();
    var pill=root?root.querySelector('.hero .pill'):null;
    var text=String(pill&&pill.textContent?pill.textContent:'').toLowerCase();
    if(text.indexOf('abierta')>=0){return 'open'}
    if(text.indexOf('cerrada')>=0){return 'closed'}
    return '';
  }
  function normalizeMealCards(){
    var root=dietRoot();
    if(!root){return}
    var open=dietState()==='open';
    var cards=root.querySelectorAll('.mealcard[data-slot]');
    for(var i=0;i<cards.length;i++){
      cards[i].disabled=!open;
      if(open){
        if(String(cards[i].className).indexOf('enabled')<0){cards[i].className+=' enabled'}
      }else{
        cards[i].className=String(cards[i].className).replace(/\s*enabled/g,'')
      }
    }
  }
  function dietScreenOn(){
    var screen=document.getElementById('screen-diet');
    return !!(screen&&String(screen.className).indexOf(' on')>=0)
  }
  function refreshDietBase(){
    var refresh=document.getElementById('refresh');
    if(refresh&&dietScreenOn()){refresh.click()}
  }
  function refreshDietAdvanced(){
    if(repairLock||!dietScreenOn()){return}
    var tab=document.querySelector('.nav button[data-tab="diet"]');
    if(!tab){return}
    repairLock=true;
    tab.click();
    setTimeout(function(){repairLock=false;sync()},450)
  }
  function needsClosedRepair(){
    return dietState()==='closed'&&!document.getElementById('fvReopenDiet')
  }
  function sync(){
    normalizeMealCards();
    var state=dietState();
    if(awaitingReopen&&state==='open'){
      awaitingReopen=false;
      setTimeout(refreshDietBase,0);
      return
    }
    if(awaitingClose&&state==='closed'){
      awaitingClose=false;
      setTimeout(refreshDietAdvanced,0);
      return
    }
    if(needsClosedRepair()){
      setTimeout(refreshDietAdvanced,0)
    }
  }
  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t){return}
    if(t.id==='fvReopenDiet'){
      awaitingReopen=true;
      setTimeout(sync,0)
    }else if(t.id==='closeDiet'){
      awaitingClose=true;
      setTimeout(sync,0)
    }
  },true);
  function install(){
    var root=dietRoot();
    if(root&&window.MutationObserver){
      observer=new MutationObserver(function(){setTimeout(sync,0)});
      observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','disabled']})
    }
    sync()
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();

(function(){
  var busy=false;
  var rowObserver=null;
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function initData(){var x=tg();try{return x&&x.initData?x.initData:''}catch(e){return ''}}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]})}
  function alertMsg(text){var x=tg();try{if(x&&x.showAlert){x.showAlert(text);return}}catch(e){}window.alert(text)}
  function notify(text){var e=document.getElementById('toast');if(!e){return}e.textContent=text;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function request(action,payload){return fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':initData()},body:JSON.stringify({action:action,payload:payload||{}})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.reason||j.error||('HTTP '+r.status))}return j.data})})}
  function closeSheet(){var o=document.getElementById('overlay');if(o){o.className='overlay'}}
  function openSheet(html){var o=document.getElementById('overlay'),s=document.getElementById('sheet');if(!o||!s){return}s.innerHTML=html;o.className='overlay on';var c=document.getElementById('fvConsumedClose');if(c){c.onclick=closeSheet}}
  function refreshDiet(){var tab=document.querySelector('.nav button[data-tab="diet"]');if(tab){tab.click();return}var r=document.getElementById('refresh');if(r){r.click()}}
  function dietOpen(){var root=document.getElementById('diet'),pill=root?root.querySelector('.hero .pill'):null,text=String(pill&&pill.textContent?pill.textContent:'').toLowerCase();return text.indexOf('abierta')>=0}
  function rowIndex(row){var root=document.getElementById('diet'),rows=root?root.querySelectorAll('.foodrow'):[];for(var i=0;i<rows.length;i++){if(rows[i]===row){return i}}return -1}
  function editSheet(food){
    var html='<div class="row"><div><div class="ey">✏️ EDITAR ALIMENTO</div><div class="stat" style="margin-top:5px">'+esc(food.product_name||'Alimento')+'</div></div><button class="iconbtn" id="fvConsumedClose">×</button></div>'+
      '<div class="fvField"><label>Cantidad ('+esc(food.unit||'')+')</label><input class="fvText" id="fvConsumedQty" type="text" inputmode="decimal" value="'+esc(food.quantity||'')+'"></div>'+
      '<button class="actionbtn primary wide" style="margin-top:12px" id="fvConsumedSave">Guardar cambios</button>'+
      '<button class="actionbtn danger wide" style="margin-top:8px" id="fvConsumedDelete">Eliminar alimento</button>';
    openSheet(html);
    var save=document.getElementById('fvConsumedSave'),del=document.getElementById('fvConsumedDelete');
    if(save){save.onclick=function(){if(busy){return}busy=true;save.disabled=true;request('edit_food',{food_id:food.id,quantity:document.getElementById('fvConsumedQty').value}).then(function(){busy=false;closeSheet();notify('Cantidad actualizada');setTimeout(refreshDiet,40)}).catch(function(e){busy=false;save.disabled=false;alertMsg(e&&e.message==='diet_closed'?'Reabre la dieta para editar.':(e&&e.message?e.message:String(e)))})}}
    if(del){del.onclick=function(){if(busy){return}if(!window.confirm('¿Eliminar '+String(food.product_name||'este alimento')+'?')){return}busy=true;del.disabled=true;request('delete_food',{food_id:food.id}).then(function(){busy=false;closeSheet();notify('Alimento eliminado');setTimeout(refreshDiet,40)}).catch(function(e){busy=false;del.disabled=false;alertMsg(e&&e.message==='diet_closed'?'Reabre la dieta para editar.':(e&&e.message?e.message:String(e)))})}}
  }
  function openRow(row){
    if(!dietOpen()){alertMsg('Reabre la dieta para editar lo consumido.');return}
    var idx=rowIndex(row);if(idx<0){return}
    request('diet',{}).then(function(d){var foods=d&&d.foods?d.foods:[];if(!foods[idx]){alertMsg('No se pudo localizar el alimento. Actualiza la pantalla.');return}editSheet(foods[idx])}).catch(function(e){alertMsg(e&&e.message?e.message:String(e))})
  }
  function hasActionTarget(t,row){while(t&&t!==row){if(String(t.tagName||'').toLowerCase()==='button'){return true}t=t.parentNode}return false}
  function bindRows(){
    var root=document.getElementById('diet');if(!root){return}
    var rows=root.querySelectorAll('.foodrow');
    for(var i=0;i<rows.length;i++){
      if(rows[i].getAttribute('data-fv-consumed-edit')==='1'){continue}
      rows[i].setAttribute('data-fv-consumed-edit','1');
      rows[i].style.cursor='pointer';
      rows[i].onclick=function(e){if(hasActionTarget(e.target,this)){return}e.preventDefault();e.stopPropagation();openRow(this)}
    }
  }
  function installRows(){
    var root=document.getElementById('diet');
    if(root&&window.MutationObserver){rowObserver=new MutationObserver(function(){setTimeout(bindRows,0)});rowObserver.observe(root,{childList:true,subtree:true})}
    bindRows();setTimeout(bindRows,120);setTimeout(bindRows,500)
  }
  document.addEventListener('click',function(e){
    var t=e.target;if(!t){return}
    var action=t;while(action&&action!==document&&String(action.tagName||'').toLowerCase()!=='button'){action=action.parentNode}
    if(action&&(action.getAttribute('data-edit')!==null||action.getAttribute('data-delete')!==null)){return}
  },false);
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',installRows)}else{installRows()}
})();
