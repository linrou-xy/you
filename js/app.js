const viewport = document.querySelector('#viewport');
const game = document.querySelector('#game');
const world = document.querySelector('#world');
const runner = document.querySelector('#runner');
const stickersLayer = document.querySelector('#stickers');
const progressFill = document.querySelector('#progressFill');
const progressDog = document.querySelector('#progressDog');
const gemCount = document.querySelector('#gemCount');
const toast = document.querySelector('#toast');
const dialog = document.querySelector('#gameDialog');
const dialogContent = document.querySelector('#dialogContent');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  x: 0, targetX: 0, dragging: false, dragStart: 0, dragOrigin: 0,
  gems: new Set(JSON.parse(localStorage.getItem('birthday-gems') || '[]')),
  sound: false, audio: null, lastMove: 0,
};
const music=new Audio();music.preload='none';music.loop=false;let currentTrack='';
const tracks={brave:'audio/fairytale-adventure.wav',bedtime:'audio/bedtime-story.mp3',hengdian:'audio/peach-blossom-smile.mp3',remember:'audio/remember-me.mp3',september27:'audio/record-september27.mp3',everything:'audio/record-everything-sucks.mp3',pretend:'audio/record-pretend.mp3',xiaoban:'audio/record-xiaoban.mp3',shangguanqian:'audio/voice-shangguanqian.mp3',lijia:'audio/voice-lijia.mp3',shaoyao:'audio/voice-shaoyao.mp3',huxiu:'audio/voice-huxiu.mp3',nanyi:'audio/voice-nanyi.mp3',moneyHappiness:'audio/voice-money-happiness.mp3',momPhoto:'audio/voice-mom-photo.mp3',dadPhoto:'audio/voice-dad-photo.mp3'};
let bravePosition=0;
function playTrack(name,{loop=name==='brave',volume=1}={}){const src=tracks[name];if(!src)return Promise.resolve();if(currentTrack!==name){if(currentTrack==='brave')bravePosition=music.currentTime;music.pause();music.src=src;music.currentTime=name==='brave'?bravePosition:0;currentTrack=name}music.loop=loop;music.volume=Math.max(0,Math.min(1,volume));state.sound=true;const soundButton=document.querySelector('#soundButton');soundButton?.setAttribute('aria-pressed','true');soundButton?.setAttribute('aria-label','关闭声音');return music.play().catch(()=>showToast('点一下音乐按钮，再播放这段声音。'));}
music.addEventListener('ended',()=>{if(currentTrack!=='brave'&&state.sound)playTrack('brave');});
function stopMusic(){music.pause();music.currentTime=0;currentTrack='';}
window.gameAudio={playTrack,stopMusic,get current(){return currentTrack}};

const archiveNumbers = [...Array(20)].map((_, i) => i + 1).concat([24, 25, 26, 28]);
const stickerPositions = [260,610,980,1320,1650,1940,2260,2550,2860,3200,3780,4100,4470,4800,5100,5440,5770,6100,6420,6760,7450,7860,8270,8640,9020,9350];
archiveNumbers.forEach((number, index) => {
  const image = document.createElement('img');
  image.dataset.src = `images/archive/${number}.png`;
  image.dataset.archive = String(number);
  image.alt = `人生档案第${number}号插图`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.fetchPriority = 'low';
  image.className = `archive-sticker ${index % 3 === 1 ? 'air' : 'roadside'}`;
  image.style.left = `${stickerPositions[index]}px`;
  image.style.setProperty('--rot', `${[-5,3,-2,5,-4][index % 5]}deg`);
  image.style.setProperty('--top', `${[17,27,12,35][index % 4]}%`);
  image.style.setProperty('--bottom', `${[28,39,31,47][index % 4]}%`);
  stickersLayer.append(image);
  if(number<=3){image.src=image.dataset.src;delete image.dataset.src;}
});
[
  {src:'images/role-blue-moon.png',alt:'蓝白礼服人物插画',left:7480,top:37},
  {src:'images/role-soft-night.png',alt:'柔夜电话人物插画',left:7060,top:9},
].forEach((item,index)=>{const image=document.createElement('img');image.dataset.src=item.src;image.dataset.asset=item.src;image.alt=item.alt;image.loading='lazy';image.decoding='async';image.fetchPriority='low';image.className='archive-sticker feature-role roadside';image.style.left=item.left+'px';image.style.top=item.top+'%';image.style.bottom='auto';image.style.setProperty('--rot',index?'3deg':'-3deg');stickersLayer.append(image);});

let journeyLoadEdge=-1;
window.loadJourneyAssets=(position=0)=>{
  const edge=position+1900;
  if(edge<=journeyLoadEdge)return;
  journeyLoadEdge=edge;
  document.querySelectorAll('.archive-sticker[data-src]').forEach(image=>{
    const left=parseFloat(image.style.left)||0;
    if(left<=edge){
      const source=image.dataset.src;
      image.src=source;
      image.fetchPriority=left<1800?'high':'low';
      image.addEventListener('error',()=>{image.src='';requestAnimationFrame(()=>{image.src=source;});},{once:true});
      delete image.dataset.src;
    }
  });
};

const maxTravel = () => Math.max(0, world.offsetWidth - viewport.clientWidth);
const scenePointerX = event => {
  const rotated=document.documentElement.classList.contains('portrait-landscape-fallback');
  const scale=Number(getComputedStyle(document.documentElement).getPropertyValue('--scene-scale'))||1;
  return (rotated?event.clientY:event.clientX)/scale;
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
function setTarget(value) {
  if (window.adventure) value = window.adventure.constrain(value);
  state.targetX = clamp(value, 0, maxTravel());
  state.lastMove = performance.now();
  runner.classList.remove('is-stopped');
}
function updateWorld() {
  if(game.dataset.start==='true')window.loadJourneyAssets?.(state.x);
  if (window.adventure) window.adventure.frame(performance.now());
  state.x += (state.targetX - state.x) * (reducedMotion ? 1 : .13);
  if (Math.abs(state.targetX - state.x) < .2) state.x = state.targetX;
  world.style.transform = `translate3d(${-state.x}px,0,0)`;
  document.querySelector('#distantLayer').style.transform = `translate3d(${state.x * .2}px,0,0)`;
  const progress = maxTravel() ? state.x / maxTravel() : 0;
  progressFill.style.width = `${progress * 100}%`;
  progressDog.style.left = `${progress * 100}%`;
  runner.classList.toggle('is-stopped', performance.now() - state.lastMove > 220);
  requestAnimationFrame(updateWorld);
}

viewport.addEventListener('wheel', (event) => {
  if (dialog.open) return;
  event.preventDefault();
  const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  setTarget(state.targetX + delta * 1.35);
}, { passive: false });
viewport.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button,[role="button"]')) return;
  state.dragging = true; state.dragStart = scenePointerX(event); state.dragOrigin = state.targetX;
  viewport.classList.add('is-dragging'); viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove', (event) => { if (state.dragging) setTarget(state.dragOrigin + state.dragStart - scenePointerX(event)); });
viewport.addEventListener('pointerup', () => { state.dragging = false; viewport.classList.remove('is-dragging'); });
viewport.addEventListener('pointercancel', () => { state.dragging = false; viewport.classList.remove('is-dragging'); });

const moveBy = (amount) => setTarget(state.targetX + amount);
document.querySelector('#backButton').addEventListener('click', () => moveBy(-Math.min(720, viewport.clientWidth * .72)));
document.querySelector('#forwardButton').addEventListener('click', () => moveBy(Math.min(720, viewport.clientWidth * .72)));
document.querySelector('#homeButton').addEventListener('click', () => setTarget(0));
viewport.addEventListener('keydown', (event) => {
  if (window.adventure) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); moveBy(420); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveBy(-420); }
  if (event.key === 'Home') { event.preventDefault(); setTarget(0); }
  if (event.key === 'End') { event.preventDefault(); setTarget(maxTravel()); }
});

function showToast(message) {
  toast.textContent = message; toast.classList.add('is-visible'); clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}
function ensureAudio() {
  if (!state.audio) state.audio = new AudioContext();
  if (state.audio.state === 'suspended') state.audio.resume();
}
function tone(frequency = 880, duration = .22, type = 'sine') {
  if (!state.sound) return;
  ensureAudio();
  const oscillator = state.audio.createOscillator(); const gain = state.audio.createGain();
  oscillator.type = type; oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.0001, state.audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.12, state.audio.currentTime + .015);
  gain.gain.exponentialRampToValueAtTime(.0001, state.audio.currentTime + duration);
  oscillator.connect(gain).connect(state.audio.destination); oscillator.start(); oscillator.stop(state.audio.currentTime + duration + .02);
}
function collectGem(id, element) {
  if (state.gems.has(id)) return showToast('这颗光已经收进礼物袋了');
  state.gems.add(id); localStorage.setItem('birthday-gems', JSON.stringify([...state.gems]));
  gemCount.textContent = state.gems.size; if (element) element.classList.add('is-collected');
  if (window.adventure) window.adventure.reward(element);
  tone(987, .34); setTimeout(() => tone(1318, .38), 90); showToast(`收集到生日宝石 ${state.gems.size} / 8`);
}
document.querySelectorAll('[data-gem]').forEach((button) => {
  if (state.gems.has(button.dataset.gem)) button.classList.add('is-collected');
  button.addEventListener('click', () => collectGem(button.dataset.gem, button));
});
gemCount.textContent = state.gems.size;
document.querySelector('#soundButton').addEventListener('click', (event) => {
  state.sound = !state.sound; event.currentTarget.setAttribute('aria-pressed', String(state.sound));
  event.currentTarget.setAttribute('aria-label', state.sound ? '关闭声音' : '开启声音');
  if (state.sound) { ensureAudio(); tone(659, .25); if(currentTrack)music.play().catch(()=>{}); }
  else music.pause();
});
document.addEventListener('pointerdown',event=>{if(event.target.closest('button,[role=button],a'))tone(520,.055,'triangle')},{passive:true});

document.querySelectorAll('.floating-quote').forEach((quote) => {
  quote.tabIndex = 0;
  const scatter = () => { quote.classList.add('is-scattered'); setTimeout(() => quote.classList.remove('is-scattered'), 1400); };
  quote.addEventListener('click', scatter);
  quote.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') scatter(); });
});

function openDialog(name) {
  if (name === 'finale' && state.gems.size < 8 && state.x < Math.min(9800,maxTravel()-80)) { window.adventure?.showMap(); return showToast('沿路收集宝石，抵达终点就能打开27岁人生蛋糕。'); }
  if (window.stageUI?.open(name)) return;
  const template = document.querySelector(`#${name}Template`); if (!template) return;
  dialogContent.replaceChildren(template.content.cloneNode(true)); if (!dialog.open) dialog.showModal(); setupDialog(name);
  window.adventure?.enhanceDialog(name);
}
document.querySelectorAll('[data-open]').forEach((element) => {
  element.addEventListener('click', () => openDialog(element.dataset.open));
  element.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDialog(element.dataset.open); } });
});
document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

function setupDialog(name) {
  dialogContent.querySelectorAll('[data-dialog-gem]').forEach((button) => button.addEventListener('click', () => collectGem(button.dataset.dialogGem, button)));
  if (name === 'photo') {
    dialogContent.querySelector('#photoUpload').addEventListener('change', (event) => {
      const file = event.target.files[0]; if (!file) return;
      const preview = dialogContent.querySelector('#photoPreview'); const image = new Image(); image.alt = '用户选择的照片预览';
      image.src = URL.createObjectURL(file); image.onload = () => URL.revokeObjectURL(image.src); preview.replaceChildren(image);
    });
  }
  if (name === 'library') {
    const grid = dialogContent.querySelector('#bookGrid'); const winner = 7;
    for (let i = 0; i < 18; i++) {
      const book = document.createElement('button'); book.type = 'button'; book.setAttribute('aria-label', `检查第${i + 1}本书`);
      book.style.setProperty('--book-color', ['#8aa07a','#b65c4d','#7293ac','#d2a85a'][i % 4]); book.style.setProperty('--book-rot', `${(i % 5) - 2}deg`);
      if (i === winner) book.classList.add('is-gem');
      book.addEventListener('click', () => i === winner ? collectGem('library', book) : showToast('这里没有，再看看别处')); grid.append(book);
    }
  }
  if (name === 'studio') {
    dialogContent.querySelectorAll('[data-role]').forEach((button) => button.addEventListener('click', () => {
      dialogContent.querySelectorAll('[data-role]').forEach((item) => item.classList.remove('is-selected')); button.classList.add('is-selected');
    }));
  }
  if (name === 'cards') {
    let flipped = 0;
    dialogContent.querySelectorAll('.flip-card').forEach((card) => card.addEventListener('click', () => {
      if (card.classList.contains('is-flipped')) return; card.classList.add('is-flipped'); flipped += 1; tone(720 + flipped * 120, .2);
      if (flipped === 3) setTimeout(() => collectGem('cards'), 480);
    }));
  }
  if (name === 'finale') setupFinale();
}

function setupFinale() {
  const finale = dialogContent.querySelector('.finale-game'); const match = finale.querySelector('#match'); const cake = finale.querySelector('.cake'); const notes = finale.querySelector('#notesWall');
  let burning = false; let startX = 0;
  match.addEventListener('pointerdown', (event) => { startX = event.clientX; match.setPointerCapture(event.pointerId); });
  match.addEventListener('pointermove', (event) => {
    if (!match.hasPointerCapture(event.pointerId)) return; const dx = event.clientX - startX; match.style.transform = `translateX(${clamp(dx,-50,220)}px)`;
    if (dx > 130 && !burning) { burning = true; match.classList.add('is-burning'); tone(180,.5,'sawtooth'); }
    const box = cake.getBoundingClientRect();
    if (burning && event.clientX > box.left && event.clientX < box.right && event.clientY > box.top - 90 && event.clientY < box.bottom) lightCake();
  });
  match.addEventListener('pointerup', (event) => match.releasePointerCapture(event.pointerId));
  match.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); burning = true; match.classList.add('is-burning'); lightCake(); } });
  function lightCake() {
    if (cake.classList.contains('is-lit')) return; cake.classList.add('is-lit'); notes.hidden = false;
    tone(523,.4); setTimeout(() => tone(659,.4),140); setTimeout(() => tone(784,.6),280); showToast('一路收集的光，终于点亮了这里');
  }
  finale.querySelector('#noteForm').addEventListener('submit', (event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const saved = JSON.parse(localStorage.getItem('birthday-notes') || '[]'); saved.push({ name:data.get('name'), message:data.get('message'), color:data.get('color') });
    localStorage.setItem('birthday-notes', JSON.stringify(saved.slice(-24))); event.currentTarget.reset(); renderNotes(); tone(900,.18); showToast('祝福已经贴在墙上');
  });
  renderNotes();
}
function renderNotes() {
  const wall = dialogContent.querySelector('#postedNotes'); if (!wall) return; wall.replaceChildren();
  const colors = { kraft:'#d6b275', pink:'#e8b3b9', blue:'#aecad9', ivory:'#f2e9d2' };
  JSON.parse(localStorage.getItem('birthday-notes') || '[]').forEach((note,index) => {
    const article = document.createElement('article'); article.className = 'fan-note'; article.style.setProperty('--note', colors[note.color] || colors.ivory); article.style.setProperty('--r', `${[-2,1,-1,2][index % 4]}deg`);
    const name = document.createElement('strong'); const message = document.createElement('p'); name.textContent = note.name; message.textContent = note.message; article.append(name,message); wall.append(article);
  });
}

window.addEventListener('resize', () => setTarget(state.targetX));
updateWorld();
