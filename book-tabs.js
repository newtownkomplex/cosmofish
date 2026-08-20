(() => {
  const originalRender = window.render;
  if (!originalRender) return;

  const tabs = [
    { key: 'ふつう', label: 'ふつう' },
    { key: 'めずらしい', label: 'めずらしい' },
    { key: 'まぼろし', label: 'まぼろし' },
    { key: '未確認', label: '未確認' }
  ];
  let activeTab = localStorage.getItem('cosmofish-book-tab') || 'ふつう';

  const style = document.createElement('style');
  style.textContent = `
    .book-tabs{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #fff500}
    .book-tab{border:0;border-right:1px solid #fff500;background:#102a2d;color:#f7f5d9;padding:12px 6px;font-size:13px;letter-spacing:.08em}
    .book-tab:last-child{border-right:0}
    .book-tab.active{background:#fff500;color:#19383b}
    .book-tab.common.active{background:#ff4b4b;color:#fff}
    .book-tab.rare.active{background:#72d9ff;color:#19383b}
    .book-tab.mythical.active{background:#c084ff;color:#19383b}
    .book-tab.unconfirmed.active{background:#f7f5d9;color:#19383b}
    .book-tab-count{font-size:9px;margin-left:4px;opacity:.8}
    @media(max-width:700px){.book-tab{padding:10px 3px;font-size:10px}.book-tab-count{display:block;margin:3px 0 0;font-size:8px}}
  `;
  document.head.appendChild(style);

  function rarityClass(r){
    return r==='めずらしい'?'rare':r==='まぼろし'?'mythical':r==='未確認'?'unconfirmed':'common';
  }

  function renderTabs(){
    const list=document.getElementById('list');
    if(!list)return;
    let bar=list.querySelector('.book-tabs');
    if(!bar){
      bar=document.createElement('div');
      bar.className='book-tabs';
      list.prepend(bar);
    }
    bar.replaceChildren();
    tabs.forEach(t=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='book-tab '+rarityClass(t.key)+(activeTab===t.key?' active':'');
      const group=fishData.filter(f=>f.rarity===t.key);
      const need=needFor(t.key);
      const unlocked=group.filter(f=>(counts[f.id]||0)>=need).length;
      b.innerHTML=t.label+'<span class="book-tab-count">'+unlocked+'/'+group.length+'</span>';
      b.onclick=()=>{activeTab=t.key;localStorage.setItem('cosmofish-book-tab',activeTab);render();};
      bar.appendChild(b);
    });
  }

  window.render=function(){
    originalRender();
    const list=document.getElementById('list');
    if(!list)return;
    renderTabs();

    // 元の4レア度セクションはタブ表示では不要なので、現在のタブだけ残す。
    const sections=[...list.querySelectorAll('.rarity')];
    sections.forEach(sec=>{
      const title=sec.querySelector('.rt');
      const text=title?title.textContent:'';
      const show=text.startsWith(activeTab+' ' ) || text===activeTab;
      sec.style.display=show?'block':'none';
    });

    // タブ以外は従来どおり下部に緊急脱出を残す。
    const reset=list.querySelector('.reset-area');
    if(reset){reset.style.display='block';}
  };
})();
