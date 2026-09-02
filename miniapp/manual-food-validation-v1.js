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
  function loadZepp(){
    if(!document.querySelector('link[href*="zepp-v1.css"]')){var l=document.createElement('link');l.rel='stylesheet';l.href='/zepp-v1.css?v=1498cd6';document.head.appendChild(l)}
    if(!document.querySelector('script[src*="zepp-v1.js"]')){var s=document.createElement('script');s.src='/zepp-v1.js?v=92d72d9';s.defer=true;document.body.appendChild(s)}
  }
  document.addEventListener('click',validate,true);
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',loadZepp)}else{loadZepp()}
})();
