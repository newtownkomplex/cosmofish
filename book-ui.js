(() => {
  const tabKey='cosmofish-book-rarity-tab';
  let musicCtx=null,musicGain=null,musicTimer=null,musicStep=0;
  function style(){
    if(document.getElementById('bookUIStyle'))return;
    const s=document.createElement('style');s.id='bookUIStyle';s.textContent=`
      .rarity-tabs{display:grid;grid-template-columns:repeat(4,1fr);margin:0 0 22px;border:1px solid #fff500}
      .rarity-tabs button{min-height:64px;border:0;border-right:1px solid #fff500;background:#102a2d;color:#f7f5d9;padding:8px 4px;font-family:inherit;font-size:clamp(13px,2vw,19px)}
      .rarity-tabs button:last-child{border-right:0}.rarity-tabs button.active{background:#fff500;color:#19383b}
      .rarity-tabs .tab-count{display:block;margin-top:5px;font-size:11px;opacity:.9}
      .rarity-tabs button.tab-common.active{background:#ff4b4b;color:#fff}.rarity-tabs button.tab-rare.active{background:#72d9ff;color:#19383b}.rarity-tabs button.tab-mythical.active{background:#c084ff;color:#19383b}.rarity-tabs button.tab-unconfirmed.active{background:#f7f5d9;color:#19383b}
      @media(max-width:700px){.rarity-tabs button{min-height:58px;font-size:13px}.rarity-tabs .tab-count{font-size:9px}}
    `;document.head.appendChild(s);
  }
  function startMusic(){
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    if(!musicCtx){musicCtx=new AC();musicGain=musicCtx.createGain();musicGain.gain.value=.045;musicGain.connect(musicCtx.destination)}
    if(musicCtx.state==='suspended')musicCtx.resume();
    if(musicTimer)return;
    const bpm=70,beat=60/bpm;
    const melody=[659.25,0,783.99,880,0,783.99,659.25,587.33,523.25,0,587.33,659.25,783.99,0,659.25,523.25,587.33,659.25,0,783.99,880,0,987.77,880,783.99,659.25,0,587.33,523.25,0,587.33,659.25];
    const bass=[164.81,164.81,196,196,146.83,146.83,130.81,130.81,164.81,164.81,196,196,220,220,146.83,146.83];
    function note(freq,dur,vol,type){if(!freq)return;const now=musicCtx.currentTime,o=musicCtx.createOscillator(),g=musicCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(vol,now+.02);g.gain.exponentialRampToValueAtTime(.001,now+dur);o.connect(g);g.connect(musicGain);o.start(now);o.stop(now+dur+.03)}
    function tick(){if(!musicCtx||localStorage.getItem('cosmofish-music-enabled')!=='on'){musicTimer=null;return}const i=musicStep%32;note(melody[i],beat*.72,.075,'square');if(i%2===0)note(bass[Math.floor(i/2)%16],beat*1.5,.055,'triangle');musicStep++;musicTimer=setTimeout(tick,beat*1000)}
    tick();
  }
  function stopMusic(){if(musicTimer){clearTimeout(musicTimer);musicTimer=null}if(musicCtx&&musicCtx.state!=='closed')musicCtx.suspend()}
  function music(){
    const list=document.getElementById('list');if(!list)return;
    let wrap=document.getElementById('musicToggleWrap');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='musicToggleWrap';wrap.style.cssText='margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid #fff500;';
      const b=document.createElement('button');b.id='musicToggle';b.className='reset-btn';b.type='button';
      b.addEventListener('click',()=>{const on=localStorage.getItem('cosmofish-music-enabled')!=='on';localStorage.setItem('cosmofish-music-enabled',on?'on':'off');if(on)startMusic();else stopMusic();updateMusic();});
      wrap.appendChild(b);list.prepend(wrap);
    }updateMusic();
  }
  function updateMusic(){const b=document.getElementById('musicToggle');if(!b)return;const on=localStorage.getItem('cosmofish-music-enabled')==='on';b.textContent=on?'音楽　ON':'音楽　OFF';b.style.background=on?'#fff500':'#666';b.style.color=on?'#19383b':'#eee';b.style.borderColor=on?'#fff500':'#888';}
  function tabs(){
    const list=document.getElementById('list');if(!list)return;
    document.querySelectorAll('.rarity-tabs').forEach(e=>e.remove());
    const sections=[...list.querySelectorAll('.rarity')];if(!sections.length)return;
    const names=['ふつう','めずらしい','まぼろし','未確認'];const box=document.createElement('div');box.className='rarity-tabs';
    const musicWrap=document.getElementById('musicToggleWrap');if(musicWrap)musicWrap.after(box);else list.prepend(box);
    function sectionOf(name){return sections.find(sec=>{const t=sec.querySelector('.rt');return t&&t.textContent.trim().startsWith(name)})}
    function activate(name){localStorage.setItem(tabKey,name);names.forEach((n,i)=>{const sec=sectionOf(n);if(sec)sec.style.display=n===name?'block':'none';if(box.children[i])box.children[i].classList.toggle('active',n===name)})}
    names.forEach((name,i)=>{const sec=sectionOf(name),b=document.createElement('button');const cls=i===0?'common':i===1?'rare':i===2?'mythical':'unconfirmed';b.className='tab-'+cls;const count=sec?.querySelector('.rt')?.textContent.match(/\d+\s*\/\s*\d+/)?.[0]||'0 / 0';b.innerHTML=name+'<span class="tab-count">'+count+'</span>';b.onclick=()=>activate(name);box.appendChild(b)});
    const initial=names.includes(localStorage.getItem(tabKey))?localStorage.getItem(tabKey):'ふつう';activate(initial);
    sections.forEach(sec=>{const t=sec.querySelector('.rt');if(t)t.style.display='none'});
  }
  function refresh(){if(window.render)window.render();setTimeout(()=>{style();music();tabs()},0)}
  const open=document.getElementById('openBook');if(open)open.addEventListener('click',()=>setTimeout(refresh,0));
})();