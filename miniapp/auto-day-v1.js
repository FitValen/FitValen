(function(){
  var autoStarting=false;
  var GOAL_MIN=2000,GOAL_MAX=2300,WATER_LITERS=4;
  function removeManualEnd(){
    /* Web: el día se inicia automáticamente, pero el cierre manual debe seguir disponible. */
  }
  function autoStart(){
    var b=document.getElementById('startDay');
    if(!b||autoStarting){return}
    autoStarting=true;
    try{b.style.display='none'}catch(ignore){}
    setTimeout(function(){
      try{b.click()}catch(ignore){autoStarting=false}
    },0)
  }
  function installGoalStyles(){
    if(document.getElementById('fvDashboardGoalsStyle')){return}
    var style=document.createElement('style');
    style.id='fvDashboardGoalsStyle';
    style.textContent='.fvGoalCard{position:relative;overflow:hidden;border-color:rgba(103,228,147,.16);background:linear-gradient(145deg,rgba(103,228,147,.07),var(--panel))}.fvGoalCard:after{content:"";position:absolute;width:120px;height:120px;border-radius:50%;right:-68px;top:-72px;background:rgba(103,228,147,.07);pointer-events:none}.fvGoalRange{font-size:24px;font-weight:950;letter-spacing:-.035em;margin-top:5px}.fvGoalRange span{font-size:11px;font-weight:850;color:var(--muted);letter-spacing:0}.fvGoalTrack{position:relative;height:9px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden;margin-top:14px}.fvGoalTrack .fvGoalBand{position:absolute;left:86.9565%;right:0;top:0;bottom:0;background:rgba(103,228,147,.14)}.fvGoalTrack i{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .2s ease}.fvGoalScale{position:relative;height:18px;font-size:9px;color:var(--muted);margin-top:5px}.fvGoalScale span{position:absolute;top:0;white-space:nowrap}.fvGoalScale .fvGoalZero{left:0}.fvGoalScale .fvGoalMin{left:86.9565%;transform:translateX(-50%)}.fvGoalScale .fvGoalMax{right:0}.fvGoalFooter{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px;padding-top:10px;border-top:1px solid var(--line);font-size:11px;color:var(--muted)}.fvGoalFooter b{color:var(--soft);font-size:12px}.fvGoalCard .pill.above{color:var(--warning);border-color:rgba(244,197,93,.22);background:rgba(244,197,93,.08)}';
    document.head.appendChild(style);
  }
  function currentCalories(){
    var home=document.getElementById('home');
    if(!home){return 0}
    var big=home.querySelector('.hero .big');
    if(!big){return 0}
    var text=String(big.textContent||'').replace(/\./g,'');
    var m=text.match(/(\d+)/);
    return m?Number(m[1]):0;
  }
  function goalStatus(k){
    if(k<GOAL_MIN){return {text:'Faltan '+Math.max(0,GOAL_MIN-k)+' kcal',className:'pill warn'}}
    if(k<=GOAL_MAX){return {text:'En rango',className:'pill good'}}
    return {text:'+'+(k-GOAL_MAX)+' kcal',className:'pill above'};
  }
  function syncGoals(){
    var home=document.getElementById('home');
    if(!home){return}
    var hero=home.querySelector('.hero');
    if(!hero){return}
    installGoalStyles();
    var card=document.getElementById('fvGoalsCard');
    if(!card){
      card=document.createElement('div');
      card.id='fvGoalsCard';
      card.className='card fvGoalCard';
      card.innerHTML='<div class="row"><div><div class="ey">OBJETIVOS ACTUALES</div><div class="fvGoalRange">2.000–2.300 <span>kcal/día</span></div></div><span id="fvGoalState" class="pill">—</span></div><div class="fvGoalTrack"><span class="fvGoalBand"></span><i id="fvGoalFill" style="width:0%"></i></div><div class="fvGoalScale"><span class="fvGoalZero">0</span><span class="fvGoalMin">2.000</span><span class="fvGoalMax">2.300 kcal</span></div><div class="fvGoalFooter"><span>💧 Hidratación diaria</span><b>4 L de agua</b></div>';
      if(hero.nextSibling){hero.parentNode.insertBefore(card,hero.nextSibling)}else{hero.parentNode.appendChild(card)}
    }
    var k=currentCalories(),pct=Math.max(0,Math.min(100,(k/GOAL_MAX)*100)),state=goalStatus(k);
    var fill=document.getElementById('fvGoalFill');
    if(fill){fill.style.width=pct.toFixed(1)+'%'}
    var badge=document.getElementById('fvGoalState');
    if(badge){if(String(badge.textContent||'')!==state.text){badge.textContent=state.text}if(badge.className!==state.className){badge.className=state.className}}
    var footer=card.querySelector('.fvGoalFooter b'),waterText=WATER_LITERS+' L de agua';
    if(footer&&String(footer.textContent||'')!==waterText){footer.textContent=waterText}
  }
  function sync(){removeManualEnd();autoStart();syncGoals()}
  function install(){
    sync();
    var home=document.getElementById('home');
    if(home&&window.MutationObserver){
      new MutationObserver(function(){setTimeout(sync,0)}).observe(home,{childList:true,subtree:true})
    }else{
      window.setInterval(sync,500)
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',install)}else{install()}
})();
