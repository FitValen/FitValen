(function(){
  var awaitingReopen=false;
  var observer=null;
  function dietRoot(){return document.getElementById('diet')}
  function dietIsOpen(){
    var root=dietRoot();
    var pill=root?root.querySelector('.hero .pill'):null;
    var text=String(pill&&pill.textContent?pill.textContent:'').toLowerCase();
    return text.indexOf('abierta')>=0;
  }
  function normalizeMealCards(){
    var root=dietRoot();
    if(!root){return}
    var open=dietIsOpen();
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
  function refreshDietBase(){
    var refresh=document.getElementById('refresh');
    var screen=document.getElementById('screen-diet');
    if(refresh&&screen&&String(screen.className).indexOf(' on')>=0){refresh.click()}
  }
  function sync(){
    normalizeMealCards();
    if(awaitingReopen&&dietIsOpen()){
      awaitingReopen=false;
      setTimeout(refreshDietBase,0);
    }
  }
  document.addEventListener('click',function(e){
    var t=e.target;
    if(t&&t.id==='fvReopenDiet'){
      awaitingReopen=true;
      setTimeout(sync,0);
    }
  },true);
  function install(){
    var root=dietRoot();
    if(root&&window.MutationObserver){
      observer=new MutationObserver(function(){setTimeout(sync,0)});
      observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','disabled']});
    }
    sync();
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
