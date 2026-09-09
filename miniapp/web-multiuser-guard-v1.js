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
  function installAutomaticDayLifecycleUi(){
    if(window.__fvAutomaticDayLifecycleV2){return}
    window.__fvAutomaticDayLifecycleV2=true;
    var autoStarting=false,lastDate='',closeRefreshDate='';
    function madridParts(){
      try{
        var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
        var out={};
        for(var i=0;i<parts.length;i++){out[parts[i].type]=parts[i].value}
        return {date:out.year+'-'+out.month+'-'+out.day,hm:out.hour+':'+out.minute};
      }catch(e){
        var d=new Date(),pad=function(n){return String(n).padStart(2,'0')};
        return {date:d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),hm:pad(d.getHours())+':'+pad(d.getMinutes())};
      }
    }
    function sync(){
      var start=document.getElementById('startDay');
      if(start){
        if(start.style.display!=='none'){start.style.display='none'}
        if(!autoStarting){
          autoStarting=true;
          setTimeout(function(){
            try{if(document.documentElement.contains(start)){start.click()}}catch(ignore){}
            setTimeout(function(){autoStarting=false},300);
          },0);
        }
      }
      var finish=document.getElementById('fvFinishDayBtn');
      if(finish&&finish.parentNode){finish.parentNode.removeChild(finish)}
      var confirm=document.getElementById('fvConfirmFinish');
      if(confirm&&confirm.parentNode){confirm.parentNode.removeChild(confirm)}
      var tools=document.getElementById('fvDayTools');
      if(tools&&/(^|\s)three(\s|$)/.test(tools.className)){
        tools.className=tools.className.replace(/(^|\s)three(?=\s|$)/g,' ').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');
      }
    }
    var now=madridParts();lastDate=now.date;
    sync();
    if(window.MutationObserver){new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true})}
    else{setInterval(sync,500)}
    setInterval(function(){
      var p=madridParts();
      if(p.date!==lastDate){location.reload();return}
      if(p.hm==='23:50'&&closeRefreshDate!==p.date){
        closeRefreshDate=p.date;
        setTimeout(function(){location.reload()},5000);
      }
    },15000);
  }
  function mirrorDaniCloneUi(){
    function syncHydration(){
      var footer=document.querySelector('#fvGoalsCard .fvGoalFooter');
      if(!footer){return}
      if(footer.style.display!=='flex'){footer.style.display='flex'}
      var value=footer.querySelector('b');
      if(value&&value.textContent!=='4 L de agua'){value.textContent='4 L de agua'}
    }
    syncHydration();
    if(window.MutationObserver){new MutationObserver(syncHydration).observe(document.documentElement,{childList:true,subtree:true})}
    else{setInterval(syncHydration,750)}
  }

  installWorkoutAutoFinish();
  installAutomaticDayLifecycleUi();

  var user=webUsername();
  if(user==='dani'){return}
  if(user==='danitest'){mirrorDaniCloneUi();return}
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
