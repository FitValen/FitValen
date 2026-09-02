(function(){
  function stop(e){try{e.preventDefault();e.stopImmediatePropagation()}catch(ignore){}}
  function val(id){var e=document.getElementById(id);return e?String(e.value||'').replace(/^\s+|\s+$/g,''):''}
  function notify(t){var e=document.getElementById('toast');if(!e){return}e.textContent=t;e.className='toast on';setTimeout(function(){e.className='toast'},1800)}
  function validate(e){
    var t=e&&e.target?e.target:null;if(!t||t.id!=='fvManualSave'){return}
    if(!val('fvManualName')||!val('fvManualQty')||!val('fvManualUnit')||!val('fvManualKcal')||!val('fvManualProtein')||!val('fvManualCarbs')||!val('fvManualFat')){
      stop(e);notify('Completa cantidad, kcal y todos los macros');
    }
  }
  document.addEventListener('click',validate,true);
})();
