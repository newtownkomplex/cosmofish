(() => {
  // 起動画面。ゲーム本編にはフェード処理を一切使用しない。
  const overlay = document.createElement('div');
  overlay.id = 'bootScreen';
  overlay.innerHTML = `
    <div class="boot-inner">
      <div class="boot-title" id="bootText"></div>
      <div class="boot-gauge"><div class="boot-fill" id="bootFill"></div></div>
      <div class="boot-status" id="bootStatus">系統準備中...</div>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    #bootScreen{
      position:fixed!important;
      inset:0!important;
      z-index:99999!important;
      display:grid!important;
      place-items:center!important;
      background:#19383b!important;
      color:#fff500!important;
      opacity:1!important;
      visibility:visible!important;
      transition:none!important;
      animation:none!important;
    }
    #bootScreen .boot-inner{width:min(82vw,620px);text-align:center}
    #bootScreen .boot-title{min-height:1.5em;font-size:clamp(24px,5vw,48px);letter-spacing:.12em}
    #bootScreen .boot-gauge{height:18px;margin:28px 0 14px;border:2px solid #fff500;background:#19383b}
    #bootScreen .boot-fill{height:100%;width:0;background:#fff500}
    #bootScreen .boot-status{font-size:clamp(11px,2vw,16px);letter-spacing:.08em}
    #bootScreen.boot-done{opacity:1!important}

    /* フェードアウト・フェードイン・透明度遷移をゲーム本編から完全撤去 */
    .screen,.header,.book-button,.pond,.spot,.shadow,.gauge,.status,.catch,
    .pond-wrap,#pond .shadow,#pond .spot{
      animation:none!important;
      transition:none!important;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

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
    status.textContent = progress < 1
      ? `系統啟動中... ${Math.floor(progress * 100)}%`
      : '啟動完成';

    if (progress < 1) {
      requestAnimationFrame(load);
    } else {
      // フェードさせず、起動画面を即時撤去。
      overlay.remove();
    }
  }
  requestAnimationFrame(load);
})();