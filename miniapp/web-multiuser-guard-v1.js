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
