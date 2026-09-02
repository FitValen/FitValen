(function(){
  var meals=[
    {icon:'🥤',name:'Desayuno',desc:'Whey + frutos secos + leche 0%',kcal:330,slot:'desayuno',variant:'quick_1'},
    {icon:'🍳',name:'Almuerzo',desc:'Claras + huevo + fresas',kcal:169,slot:'almuerzo',variant:'quick_2'},
    {icon:'🍗',name:'Comida',desc:'Pollo + verdura verde',kcal:239,slot:'comida',variant:'quick_3'},
    {icon:'🥛',name:'Merienda',desc:'Yogur + Whey + frutos secos',kcal:326,slot:'merienda',variant:'quick_4'},
    {icon:'🌙',name:'Cena',desc:'Pollo + verdura verde',kcal:239,slot:'cena',variant:'quick_5'},
    {icon:'🍍',name:'Post-entreno',desc:'150 g de piña',kcal:87,slot:'post-entreno',variant:'quick_6'},
    {icon:'🫐',name:'Postre',desc:'Queso batido + arándanos',kcal:118,slot:'postre',variant:'quick_7'}
  ];
  function telegram(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function initData(){var tg=telegram();try{return tg&&tg.initData?tg.initData:''}catch(e){return ''}}
  function haptic(type){var tg=telegram();try{if(tg&&tg.HapticFeedback){tg.HapticFeedback.impactOccurred(type||'light')}}catch(e){}}
  function alertMessage(text){var tg=telegram();try{if(tg&&tg.showAlert){tg.showAlert(text);return}}catch(e){}window.alert(text)}
  function request(action,payload){return fetch(window.location.href,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':initData()},body:JSON.stringify({action:action,payload:payload||{}})}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error('Respuesta no válida')}if(!r.ok||!j.ok){throw new Error(j.reason||j.error||('HTTP '+r.status))}return j.data})})}
  function isDietClosed(diet){var pill=diet?diet.querySelector('.hero .pill'):null;return !!(pill&&String(pill.textContent||'').toLowerCase().indexOf('cerrada')>=0)}
  function buttonHtml(m,i,disabled){return '<button class="quickMealBtn" data-quick="'+i+'" '+(disabled?'disabled':'')+'><div class="quickMealTop"><span class="quickMealIcon">'+m.icon+'</span><span class="quickMealKcal">'+m.kcal+' kcal</span></div><div><div class="quickMealName">'+m.name+'</div><div class="quickMealDesc">'+m.desc+'</div></div></button>'}
  function ensureQuickMeals(){var diet=document.getElementById('diet');if(!diet||document.getElementById('quickMealsWrap')){return}var hero=diet.querySelector('.hero');if(!hero){return}var closed=isDietClosed(diet),wrap=document.createElement('div'),html='';wrap.id='quickMealsWrap';wrap.className='quickMealsWrap';html+='<div class="quickMealsHead"><div class="sectiontitle">⚡ Comidas rápidas</div><div class="sectionmeta">Registro en un toque</div></div>';html+='<div class="quickMealsGrid">';for(var i=0;i<meals.length;i++){html+=buttonHtml(meals[i],i,closed)}html+='</div>';wrap.innerHTML=html;if(hero.nextSibling){hero.parentNode.insertBefore(wrap,hero.nextSibling)}else{hero.parentNode.appendChild(wrap)}var buttons=wrap.querySelectorAll('[data-quick]');for(var b=0;b<buttons.length;b++){buttons[b].onclick=function(){var index=Number(this.getAttribute('data-quick')),meal=meals[index],btn=this;if(!meal||btn.disabled){return}btn.className='quickMealBtn saving';btn.disabled=true;haptic('light');request('choose_meal',{slot:meal.slot,option_index:90,variant_key:meal.variant}).then(function(){btn.className='quickMealBtn done';btn.innerHTML='<div class="quickMealTop"><span class="quickMealIcon">✓</span><span class="quickMealKcal">Guardado</span></div><div><div class="quickMealName">'+meal.name+'</div><div class="quickMealDesc">Actualizando datos…</div></div>';haptic('medium');setTimeout(function(){var r=document.getElementById('refresh');if(r){r.click()}},250)}).catch(function(error){btn.className='quickMealBtn';btn.disabled=false;alertMessage(error&&error.message?error.message:String(error))})}}
  }
  function observe(){ensureQuickMeals();var target=document.getElementById('diet');if(target&&window.MutationObserver){var observer=new MutationObserver(function(){ensureQuickMeals()});observer.observe(target,{childList:true,subtree:false})}else{window.setInterval(ensureQuickMeals,700)}}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',observe)}else{observe()}
})();

(function(){
  function loadWorkout(){
    if(!document.querySelector('link[data-fv-workout]')){var l=document.createElement('link');l.rel='stylesheet';l.href='/workout-v1.css?v=432f55c';l.setAttribute('data-fv-workout','1');document.head.appendChild(l)}
    if(!document.querySelector('script[data-fv-workout]')){var s=document.createElement('script');s.src='/workout-v1.js?v=432f55c';s.setAttribute('data-fv-workout','1');document.body.appendChild(s)}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',loadWorkout)}else{loadWorkout()}
})();
