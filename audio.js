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
    function searchChime() {
      if (!ctx || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const toneGain = ctx.createGain();
      const delay = ctx.createDelay(2.8);
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
      delay.delayTime.value = 0.42;
      feedback.gain.value = 0.72;
      wet.gain.value = 0.42;
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
    drone();
    searchChime();
    searchTimer = setInterval(searchChime, 16000);
  }

  // ゲーム側の旧ハンドラより先に入力を受け取り、
  // 「黄色いTAPゾーンにバーが重なっている瞬間」だけ成功にする。
  const pond = document.getElementById('pond');
  const gauge = document.getElementById('gauge');
  const cursor = document.getElementById('cursor');
  const status = document.getElementById('status');
  const catchBox = document.getElementById('catch');
  const cells = pond ? [...pond.querySelectorAll('.cell')] : [];
  const saveKey = 'cosmofish-catches';
  let counts = {};
  try { counts = JSON.parse(localStorage.getItem(saveKey) || '{}'); } catch (e) {}
  let fishing = false;
  let fishingSize = 'medium';
  let gaugeStarted = 0;
  let gaugeRaf = 0;
  let gaugePosition = 0;

  function rarityClass(r) {
    return r === 'めずらしい' ? 'rare' : r === 'まぼろし' ? 'mythical' : r === '未確認' ? 'unconfirmed' : 'common';
  }

  function pickFish(size) {
    const rates = size === 'gold' ? [['めずらしい', 10], ['まぼろし', 90]] : [['ふつう', 91], ['めずらしい', 9]];
    let x = Math.random() * 100;
    let sum = 0;
    for (const [rarity, rate] of rates) {
      sum += rate;
      if (x < sum) {
        const pool = fishData.filter(f => f.rarity === rarity);
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  function makeRandomShadows() {
    if (!pond) return;
    cells.forEach(c => c.replaceChildren());
    const count = 4 + Math.floor(Math.random() * 4);
    const chosen = [...cells].sort(() => Math.random() - 0.5).slice(0, count);
    const placed = [];
    chosen.forEach(cell => {
      let shadow = null;
      for (let attempt = 0; attempt < 80; attempt++) {
        const r = Math.random();
        const kind = r < 0.01 ? 'gold' : r < 0.09 ? 'large' : 'medium';
        const w = kind === 'medium' ? 52 : 78;
        const h = kind === 'medium' ? 26 : 39;
        const padX = w / 2 + 8;
        const padY = h / 2 + 8;
        const x = padX + Math.random() * Math.max(1, cell.clientWidth - padX * 2);
        const y = padY + Math.random() * Math.max(1, cell.clientHeight - padY * 2);
        const rect = cell.getBoundingClientRect();
        const cx = rect.left + x;
        const cy = rect.top + y;
        const overlaps = placed.some(p => {
          const dx = cx - p.cx;
          const dy = cy - p.cy;
          return Math.sqrt(dx * dx + dy * dy) < (w + p.w) / 2 + 10 && Math.abs(dy) < (h + p.h) / 2 + 10;
        });
        if (!overlaps) {
          shadow = document.createElement('div');
          shadow.className = 'shadow ' + kind;
          shadow.style.left = x + 'px';
          shadow.style.top = y + 'px';
          cell.appendChild(shadow);
          placed.push({ cx, cy, w, h });
          break;
        }
      }
    });
  }

  function startFishing(shadow) {
    if (fishing) return;
    fishing = true;
    fishingSize = shadow.classList.contains('gold') ? 'gold' : shadow.classList.contains('large') ? 'large' : 'medium';
    shadow.style.display = 'none';
    gaugeStarted = performance.now();
    gaugePosition = 0;
    cursor.style.left = '0%';
    status.textContent = '黄色いTAPゾーンでTAP!';
    function animate(now) {
      if (!fishing) return;
      const t = ((now - gaugeStarted) % 1000) / 1000;
      gaugePosition = t <= 0.5 ? t * 200 : (1 - t) * 200;
      cursor.style.left = gaugePosition + '%';
      gaugeRaf = requestAnimationFrame(animate);
    }
    gaugeRaf = requestAnimationFrame(animate);
  }

  function finishFishing() {
    if (!fishing) return;
    fishing = false;
    cancelAnimationFrame(gaugeRaf);
    const success = gaugePosition >= 40 && gaugePosition <= 60;
    if (!success) {
      status.textContent = '逃げられた……';
      setTimeout(() => {
        status.textContent = '魚影をタップして釣りを開始';
        makeRandomShadows();
      }, 900);
      return;
    }
    const fish = pickFish(fishingSize);
    counts[fish.id] = (counts[fish.id] || 0) + 1;
    localStorage.setItem(saveKey, JSON.stringify(counts));
    catchBox.innerHTML = '釣り成功！　<span class="' + rarityClass(fish.rarity) + '">' + fish.name + '</span>';
    catchBox.classList.remove('hidden');
    status.classList.add('success');
    status.textContent = '捕獲しました（' + counts[fish.id] + '回目）';
    setTimeout(() => {
      catchBox.classList.add('hidden');
      status.classList.remove('success');
      status.textContent = '魚影をタップして釣りを開始';
      makeRandomShadows();
    }, 1200);
  }

  // window captureなので、既存のpond/gaugeハンドラより先に処理できる。
  window.addEventListener('pointerdown', e => {
    if (e.target.closest && e.target.closest('.shadow')) {
      e.preventDefault();
      e.stopPropagation();
      startFishing(e.target.closest('.shadow'));
      return;
    }
    if (gauge && (e.target === gauge || gauge.contains(e.target)) && fishing) {
      e.preventDefault();
      e.stopPropagation();
      finishFishing();
    }
  }, true);

  // 初回表示も9マスの中心固定ではなく、ランダム配置にする。
  setTimeout(makeRandomShadows, 0);
  window.addEventListener('resize', () => { if (!fishing) makeRandomShadows(); });

  document.addEventListener('pointerdown', initAudio, { once: true, capture: true });
})();