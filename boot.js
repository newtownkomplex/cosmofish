(() => {
  const overlay = document.createElement('div');
  overlay.id = 'bootScreen';
  overlay.innerHTML = `
    <div class="boot-inner">
      <div class="boot-title" id="bootText"></div>
      <div class="boot-gauge"><div class="boot-fill" id="bootFill"></div></div>
      <div class="boot-status" id="bootStatus">系統準備中...</div>
    </div>`;
  document.body.appendChild(overlay);

  const style = document.createElement('style');
  style.textContent = `
    .game-reveal .header,
    .game-reveal .book-button,
    .game-reveal .pond,
    .game-reveal .gauge,
    .game-reveal .status {
      animation: gameFloatIn 1.8s cubic-bezier(.22,.61,.36,1) both !important;
    }
    .game-reveal .book-button { animation-delay:.12s !important; }
    .game-reveal .pond { animation-delay:.22s !important; }
    .game-reveal .gauge { animation-delay:.38s !important; }
    .game-reveal .status { animation-delay:.5s !important; }
    @keyframes gameFloatIn {
      0% { opacity:0; filter:brightness(.15) blur(2px); }
      45% { opacity:.42; filter:brightness(.48) blur(.8px); }
      75% { opacity:.78; filter:brightness(.78) blur(0); }
      100% { opacity:1; filter:brightness(1) blur(0); }
    }
  `;
  document.head.appendChild(style);

  const text = '程序啟動中...';
  const textEl = document.getElementById('bootText');
  const fill = document.getElementById('bootFill');
  const status = document.getElementById('bootStatus');
  let i = 0;
  const typeTimer = setInterval(() => {
    textEl.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(typeTimer);
  }, 120);

  const start = performance.now(), duration = 5000;
  function load(now) {
    const progress = Math.min((now - start) / duration, 1);
    fill.style.width = `${progress * 100}%`;
    status.textContent = progress < 1 ? `系統啟動中... ${Math.floor(progress * 100)}%` : '啟動完成';
    if (progress < 1) requestAnimationFrame(load);
    else setTimeout(() => {
      const screen = document.querySelector('.screen');
      if (screen) screen.classList.add('game-reveal');
      overlay.classList.add('boot-done');
      setTimeout(() => overlay.remove(), 500);
    }, 180);
  }
  requestAnimationFrame(load);

  // 捕獲後の再出現では、ランダムに選ばれた一時的な位置を一度も表示しない。
  // 初回に存在した .spot の番号だけを記憶し、その番号の場所でのみ再出現させる。
  const pond = document.getElementById('pond');
  if (pond) {
    let fixedSlots = [];
    let restoring = false;

    const captureSlots = () => {
      const spots = [...pond.querySelectorAll('.spot')];
      const active = spots
        .map((spot, index) => spot.querySelector('.shadow') ? index : null)
        .filter(index => index !== null);
      if (active.length) fixedSlots = active;
    };

    const restoreSlots = () => {
      if (restoring || !fixedSlots.length) return;
      const spots = [...pond.querySelectorAll('.spot')];
      const shadows = spots.flatMap(spot => [...spot.querySelectorAll('.shadow')]);
      if (!shadows.length) return;

      restoring = true;

      // ランダムに生成された場所を一切描画しない。
      spots.forEach(spot => { spot.style.opacity = '0'; });

      fixedSlots.forEach((slotIndex, i) => {
        const shadow = shadows[i];
        const target = spots[slotIndex];
        if (!shadow || !target) return;
        target.appendChild(shadow);
        shadow.style.opacity = '0';
      });

      // DOM移動が完了したあと、同じ場所だけをフェードイン。
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fixedSlots.forEach((slotIndex, i) => {
            const target = spots[slotIndex];
            const shadow = target?.querySelector('.shadow');
            if (!target || !shadow) return;
            target.style.opacity = '1';
            shadow.style.opacity = '1';
          });
          restoring = false;
        });
      });
    };

    const observer = new MutationObserver(() => {
      const spots = [...pond.querySelectorAll('.spot')];
      const hasShadow = spots.some(spot => spot.querySelector('.shadow'));
      if (!fixedSlots.length && hasShadow) {
        captureSlots();
        return;
      }
      if (fixedSlots.length && hasShadow) restoreSlots();
    });

    observer.observe(pond, { childList: true, subtree: true });
    setTimeout(captureSlots, 900);
  }
})();