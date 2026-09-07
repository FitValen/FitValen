/* FitValen Web · Performance UI v2
   Ajustes exclusivamente visuales. Mantiene lógica, listeners y datos existentes. */
(function(){
  var scheduled=false;
  function txt(el){return el?String(el.textContent||''):''}
  function hasClass(el,name){return !!(el&&(' '+String(el.className||'')+' ').indexOf(' '+name+' ')>=0)}
  function addClass(el,name){if(!el||hasClass(el,name)){return}el.className=(String(el.className||'')+' '+name).replace(/^\s+|\s+$/g,'')}
  function svg(name){
    var a=' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    if(name==='meal'){return '<svg'+a+'<path d="M7 3v7"></path><path d="M4.5 3v4.5A2.5 2.5 0 0 0 7 10"></path><path d="M9.5 3v4.5A2.5 2.5 0 0 1 7 10v11"></path><path d="M16 3v18"></path><path d="M16 3c3.2 2.2 4 5.5 4 8h-4"></path></svg>'}
    if(name==='sun'){return '<svg'+a+'<circle cx="12" cy="12" r="3.5"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.9 4.9 1.4 1.4"></path><path d="m17.7 17.7 1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.9 19.1 1.4-1.4"></path><path d="m17.7 6.3 1.4-1.4"></path></svg>'}
    if(name==='moon'){return '<svg'+a+'<path d="M20 15.2A8 8 0 1 1 8.8 4 6.4 6.4 0 0 0 20 15.2Z"></path></svg>'}
    if(name==='fruit'){return '<svg'+a+'<path d="M12 7c-4 0-7 2.7-7 6.2C5 17 8 20 12 20s7-3 7-6.8C19 9.7 16 7 12 7Z"></path><path d="M12 7c0-2 1.4-3.5 3.5-4"></path><path d="M12 6c-1.5-1.7-3.4-2-5-1.3"></path></svg>'}
    if(name==='cup'){return '<svg'+a+'<path d="M5 8h11v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"></path><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"></path><path d="M8 4v2"></path><path d="M12 4v2"></path></svg>'}
    if(name==='logout'){return '<svg'+a+'<path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"></path><path d="M14 8l4 4-4 4"></path><path d="M18 12H9"></path></svg>'}
    return '<svg'+a+'<circle cx="12" cy="12" r="8"></circle></svg>';
  }
  function iconForSlot(slot){
    var s=String(slot||'').toLowerCase();
    if(s==='ayunas'){return 'sun'}
    if(s==='cena'||s==='antes de dormir'){return 'moon'}
    if(s==='post-entreno'||s==='postre'){return 'fruit'}
    if(s==='merienda'){return 'cup'}
    return 'meal';
  }
  function applyChrome(){
    var brand=document.querySelector('.topbar .brand');
    if(brand&&txt(brand)!=='FitValen'){brand.textContent='FitValen'}
    var status=document.getElementById('status');
    if(status&&txt(status)==='Web · conectado'){status.textContent='Conectado'}
    var logout=document.getElementById('fvWebLogout');
    if(logout&&logout.getAttribute('data-fv-v2')!=='1'){
      logout.setAttribute('data-fv-v2','1');logout.setAttribute('aria-label','Cerrar sesión');logout.title='Cerrar sesión';logout.innerHTML=svg('logout');
    }
  }
  function applyDiet(){
    var root=document.getElementById('diet');if(!root){return}addClass(root,'fvDietPerformance');
    var hero=root.querySelector('.hero'),ey=hero?hero.querySelector('.ey'):null;
    if(ey&&txt(ey)==='Alimentación'){ey.textContent='Dieta'}
    var cards=root.querySelectorAll('.mealcard[data-slot]');
    for(var i=0;i<cards.length;i++){
      var icon=cards[i].querySelector('.mealicon'),slot=cards[i].getAttribute('data-slot')||'';
      if(icon&&icon.getAttribute('data-fv-v2')!=='1'){icon.setAttribute('data-fv-v2','1');icon.innerHTML=svg(iconForSlot(slot))}
    }
    var quick=root.querySelectorAll('.quickMealBtn[data-quick]');
    for(var q=0;q<quick.length;q++){
      var qi=quick[q].querySelector('.quickMealIcon');
      if(qi&&qi.getAttribute('data-fv-v2')!=='1'){qi.setAttribute('data-fv-v2','1');qi.innerHTML=svg('meal')}
    }
  }
  function applyWork(){
    var root=document.getElementById('work');if(!root){return}addClass(root,'fvWorkPerformance');
    var fd=root.querySelector('.fvFocusDay');
    if(fd&&txt(fd).indexOf('🐗 ')===0){fd.textContent=txt(fd).replace('🐗 ','')}
    var ab=root.querySelector('.activebanner .ey');
    if(ab&&txt(ab).indexOf('▶️ ')===0){ab.textContent=txt(ab).replace('▶️ ','')}
    var start=root.querySelector('.fvStartCard .fvEy');
    if(start&&txt(start)==='MODO BESTIA'){start.textContent='Entrenamiento'}
  }
  function applyProgress(){var root=document.getElementById('progress');if(root){addClass(root,'fvProgressPerformance')}}
  function apply(){scheduled=false;applyChrome();applyDiet();applyWork();applyProgress()}
  function schedule(){if(scheduled){return}scheduled=true;setTimeout(apply,0)}
  function install(){
    schedule();
    var app=document.getElementById('app');
    if(app&&window.MutationObserver){new MutationObserver(schedule).observe(app,{childList:true,subtree:true,characterData:true})}
    var nav=document.querySelectorAll('.nav button[data-tab]');
    for(var i=0;i<nav.length;i++){nav[i].addEventListener('click',function(){setTimeout(apply,80)})}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
