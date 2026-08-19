(() => {
  let ctx = null;
  let started = false;
  let droneTimer = null;
  let searchTimer = null;

  function initAudio() {
    if (started) {
      if (ctx && ctx.state === 'suspended') ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    started = true;

    const master = ctx.createGain();
    master.gain.value = 0.028;
    master.connect(ctx.destination);

    // ノンビートのドローン・アンビエント
    let step = 0;
    const roots = [55, 61.735, 65.406, 73.416, 82.407, 65.406];
    function drone() {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const base = roots[step++ % roots.length];
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(base, now);
      osc2.frequency.setValueAtTime(base * 2.003, now);
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 5);
      gain.gain.linearRampToValueAtTime(0.08, now + 14);
      gain.gain.linearRampToValueAtTime(0, now + 22);
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 22.5);
      osc2.stop(now + 22.5);
      droneTimer = setTimeout(drone, 18000);
    }

    // リバーブ付き「ピコーン」サーチ音
    function searchChime() {
      if (!ctx || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const toneGain = ctx.createGain();
      const delay = ctx.createDelay(1.2);
      const feedback = ctx.createGain();
      const wet = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.28);

      toneGain.gain.setValueAtTime(0, now);
      toneGain.gain.linearRampToValueAtTime(0.10, now + 0.015);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      filter.type = 'lowpass';
      filter.frequency.value = 3200;
      delay.delayTime.value = 0.28;
      feedback.gain.value = 0.38;
      wet.gain.value = 0.34;

      osc.connect(filter);
      filter.connect(toneGain);
      toneGain.connect(master);
      toneGain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(master);

      osc.start(now);
      osc.stop(now + 0.45);
    }

    drone();
    searchChime();
    searchTimer = setInterval(searchChime, 8000);
  }

  document.addEventListener('pointerdown', initAudio, { once: true, capture: true });
})();