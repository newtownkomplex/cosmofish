// COSMFISH サーチ音：5秒ごとに「ピコーン」
(()=>{
  let started=false;
  let timer=null;
  let ctx=null;
  function startSearchSound(){
    if(started)return;
    started=true;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    ctx=new AC();
    const ping=()=>{
      if(ctx.state==='suspended')ctx.resume();
      const now=ctx.currentTime;
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      const filter=ctx.createBiquadFilter();
      osc.type='sine';
      osc.frequency.setValueAtTime(880,now);
      osc.frequency.exponentialRampToValueAtTime(1320,now+0.18);
      filter.type='lowpass';
      filter.frequency.value=2200;
      gain.gain.setValueAtTime(0,now);
      gain.gain.linearRampToValueAtTime(0.07,now+0.015);
      gain.gain.exponentialRampToValueAtTime(0.001,now+0.45);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now+0.46);
    };
    ping();
    timer=setInterval(ping,5000);
  }
  document.addEventListener('pointerdown',startSearchSound,{capture:true,once:true});
})();