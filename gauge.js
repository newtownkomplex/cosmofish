(() => {
  const style = document.createElement('style');
  style.textContent = `
    .pond { display:block !important; position:relative !important; padding:0 !important; animation:none !important; }
    .spot { position:absolute !important; margin:0 !important; width:min(21%,190px) !important; aspect-ratio:1 !important; animation:cosmofishSpotReveal 1.8s ease-out both !important; }
    .spot:nth-child(1){left:50%!important;top:2%!important;transform:translateX(-50%)!important;animation-delay:.15s!important}
    .spot:nth-child(2){left:32%!important;top:37%!important;transform:translateX(-50%)!important;animation-delay:.3s!important}
    .spot:nth-child(3){left:68%!important;top:37%!important;transform:translateX(-50%)!important;animation-delay:.45s!important}
    .spot:nth-child(4){left:16%!important;top:72%!important;transform:translateX(-50%)!important;animation-delay:.6s!important}
    .spot:nth-child(5){left:50%!important;top:72%!important;transform:translateX(-50%)!important;animation-delay:.75s!important}
    .spot:nth-child(6){left:84%!important;top:72%!important;transform:translateX(-50%)!important;animation-delay:.9s!important}
    @keyframes cosmofishSpotReveal{0%{opacity:0;filter:brightness(.15) blur(4px);transform:translateX(-50%) scale(.82)}55%{opacity:.55;filter:brightness(.55) blur(1px)}100%{opacity:1;filter:brightness(1) blur(0);transform:translateX(-50%) scale(1)}}
    .screen{animation:cosmofishScreenReveal 2.2s ease-out both!important}.header{animation:cosmofishYellowReveal 2s ease-out .15s both!important}.book-button{animation:cosmofishYellowFill 1.8s ease-out .25s both!important}.gauge{animation:cosmofishYellowReveal 2s ease-out .45s both!important}.status{animation:cosmofishYellowReveal 2s ease-out .6s both!important}
    @keyframes cosmofishScreenReveal{0%{opacity:.15}100%{opacity:1}}
    @keyframes cosmofishYellowReveal{0%{opacity:.05;filter:brightness(.18) blur(1px);box-shadow:0 0 0 rgba(255,245,0,0)}45%{opacity:.4;filter:brightness(.48) blur(.4px);box-shadow:0 0 22px rgba(255,245,0,.13)}100%{opacity:1;filter:brightness(1) blur(0);box-shadow:none}}
    @keyframes cosmofishYellowFill{0%{opacity:.05;filter:brightness(.18) blur(1px)}50%{opacity:.5;filter:brightness(.55) blur(.3px)}100%{opacity:1;filter:brightness(1) blur(0)}}
    .shadow.medium{width:34px!important;height:34px!important}.shadow.large,.shadow.gold{width:52px!important;height:52px!important}
    .catch{grid-template-rows:auto auto auto!important;gap:18px;padding:30px;text-align:center}.catch-label{font-size:clamp(16px,3vw,28px);letter-spacing:.18em;color:#f7f5d9}.catch-label.new-species{color:#fff500}.catch-label.analysis-complete{color:#72d9ff}.catch-recover{min-width:180px;padding:14px 32px;border:2px solid #fff500;background:#fff500;color:#19383b;font:inherit;cursor:pointer;letter-spacing:.08em}
    @media(max-width:700px){.spot{width:min(25%,110px)!important}.spot:nth-child(1){top:2%!important}.spot:nth-child(2),.spot:nth-child(3){top:37%!important}.spot:nth-child(4),.spot:nth-child(5),.spot:nth-child(6){top:72%!important}.shadow.medium{width:28px!important;height:28px!important}.shadow.large,.shadow.gold{width:44px!important;height:44px!important}.catch{padding:20px;gap:12px}.catch-recover{min-width:140px;padding:12px 24px}}
  `;
  document.head.appendChild(style);

  const gauge=document.getElementById('gauge'),status=document.getElementById('status'),catchBox=document.getElementById('catch'),saveKey='cosmofish-catches';

  gauge.addEventListener('pointerdown',(e)=>{
    if(!active)return;
    e.preventDefault();e.stopImmediatePropagation();
    const barPosition=pos,targetLeft=40,targetRight=60;
    active=false;cancelAnimationFrame(raf);
    if(barPosition>=targetLeft&&barPosition<=targetRight){
      const f=pickFish(currentSize),previousCount=counts[f.id]||0;
      counts[f.id]=previousCount+1;localStorage.setItem(saveKey,JSON.stringify(counts));
      const need=needFor(f.rarity),isNew=previousCount===0,isAnalysisComplete=previousCount<need&&counts[f.id]>=need;
      let labels='';
      if(isNew)labels+='<div class="catch-label new-species">新種捕獲</div>';
      if(isAnalysisComplete)labels+='<div class="catch-label analysis-complete">解析完了</div>';
      catchBox.innerHTML=labels+'<div>釣り成功！　<span class="'+rarityClass(f.rarity)+'">'+f.name+'</span></div><button type="button" class="catch-recover">回収</button>';
      catchBox.classList.remove('hidden');status.classList.add('success');status.textContent='捕獲しました（'+counts[f.id]+'回目）';
      const recover=catchBox.querySelector('.catch-recover');
      recover.addEventListener('click',(ev)=>{ev.preventDefault();ev.stopPropagation();catchBox.classList.add('hidden');status.classList.remove('success');status.textContent='魚影をタップして釣りを開始';shadows()});
    }else{status.textContent='逃げられた……';setTimeout(()=>{status.textContent='魚影をタップして釣りを開始';shadows()},900)}
  },{capture:true});
})();