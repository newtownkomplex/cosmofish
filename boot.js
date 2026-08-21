(() => {
  // 起動画面だけを表示。釣り場・スポット・捕獲画面には一切フェードをかけない。
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
    #bootScreen{opacity:1!important;transition:none!important}
    #bootScreen.boot-done{opacity:1!important}
    .screen,.header,.book-button,.pond,.spot,.shadow,.gauge,.status,.catch{animation:none!important;transition:none!important;transform:none!important}
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

  const start = performance.now();
  const duration = 5000;
  function load(now) {
    const progress = Math.min((now - start) / duration, 1);
    fill.style.width = `${progress * 100}%`;
    status.textContent = progress < 1 ? `系統啟動中... ${Math.floor(progress * 100)}%` : '啟動完成';
    if (progress < 1) {
      requestAnimationFrame(load);
      return;
    }

    // 起動画面はフェードせず、そのまま消す。
    setTimeout(() => overlay.remove(), 180);
  }
  requestAnimationFrame(load);
})();