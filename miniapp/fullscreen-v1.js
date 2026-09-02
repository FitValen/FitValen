(function(){
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function haptic(){var x=tg();try{if(x&&x.HapticFeedback){x.HapticFeedback.impactOccurred('light')}}catch(e){}}
  function state(){var x=tg();try{return !!(x&&x.isFullscreen)}catch(e){return false}}
  function topInset(){var x=tg(),a=0,b=0;try{if(x&&x.safeAreaInset){a=Number(x.safeAreaInset.top||0)}}catch(e){}try{if(x&&x.contentSafeAreaInset){b=Number(x.contentSafeAreaInset.top||0)}}catch(e){}return Math.max(0,a,b)}
  function applySafeArea(){var root=document.documentElement,on=state(),top=topInset();try{root.style.setProperty('--fv-tg-safe-top',top+'px')}catch(e){}if(root.classList){if(on){root.classList.add('fvFullscreenOn')}else{root.classList.remove('fvFullscreenOn')}}}
  function sync(){var b=document.getElementById('fvFullscreenBtn');applySafeArea();if(!b){return}var on=state();b.className='iconbtn'+(on?' on':'');b.textContent='⛶';b.setAttribute('aria-label',on?'Salir de pantalla completa':'Pantalla completa');b.title=on?'Salir de pantalla completa':'Pantalla completa'}
  function deferredSync(){sync();setTimeout(sync,80);setTimeout(sync,260)}
  function toggle(){var x=tg();if(!x){return}haptic();try{
    if(state()&&typeof x.exitFullscreen==='function'){x.exitFullscreen();deferredSync();return}
    if(typeof x.requestFullscreen==='function'){x.requestFullscreen();deferredSync();return}
    if(typeof x.expand==='function'){x.expand();var b=document.getElementById('fvFullscreenBtn');if(b){b.className='iconbtn unsupported';b.title='Vista ampliada';b.setAttribute('aria-label','Vista ampliada')}return}
  }catch(e){try{if(typeof x.expand==='function'){x.expand()}}catch(ignore){}}
  }
  function install(){var actions=document.querySelector('.topactions'),beta=actions?actions.querySelector('.beta'):null;if(!actions||!beta||document.getElementById('fvFullscreenBtn')){return}var b=document.createElement('button');b.id='fvFullscreenBtn';b.className='iconbtn';b.type='button';b.textContent='⛶';b.setAttribute('aria-label','Pantalla completa');b.title='Pantalla completa';b.onclick=toggle;actions.insertBefore(b,beta);var x=tg();try{if(x&&typeof x.onEvent==='function'){x.onEvent('fullscreenChanged',deferredSync);x.onEvent('fullscreenFailed',deferredSync);x.onEvent('safeAreaChanged',deferredSync);x.onEvent('contentSafeAreaChanged',deferredSync);x.onEvent('viewportChanged',deferredSync)}}catch(e){}deferredSync()}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
