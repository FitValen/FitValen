(function(){
  function text(el){return el?String(el.textContent||''):''}
  function stop(e){try{e.preventDefault();e.stopImmediatePropagation()}catch(ignore){}}
  function confirmFinish(e){
    var t=e&&e.target?e.target:null;
    if(!t||t.id!=='fvConfirmFinish'){return}
    var sheet=document.getElementById('sheet');
    var pending=sheet?sheet.querySelector('.fvPending'):null;
    var p=text(pending);
    if((p.indexOf('Dieta abierta')>=0||p.indexOf('Entrenamiento abierto')>=0)&&!window.confirm('Hay elementos abiertos. ¿Quieres cerrarlos automáticamente y finalizar el día?')){stop(e);return}
    if(p.indexOf('Comida registrada después de cerrar dieta')>=0&&!window.confirm('Hay comida posterior al cierre de dieta. ¿Quieres incorporarla al día antes de cerrarlo?')){stop(e);return}
  }
  document.addEventListener('click',confirmFinish,true);
})();
