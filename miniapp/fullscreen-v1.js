(function(){
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function haptic(){var x=tg();try{if(x&&x.HapticFeedback){x.HapticFeedback.impactOccurred('light')}}catch(e){}}
  function state(){var x=tg();try{return !!(x&&x.isFullscreen)}catch(e){return false}}
  function sync(){var b=document.getElementById('fvFullscreenBtn');if(!b){return}var on=state();b.className='iconbtn'+(on?' on':'');b.textContent=on?'⛶':'⛶';b.setAttribute('aria-label',on?'Salir de pantalla completa':'Pantalla completa');b.title=on?'Salir de pantalla completa':'Pantalla completa'}
  function toggle(){var x=tg();if(!x){return}haptic();try{
    if(state()&&typeof x.exitFullscreen==='function'){x.exitFullscreen();return}
    if(typeof x.requestFullscreen==='function'){x.requestFullscreen();return}
    if(typeof x.expand==='function'){x.expand();var b=document.getElementById('fvFullscreenBtn');if(b){b.className='iconbtn unsupported';b.title='Vista ampliada';b.setAttribute('aria-label','Vista ampliada')}return}
  }catch(e){try{if(typeof x.expand==='function'){x.expand()}}catch(ignore){}}
  }
  function install(){var actions=document.querySelector('.topactions'),beta=actions?actions.querySelector('.beta'):null;if(!actions||!beta||document.getElementById('fvFullscreenBtn')){return}var b=document.createElement('button');b.id='fvFullscreenBtn';b.className='iconbtn';b.type='button';b.textContent='⛶';b.setAttribute('aria-label','Pantalla completa');b.title='Pantalla completa';b.onclick=toggle;actions.insertBefore(b,beta);var x=tg();try{if(x&&typeof x.onEvent==='function'){x.onEvent('fullscreenChanged',sync);x.onEvent('fullscreenFailed',sync)}}catch(e){}sync()}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
