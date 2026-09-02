(function(){
  function tg(){try{return window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null}catch(e){return null}}
  function isFullscreen(){var x=tg();try{return !!(x&&x.isFullscreen)}catch(e){return false}}
  function topInset(){var x=tg(),safe=0,content=0;try{if(x&&x.safeAreaInset){safe=Number(x.safeAreaInset.top||0)}}catch(e){}try{if(x&&x.contentSafeAreaInset){content=Number(x.contentSafeAreaInset.top||0)}}catch(e){}return Math.max(0,safe,content)}
  function ensureStyle(){if(document.getElementById('fvSafeAreaV2Style')){return}var s=document.createElement('style');s.id='fvSafeAreaV2Style';s.textContent=':root{--fv-tg-safe-top:0px}html.fvFullscreenSafe .app{padding-top:calc(var(--fv-tg-safe-top) + env(safe-area-inset-top,0px) + 10px)!important}html.fvFullscreenSafe .topbar{top:calc(var(--fv-tg-safe-top) + env(safe-area-inset-top,0px))!important}@media(max-width:390px){html.fvFullscreenSafe .app{padding-top:calc(var(--fv-tg-safe-top) + env(safe-area-inset-top,0px) + 8px)!important}}';document.head.appendChild(s)}
  function apply(){var root=document.documentElement,top=topInset(),on=isFullscreen();ensureStyle();try{root.style.setProperty('--fv-tg-safe-top',top+'px')}catch(e){}if(root.classList){if(on){root.classList.add('fvFullscreenSafe')}else{root.classList.remove('fvFullscreenSafe')}}}
  function refresh(){apply();setTimeout(apply,80);setTimeout(apply,260);setTimeout(apply,700)}
  function install(){ensureStyle();var x=tg();try{if(x&&typeof x.onEvent==='function'){x.onEvent('fullscreenChanged',refresh);x.onEvent('safeAreaChanged',refresh);x.onEvent('contentSafeAreaChanged',refresh);x.onEvent('viewportChanged',refresh)}}catch(e){}refresh()}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
