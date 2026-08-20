(() => {
  const tabs = [
    { key:'ふつう', label:'ふつう', cls:'common' },
    { key:'めずらしい', label:'めずらしい', cls:'rare' },
    { key:'まぼろし', label:'まぼろし', cls:'mythical' },
    { key:'未確認', label:'未確認', cls:'unconfirmed' }
  ];
  const tabKey='cosmofish-book-tab';
  let activeTab=localStorage.getItem(tabKey)||'ふつう';
  if(!tabs.some(t=>t.key===activeTab)) activeTab='ふつう';

  const style=document.createElement('style');
  style.textContent=`
    html,body{background-color:#19383b!important;background-image:linear-gradient(rgba(255,245,0,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(255,245,0,.10) 1px,transparent 1px)!important;background-size:44px 44px!important}
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

  const listEl=()=>document.getElementById('list');
  const escapeHtml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getSizes=()=>{try{return JSON.parse(localStorage.getItem('cosmofish-fish-sizes')||'{}')}catch(e){return {}}};
  const needForRarity=r=>r==='ふつう'?3:r==='めずらしい'?2:1;

  function updateTabCounts(){
    const list=listEl(); if(!list||typeof fishData==='undefined')return;
    list.querySelectorAll('.book-tab').forEach(btn=>{
      const r=btn.dataset.rarity;
      const group=fishData.filter(f=>f.rarity===r);
      const need=needForRarity(r);
      const unlocked=group.filter(f=>(counts[f.id]||0)>=need).length;
      const count=btn.querySelector('.book-tab-count');
      if(count)count.textContent=`${unlocked}/${group.length}`;
    });
  }

  function buildTabsOnce(){
    const list=listEl(); if(!list)return null;
    list.querySelectorAll('.book-tabs').forEach((el,i)=>{if(i>0)el.remove()});
    const existing=list.querySelector('.book-tabs');
    if(existing)return existing;
    const bar=document.createElement('div');bar.className='book-tabs';
    tabs.forEach(t=>{
      const b=document.createElement('button');
      b.type='button';b.className=`book-tab ${t.cls}${t.key===activeTab?' active':''}`;b.dataset.rarity=t.key;
      b.innerHTML=`${t.label}<span class="book-tab-count"></span>`;
      b.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        activeTab=t.key;localStorage.setItem(tabKey,activeTab);
        renderFishGroup();
      });
      bar.appendChild(b);
    });
    list.prepend(bar);updateTabCounts();return bar;
  }

  function renderFishGroup(){
    const list=listEl();if(!list||typeof fishData==='undefined')return;
    const title=list.querySelector('.book-rarity-title');
    const grid=list.querySelector('.book-fish-grid');
    if(!title||!grid)return;
    const group=fishData.filter(f=>f.rarity===activeTab);
    const need=needForRarity(activeTab);
    const unlocked=group.filter(f=>(counts[f.id]||0)>=need).length;
    title.textContent=`${activeTab}　${unlocked} / ${group.length}`;
    grid.replaceChildren();
    const sizes=getSizes();
    group.forEach(f=>{
      const count=counts[f.id]||0;
      const card=document.createElement('button');card.type='button';card.className=`card ${count?'':'locked'}`;
      card.innerHTML=`<div class="no">No.${String(f.id).padStart(2,'0')}</div><div class="name">${count?escapeHtml(f.name):'？？？？？？'}</div><div class="no" style="margin-top:8px">${count}匹</div>`;
      const rec=sizes[f.id];
      if(rec){
        const records=document.createElement('div');records.className='book-size-records';
        records.innerHTML=`<div class="${rec.best?.name==='特大'?'giant':''}">最大：${rec.best?escapeHtml(rec.best.name):'—'}</div><div class="${rec.min?.name==='稚魚'?'fry':''}">最小：${rec.min?escapeHtml(rec.min.name):'—'}</div>`;
        card.appendChild(records);
      }
      if(count)card.addEventListener('click',()=>showDetail(f,count,need));
      grid.appendChild(card);
    });
    list.querySelectorAll('.book-tab').forEach(b=>b.classList.toggle('active',b.dataset.rarity===activeTab));
    updateTabCounts();
  }

  function setupBook(){
    const list=listEl();if(!list||typeof fishData==='undefined')return;
    list.querySelectorAll('#musicToggle,.music-toggle-wrap,[data-music-toggle],.music-control,.music-controls').forEach(el=>el.remove());

    let tabsBar=list.querySelector('.book-tabs');
    let title=list.querySelector('.book-rarity-title');
    let grid=list.querySelector('.book-fish-grid');
    let reset=list.querySelector('.book-reset');

    if(!tabsBar){
      list.querySelectorAll('.rarity,.reset-area').forEach(el=>el.remove());
      list.querySelectorAll('.grid').forEach(el=>el.remove());
      tabsBar=buildTabsOnce();
    }
    if(!title){title=document.createElement('h3');title.className='book-rarity-title';tabsBar.after(title)}
    if(!grid){grid=document.createElement('div');grid.className='grid book-fish-grid';title.after(grid)}
    if(!reset){
      reset=document.createElement('div');reset.className='book-reset';reset.innerHTML='<button type="button" class="reset-btn" id="resetButton">緊急脱出</button>';list.appendChild(reset);
      const rb=document.getElementById('resetButton');if(rb&&typeof resetConfirm!=='undefined')rb.onclick=()=>resetConfirm.classList.remove('hidden');
    }
    renderFishGroup();
  }

  window.render=setupBook;
  const openBook=document.getElementById('openBook');
  if(openBook)openBook.addEventListener('click',()=>setTimeout(setupBook,0));
})();