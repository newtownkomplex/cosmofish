(() => {
  let ctx = null;
  let started = false;
  let seqTimer = null;
  const enabledKey = 'cosmofish-music-enabled';
  let enabled = localStorage.getItem(enabledKey) !== 'off';

  window.startBGM = function() {};
  window.playSearchChime = function() {};

  function initAudio() {
    if (!enabled || started) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    started = true;

    const master = ctx.createGain();
    master.gain.value = 0.045;
    master.connect(ctx.destination);

    // Minimal chiptune / BPM 70 / 32小節の長いフレーズ
    const bpm = 70;
    const beat = 60 / bpm;
    const melody = [
      659.25, 0, 783.99, 880, 0, 783.99, 659.25, 587.33,
      523.25, 0, 587.33, 659.25, 783.99, 0, 659.25, 523.25,
      587.33, 659.25, 0, 783.99, 880, 0, 987.77, 880,
      783.99, 659.25, 0, 587.33, 523.25, 0, 587.33, 659.25
    ];
    const bass = [164.81, 164.81, 196, 196, 146.83, 146.83, 130.81, 130.81,
      164.81, 164.81, 196, 196, 220, 220, 146.83, 146.83];
    let step = 0;

    function blip(freq, duration, volume, type, time) {
      if (!freq) return;
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
      if (!ctx || ctx.state === 'closed' || !enabled) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const melodyNote = melody[step % melody.length];
      const bassNote = bass[Math.floor(step / 2) % bass.length];
      blip(melodyNote, beat * 0.72, 0.075, 'square', now);
      if (step % 2 === 0) blip(bassNote, beat * 1.55, 0.055, 'triangle', now);
      step++;
      seqTimer = setTimeout(sequence, beat * 1000);
    }

    sequence();
  }

  function updateMusicButton() {
    const b = document.getElementById('musicToggle');
    if (!b) return;
    b.textContent = enabled ? '音楽　ON' : '音楽　OFF';
    b.style.background = enabled ? '#fff500' : '#666';
    b.style.color = enabled ? '#19383b' : '#eee';
    b.style.borderColor = enabled ? '#fff500' : '#888';
  }

  function setMusic(on) {
    enabled = on;
    localStorage.setItem(enabledKey, on ? 'on' : 'off');
    if (on) {
      initAudio();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } else {
      if (seqTimer) { clearTimeout(seqTimer); seqTimer = null; }
      if (ctx && ctx.state !== 'closed') { try { ctx.suspend(); } catch (e) {} }
    }
    updateMusicButton();
  }

  function addMusicToggle() {
    const list = document.getElementById('list');
    if (!list || document.getElementById('musicToggle')) return;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin:0 0 24px;padding-bottom:20px;border-bottom:1px solid #fff500;';
    const b = document.createElement('button');
    b.id = 'musicToggle';
    b.className = 'reset-btn';
    b.type = 'button';
    b.addEventListener('click', () => setMusic(!enabled));
    wrap.appendChild(b);
    list.prepend(wrap);
    updateMusicButton();
  }

  const openBook = document.getElementById('openBook');
  if (openBook) openBook.addEventListener('click', () => setTimeout(addMusicToggle, 0));
})();