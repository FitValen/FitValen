/* FitValen Web · UX Polish v3
   Mejora semántica y micro-UX sin alterar acciones ni estado. */
(function(){
  var scheduled=false;
  function txt(el){return el?String(el.textContent||'').replace(/^\s+|\s+$/g,''):''}
  function apply(){
    scheduled=false;
    var nav=document.querySelector('.nav');
    if(nav&&!nav.getAttribute('aria-label')){nav.setAttribute('aria-label','Navegación principal')}
    var buttons=document.querySelectorAll('.nav button[data-tab]');
    for(var i=0;i<buttons.length;i++){
      buttons[i].setAttribute('aria-current',String(buttons[i].className||'').indexOf('on')>=0?'page':'false');
    }
    var main=document.getElementById('app');
    if(main&&!main.getAttribute('role')){main.setAttribute('role','main')}
    var closeButtons=document.querySelectorAll('.sheet .iconbtn');
    for(var c=0;c<closeButtons.length;c++){
      if(txt(closeButtons[c])==='×'&&!closeButtons[c].getAttribute('aria-label')){closeButtons[c].setAttribute('aria-label','Cerrar')}
    }
    var editButtons=document.querySelectorAll('.fvFoodActions .fvMiniBtn');
    for(var e=0;e<editButtons.length;e++){
      if(!editButtons[e].getAttribute('aria-label')){
        var t=txt(editButtons[e]);
        editButtons[e].setAttribute('aria-label',t==='×'?'Eliminar alimento':'Editar alimento');
      }
    }
    var sheet=document.getElementById('sheet');
    if(sheet&&sheet.parentNode&&String(sheet.parentNode.className||'').indexOf(' on')>=0){
      sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
    }
  }
  function schedule(){if(scheduled){return}scheduled=true;setTimeout(apply,0)}
  function install(){
    apply();
    var app=document.getElementById('app');
    if(app&&window.MutationObserver){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
    document.addEventListener('click',schedule,false);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
