(function(){
  var autoStarting=false;
  function removeManualEnd(){
    var b=document.getElementById('fvFinishDayBtn');
    if(b&&b.parentNode){b.parentNode.removeChild(b)}
    var tools=document.getElementById('fvDayTools');
    if(tools){tools.className='fvInlineTools'}
  }
  function autoStart(){
    var b=document.getElementById('startDay');
    if(!b||autoStarting){return}
    autoStarting=true;
    try{b.style.display='none'}catch(ignore){}
    setTimeout(function(){
      try{b.click()}catch(ignore){autoStarting=false}
    },0)
  }
  function sync(){removeManualEnd();autoStart()}
  function install(){
    sync();
    var home=document.getElementById('home');
    if(home&&window.MutationObserver){
      new MutationObserver(function(){setTimeout(sync,0)}).observe(home,{childList:true,subtree:true})
    }else{
      window.setInterval(sync,500)
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
