(() => {
  const root=document.documentElement;
  let orientationTimer;
  const syncPhoneViewport=()=>{
    const vv=window.visualViewport;
    const width=Math.round(vv?.width||window.innerWidth||root.clientWidth);
    const height=Math.round(vv?.height||window.innerHeight||root.clientHeight);
    const phoneLike=Math.min(width,height)<=700&&Math.max(width,height)<=1400;
    const portrait=phoneLike&&window.matchMedia('(orientation: portrait)').matches;
    root.style.setProperty('--app-vw',width+'px');
    root.style.setProperty('--app-vh',height+'px');
    root.classList.toggle('phone-landscape',phoneLike&&!portrait);
    root.classList.toggle('phone-portrait',portrait);
    root.classList.toggle('portrait-landscape-fallback',false);
    const sceneHeight=phoneLike?Math.min(width,height):height;
    const sceneWidth=phoneLike?Math.max(width,height):width;
    const sceneScale=phoneLike?sceneHeight/620:1;
    root.style.setProperty('--scene-scale',sceneScale);
    root.style.setProperty('--scene-width',(sceneWidth/sceneScale)+'px');
    if(phoneLike&&width>height)window.scrollTo(0,0);
  };
  const scheduleViewportSync=()=>{
    syncPhoneViewport();
    cancelAnimationFrame(orientationTimer);
    orientationTimer=requestAnimationFrame(syncPhoneViewport);
    clearTimeout(scheduleViewportSync.late);
    scheduleViewportSync.late=setTimeout(syncPhoneViewport,280);
  };
  syncPhoneViewport();
  window.addEventListener('resize',scheduleViewportSync,{passive:true});
  window.addEventListener('orientationchange',scheduleViewportSync,{passive:true});
  window.visualViewport?.addEventListener('resize',scheduleViewportSync,{passive:true});
  // Mobile Safari does not expose a reliable programmatic orientation lock.
  // Keep the CSS-rotated fallback active, while still requesting native
  // landscape on browsers that allow locking after a user gesture.
  const requestLandscape=()=>{
    if(!root.classList.contains('phone-portrait'))return;
    screen.orientation?.lock?.('landscape').catch(()=>{});
  };
  window.addEventListener('pointerdown',requestLandscape,{once:true,passive:true});
  const $=s=>document.querySelector(s);
  const svg=body=>`<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#65534c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const title=$('.zone-uk .place-title strong');title.textContent='小小的我独自漂泊';title.parentElement.setAttribute('aria-label','放大悬浮文字：小小的我独自漂泊');
  const girl=$('.archive-sticker[data-archive="7"]'),story=$('.bedtime-quote');
  const exact='小➡️时↘️候↗️睡➡️觉↘️前⤴️最爱↗️听床边➡️故事⤴️';
  const letters=Array.from(new Intl.Segmenter('zh',{granularity:'grapheme'}).segment(exact),s=>s.segment);
  story.replaceChildren();story.setAttribute('aria-label',exact);story.classList.add('story-arc');
  letters.forEach((letter,i)=>{const span=document.createElement('span');span.textContent=letter;const t=i/(letters.length-1);span.style.left=(t*94)+'%';span.style.top=(55*(1-Math.sin(Math.PI*t)))+'px';span.style.rotate=(Math.cos(Math.PI*t)*-34)+'deg';story.append(span);});
  girl.style.zIndex='36';girl.style.maxWidth='220px';girl.style.maxHeight='285px';
  const positionStory=()=>{story.style.left=(parseFloat(girl.style.left)+girl.getBoundingClientRect().width/2-175)+'px';story.style.top=`calc(${girl.style.top} - 78px)`;};
  const deskGirl=$('.archive-sticker[data-archive="6"]');if(deskGirl){deskGirl.style.zIndex='36';deskGirl.style.maxWidth='220px';deskGirl.style.maxHeight='285px';}
  girl.addEventListener('load',positionStory);positionStory();window.addEventListener('resize',positionStory);
  const departure=$('.archive-sticker[data-archive="13"]');departure.style.left='4900px';departure.style.top='7%';departure.style.maxHeight='180px';
  const night=$('.archive-sticker[data-asset="images/role-soft-night.png"]');night.style.left='7240px';night.style.top='12%';night.style.maxHeight='195px';
  const walking=$('.archive-sticker[data-archive="24"]'),moon=$('.archive-sticker[data-asset="images/role-blue-moon.png"]');
  if(walking){walking.dataset.src='images/walk-person-only.png';walking.style.left='7330px';walking.style.top='28%';walking.style.bottom='auto';}
  if(moon){moon.dataset.src='images/moon-person-only.png';moon.style.left='7680px';moon.style.top='17%';moon.style.bottom='auto';}
  const train=document.createElement('button');train.className='toy-train';train.type='button';train.setAttribute('aria-label','让悬浮玩具火车摇晃');
  train.innerHTML=svg('<path d="M15 107h211v14H15z" fill="#b98869"/><path d="M28 71h84v37H28z" fill="#93b4b2"/><path d="M33 38h47v36H33zM22 37h69" fill="#d79583"/><path d="M92 59h17v16H92z" fill="#d4b876"/><path d="M132 59h82v47h-82z" fill="#dabd80"/><path d="M143 69h22v22h-22zM181 69h22v22h-22zM45 48h21v19H45z" fill="#f4e7b3"/><circle cx="43" cy="120" r="14" fill="#8a7979"/><circle cx="96" cy="120" r="14" fill="#8a7979"/><circle cx="151" cy="120" r="14" fill="#8a7979"/><circle cx="202" cy="120" r="14" fill="#8a7979"/><path d="M95 46q-15-16 5-20t13-16" stroke-dasharray="4 8"/>');
  train.onclick=()=>{tone(680,.13,'triangle');train.animate([{rotate:'-4deg'},{rotate:'7deg',translate:'0 -12px'},{rotate:'-4deg'}],{duration:reducedMotion?1:600});};world.append(train);
  const mic=$('.recording-studio');mic.replaceChildren();mic.innerHTML=svg('<rect x="97" y="12" width="46" height="75" rx="23" fill="#bb8996"/><path d="M83 60v15a37 37 0 0074 0V60M120 112v24m-30 0h60M109 25h22m-22 12h22m-22 12h22"/>')+'<span>点击唱歌</span>';mic.setAttribute('aria-label','点击唱歌，播放桃花笑一笑');
  $('.chapter-stops').remove();const track=$('.journey-track');track.setAttribute('role','progressbar');track.setAttribute('aria-label','探险进度：童年、云端、英伦、横店、回家');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
  const labels=document.createElement('div');labels.className='progress-labels';[['童年',0],['云端',2100],['英伦',3600],['横店',7300],['回家',9800]].forEach(([text,x])=>{const span=document.createElement('button');span.type='button';span.textContent=text;span.setAttribute('aria-label',`跳转到${text}章节`);span.onclick=()=>{game.dataset.start='true';setTarget(x);if(text==='童年'){window.stageUI?.open('childhood');return;}viewport.focus({preventScroll:true});};labels.append(span);});track.append(labels);
  const umbrella=document.createElement('div');umbrella.className='dog-umbrella';umbrella.setAttribute('aria-hidden','true');umbrella.innerHTML=svg('<path d="M17 77Q120-55 223 77Q189 56 154 77Q119 57 86 77Q49 56 17 77Z" fill="#b88d9d"/><path d="M120 14q-33 19-34 63m34-63q33 19 34 63M120 14v111q0 22-22 12"/><path d="M120 8v-8"/>');runner.append(umbrella);
  const end=document.createElement('button');end.className='terminal-invitation';end.type='button';end.textContent='到家啦 · 点这里打开27岁人生蛋糕';end.hidden=true;end.onclick=()=>window.stageUI.open('finale');$('#game').append(end);
  // One cached noise buffer; no audio allocation on every animation frame.
  let water=null;
  function waterSound(on){if(!on){if(water){water.source.stop();water=null;}return;}if(water)return;ensureAudio();const c=state.audio,buffer=c.createBuffer(1,c.sampleRate*3,c.sampleRate),data=buffer.getChannelData(0);let seed=927,last=0;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;last=(last+(seed/4294967296*2-1)*.04)/1.04;data[i]=last*4;}const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=850;gain.gain.value=.15;source.connect(filter).connect(gain).connect(c.destination);source.start();water={source};}
  const previous=window.paperPlay.frame;let lastPercent=-1;
  window.paperPlay.frame=(now,x)=>{previous(now,x);runner.classList.toggle('has-umbrella',x>7000&&x<7540&&runner.dataset.action!=='boat');waterSound(state.sound&&runner.dataset.action==='boat'&&!dialog.open);end.hidden=x<Math.min(9800,maxTravel()-80)||dialog.open;const percent=Math.round(x/maxTravel()*100);if(percent!==lastPercent){track.setAttribute('aria-valuenow',percent);lastPercent=percent;}};
  window.addEventListener('pagehide',()=>waterSound(false));
})();
