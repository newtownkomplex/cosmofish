(() => {
  const tabs = [
    { key: 'ふつう', label: 'ふつう', cls: 'common' },
    { key: 'めずらしい', label: 'めずらしい', cls: 'rare' },
    { key: 'まぼろし', label: 'まぼろし', cls: 'mythical' },
    { key: '未確認', label: '未確認', cls: 'unconfirmed' }
  ];
  const tabKey = 'cosmofish-book-tab';
  let activeTab = localStorage.getItem(tabKey) || 'ふつう';
  if (!tabs.some(t => t.key === activeTab)) activeTab = 'ふつう';

  const style = document.createElement('style');
  style.textContent = `
    .book-tabs{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #fff500;margin-bottom:20px}
    .book-tab{border:0;border-right:1px solid #fff500;background:#102a2d;color:#f7f5d9;padding:12px 6px;font-size:13px;letter-spacing:.08em}
    .book-tab:last-child{border-right:0}.book-tab.active{background:#fff500;color:#19383b}
    .book-tab.common.active{background:#ff4b4b;color:#fff}.book-tab.rare.active{background:#72d9ff;color:#19383b}
    .book-tab.mythical.active{background:#c084ff;color:#19383b}.book-tab.unconfirmed.active{background:#f7f5d9;color:#19383b}
    .book-tab-count{display:block;font-size:9px;margin-top:4px;opacity:.8}
    .book-rarity-title{color:#fff500;border-bottom:1px solid #fff500;padding-bottom:8px;font-size:14px;font-weight:normal;margin:0 0 12px}
    .book-size-records{font-size:8px;line-height:1.4;margin-top:6px;letter-spacing:.03em;color:#fff500}
    .book-size-records .fry{color:#ff8fc7}.book-size-records .giant{color:#c084ff}
    .book-reset{margin-top:30px;padding-top:20px;border-top:1px solid #fff500}
    @media(max-width:700px){.book-tab{padding:10px 3px;font-size:10px}.book-tab-count{font-size:8px}.book-size-records{font-size:8px}}
  `;
  document.head.appendChild(style);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function getSizeRecords() {
    try { return JSON.parse(localStorage.getItem('cosmofish-fish-sizes') || '{}'); }
    catch (e) { return {}; }
  }

  function sizeLine(label, size) { return `${label}：${size ? size.name : '—'}`; }

  function renderBook() {
    const list = document.getElementById('list');
    if (!list || typeof fishData === 'undefined') return;

    const previousMusic = document.getElementById('musicToggle');
    const musicParent = previousMusic ? previousMusic.parentElement : null;

    list.replaceChildren();

    const bar = document.createElement('div');
    bar.className = 'book-tabs';
    tabs.forEach(t => {
      const group = fishData.filter(f => f.rarity === t.key);
      const need = needFor(t.key);
      const unlocked = group.filter(f => (counts[f.id] || 0) >= need).length;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `book-tab ${t.cls}${activeTab === t.key ? ' active' : ''}`;
      b.innerHTML = `${t.label}<span class="book-tab-count">${unlocked}/${group.length}</span>`;
      b.addEventListener('click', () => {
        activeTab = t.key;
        localStorage.setItem(tabKey, activeTab);
        renderBook();
      });
      bar.appendChild(b);
    });
    list.appendChild(bar);

    const group = fishData.filter(f => f.rarity === activeTab);
    const need = needFor(activeTab);
    const title = document.createElement('h3');
    title.className = 'book-rarity-title';
    title.textContent = `${activeTab}　${group.filter(f => (counts[f.id] || 0) >= need).length} / ${group.length}`;
    list.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'grid';
    const sizeRecords = getSizeRecords();
    group.forEach(f => {
      const count = counts[f.id] || 0;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `card ${count ? '' : 'locked'}`;
      card.innerHTML = `<div class="no">No.${String(f.id).padStart(2,'0')}</div><div class="name">${count ? escapeHtml(f.name) : '？？？？？？'}</div><div class="no" style="margin-top:8px">${count} / ${need}</div>`;
      const rec = sizeRecords[f.id];
      if (rec) {
        const records = document.createElement('div');
        records.className = 'book-size-records';
        const bestClass = rec.best?.name === '特大' ? 'giant' : '';
        const minClass = rec.min?.name === '稚魚' ? 'fry' : '';
        records.innerHTML = `<div class="${bestClass}">${sizeLine('最大', rec.best)}</div><div class="${minClass}">${sizeLine('最小', rec.min)}</div>`;
        card.appendChild(records);
      }
      if (count) card.addEventListener('click', () => showDetail(f, count, need));
      grid.appendChild(card);
    });
    list.appendChild(grid);

    const resetArea = document.createElement('div');
    resetArea.className = 'book-reset';
    resetArea.innerHTML = '<button type="button" class="reset-btn" id="resetButton">緊急脱出</button>';
    list.appendChild(resetArea);
    const resetButton = document.getElementById('resetButton');
    if (resetButton && typeof resetConfirm !== 'undefined') resetButton.onclick = () => resetConfirm.classList.remove('hidden');

    if (previousMusic) {
      const wrap = musicParent || document.createElement('div');
      if (!wrap.parentElement) {
        wrap.style.cssText = 'margin:0 0 24px;padding-bottom:20px;border-bottom:1px solid #fff500;';
        list.prepend(wrap);
      } else {
        list.prepend(wrap);
      }
      if (!wrap.contains(previousMusic)) wrap.appendChild(previousMusic);
    }
  }

  window.render = renderBook;
})();