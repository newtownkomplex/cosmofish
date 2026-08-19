(() => {
  let ctx = null;
  let started = false;
  let seqTimer = null;
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
    master.gain.value = 0.045;
    master.connect(ctx.destination);

    // Minimal chiptune / BPM 90
    const bpm = 90;
    const beat = 60 / bpm;
    const melody = [
      659.25, 783.99, 880, 783.99, 659.25, 587.33, 659.25, 523.25,
      659.25, 783.99, 987.77, 880, 783.99, 659.25, 587.33, 523.25
    ];
    const bass = [164.81, 164.81, 196.00, 196.00, 146.83, 146.83, 130.81, 130.81];
    let step = 0;

    function blip(freq, duration, volume, type, time) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.008);
      gain.gain.setValueAtTime(volume, time + Math.max(0.01, duration - 0.035));
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(time);
      osc.stop(time + duration + 0.02);
    }

    function sequence() {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const m = melody[step % melody.length];
      const b = bass[Math.floor(step / 2) % bass.length];
      blip(m, beat * 0.72, 0.075, 'square', now);
      if (step % 2 === 0) blip(b, beat * 1.55, 0.055, 'triangle', now);
      step++;
      seqTimer = setTimeout(sequence, beat * 1000);
    }

    // 1分に1回のサーチ音。深く長いリバーブ。
    function searchChime() {
      if (!ctx || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const toneGain = ctx.createGain();
      const delay = ctx.createDelay(3.5);
      const feedback = ctx.createGain();
      const wet = ctx.createGain();
      const reverbFilter = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.28);
      toneGain.gain.setValueAtTime(0, now);
      toneGain.gain.linearRampToValueAtTime(0.10, now + 0.015);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      reverbFilter.type = 'lowpass';
      reverbFilter.frequency.value = 2200;
      delay.delayTime.value = 0.48;
      feedback.gain.value = 0.78;
      wet.gain.value = 0.45;
      osc.connect(toneGain);
      toneGain.connect(master);
      toneGain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(reverbFilter);
      reverbFilter.connect(wet);
      wet.connect(master);
      osc.start(now);
      osc.stop(now + 0.45);
    }

    sequence();
    searchChime();
    searchTimer = setInterval(searchChime, 60000);
  }

  document.addEventListener('pointerdown', e => {
    if (e.target.closest && e.target.closest('.shadow')) initAudio();
  }, { capture: true });
})();