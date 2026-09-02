(function(){
  function prescription(){
    var e=document.querySelector('#fvWorkoutControls .fvPrescription');
    return String(e&&e.textContent?e.textContent:'').replace(/^\s+|\s+$/g,'');
  }
  function sync(){
    var input=document.getElementById('fvSetInput');
    var root=document.getElementById('fvWorkoutControls');
    if(!input||!root){return}
    var p=prescription();
    var hint=root.querySelector('.fvHint');
    if(/fallo/i.test(p)){
      input.placeholder='10,8,7';
      if(hint){hint.textContent='Reps por serie · ejemplo: 10,8,7'}
      return;
    }
    var m=p.match(/(\d+)\s*x\s*(\d+)/i);
    if(m){
      input.placeholder='22,5x'+m[1];
      if(hint){hint.textContent='Peso × series · también puedes indicar una serie cada vez o reps explícitas'}
      return;
    }
    input.placeholder='22,5x4';
  }
  function install(){
    var work=document.getElementById('work');
    if(work&&window.MutationObserver){new MutationObserver(function(){setTimeout(sync,0)}).observe(work,{childList:true,subtree:true})}
    sync();
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
