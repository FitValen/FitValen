/* FitValen Web · Home Performance UI v1
   Reorganiza únicamente el DOM visual de Inicio. Mantiene listeners y lógica existentes. */
(function(){
  var scheduled=false;
  function text(el){return el?String(el.textContent||''):''}
  function svg(name){
    var a=' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    if(name==='diet'){return '<svg'+a+'<path d="M7 3v7"></path><path d="M4.5 3v4.5A2.5 2.5 0 0 0 7 10"></path><path d="M9.5 3v4.5A2.5 2.5 0 0 1 7 10v11"></path><path d="M16 3v18"></path><path d="M16 3c3.2 2.2 4 5.5 4 8h-4"></path></svg>'}
    if(name==='work'){return '<svg'+a+'<path d="M3 9v6"></path><path d="M6 7v10"></path><path d="M18 7v10"></path><path d="M21 9v6"></path><path d="M6 12h12"></path></svg>'}
    if(name==='weight'){return '<svg'+a+'<path d="M5 5h14l1 15H4L5 5Z"></path><path d="M9 9a3 3 0 0 1 6 0"></path><path d="m12 9 1.6-1.6"></path></svg>'}
    return '';
  }
  function localDate(ey){
    var raw=text(ey),m=raw.match(/(\d{4})-(\d{2})-(\d{2})/);
    if(!m){return}
    try{
      var d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),12,0,0);
      var out=new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(d);
      if(out){ey.textContent=out.charAt(0).toUpperCase()+out.slice(1)}
    }catch(ignore){}
  }
  function labelButton(id,label){var b=document.getElementById(id);if(b&&text(b)!==label){b.textContent=label}}
  function apply(){
    scheduled=false;
    var root=document.getElementById('home');
    if(!root||!root.querySelector('.hero')){return}
    if((' '+root.className+' ').indexOf(' fvHomePerformance ')<0){root.className=(root.className+' fvHomePerformance').replace(/^\s+|\s+$/g,'')}
    var hero=root.querySelector('.hero');
    var ey=hero.querySelector('.ey');
    localDate(ey);

    var goal=document.getElementById('fvGoalsCard');
    var actions=hero.querySelector('.actionRow');
    if(goal&&goal.parentNode!==hero){hero.insertBefore(goal,actions||null)}
    if(goal){
      var gy=goal.querySelector('.ey');if(gy&&text(gy)!=='Objetivo diario'){gy.textContent='Objetivo diario'}
      var footer=goal.querySelector('.fvGoalFooter');
      if(footer){var spans=footer.querySelectorAll('span');if(spans.length&&text(spans[0])!=='Hidratación'){spans[0].textContent='Hidratación'}}
    }

    var grids=root.querySelectorAll(':scope > .grid3');
    if(grids.length&&grids[0].parentNode!==hero){hero.insertBefore(grids[0],actions||null)}

    labelButton('goDiet','Abrir dieta');
    var sw=document.getElementById('setWeight');
    if(sw){sw.textContent=text(sw).toLowerCase().indexOf('actualizar')>=0?'Actualizar peso':'Registrar peso'}
    labelButton('startDay','Iniciar día');

    var heads=root.querySelectorAll(':scope > .sectionhead .sectiontitle');
    for(var i=0;i<heads.length;i++){
      var t=text(heads[i]);
      if(t==='Estado de hoy'){heads[i].textContent='Hoy'}
      else if(t==='FitValen'){heads[i].textContent='FitValen'}
    }

    var rows=root.querySelectorAll('.timelineRow');
    for(var r=0;r<rows.length;r++){
      var icon=rows[r].querySelector('.timelineIcon');
      if(!icon){continue}
      var title=text(rows[r].querySelector('.timelineTitle')).toLowerCase();
      var kind=title.indexOf('dieta')>=0?'diet':(title.indexOf('día ')===0||title.indexOf('entren')>=0?'work':'weight');
      if(icon.getAttribute('data-fv-home-icon')!==kind){icon.setAttribute('data-fv-home-icon',kind);icon.innerHTML=svg(kind)}
    }

    var brain=root.querySelector('.card.brain');
    var tools=document.getElementById('fvDayTools');
    if(tools&&brain&&tools.parentNode===root&&brain.parentNode===root&&tools.previousSibling!==brain){
      if(brain.nextSibling){root.insertBefore(tools,brain.nextSibling)}else{root.appendChild(tools)}
    }
    labelButton('fvSummaryBtn','Resumen');
    labelButton('fvSummaryOnly','Resumen del día');
    labelButton('fvFinishDayBtn','Finalizar día');
    labelButton('fvFullFreeBtn','Día libre');
  }
  function schedule(){if(scheduled){return}scheduled=true;setTimeout(apply,0)}
  function install(){
    schedule();
    var root=document.getElementById('home');
    if(root&&window.MutationObserver){new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true})}
    var nav=document.querySelectorAll('.nav button');
    for(var i=0;i<nav.length;i++){if(nav[i].getAttribute('data-tab')==='home'){nav[i].addEventListener('click',function(){setTimeout(apply,40)})}}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
