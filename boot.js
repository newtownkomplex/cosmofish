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

  // 釣りスポットのレイアウトには一切触れない。
  // 配置は index.html の 3x2 CSS Grid にのみ任せる。
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

  // 捕獲後の再出現位置を固定する。
  // index.html の respawnSpots() は新しい魚影をランダムな .spot に追加するため、
  // ここで「最初に存在したスポットの位置」を記憶し、再出現時も同じ .spot に戻す。
  const pond = document.getElementById('pond');
  if (pond) {
    let fixedSlots = [];

    const captureSlots = () => {
      const spots = [...pond.querySelectorAll('.spot')];
      const active = spots
        .map((spot, index) => spot.querySelector('.shadow') ? index : null)
        .filter(index => index !== null);
      if (active.length) fixedSlots = active;
    };

    const restoreSlots = () => {
      const spots = [...pond.querySelectorAll('.spot')];
      if (!fixedSlots.length || !spots.length) return;

      const shadows = spots
        .flatMap(spot => [...spot.querySelectorAll('.shadow')]);

      fixedSlots.forEach((slotIndex, i) => {
        const shadow = shadows[i];
        const target = spots[slotIndex];
        if (!shadow || !target) return;
        if (shadow.parentElement !== target) target.appendChild(shadow);
        // respawnSpots() で全スポットを一度透明にした後、
        // 同じ場所だけをフェードインさせる。
        target.style.opacity = '1';
      });
    };

    const observer = new MutationObserver(() => {
      const spots = [...pond.querySelectorAll('.spot')];
      const hasShadow = spots.some(spot => spot.querySelector('.shadow'));

      // 初回生成時の位置を記憶。
      if (!fixedSlots.length && hasShadow) {
        captureSlots();
        return;
      }

      // 捕獲後の再生成時は、ランダムに選ばれた位置を元の位置へ戻す。
      if (fixedSlots.length && hasShadow) restoreSlots();
    });

    observer.observe(pond, { childList: true, subtree: true });

    // 初回生成が完了してから位置をロック。
    setTimeout(captureSlots, 900);
  }
})();