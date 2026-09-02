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
