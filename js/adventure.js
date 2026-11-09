/* Layered paper adventure. All scenery variation uses a fixed seed. */
(() => {
  const game = document.querySelector('#game');
  const $ = (s, parent=document) => parent.querySelector(s);
  const create = (tag, cls, html='') => { const e=document.createElement(tag);e.className=cls;e.innerHTML=html;return e; };
  const svg = content => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#484b3c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
  const drawings = {
    tree:svg('<path d="M94 196 99 78 118 69 109 192" fill="#b89869"/><path d="m102 128-39-34m43 3 40-34"/><path d="M50 102C6 107 10 60 36 54 17 20 72 5 89 24 112-9 160 9 155 41 192 38 199 88 168 95 156 119 121 111 109 95 91 119 67 108 50 102Z" fill="#9baa72"/><path d="m51 63 14 12 24-23m31 14 21-20" stroke-width="2"/>'),
    flower:svg('<path d="m106 195-6-105m3 64c-53 3-56-31-54-38 35-3 47 15 54 38m0-19c28 5 49-15 51-34-34 0-45 15-51 34" fill="#91a474"/><path d="M98 82C55 110 39 58 67 49 51 16 91 3 104 33 129 5 162 41 137 60 172 84 132 117 112 85Z" fill="#ead5ac"/><circle cx="106" cy="62" r="14" fill="#b78850"/>'),
    grass:svg('<path d="M14 174 39 89 61 147 84 57 96 157 144 94 126 160 181 140 165 186Z" fill="#98ac77" stroke-width="2.5"/>'),
    cloud:svg('<path d="M24 115C-5 94 16 57 45 62 36 27 94 15 110 49 137 13 175 44 164 73 209 74 204 120 171 125L27 124" fill="#eee9d8" stroke="#7e8c85" stroke-width="2"/>'),
    lantern:svg('<path d="m100 0-2 39M91 155l-3 35m19-36 4 41" stroke-width="2"/><path d="M72 40 129 40 145 58 149 129 126 151 69 147 49 125 53 64Z" fill="#bb6e55"/><path d="m74 43-4 102m33-101-3 102m22-100 6 98" stroke="#e2ba75"/><path d="m68 36 63 2m-63 113 62 2" stroke-width="5"/>'),
    fence:svg('<path d="M15 192 17 51 34 36 48 54 45 190M90 190 94 49 109 35 120 52 120 190M168 188 169 46 184 36 194 52 194 187" fill="#ccb88b"/><path d="m6 82 192-3M6 145l192-3" stroke="#b09970" stroke-width="17"/><path d="m6 75 192-3M6 138l192-3" stroke-width="2"/>'),
    lamp:svg('<path d="M97 193 103 67 67 65 52 42 52 8 147 10 143 48 129 68 103 67" fill="#d7c6a0"/><path d="m65 14 7 40 54 1 8-38" fill="#e9cd85"/><path d="m72 192 51 1" stroke-width="7"/>'),
    crate:svg('<path d="m19 74 44-36 121 9-15 36-7 96L24 174Z" fill="#b39566"/><path d="m19 74 147 9 18-35M47 83l-5 90m112-91-11 97M25 101l130 8M24 154l128 5M48 101l91 56"/><path d="m65 38 31 40m-7-39 31 41" stroke="#e3c68e" stroke-width="5"/>'),
    star:svg('<path d="m99 17 22 53 57 5-45 39 16 62-52-34-53 31 15-59L14 76l63-6Z" fill="#d8b85c"/>'),
    butterfly:svg('<path d="M98 96C-12 2 0 131 79 120-17 189 109 215 101 121 191 202 215 103 126 110 209 39 137-3 98 96Z" fill="#bd8a91"/><path d="m100 87 4 61m-5-55-17-24m20 23 20-25" stroke-width="4"/>'),
  };
  const plane=svg('<path d="m6 105 23-22L16 45l28 4 36 38 81-2c46 0 52 32 12 41l-41 4-28 50-30-2 16-48-55-3Z" fill="#e2c58e"/><path d="m39 112 138 3" stroke="#7f9da7" stroke-width="12"/><circle cx="145" cy="99" r="9" fill="#96b6bc"/><circle cx="116" cy="99" r="9" fill="#96b6bc"/>');
  const boat=svg('<path d="M7 118 188 112 160 179 44 181Z" fill="#b99562"/><path d="m18 135 160-2m-149 20 137-3" stroke="#7b694d"/><path d="M102 118 100 2 157 94 102 97" fill="#d9c8a0"/><path d="m99 9-65 88 62 4" fill="#b37861"/>');
  const house=$('.paper-house');house.classList.add('hand-drawn');house.innerHTML=svg('<path d="m34 80 133-3 10 105-15 8-128-4Z" fill="#b97962"/><path d="m167 78 16-12 8 108-14 8Z" fill="#8e6250"/><path d="m22 84 25-45 52-18 65 10 24 43-33 7-53-33-54 37Z" fill="#708a78"/><path d="m45 45 57-28 68 19m-130 38 57-33 72 29" stroke="#435b50" stroke-width="2"/><path d="m138 29-1-21 19 2 3 25" fill="#b58c67"/><path d="m52 105 33-3 2 37-35 2Z" fill="#edc77b"/><path d="m68 105 1 35m-15-18 32-3"/><path d="m114 124 33 2 3 59-37 2Z" fill="#d6b180"/><path d="m121 132 20 2m-18 7 18 1" stroke-width="2"/><circle cx="139" cy="161" r="2" fill="#484b3c"/><path d="m47 151 44 2-5 10-37-2Z" fill="#8d9c6b"/><path d="m56 153-6-17m18 18 4-11m9 9 10-13" stroke="#637b53"/><path d="m105 188 54 2 9 6-71-1M30 180l-17-1 1-24 15 3" fill="#cab28a"/><path d="m21 153-1-25m-9 1 21 1" stroke-width="2"/>');

  game.dataset.start='false';
  const opening=create('section','opening','<img data-journey-src="images/opening-title-27.webp" alt="噜噜晓092727岁快乐"><p>一场把回忆拾起来的小小冒险</p><button class="start-journey" type="button">带上巴豆和妹妹，出发吧 ↗</button><small>沿着石板路，找齐 8 颗生日宝石。<br>每间亮着灯的小屋，都藏着下一步线索。</small>');
  world.append(opening);
  const guide=create('aside','chapter-guide','<strong></strong><p></p><button type="button">展开探险路线 ↗</button>');game.append(guide);
  const actionUI=create('div','player-actions','<button id="jumpButton" type="button" aria-label="宠物跳跃，空格键"><b aria-hidden="true">↑</b><span>跳跃</span></button><button id="interactButton" type="button" aria-label="与附近物件互动，E键"><b aria-hidden="true">✦</b><span>互动</span></button>');game.append(actionUI);
  game.append(create('div','control-caption','← → / A D 行走 · 空格跳跃<br>拖动探索 · E 互动 · M 路线'));
  const hint=create('span','scene-hint','点亮着灯的窗户 ↗');$('.zone-childhood').append(hint);
  const assets=[...document.querySelectorAll('.archive-sticker')];
  assets.forEach((img,i)=>{
    img.style.setProperty('--delay',`${-i*.63}s`);img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',`${img.alt}，点击让贴纸动起来`);
    // Reserve the opening lettering area, keep archive order from left to right.
    if(i<3){img.style.left=`${740+i*260}px`;img.style.top='auto';img.style.bottom=`${[29,48,30][i]}%`;img.style.maxWidth='145px';}
    const wave=()=>{img.classList.remove('is-waving');void img.offsetWidth;img.classList.add('is-waving');tone(500+i*17,.12)};
    img.addEventListener('click',wave);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();wave()}});
    if(img.src.endsWith('/23.png')){img.src='images/role-poise.png';img.alt='粉衣拼贴角色';img.classList.add('feature-role');img.style.bottom='28%';img.style.top='auto';const other=img.cloneNode();other.src='images/role-red.png';other.alt='红袖持书拼贴角色';other.style.left='7700px';other.style.bottom='31%';other.style.setProperty('--delay','-2s');other.addEventListener('click',()=>{other.classList.toggle('is-waving')});other.addEventListener('keydown',e=>{if(e.key==='Enter')other.click()});stickersLayer.append(other);}
    if(img.src.endsWith('/27.png')){img.src='images/role-forest.png';img.classList.add('feature-role');img.alt='绿色长袍人物独立贴纸';img.style.top='14%';img.style.bottom='auto';img.style.maxHeight='215px';}
  });
  const theater=$('.theater');theater.classList.add('hand-drawn-stage');theater.innerHTML=svg('<path d="m11 41 178 3-8 143-164 2Z" fill="#b96e56"/><path d="m22 58 154 3-7 115-144-1Z" fill="#485450"/><path d="m7 41 12-21 157 3 18 22Z" fill="#789284"/><path d="m21 59 28 3c-7 52-3 84 21 111l-40 1Z" fill="#b06653"/><path d="m173 60-30 2c7 55 5 78-17 111l44 2Z" fill="#b06653"/><path d="m20 58 153 4m-145 112 143 2" stroke="#d8b16b" stroke-width="5"/><path d="m31 69 7 89m124-87-4 92M15 187l-10 9 190-2-15-8" stroke-width="2"/><path d="m93 65-2 30 10-6 11 7-5-14 7-10-13 1-9-11" fill="#d3b35b"/>')+'<span>角色剧场 · 翻开回忆</span>';
  const chair=$('.director-chair');chair.classList.add('hand-drawn-chair');chair.innerHTML=svg('<path d="m37 32 120 4-3 64-112-3Z" fill="#c2a572"/><path d="m33 22 12 166m112-161-5 164m-112-94 119 78m-8-75L47 176" stroke="#746347" stroke-width="7"/><path d="m44 98 109 3-2 19-105-3Z" fill="#8a7860"/>')+'<span>导演椅</span>';
  // Deterministic scenery layout: no new random numbers inside animation frames.
  let seed=927;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const layers={};for(const type of ['far','middle','front']){layers[type]=create('div',`scenery ${type}`);layers[type].ariaHidden='true';world.append(layers[type]);}
  function prop(kind,x,size,layer='middle',bottom){const e=create('div',`scenery-item ${kind}`,drawings[kind]);e.style.left=x+'px';e.style.width=size+'px';e.style.height=size+'px';if(bottom)e.style.bottom=bottom;e.style.rotate=`${random()*6-3}deg`;layers[layer].append(e);return e;}
  for(let x=30;x<11200;x+=220+random()*190){const water=x>2200&&x<3500||x>5850&&x<7100; if(!water){prop(random()>.45?'grass':'flower',x,45+random()*70,'front');if(random()>.6)prop('tree',x+120,190+random()*110,'far');}if(random()>.45){const cloud=prop('cloud',x+70,150+random()*100,'far');cloud.style.top=(5+random()*18)+'%';}}
  [450,1310,1780,3780,4820,5590,7470,8490,9140,9970,10880].forEach((x,i)=>{prop(i>5?'lantern':i>2?'lamp':'tree',x,i>5?130:210,'middle',i>5?'57%':'27%')});
  [45,680,1700,3900,5350,8220,9290].forEach(x=>prop('fence',x,140,'middle','23%'));
  [370,1710,3960,5430,7740,9390].forEach(x=>prop('butterfly',x,50,'middle','56%'));
  const farItems=[...layers.far.children];
  const tasks=[
    {id:'album',title:'旧相册',where:'童年 · 点击路边发光的宝石',x:400},
    {id:'camera',title:'童年小屋',where:'童年 · 进屋，按下旧相机',x:780,dialog:'childhood'},
    {id:'star',title:'摘个星星',where:'远行 · 搭飞机，点击星星',x:3000},
    {id:'photo',title:'英伦合影',where:'英国 · 选择头像，拍下纪念照',x:3950,dialog:'photo'},
    {id:'library',title:'贴画碰个面',where:'英国 · 翻开贴画，连成三对',x:4400,dialog:'library'},
    {id:'bottle',title:'漂流瓶',where:'航海 · 点击海上的宝石',x:6480},
    {id:'role',title:'片场留影',where:'横店 · 选喜欢的角色合影',x:8190,dialog:'studio'},
    {id:'cards',title:'角色剧场',where:'横店 · 翻开三张角色卡',x:8730,dialog:'cards'},
  ];
  function showMap(){
    dialogContent.replaceChildren();const content=create('article','dialog-scene','<h2 id="dialogTitle">把 8 颗光，带回家</h2><p>不怕漏掉。点一个线索，就能沿原路回去。</p>');
    const list=create('div','route-list');tasks.forEach(task=>{const b=create('button',state.gems.has(task.id)?'done':'');b.type='button';b.textContent=`${state.gems.has(task.id)?'✓':'◇'} ${task.title}`;const small=create('small','');small.textContent=task.where;b.append(small);b.onclick=()=>{dialog.close();travel=null;keys.clear();held=0;direct=true;setTarget(task.x);direct=false;game.dataset.start='true';};list.append(b)});content.append(list);dialogContent.append(content);if(!dialog.open)dialog.showModal();
  }
  $('button',guide).onclick=showMap;
  $('.start-journey').onclick=()=>{game.dataset.start='true';setTarget(410);viewport.focus({preventScroll:true});showToast('先拾起路边宝石，再去童年小屋找线索。')};
  // The runner is intentionally outside the translated world.
  viewport.append(runner);runner.innerHTML='<canvas width="600" height="440" aria-hidden="true"></canvas><div class="vehicle"></div>';
  const canvas=$('canvas',runner),ctx=canvas.getContext('2d');
  const dogImages=['dog-run-a-clean.png','dog-run-b-clean.png','pets-childhood.png'].map(file=>{const img=new Image();img.src='images/'+file;img.fetchPriority='high';return img});
  const openingTitle=opening.querySelector('[data-journey-src]');
  openingTitle.src=openingTitle.dataset.journeySrc;
  openingTitle.fetchPriority='high';
  openingTitle.addEventListener('error',()=>{const source=openingTitle.dataset.journeySrc;openingTitle.src='';requestAnimationFrame(()=>{openingTitle.src=source;});},{once:true});
  delete openingTitle.dataset.journeySrc;
  let previous=performance.now(),lastX=0,clock=0,held=0,jumpStart=-1,direct=false,travel=null,lastChapter='',storyPauseUntil=0,storyMomentPlayed=false;const keys=new Set();
  const voiceMoments=[['16','shangguanqian'],['17','lijia'],['20','shaoyao'],['24','huxiu']].map(([archive,track])=>({archive,track,played:false}));
  const huxiuRole=document.querySelector('.archive-sticker[data-archive="24"]');
  if(huxiuRole){
    huxiuRole.setAttribute('aria-label','胡羞，点击播放角色语音');
    huxiuRole.addEventListener('click',()=>{
      huxiuRole.classList.add('voice-glow');
      window.gameAudio?.playTrack('huxiu');
      setTimeout(()=>huxiuRole.classList.remove('voice-glow'),3200);
    });
  }
  const nanyiRole=document.querySelector('.archive-sticker[data-archive="26"]');
  if(nanyiRole){
    nanyiRole.setAttribute('aria-label','南衣，点击播放角色语音');
    nanyiRole.addEventListener('click',()=>{
      nanyiRole.classList.add('voice-glow');
      window.gameAudio?.playTrack('nanyi',{volume:.58});
      setTimeout(()=>nanyiRole.classList.remove('voice-glow'),3200);
    });
  }
  const clickableVoiceMoments=[['1','momPhoto'],['3','dadPhoto'],['10','moneyHappiness']].map(([archive,track])=>({archive,track,armed:false}));
  clickableVoiceMoments.forEach(item=>{const role=document.querySelector(`.archive-sticker[data-archive="${item.archive}"]`);if(!role)return;role.setAttribute('aria-label',`${role.alt}，经过发光后点击播放角色语音`);role.addEventListener('click',()=>{if(!item.armed)return;role.classList.remove('voice-ready');role.classList.add('voice-glow');window.gameAudio?.playTrack(item.track);setTimeout(()=>role.classList.remove('voice-glow'),3200);});});
  const transports=[{start:1920,end:3400,type:'plane',label:'飞机停稳啦 · 用左右方向控制飞行'}];
  const boatSegments=[[5630,7140],[9400,10150]];
  const inBoatZone=x=>boatSegments.some(([start,end])=>x>=start&&x<=end);
  const rocks=[1450];let rockHintAt=-Infinity;
  rocks.forEach(x=>{const rock=create('button','road-obstacle','<span>空格 / 点这里跳过</span>');rock.type='button';rock.style.left=x+'px';rock.setAttribute('aria-label','石头挡路，点击或按空格跳跃');rock.onclick=()=>{const nose=runner.offsetLeft+runner.offsetWidth*.82;if(Math.abs(state.x+nose-x)<180){jump();setTarget(x+115-nose);}else showToast('走近石头后，再按空格跳跃。');};world.append(rock)});
  const rain=create('div','rain-passage');rain.style.left='7180px';rain.setAttribute('aria-hidden','true');world.append(rain);
  function constrain(value){
    if(performance.now()<storyPauseUntil)return state.targetX;
    if(direct)return value;if(travel)return travel.type==='plane'?clamp(value,travel.start,Math.min(travel.end,maxTravel())):state.targetX;
    if(value>state.targetX&&jumpStart<0){const nose=runner.offsetLeft+runner.offsetWidth*.82;const rock=rocks.find(x=>state.x+nose<=x+10&&value+nose>=x-8);if(rock){if(performance.now()-rockHintAt>2600){showToast('按空格跳过石头 →');tone(150,.13,'triangle');rockHintAt=performance.now();}return Math.max(0,rock-nose-10);}}
    if(value>state.targetX){const next=transports.find(t=>state.targetX<=t.start&&value>=t.start);if(next)return next.start;}
    return value;
  }
  function jump(){if(dialog.open||travel?.type==='boat'||jumpStart>=0)return;jumpStart=performance.now();state.lastMove=performance.now();runner.classList.add('is-jumping');tone(330,.08,'square');setTimeout(()=>tone(620,.16,'sine'),55)}
  const jumpButton=$('#jumpButton');
  jumpButton.onpointerdown=e=>{if(e.pointerType==='touch'){e.preventDefault();jump();}};
  jumpButton.onclick=e=>{if(e.pointerType!=='touch')jump();};
  function interact(){if(dialog.open)return;const px=state.x+runner.offsetLeft+runner.offsetWidth/2;let nearest=null,dist=Infinity;world.querySelectorAll('[data-open],.drop-cache:not(.opened),.world-drop,[data-gem]:not(.is-collected)').forEach(e=>{const r=e.getBoundingClientRect();const d=Math.abs(r.left+r.width/2-(px-state.x));if(d<dist&&r.width){dist=d;nearest=e}});if(nearest&&dist<360)nearest.click();else showToast('再靠近发光的物件或房子一点。')}
  $('#interactButton').onclick=interact;
  // Replace old click-to-teleport controls with pointer-hold movement.
  ['backButton','forwardButton'].forEach((id,i)=>{const old=$('#'+id),button=old.cloneNode(true);old.replaceWith(button);button.onpointerdown=e=>{held=i?1:-1;button.setPointerCapture(e.pointerId);game.dataset.start='true'};button.onpointerup=()=>{held=0};button.onpointercancel=()=>{held=0};button.onclick=e=>{if(e.detail===0)setTarget(state.targetX+(i?160:-160));viewport.focus({preventScroll:true})};});
  window.addEventListener('keydown',e=>{if(dialog.open||e.target.matches('input,textarea,select'))return;if(['ArrowLeft','ArrowRight','a','d','A','D',' '].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase());game.dataset.start='true';if(e.key===' '&&!e.repeat)jump();}if(e.key.toLowerCase()==='e'&&!e.repeat)interact();if(e.key.toLowerCase()==='m'&&!e.repeat)showMap();if(e.key==='Home'){setTarget(0)}if(e.key==='End'){direct=true;setTarget(maxTravel());direct=false}});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();held=0});
  dialog.addEventListener('close',()=>{viewport.focus({preventScroll:true});keys.clear();held=0});
  const bonus=new Set(JSON.parse(localStorage.getItem('birthday-keepsakes')||'[]'));
  [1260,1770,4380,5350,7800,9230].forEach((x,i)=>{const chest=create('button','drop-cache',drawings.crate);chest.type='button';chest.style.left=x+'px';chest.setAttribute('aria-label',`打开第${i+1}个回忆箱，寻找纪念物`);if(bonus.has(i))chest.classList.add('opened');chest.onclick=()=>{if(chest.classList.contains('opened'))return showToast('这个箱子已经找过啦');chest.classList.add('opened');tone(240,.16,'triangle');const drop=create('button','world-drop','✦');drop.type='button';drop.setAttribute('aria-label','拾取掉落的回忆星');drop.style.left=(x+35)+'px';drop.style.bottom='27%';world.append(drop);drop.onclick=()=>{bonus.add(i);localStorage.setItem('birthday-keepsakes',JSON.stringify([...bonus]));reward(drop);drop.remove();showToast(`找到回忆星 ${bonus.size} / 6 · 生日宝石另有 8 颗`)}};world.append(chest)});
  function reward(element){const r=element?.getBoundingClientRect()||{left:innerWidth/2,top:innerHeight/2,width:0,height:0};for(let i=0;i<7;i++){const p=create('span','reward-particle','✦');p.style.left=r.left+r.width/2+'px';p.style.top=r.top+r.height/2+'px';game.append(p);const anim=p.animate([{transform:'translate(0,0) scale(.3)',opacity:1},{transform:`translate(${(i-3)*26}px,${-50-i*7}px) scale(1)`,opacity:1,offset:.3},{transform:`translate(${innerWidth-110-r.left}px,${45-r.top}px) scale(.2)`,opacity:0}],{duration:reducedMotion?100:850+i*45,easing:'ease-in-out'});anim.onfinish=()=>p.remove();}lastChapter='';}
  function drawDog(img,x,y,w,h,phase,moving,reverse){if(!img.complete||!img.naturalWidth)return;ctx.save();ctx.translate(x+w/2,y+h);if(reverse)ctx.scale(-1,1);ctx.rotate(moving?Math.sin(phase)*.025:Math.sin(clock*.0015)*.02);ctx.translate(-w/2,-h);
    // Keep the face intact; independently articulate the lower body in narrow strips.
    const split=.66;ctx.drawImage(img,0,0,img.width,img.height*split,0,0,w,h*split);
    for(let n=0;n<20;n++){const sy=img.height*(split+(1-split)*n/20),sh=img.height*(1-split)/20;const t=n/20;const dx=moving?Math.sin(phase)*Math.pow(t,1.2)*w*.045:0;ctx.drawImage(img,0,sy,img.width,sh,dx,h*(split+(1-split)*n/20)-.5,w,h*(1-split)/20+1);}
    ctx.restore();}
  function frame(now){const dt=Math.min(40,now-previous);previous=now;clock=now;const moving=Math.abs(state.x-lastX)>.3;const reverse=state.x<lastX-.1;lastX=state.x;
    const voiceMoment=voiceMoments.find(item=>{if(item.played||!moving||reverse)return false;const role=document.querySelector(`.archive-sticker[data-archive="${item.archive}"]`);if(!role)return false;const trigger=parseFloat(role.style.left)-viewport.clientWidth*.52;return Math.abs(state.x-trigger)<42;});
    if(voiceMoment&&now>=storyPauseUntil){voiceMoment.played=true;storyPauseUntil=now+(reducedMotion?500:1800);state.targetX=state.x;const role=document.querySelector(`.archive-sticker[data-archive="${voiceMoment.archive}"]`);role?.classList.add('voice-glow');window.gameAudio?.playTrack(voiceMoment.track);setTimeout(()=>role?.classList.remove('voice-glow'),reducedMotion?700:2800);}
    const clickableMoment=clickableVoiceMoments.find(item=>{if(item.armed||!moving||reverse)return false;const role=document.querySelector(`.archive-sticker[data-archive="${item.archive}"]`);if(!role)return false;const trigger=parseFloat(role.style.left)-viewport.clientWidth*.52;return Math.abs(state.x-trigger)<42;});
    if(clickableMoment&&now>=storyPauseUntil){clickableMoment.armed=true;storyPauseUntil=now+(reducedMotion?350:900);state.targetX=state.x;document.querySelector(`.archive-sticker[data-archive="${clickableMoment.archive}"]`)?.classList.add('voice-ready');}
    if(!storyMomentPlayed&&state.x>=2280){storyMomentPlayed=true;storyPauseUntil=now+(reducedMotion?500:1800);state.targetX=state.x;const role=document.querySelector('.archive-sticker[data-archive="7"]');role?.classList.add('story-glow');document.querySelector('.bedtime-quote')?.classList.add('story-glow');window.gameAudio?.playTrack('bedtime');showToast('停一下，听听床边故事 ♪');setTimeout(()=>{role?.classList.remove('story-glow');document.querySelector('.bedtime-quote')?.classList.remove('story-glow');},reducedMotion?600:2600);}
    if(!dialog.open){const direction=held||(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0);if(direction&&(!travel||travel.type==='plane')&&now>=storyPauseUntil)setTarget(state.targetX+direction*dt*(travel?.type==='plane'?.62:(inBoatZone(state.x)?.36:.47)));}
    if(!travel&&!dialog.open){const t=transports.find(t=>Math.abs(state.x-t.start)<3&&Math.abs(state.targetX-t.start)<1);if(t){travel={...t,time:now};game.dataset.start='true';$('.vehicle',runner).innerHTML=t.type==='plane'?plane:boat;showToast(t.label);tone(t.type==='plane'?130:180,.8,'triangle')}}
    if(travel?.type==='plane'){if(state.x>=travel.end-2&&state.targetX>=travel.end-2){travel=null;showToast('飞机到站啦，继续向右探索。')}}else if(travel){const p=Math.min(1,(now-travel.time)/(reducedMotion?800:4200));state.targetX=travel.start+(Math.min(travel.end,maxTravel())-travel.start)*(p*p*(3-2*p));state.lastMove=now;if(p===1){travel=null;showToast('到站啦，继续向右探索。')}}
    const boatZone=inBoatZone(state.x);
    const vehicleWrap=$('.vehicle',runner);
    if(travel?.type==='plane'){vehicleWrap.innerHTML=plane;}else if(boatZone){vehicleWrap.innerHTML=boat;}else{vehicleWrap.innerHTML='';}
    let mode=travel?.type|| (boatZone?'boat':(jumpStart>=0?'jump':moving?'walk':'idle'));runner.dataset.action=mode;
    ctx.clearRect(0,0,600,440);let bounce=0;if(jumpStart>=0){const p=(now-jumpStart)/760;bounce=Math.sin(Math.min(1,p)*Math.PI)*138;if(p>=1){jumpStart=-1;runner.classList.remove('is-jumping');}}
    if(window.petWardrobe){window.petWardrobe.draw(ctx,{now,mode,moving,reverse,bounce,x:state.x});}else if(mode==='idle'&&dogImages[2].complete&&dogImages[2].naturalWidth){const img=dogImages[2];const h=330,w=h*img.width/img.height;ctx.drawImage(img,(600-w)/2,100+Math.sin(now*.002)*3,w,h);}else{const phase=reducedMotion?0:now*.016;drawDog(dogImages[0],180,55-bounce+(moving?Math.sin(phase)*5:0),325,315,phase,moving&&!travel,reverse);drawDog(dogImages[1],20,186-bounce*.8+(moving?Math.sin(phase+1.5)*6:0),255,235,phase+1.5,moving&&!travel,reverse);}
    window.paperPlay?.frame(now,state.x);
      if(travel){runner.style.translate=`0 ${Math.sin(now*.003)*7}px`;$('.vehicle svg',runner)?.setAttribute('preserveAspectRatio','none')}else runner.style.translate='0 0';
    farItems.forEach((e,i)=>{e.style.translate=`${state.x*.065}px ${reducedMotion?0:Math.sin(now*.0006+i)*3}px`});
    const chapter=state.x<2000?0:state.x<3450?1:state.x<5650?2:state.x<7150?3:state.x<9420?4:5;
    const key=`${chapter}:${state.gems.size}`;if(key!==lastChapter){lastChapter=key;const titles=['01 / 翻出童年','02 / 摘个星星','03 / 英伦拍一张','04 / 跟浪花走','05 / 闯进片场','06 / 回到家'];const descriptions=['找旧相册的宝石；点亮窗户进屋，旧相机会给你下一颗。','巴豆和妹妹正在飞往英国。留意云层中闪光的星星。','红色电话亭可以合影；图书馆里把同款贴画连成三对。','乘着小船手动前进，点击漂流瓶旁的光。','在导演椅选角色合影，再到剧场翻开三张角色卡。',state.gems.size===8?'8 颗宝石已集齐！点暖黄窗户，用钥匙打开生日礼物。':`还差 ${8-state.gems.size} 颗宝石。展开路线，找到遗漏的光。`];$('strong',guide).textContent=titles[chapter];$('p',guide).textContent=descriptions[chapter];}
  }
  const roomText={childhood:'第一关 · 点击放映机时光回溯 → 按下旧相机收集宝石 → 出门前往机场。',photo:'第二关 · 左边滑动选角色 → 上传或拍照 → 拖动贴画完成合影。',library:'翻开两张贴画，找到三组相同图案，就能带走宝石。',studio:'第三关 · 先选角色 → 留下合影 → 去右边的角色剧场。',cards:'第三关 · 翻开三张卡片 → 领取宝石 → 沿江回到家。',finale:'终点 · 宝石变成钥匙。划燃火柴后，拖到蜡烛上。键盘可按两次 Enter 完成。'};
  function enhanceDialog(name){const article=$('article',dialogContent);const p=create('p','room-guide');p.textContent=roomText[name]||'';article.append(p);
    if(name==='childhood'){const label=create('span','guide-heading','屋主的小纸条：相机记住了第一束光');article.insertBefore(label,$('.old-camera',article));}
    if(name==='library')setupLibrary(article);
    if(name==='photo'||name==='studio')setupPhoto(article,name);
    if(name==='cards'){const imgs=article.querySelectorAll('img');['role-poise.png','role-red.png','role-forest.png'].forEach((f,i)=>imgs[i].src='images/'+f)}
    if(name==='finale'){
      const key=create('div','gate-key','⚿');key.setAttribute('aria-label','宝石合成的生日钥匙');article.insertBefore(key,$('.cake',article));
      const match=$('#match'),replacement=match.cloneNode(true);match.replaceWith(replacement);let start=null,burning=false;
      const light=()=>{if(!burning)return;$('.cake',article).classList.add('is-lit');$('#notesWall').hidden=false;reward($('.cake',article));tone(784,.7);showToast('27岁快乐，所有的光都回家了。')};
      replacement.onpointerdown=e=>{start={x:e.clientX,y:e.clientY};replacement.setPointerCapture(e.pointerId)};
      replacement.onpointermove=e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;replacement.style.transform=`translate(${dx}px,${dy}px)`;if(Math.abs(dx)>95&&!burning){burning=true;replacement.classList.add('is-burning');tone(160,.35,'sawtooth')}const r=$('.cake',article).getBoundingClientRect();if(burning&&e.clientX>r.left-20&&e.clientX<r.right+20&&e.clientY>r.top-80&&e.clientY<r.bottom)light()};
      replacement.onpointerup=replacement.onpointercancel=()=>{start=null;replacement.style.transform=''};replacement.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(burning)light();else{burning=true;replacement.classList.add('is-burning');showToast('火柴点燃了，再按一次点亮蜡烛。')}}};
    }
  }
  function setupLibrary(article){const grid=$('#bookGrid');grid.replaceChildren();const status=create('div','game-timer','翻开两张贴画，让同款宝石碰个面');article.insertBefore(status,grid);const faces=[{id:'star',label:'星芒宝石'},{id:'opal',label:'彩虹蛋白石'},{id:'heart',label:'玻璃爱心'}];const deck=[...faces,...faces].sort(()=>Math.random()-.5);let first=null,lock=false,pairs=0;
    deck.forEach((face,i)=>{const b=create('button','match-card',`<span>?</span><b><i class="jelly-gem jelly-${face.id}" aria-hidden="true"></i></b>`);b.type='button';b.dataset.face=face.id;b.setAttribute('aria-label',`翻开第 ${i+1} 张贴画`);b.style.setProperty('--card-rot',`${[-3,2,-1,3,-2,1][i]}deg`);b.onclick=()=>{if(lock||b===first||b.classList.contains('matched'))return;b.classList.add('open');b.setAttribute('aria-label',face.label);tone(420,.08);if(!first){first=b;status.textContent='再翻一张，找它的同伴';return}if(first.dataset.face===face.id){first.classList.add('matched');b.classList.add('matched');first=null;pairs++;status.textContent=`找到 ${pairs}/3 对宝石`;tone(660,.18);if(pairs===3){status.textContent='三组宝石都亮起来了，收好这一颗！';collectGem('library',b)}}else{lock=true;status.textContent='不是这一对，再看看';setTimeout(()=>{first.classList.remove('open');b.classList.remove('open');first=null;lock=false},650)}};grid.append(b)});
  }
  function setupPhoto(article,name){const original=$('[data-dialog-gem]',article),button=original.cloneNode(true);original.replaceWith(button);button.disabled=true;let ready=false;
    if(name==='photo'){
      const preset=create('button','action-button','使用宠物头像');preset.type='button';$('.upload-label',article).after(preset);preset.onclick=()=>{const img=new Image();img.src='images/pets-childhood.png';img.alt='巴豆和妹妹预设头像';$('#photoPreview').replaceChildren(img);ready=true;button.disabled=false};$('#photoUpload').addEventListener('change',e=>{ready=!!e.target.files[0];button.disabled=!ready});
    }else{
      const portraits=['role-poise.png','role-red.png','role-forest.png'];article.querySelectorAll('[data-role]').forEach((b,i)=>{b.querySelector('img').src='images/'+portraits[i];b.onclick=()=>{ready=true;button.disabled=false;article.querySelectorAll('[data-role]').forEach(e=>e.classList.remove('is-selected'));b.classList.add('is-selected')}});
    }
    button.onclick=()=>{if(!ready)return;collectGem(name==='photo'?'photo':'role');button.textContent='合影已完成 · 下载纪念照';button.onclick=()=>downloadPhoto(article,name)};
  }
  async function downloadPhoto(article,name){const c=document.createElement('canvas');c.width=1000;c.height=760;const g=c.getContext('2d');g.fillStyle='#d6c7a4';g.fillRect(0,0,1000,760);g.fillStyle='#94afa8';g.fillRect(35,35,930,575);g.strokeStyle='#455e59';for(let x=50;x<990;x+=110){g.strokeRect(x,120+(x%3)*15,70,480)}const imgs=name==='photo'?[...article.querySelectorAll('.polaroid img')]:[$('.is-selected img',article),dogImages[2]];await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));imgs.forEach((im,i)=>{if(!im?.naturalWidth)return;const h=510,w=Math.min(420,h*im.naturalWidth/im.naturalHeight);g.drawImage(im,60+i*480,80,w,h)});g.fillStyle='#644c3f';g.font='36px "Ma Shan Zheng", cursive';g.fillText('噜噜晓 27 岁27岁快乐 · 一起走过的风景',70,685);const a=document.createElement('a');a.download='生日探险-纪念合影.png';a.href=c.toDataURL();a.click()}
  window.adventure={constrain,frame,reward,showMap,enhanceDialog};
})();
