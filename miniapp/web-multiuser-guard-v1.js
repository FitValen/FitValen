(function(){
  function webUsername(){
    try{
      var token=localStorage.getItem('fitvalen_web_session')||'';
      var part=token.split('.')[1]||'';
      if(!part){return ''}
      part=part.replace(/-/g,'+').replace(/_/g,'/');
      while(part.length%4){part+='='}
      var payload=JSON.parse(atob(part));
      return String(payload&&payload.username||'').toLowerCase();
    }catch(e){return ''}
  }
  function notify(text){
    var e=document.getElementById('toast');
    if(!e){return}
    e.textContent=text;
    e.className='toast on';
    setTimeout(function(){e.className='toast'},2200);
  }
  function targetSeries(active){
    var p=String(active&&active.exercise&&active.exercise.prescription?active.exercise.prescription:'');
    var re=/(\d+)\s*[x×]/gi,m,total=0;
    while((m=re.exec(p))!==null){total+=Number(m[1]||0)}
    return total>0?total:null;
  }
  function lastExerciseComplete(active){
    if(!active||!active.exercise){return false}
    var plan=active.plan||[],code=String(active.exercise.exercise_code||''),idx=-1;
    for(var i=0;i<plan.length;i++){
      if(String(plan[i].exercise_code||'')===code){idx=i;break}
    }
    if(idx<0||idx!==plan.length-1){return false}
    var target=targetSeries(active),count=active.currentSets?active.currentSets.length:0;
    return !!target&&count>=target;
  }
  function installWorkoutAutoFinish(){
    if(window.__fvWorkoutAutoFinishV1){return}
    window.__fvWorkoutAutoFinishV1=true;
    var nativeFetch=window.fetch,finishing=false;
    window.fetch=function(input,init){
      var response=nativeFetch.apply(this,arguments);
      try{
        var url=typeof input==='string'?input:(input&&input.url?input.url:'');
        if(url!==window.location.href||!init||String(init.method||'GET').toUpperCase()!=='POST'){return response}
        var body=null;
        try{body=JSON.parse(typeof init.body==='string'?init.body:String(init.body||''))}catch(ignore){}
        if(!body||String(body.action||'')!=='add_sets'){return response}
        response.then(function(r){
          if(finishing||!r||!r.ok){return}
          r.clone().text().then(function(t){
            var j=null;
            try{j=JSON.parse(t)}catch(ignore){}
            var active=j&&j.ok&&j.data?j.data.active:null;
            if(!lastExerciseComplete(active)){return}
            finishing=true;
            var headers=init.headers||{'content-type':'application/json','x-telegram-init-data':'web-session'};
            nativeFetch(window.location.href,{method:'POST',headers:headers,body:JSON.stringify({action:'finish_workout',payload:{}})})
              .then(function(fr){return fr.text().then(function(ft){var fj=null;try{fj=JSON.parse(ft)}catch(ignore){}if(!fr.ok||!fj||!fj.ok){throw new Error(fj&&fj.error?fj.error:'finish_workout_failed')}return fj})})
              .then(function(){
                finishing=false;
                notify('🏁 Entrenamiento completado');
                var work=document.querySelector('.nav button[data-tab="work"]');
                if(work){setTimeout(function(){work.click()},80)}
              })
              .catch(function(){
                finishing=false;
                notify('No se pudo cerrar automáticamente el entrenamiento');
              });
          }).catch(function(){});
        }).catch(function(){});
      }catch(ignore){}
      return response;
    };
  }

  installWorkoutAutoFinish();

  var user=webUsername();
  if(user==='dani'){return}
  function hideLegacyPersonalUi(){
    var quick=document.getElementById('quickMealsWrap');
    if(quick){quick.style.display='none'}
  }
  var style=document.createElement('style');
  style.setAttribute('data-fv-web-multiuser-guard','1');
  style.textContent='#quickMealsWrap{display:none!important}';
  document.head.appendChild(style);
  document.addEventListener('click',function(e){
    var t=e&&e.target&&e.target.closest?e.target.closest('.quickMealBtn'):null;
    if(t){e.preventDefault();e.stopImmediatePropagation()}
  },true);
  hideLegacyPersonalUi();
  if(window.MutationObserver){
    new MutationObserver(hideLegacyPersonalUi).observe(document.documentElement,{childList:true,subtree:true});
  }
})();
