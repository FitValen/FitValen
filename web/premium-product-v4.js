/* FitValen Web · Premium Product UI v4
   Reestructura solo presentación; conserva nodos funcionales y listeners. */
(function(){
  var scheduled=false;
  function txt(el){return el?String(el.textContent||'').replace(/^\s+|\s+$/g,''):''}
  function cls(el,name){if(!el){return}var s=' '+String(el.className||'')+' ';if(s.indexOf(' '+name+' ')<0){el.className=(String(el.className||'')+' '+name).replace(/^\s+|\s+$/g,'')}}
  function token(){try{return localStorage.getItem('fitvalen_web_session')||''}catch(e){return ''}}
  function svg(name){
    var a=' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    if(name==='logout'){return '<svg'+a+'<path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"></path><path d="M14 8l4 4-4 4"></path><path d="M18 12H9"></path></svg>'}
    if(name==='more'){return '<svg'+a+'<circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg>'}
    return '';
  }
  function ensureIntro(screenId,title,sub,badge){
    var screen=document.getElementById(screenId);if(!screen){return}
    var old=screen.querySelector(':scope > .fvPremiumIntro');
    if(!old){
      old=document.createElement('div');old.className='fvPremiumIntro';
      old.innerHTML='<div><div class="fvPremiumIntroTitle"></div><div class="fvPremiumIntroSub"></div></div><div class="fvPremiumIntroBadge"></div>';
      screen.insertBefore(old,screen.firstChild);
    }
    var t=old.querySelector('.fvPremiumIntroTitle'),s=old.querySelector('.fvPremiumIntroSub'),b=old.querySelector('.fvPremiumIntroBadge');
    if(t&&txt(t)!==title){t.textContent=title}
    if(s&&txt(s)!==sub){s.textContent=sub}
    if(b){if(badge){b.textContent=badge;b.style.display='flex'}else{b.style.display='none'}}
  }
  function applyShell(){
    if(!token()){return}
    ensureIntro('screen-home','Hoy','Tu estado diario, de un vistazo','FitValen');
    ensureIntro('screen-diet','Dieta','Plan, registro y consumo de hoy','Nutrición');
    ensureIntro('screen-work','Entrenamiento','Rutina vigente y sesión activa','Rendimiento');
    ensureIntro('screen-progress','Progreso','Tendencias reales de peso, nutrición y entrenamiento','Evolución');
    var logout=document.getElementById('fvWebLogout');
    if(logout&&logout.getAttribute('data-fv-premium')!=='1'){
      logout.setAttribute('data-fv-premium','1');logout.innerHTML=svg('logout');logout.setAttribute('aria-label','Cerrar sesión');logout.title='Cerrar sesión';
    }
    var more=document.getElementById('fvMore');
    if(more&&more.getAttribute('data-fv-premium')!=='1'){more.setAttribute('data-fv-premium','1');more.innerHTML=svg('more');more.setAttribute('aria-label','Más opciones')}
  }
  function applyHome(){
    var root=document.getElementById('home');if(!root||!token()){return}cls(root,'fvHomePremiumV4');
    var heads=root.querySelectorAll(':scope > .sectionhead .sectiontitle');
    for(var i=0;i<heads.length;i++){
      var t=txt(heads[i]);
      if(t==='Hoy'||t==='Estado de hoy'){heads[i].textContent='Estado de hoy'}
      else if(t==='FitValen'){heads[i].textContent='Recomendación de hoy'}
    }
    var summary=document.getElementById('fvSummaryBtn');if(summary&&txt(summary)!=='Resumen del día'){summary.textContent='Resumen del día'}
    var fin=document.getElementById('fvFinishDayBtn');if(fin&&txt(fin)!=='Finalizar día'){fin.textContent='Finalizar día'}
    var free=document.getElementById('fvFullFreeBtn');if(free&&txt(free)!=='Marcar día libre'){free.textContent='Marcar día libre'}
  }
  function applyDiet(){
    var root=document.getElementById('diet');if(!root||!token()){return}cls(root,'fvDietPremiumV4');
    var heads=root.querySelectorAll('.sectionhead .sectiontitle');
    for(var i=0;i<heads.length;i++){
      var t=txt(heads[i]).toLowerCase();
      if(t.indexOf('comidas del plan')>=0){heads[i].textContent='Plan de hoy'}
      if(t.indexOf('consumido hoy')>=0){heads[i].textContent='Consumido hoy'}
    }
    var close=document.getElementById('closeDiet');if(close&&txt(close).indexOf('Cerrar dieta')<0){close.textContent='Cerrar dieta'}
  }
  function applyWork(){
    var root=document.getElementById('work');if(!root||!token()){return}cls(root,'fvWorkPremiumV4');
    var hero=root.querySelector(':scope > .hero .ey');if(hero&&txt(hero)==='Entrenamiento'){hero.textContent='Rutina seleccionada'}
    var head=root.querySelector(':scope > .sectionhead .sectiontitle');if(head&&txt(head)==='Rutina vigente'){head.textContent='Ejercicios'}
    var more=document.getElementById('fvMore');
    if(more&&more.getAttribute('data-fv-premium')!=='1'){more.setAttribute('data-fv-premium','1');more.innerHTML=svg('more');more.setAttribute('aria-label','Más opciones')}
    var reg=document.getElementById('fvAddSet');if(reg&&txt(reg)!=='Registrar serie'){reg.textContent='Registrar serie'}
  }
  function applyProgress(){
    var root=document.getElementById('progress');if(!root||!token()){return}cls(root,'fvProgressPremiumV4');
    var heads=root.querySelectorAll('.sectionhead .sectiontitle');
    for(var i=0;i<heads.length;i++){
      var t=txt(heads[i]);
      if(t==='Últimos entrenamientos'){heads[i].textContent='Actividad reciente'}
      if(t==='Tendencias'){heads[i].textContent='Tendencias de entrenamiento'}
    }
  }
  function applyLogin(){
    if(token()){return}
    var app=document.getElementById('app');if(!app){return}
    cls(document.documentElement,'fvPremiumLogin');
    var panel=app.querySelector(':scope > .fvLoginBrandPanel');
    if(!panel){
      panel=document.createElement('div');panel.className='fvLoginBrandPanel';
      panel.innerHTML='<div class="fvLoginKicker">FITVALEN PERFORMANCE</div><div class="fvLoginTitle">Tu rendimiento,<br>bien organizado.</div><div class="fvLoginCopy">Alimentación, entrenamiento, peso y progreso en una única herramienta personal, rápida y privada.</div><div class="fvLoginPoints"><span class="fvLoginPoint">Dieta diaria</span><span class="fvLoginPoint">Entrenamiento</span><span class="fvLoginPoint">Progreso real</span></div>';
      var homeScreen=document.getElementById('screen-home');
      if(homeScreen){app.insertBefore(panel,homeScreen)}else{app.appendChild(panel)}
    }
    var hero=document.querySelector('#home .hero');
    if(hero){
      var ey=hero.querySelector('.ey'),big=hero.querySelector('.big'),small=hero.querySelector('.small');
      if(ey){ey.textContent='Acceso privado'}
      if(big){big.textContent='Iniciar sesión'}
      if(small){small.textContent='Entra para acceder a tus datos y continuar tu día.'}
    }
    var button=document.getElementById('fvWebLogin');if(button&&txt(button)!=='Entrar a FitValen'){button.textContent='Entrar a FitValen'}
  }
  function apply(){
    scheduled=false;
    applyLogin();
    applyShell();
    applyHome();
    applyDiet();
    applyWork();
    applyProgress();
  }
  function schedule(){if(scheduled){return}scheduled=true;setTimeout(apply,0)}
  function install(){
    apply();
    if(window.MutationObserver){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']})}
    document.addEventListener('click',function(){setTimeout(schedule,30)},false);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
