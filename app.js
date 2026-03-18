/* ============================================================
   app.js — Feedback App
   Depends on: i18n.js (must be loaded first)
   ============================================================ */

/* ─── STATE ──────────────────────────────────────────────────── */
const state = {
  mode:            'junior',   // 'junior' | 'senior'
  lang:            'kz',
  currentSlide:    0,
  totalSlides:     3,

  words:           {},         // { word: count }

  understanding:   { got: 0, hard: 0, no: 0 },
  myUnderstanding: null,

  stars:           0,
  scale:           0,
  ratings:         [],
};

/* ─── PERSIST ─────────────────────────────────────────────────── */
function loadState() {
  try {
    const raw = localStorage.getItem('fbAppState_v2');
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.mode          = saved.mode          || 'junior';
    state.lang          = 'kz';
    state.words         = saved.words         || {};
    state.understanding = saved.understanding || { got:0, hard:0, no:0 };
    state.ratings       = saved.ratings       || [];
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('fbAppState_v2', JSON.stringify({
      mode:          state.mode,
      lang:          state.lang,
      words:         state.words,
      understanding: state.understanding,
      ratings:       state.ratings,
    }));
  } catch(e) {}
}

/* ─── TRANSLATION HELPER ──────────────────────────────────────── */
function t(key) {
  return (LANG[state.lang] && LANG[state.lang][key]) || key;
}

/* ─── APPLY ALL TRANSLATIONS ──────────────────────────────────── */
function applyLang() {
  const l = state.lang;

  // Mode buttons
  q('#btnJunior').innerHTML = `<span class="mode-icon">${state.mode==='junior'?'🌈':'🌈'}</span> ${t('modeJunior')}`;
  q('#btnSenior').innerHTML = `<span class="mode-icon">📐</span> ${t('modeSenior')}`;

  // Slide 1
  q('#s1NumJ').textContent  = t('slide1Num');
  q('#s1NumS').textContent  = t('slide1Num');
  q('#s1TitleJ').textContent = t('slide1TitleJ');
  q('#s1TitleS').textContent = t('slide1TitleS');
  q('#s1SubJ').textContent  = t('slide1SubJ');
  q('#s1SubS').textContent  = t('slide1SubS');
  q('#wordInput').placeholder = t('wordPlaceholder');
  q('#wordBtnJ').textContent  = t('wordBtnJ');
  q('#wordBtnS').textContent  = t('wordBtnS');
  q('#hintJ').textContent     = t('wordHintJ');
  q('#hintS').textContent     = t('wordHintS');
  q('#clearBtnJ').textContent  = t('clearCloudJ');
  q('#clearBtnS').textContent  = t('clearCloudS');

  // Slide 2
  q('#s2NumJ').textContent  = t('slide2Num');
  q('#s2NumS').textContent  = t('slide2Num');
  q('#s2TitleJ').textContent = t('slide2TitleJ');
  q('#s2TitleS').textContent = t('slide2TitleS');
  q('#s2SubJ').textContent  = t('slide2SubJ');
  q('#s2SubS').textContent  = t('slide2SubS');
  q('#lbl-got-j').textContent  = t('gotLabel');
  q('#lbl-hard-j').textContent = t('hardLabel');
  q('#lbl-no-j').textContent   = t('noLabel');
  q('#lbl-got-s').textContent  = t('gotLabelS');
  q('#lbl-hard-s').textContent = t('hardLabel');
  q('#lbl-no-s').textContent   = t('noLabel');
  q('#resetBtnJ').textContent  = t('resetBtnJ');
  q('#resetBtnS').textContent  = t('resetBtnS');
  q('#barLblGot').textContent  = t('barGot');
  q('#barLblHard').textContent = t('barHard');
  q('#barLblNo').textContent   = t('barNo');

  // Slide 3
  q('#s3NumJ').textContent    = t('slide3Num');
  q('#s3NumS').textContent    = t('slide3Num');
  q('#s3TitleJ').textContent  = t('slide3TitleJ');
  q('#s3TitleS').textContent  = t('slide3TitleS');
  q('#s3SubJ').textContent    = t('slide3SubJ');
  q('#s3SubS').textContent    = t('slide3SubS');
  q('#studentName').placeholder = t('namePlaceholder');
  q('#saveBtnJ').textContent  = t('saveBtnJ');
  q('#saveBtnS').textContent  = t('saveBtnS');
  q('#clearRatingsJ').textContent = t('clearRatingsJ');
  q('#clearRatingsS').textContent = t('clearRatingsS');

  // Update praise if stars set
  if (state.stars > 0) {
    q('#starPraise').textContent = t('starPraise')[state.stars] || '';
  }

  // Update scale label if set
  if (state.scale > 0) {
    q('#scaleLabel').textContent = t('scaleLabels')[state.scale] || '';
  }

  // Rerender saved list (labels may change)
  renderSavedList();
}

/* ─── MODE ────────────────────────────────────────────────────── */
function setMode(mode) {
  state.mode = mode;
  document.body.classList.toggle('senior', mode === 'senior');
  q('#btnJunior').classList.toggle('active', mode === 'junior');
  q('#btnSenior').classList.toggle('active', mode === 'senior');
  applyLang();
  saveState();
}

/* ─── LANG ────────────────────────────────────────────────────── */
function setLang(lang) {
  state.lang = lang;
  q('#btnRu').classList.toggle('active', lang === 'ru');
  q('#btnKz').classList.toggle('active', lang === 'kz');
  applyLang();
  saveState();
}

/* ─── SLIDES ──────────────────────────────────────────────────── */
function goToSlide(idx) {
  const slides = qAll('.slide');
  const dots   = qAll('.dot');
  const cur    = state.currentSlide;
  if (idx === cur) return;

  slides[cur].classList.add('exit-left');
  slides[cur].classList.remove('active');
  setTimeout(() => slides[cur].classList.remove('exit-left'), 450);

  state.currentSlide = idx;
  slides[idx].classList.add('active');
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));

  q('#prevBtn').style.visibility = idx === 0                      ? 'hidden' : 'visible';
  q('#nextBtn').style.visibility = idx === state.totalSlides - 1  ? 'hidden' : 'visible';
}

function nextSlide() { if (state.currentSlide < state.totalSlides - 1) goToSlide(state.currentSlide + 1); }
function prevSlide() { if (state.currentSlide > 0)                      goToSlide(state.currentSlide - 1); }

/* ─── SLIDE 1: WORD CLOUD ──────────────────────────────────────── */
const COLORS_JUNIOR = [
  '#e74c3c','#2980b9','#27ae60','#8e44ad','#e67e22',
  '#16a085','#c0392b','#2471a3','#1e8449','#6c3483',
  '#d35400','#117a65','#922b21','#1a5276','#196f3d',
];
const COLORS_SENIOR = [
  '#1a1a2e','#e94560','#4a4a6a','#2d3436','#636e72',
  '#0984e3','#00b894','#6c5ce7','#fd79a8','#b2bec3',
];

function buildCloud() {
  const raw = q('#wordInput').value.trim();
  if (!raw) return;
  raw.split(',').map(w => w.trim()).filter(Boolean).forEach(w => {
    const key = w.toLowerCase();
    if (!(key in state.words)) state.words[key] = 0;
  });
  q('#wordInput').value = '';
  renderCloud();
  saveState();
}

function clearCloud() {
  state.words = {};
  const container = q('#wordCloud');
  container.innerHTML = '';
  container.style.height = '260px';
  q('#cloudStats').textContent = '';
  saveState();
}

/* ──────────────────────────────────────────────────────────────────
   WORD CLOUD — pixel-mask spiral placement
   Algorithm:
   1. Measure each word's bounding box using an off-screen canvas
   2. Sort words by click count (most clicked = largest = center first)
   3. For each word, walk an Archimedean spiral from center outward
   4. At each spiral step, check if the word's rect overlaps any
      already-placed rect (AABB collision + 6px gap)
   5. First free position wins → word is placed there
   6. After all placements, shift everything so the bounding box is
      centered in the container, then scale to fit if needed
   ────────────────────────────────────────────────────────────────── */
function renderCloud() {
  const container = q('#wordCloud');
  const stats     = q('#cloudStats');
  container.innerHTML = '';

  const keys = Object.keys(state.words);
  if (keys.length === 0) return;

  const palette  = state.mode === 'senior' ? COLORS_SENIOR : COLORS_JUNIOR;
  const maxCount = Math.max(...Object.values(state.words), 1);

  // Sort biggest (most clicked) first → placed at center
  const sorted = [...keys].sort((a, b) => state.words[b] - state.words[a]);

  // ── Step 1: measure word sizes via hidden DOM spans ──────────
  const CW     = container.offsetWidth  || 720;
  const GAP    = 8; // minimum px gap between any two words

  // Font size: 0 clicks → 13px, max clicks → 52px
  function fontSize(count) {
    const ratio = maxCount > 1 ? count / maxCount : (count > 0 ? 1 : 0);
    return Math.round(13 + ratio * 39);
  }

  // Render all words as hidden absolute elements to measure them
  const items = sorted.map((word, i) => {
    const count = state.words[word];
    const fs    = fontSize(count);
    const color = palette[i % palette.length];

    const el = document.createElement('button');
    el.className  = 'cloud-word';
    el.dataset.word = word;
    el.style.cssText = `
      font-size:${fs}px;
      color:#fff;
      background:${color};
      position:absolute;
      white-space:nowrap;
      visibility:hidden;
      pointer-events:none;
      left:0;top:0;
    `;
    const lbl = document.createElement('span');
    lbl.textContent = word;
    el.appendChild(lbl);
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'word-count-badge';
      badge.textContent = count;
      el.appendChild(badge);
    }
    el.addEventListener('click', () => clickWord(word, el));
    container.appendChild(el);
    return { el, word, count, fs, color };
  });

  // Force layout so offsetWidth/Height are available
  container.getBoundingClientRect();

  const measured = items.map(item => ({
    ...item,
    w: item.el.offsetWidth,
    h: item.el.offsetHeight,
  }));

  // ── Step 2: spiral placement ─────────────────────────────────
  // Placed rects stored as { x, y, w, h } (relative to virtual center 0,0)
  const placed = []; // { x,y,w,h,item }

  function overlaps(ax, ay, aw, ah) {
    for (const p of placed) {
      if (ax < p.x + p.w + GAP &&
          ax + aw + GAP > p.x &&
          ay < p.y + p.h + GAP &&
          ay + ah + GAP > p.y) return true;
    }
    return false;
  }

  measured.forEach((item, idx) => {
    const hw = item.w / 2;
    const hh = item.h / 2;

    if (idx === 0) {
      // First (biggest) word: dead center
      placed.push({ x: -hw, y: -hh, w: item.w, h: item.h, item });
      return;
    }

    // Archimedean spiral: step size shrinks for smaller words (tighter packing)
    const spiralStep = 0.15 + (1 - item.fs / 52) * 0.08;
    const radiusStep = 2.5 + item.fs * 0.06;

    let placed_pos = null;
    // Start angle varies by word index so words spread in all directions
    const startAngle = (idx * 2.399); // golden angle in radians

    for (let t = 0; t < 500; t++) {
      const angle  = startAngle + t * spiralStep;
      const radius = t * radiusStep * 0.18;
      const cx = radius * Math.cos(angle);
      const cy = radius * Math.sin(angle) * 0.55; // flatten vertically (ellipse)
      const x  = cx - hw;
      const y  = cy - hh;

      if (!overlaps(x, y, item.w, item.h)) {
        placed_pos = { x, y };
        break;
      }
    }

    if (!placed_pos) {
      // Fallback: push outward until free
      const angle = startAngle;
      for (let r = 200; r < 800; r += 12) {
        const x = r * Math.cos(angle) - hw;
        const y = r * Math.sin(angle) * 0.55 - hh;
        if (!overlaps(x, y, item.w, item.h)) { placed_pos = { x, y }; break; }
      }
      if (!placed_pos) placed_pos = { x: 0, y: 0 };
    }

    placed.push({ x: placed_pos.x, y: placed_pos.y, w: item.w, h: item.h, item });
  });

  // ── Step 3: compute bounding box ─────────────────────────────
  let minX =  Infinity, minY =  Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  placed.forEach(p => {
    if (p.x       < minX) minX = p.x;
    if (p.y       < minY) minY = p.y;
    if (p.x + p.w > maxX) maxX = p.x + p.w;
    if (p.y + p.h > maxY) maxY = p.y + p.h;
  });

  const cloudW = maxX - minX;
  const cloudH = maxY - minY;

  // Scale to fit container width (with 24px padding)
  const maxW  = CW - 24;
  const scale = cloudW > maxW ? maxW / cloudW : 1;

  const finalW = cloudW * scale;
  const finalH = cloudH * scale;

  // Center horizontally in container
  const offsetX = (CW - finalW) / 2 - minX * scale;
  const offsetY = 12 - minY * scale;

  // ── Step 4: apply positions ───────────────────────────────────
  placed.forEach(({ x, y, item }, idx) => {
    const px = x * scale + offsetX;
    const py = y * scale + offsetY;
    item.el.style.left        = px + 'px';
    item.el.style.top         = py + 'px';
    item.el.style.fontSize    = (item.fs * scale) + 'px';
    item.el.style.visibility  = 'visible';
    item.el.style.opacity     = '0';
    item.el.style.pointerEvents = 'auto';
    item.el.style.animation   = `wordPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${idx * 40}ms forwards`;
  });

  container.style.height = (finalH + 24) + 'px';

  const total = Object.values(state.words).reduce((a, b) => a + b, 0);
  stats.textContent = total > 0 ? `${t('cloudStatsPrefix')} ${total}` : '';
}

function clickWord(word, btn) {
  state.words[word] = (state.words[word] || 0) + 1;

  // Pulse animation in-place
  btn.style.transition = 'transform 0.12s ease';
  btn.style.transform  = 'scale(1.55)';
  setTimeout(() => { btn.style.transform = 'scale(1)'; }, 160);

  // Update badge
  let badge = btn.querySelector('.word-count-badge');
  if (badge) {
    badge.textContent = state.words[word];
  } else {
    badge = document.createElement('span');
    badge.className = 'word-count-badge';
    badge.textContent = state.words[word];
    btn.appendChild(badge);
  }

  if (state.mode === 'junior') burstParticles(btn);
  saveState();

  // Re-render cloud so sizes and positions update properly
  renderCloud();
}


/* ─── SLIDE 2: UNDERSTANDING ───────────────────────────────────── */
function selectUnderstanding(btn, val) {
  qAll('.emoji-card, .senior-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.myUnderstanding = val;
  state.understanding[val]++;

  if (state.mode === 'junior') {
    burstParticles(btn);
    updateJuniorCounts();
  } else {
    updateSeniorPercents();
  }
  saveState();
}

function updateJuniorCounts() {
  q('#cnt-got').textContent  = state.understanding.got;
  q('#cnt-hard').textContent = state.understanding.hard;
  q('#cnt-no').textContent   = state.understanding.no;
}

function updateSeniorPercents() {
  const { got, hard, no } = state.understanding;
  const total = got + hard + no;
  if (!total) return;

  const pct = {
    got:  Math.round(got  / total * 100),
    hard: Math.round(hard / total * 100),
    no:   Math.round(no   / total * 100),
  };

  q('#spct-got').textContent  = pct.got  + '%';
  q('#spct-hard').textContent = pct.hard + '%';
  q('#spct-no').textContent   = pct.no   + '%';

  q('#pctBarWrap').style.display = 'flex';
  q('#bar-got').style.width  = pct.got  + '%';
  q('#bar-hard').style.width = pct.hard + '%';
  q('#bar-no').style.width   = pct.no   + '%';
  q('#lbl-pct-got').textContent  = pct.got  + '%';
  q('#lbl-pct-hard').textContent = pct.hard + '%';
  q('#lbl-pct-no').textContent   = pct.no   + '%';
}

function resetUnderstanding() {
  state.understanding = { got: 0, hard: 0, no: 0 };
  state.myUnderstanding = null;
  qAll('.emoji-card, .senior-btn').forEach(b => b.classList.remove('selected'));
  q('#cnt-got').textContent  = '0';
  q('#cnt-hard').textContent = '0';
  q('#cnt-no').textContent   = '0';
  q('#spct-got').textContent  = '—';
  q('#spct-hard').textContent = '—';
  q('#spct-no').textContent   = '—';
  q('#pctBarWrap').style.display = 'none';
  saveState();
}

/* ─── SLIDE 3: RATING ──────────────────────────────────────────── */
function buildScaleRow() {
  const row = q('#scaleRow');
  row.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = 'scale-btn';
    btn.dataset.v = i;
    btn.textContent = i;
    btn.addEventListener('click', () => setScale(i));
    row.appendChild(btn);
  }
}

function setStars(n) {
  state.stars = n;
  qAll('.star-btn').forEach((b, i) => b.classList.toggle('lit', i < n));
  const praise = q('#starPraise');
  praise.textContent = t('starPraise')[n] || '';
  praise.classList.remove('show');
  requestAnimationFrame(() => praise.classList.add('show'));
}

function setScale(n) {
  state.scale = n;
  qAll('.scale-btn').forEach(b => b.classList.toggle('selected', +b.dataset.v === n));
  q('#scaleNum').textContent   = n;
  q('#scaleLabel').textContent = t('scaleLabels')[n] || '';
}

function saveRating() {
  const name  = q('#studentName').value.trim();
  const score = state.mode === 'junior' ? state.stars : state.scale;

  if (!name)    { shake(q('#studentName'));                               return; }
  if (score===0){ shake(state.mode==='junior' ? q('#starRow') : q('#scaleRow')); return; }

  const labelMap = state.mode === 'junior' ? t('starPraise') : t('scaleLabels');
  const label    = labelMap[score] || '';

  state.ratings.push({ name, score, label, mode: state.mode });
  renderSavedList();
  saveState();

  // reset
  q('#studentName').value = '';
  setStars(0);
  setScale(0);

  if (state.mode === 'junior') confettiBurst();
}

function renderSavedList() {
  const list = q('#savedList');
  list.innerHTML = '';
  [...state.ratings].reverse().slice(0, 10).forEach(r => {
    const item = document.createElement('div');
    item.className = 'saved-item';
    const scoreStr = r.mode === 'junior'
      ? '⭐'.repeat(r.score)
      : `${r.score}/10`;
    item.innerHTML = `
      <span class="saved-name">${esc(r.name)}</span>
      <span class="saved-score">${scoreStr}</span>
    `;
    list.appendChild(item);
  });
}

function clearRatings() {
  state.ratings = [];
  renderSavedList();
  saveState();
}

/* ─── FX ───────────────────────────────────────────────────────── */
const BURST_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#a29bfe','#fd79a8'];

function burstParticles(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:fixed;left:${cx}px;top:${cy}px;
      width:10px;height:10px;border-radius:50%;
      background:${BURST_COLORS[i%5]};
      pointer-events:none;z-index:9998;
      transform:translate(-50%,-50%);
    `;
    document.body.appendChild(p);
    const angle = (Math.PI * 2 / 10) * i;
    const dist  = 55 + Math.random() * 55;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;
    p.animate([
      { transform:'translate(-50%,-50%) scale(1)', opacity:1 },
      { transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0)`, opacity:0 },
    ], { duration:580, easing:'ease-out' }).onfinish = () => p.remove();
  }
}

function confettiBurst() {
  const canvas = q('#confettiCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    vx: (Math.random() - 0.5) * 7,
    vy: 3 + Math.random() * 5,
    color: BURST_COLORS[Math.floor(Math.random() * 5)],
    w: 7 + Math.random() * 8,
    h: 4 + Math.random() * 5,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 9,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.12; p.angle += p.spin;
    });
    if (++frame < 95) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

/* ─── UTILS ─────────────────────────────────────────────────────── */
function q(sel)   { return document.querySelector(sel); }
function qAll(sel){ return document.querySelectorAll(sel); }
function esc(s)   { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function shake(el) {
  el.style.animation = 'none';
  requestAnimationFrame(() => { el.style.animation = 'shakeEl 0.4s ease'; });
  setTimeout(() => { el.style.animation = ''; }, 500);
}

/* ─── FULLSCREEN ─────────────────────────────────────────────────── */
function toggleFullscreen() {
  const el  = document.documentElement;
  const btn = q('#fsIcon');
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);

  if (!isFs) {
    (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen).call(el);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen).call(document);
  }
}

function updateFsIcon() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  const icon = q('#fsIcon');
  if (!icon) return;
  icon.textContent = isFs ? '✕' : '⛶';
  q('#fullscreenBtn').title = isFs ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим';
}
document.addEventListener('fullscreenchange',       updateFsIcon);
document.addEventListener('webkitfullscreenchange', updateFsIcon);

/* ─── KEYBOARD ──────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevSlide();
  if (e.key === 'Enter' && document.activeElement?.id === 'wordInput') buildCloud();
});

/* ─── INIT ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  buildScaleRow();

  // Apply persisted mode + lang
  document.body.classList.toggle('senior', state.mode === 'senior');
  q('#btnJunior').classList.toggle('active', state.mode === 'junior');
  q('#btnSenior').classList.toggle('active', state.mode === 'senior');

  q('#prevBtn').style.visibility = 'hidden';
  q('#slide0').classList.add('active');

  applyLang();
  renderCloud();
  updateJuniorCounts();
  if (state.mode === 'senior' && Object.values(state.understanding).some(v => v > 0)) {
    updateSeniorPercents();
  }
  renderSavedList();
});
