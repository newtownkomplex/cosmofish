(() => {
  // 魚影を楕円ではなく真円にする
  const style = document.createElement('style');
  style.textContent = `
    .shadow.medium { width: 34px !important; height: 34px !important; }
    .shadow.large { width: 52px !important; height: 52px !important; }
    .shadow.gold { width: 52px !important; height: 52px !important; }
    @media (max-width: 700px) {
      .shadow.medium { width: 28px !important; height: 28px !important; }
      .shadow.large { width: 44px !important; height: 44px !important; }
      .shadow.gold { width: 44px !important; height: 44px !important; }
    }
  `;
  document.head.appendChild(style);

  const gauge = document.getElementById('gauge');
  const status = document.getElementById('status');
  const cursor = document.getElementById('cursor');
  const catchBox = document.getElementById('catch');
  const saveKey = 'cosmofish-catches';

  gauge.addEventListener('pointerdown', (e) => {
    if (!active) return;

    // このイベントを既存のゲージ判定へ渡さない
    e.preventDefault();
    e.stopImmediatePropagation();

    // 判定対象は「タップした場所」ではなく、タップした瞬間の縦バーの位置。
    const barPosition = pos;
    const targetLeft = 40;
    const targetRight = 60;

    active = false;
    cancelAnimationFrame(raf);

    if (barPosition >= targetLeft && barPosition <= targetRight) {
      const f = pickFish(currentSize);
      counts[f.id] = (counts[f.id] || 0) + 1;
      localStorage.setItem(saveKey, JSON.stringify(counts));

      catchBox.innerHTML = '釣り成功！　<span class="' + rarityClass(f.rarity) + '">' + f.name + '</span>';
      catchBox.classList.remove('hidden');
      status.classList.add('success');
      status.textContent = '捕獲しました（' + counts[f.id] + '回目）';

      setTimeout(() => {
        catchBox.classList.add('hidden');
        status.classList.remove('success');
        status.textContent = '魚影をタップして釣りを開始';
        shadows();
      }, 1200);
    } else {
      status.textContent = '逃げられた……';
      setTimeout(() => {
        status.textContent = '魚影をタップして釣りを開始';
        shadows();
      }, 900);
    }
  }, { capture: true });
})();