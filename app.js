(() => {
'use strict';

/* ================= data ================= */
const ANIMALS = [
  ['🦆','Bebek'],['🐎','Kuda'],['🐢','Kura-kura'],['🐇','Kelinci'],['🐕','Anjing'],['🐈','Kucing'],
  ['🐖','Babi'],['🐄','Sapi'],['🐘','Gajah'],['🦒','Jerapah'],['🦓','Zebra'],['🐊','Buaya'],
  ['🐅','Harimau'],['🐆','Macan Tutul'],['🐪','Unta'],['🦏','Badak'],['🦛','Kuda Nil'],['🐁','Tikus'],
  ['🐿️','Tupai'],['🦔','Landak'],['🦘','Kanguru'],['🦙','Llama'],['🐐','Kambing'],['🐑','Domba'],
  ['🐃','Kerbau'],['🦌','Rusa'],['🐓','Ayam Jago'],['🦃','Kalkun'],['🦚','Merak'],['🦜','Beo'],
  ['🦢','Angsa'],['🦩','Flamingo'],['🐧','Penguin'],['🦅','Elang'],['🦉','Burung Hantu'],['🐌','Siput'],
  ['🐛','Ulat'],['🐜','Semut'],['🐝','Lebah'],['🐞','Kepik'],['🦀','Kepiting'],['🦞','Lobster'],
  ['🦐','Udang'],['🐙','Gurita'],['🦑','Cumi-cumi'],['🐠','Ikan Hias'],['🐡','Ikan Buntal'],['🦈','Hiu'],
  ['🐬','Lumba-lumba'],['🐋','Paus'],['🦭','Anjing Laut'],['🐉','Naga'],['🦖','T-Rex'],['🦕','Brontosaurus'],
  ['🦍','Gorila'],['🦧','Orangutan'],['🐒','Monyet'],['🦨','Sigung'],['🦡','Luak'],['🦫','Berang-berang'],
  ['🦦','Linsang'],['🦥','Kungkang'],['🐩','Pudel'],['🦬','Bison'],['🦣','Mamut'],['🦎','Kadal'],
  ['🐍','Ular'],['🦂','Kalajengking'],['🦗','Jangkrik'],['🦋','Kupu-kupu'],['🦤','Dodo'],['🦇','Kelelawar'],
  ['🐺','Serigala'],['🦊','Rubah'],['🐻','Beruang'],['🐼','Panda'],['🐨','Koala'],['🦁','Singa'],
  ['🐸','Katak'],['🐔','Ayam'],['🐥','Anak Ayam'],['🦄','Unicorn'],['🐂','Banteng'],['🐏','Biri-biri'],
  ['🐫','Unta Baktria'],['🐀','Tikus Got'],['🦝','Rakun'],['🐹','Hamster'],
];
const SAMPLE = ['Budi','Siti','Agus','Dewi','Rizky','Putri','Bayu','Ayu','Fajar','Intan','Dimas','Nanda'];
const TINTS = ['#ffffff','#e8eff9','#d3e4ff','#f6e7b4','#f1f3fb','#c3e6fd'];
const CROWD = ['#da251c','#cca72e','#80c6f9','#ffffff','#2392ec','#f6e7b4'];
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const UI_FONT = '"Google Sans Flex","Google Sans",system-ui,sans-serif';
const MAX_N = 200;
const STORE = 'balapanrandom:v1';

const MODES = {
  race: {
    name: 'Balapan Hewan', minDur: 5, go: 'Undi hewan', dur: 'Durasi balapan', again: 'Balapan ulang',
    lead: 'Setiap peserta mendapat satu hewan secara acak, lalu semua hewan beradu cepat di lintasan. Urutan finis sudah ditentukan secara acak sebelum balapan dimulai.',
    win: 'Peserta dengan urutan finis teratas.',
  },
  riot: {
    name: 'Riot Clash', minDur: 10, go: 'Mulai Riot Clash', dur: 'Durasi laga', again: 'Main ulang',
    lead: 'Semua peserta masuk ke satu arena yang terus menyempit. Peserta tersingkir satu per satu, dan orang terakhir yang bertahan menjadi pemenang. Urutan tersingkir sudah ditentukan secara acak sebelum laga dimulai.',
    win: 'Peserta yang paling lama bertahan di arena.',
  },
};

/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const rnd = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;   // fairness-critical draws
const vr = Math.random;                                                          // purely visual jitter
const pick = a => a[Math.floor(rnd() * a.length)];
const vpick = a => a[Math.floor(vr() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = u => u * u * (3 - 2 * u);
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cut = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
const initials = s => s.split(/\s+/).filter(Boolean).slice(0, 2).map(w => [...w][0]).join('').toUpperCase();

const S = { duration: 20, winners: 1, sound: true, mode: 'race' };
const effDur = () => Math.max(MODES[S.mode].minDur, S.duration);
let roster = [];
let usedBefore = false;

/* ================= sound ================= */
let actx;
function tone(f, d = 0.12, type = 'square', g = 0.05, when = 0) {
  if (!S.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime + when, o = actx.createOscillator(), v = actx.createGain();
    o.type = type; o.frequency.value = f;
    v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(v).connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
  } catch (e) { /* audio is optional */ }
}
/* background music: one of the tracks, picked at random each time a race or riot starts */
const TRACKS = ['audio/tread-and-torque.mp3', 'audio/steel-on-the-podium.mp3'];
const MUSIC_VOL = 0.5;
const bgm = new Audio();
bgm.loop = true; bgm.preload = 'none';
let bgmFade = 0, bgmOn = false;
function fadeMusic(to, ms, then) {
  clearInterval(bgmFade);
  const from = bgm.volume, t0 = performance.now();
  bgmFade = setInterval(() => {
    const u = Math.min(1, (performance.now() - t0) / ms);
    bgm.volume = from + (to - from) * u;
    if (u >= 1) { clearInterval(bgmFade); if (then) then(); }
  }, 40);
}
function musicStart() {
  bgmOn = true;
  if (!S.sound) return;
  clearInterval(bgmFade);
  const src = new URL(pick(TRACKS), location.href).href;
  if (bgm.src !== src) bgm.src = src;
  bgm.currentTime = 0; bgm.volume = MUSIC_VOL;
  bgm.play().catch(() => {});
}
function musicDim() { if (bgmOn && !bgm.paused) fadeMusic(MUSIC_VOL * 0.35, 1200); }
function musicStop() {
  bgmOn = false;
  if (!bgm.paused) fadeMusic(0, 700, () => bgm.pause());
}

const fanfare = () =>[523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.14, 'triangle', 0.08, i * 0.13));

/* ================= persistence ================= */
const elNames = $('#names');
function save() {
  try { localStorage.setItem(STORE, JSON.stringify({ names: elNames.value, ...S })); } catch (e) {}
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (d) {
      elNames.value = d.names || '';
      S.duration = clamp(+d.duration || 20, 5, 60);
      S.winners = clamp(+d.winners || 1, 1, 10);
      S.sound = d.sound !== false;
      if (MODES[d.mode]) { S.mode = d.mode; usedBefore = true; }
    }
  } catch (e) {}
  // shared links: #n=Budi|Siti (old) or #m=riot&n=Budi|Siti
  let linkMode = null;
  if (location.hash.length > 1) {
    const p = new URLSearchParams(location.hash.slice(1)), n = p.get('n'), m = p.get('m');
    if (n) elNames.value = n.split('|').join('\n');
    if (MODES[m]) linkMode = m;
    if (n || m) history.replaceState(null, '', location.pathname + location.search);
  }
  return linkMode;
}

/* ================= screens ================= */
const screens = { mode: $('#s-mode'), setup: $('#s-setup'), draft: $('#s-draft'), race: $('#s-race') };
function show(name) {
  stopRace(); stopRiot();
  if (name !== 'race') musicStop();
  draftToken++;
  for (const k in screens) screens[k].hidden = k !== name;
  if (name !== 'race' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (name === 'mode') document.querySelectorAll('.mode-card').forEach(c => c.classList.toggle('last', usedBefore && c.dataset.mode === S.mode));
  window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if (b) show(b.dataset.go);
});
document.querySelectorAll('.mode-card').forEach(c => c.onclick = () => {
  S.mode = c.dataset.mode; usedBefore = true;
  save(); refreshSetup(); show('setup');
  elNames.focus({ preventScroll: true });
});

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 1800);
}

/* ================= setup ================= */
const parseNames = () => elNames.value.split('\n').map(s => s.trim()).filter(Boolean);
function refreshSetup() {
  const M = MODES[S.mode], n = parseNames().length, d = effDur();
  $('#modeName').textContent = 'Metode: ' + M.name;
  $('#setupTitle').textContent = M.name;
  $('#setupLead').textContent = M.lead;
  $('#durName').textContent = M.dur;
  $('#dur').min = M.minDur; $('#dur').value = d;
  $('#durLabel').textContent = d + ' detik';
  $('#winLabel').textContent = S.winners;
  $('#winHint').textContent = M.win;
  $('#btnDraft').textContent = M.go + ' →';
  $('#count').textContent = n + ' peserta';
  $('#btnSound').textContent = S.sound ? 'Suara: aktif' : 'Suara: mati';
  $('#btnSound').setAttribute('aria-pressed', S.sound);
  const hint = $('#setupHint');
  hint.classList.toggle('err', n > MAX_N);
  hint.textContent = n > MAX_N ? `Jumlah peserta melebihi batas ${MAX_N} orang.` : `Minimal 2 peserta, maksimal ${MAX_N}.`;
}
elNames.addEventListener('input', () => { refreshSetup(); save(); });
elNames.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) goNext(); });
$('#dur').addEventListener('input', e => { S.duration = +e.target.value; refreshSetup(); save(); });
$('#winMinus').onclick = () => { S.winners = clamp(S.winners - 1, 1, 10); refreshSetup(); save(); };
$('#winPlus').onclick = () => { S.winners = clamp(S.winners + 1, 1, 10); refreshSetup(); save(); };
$('#btnSound').onclick = () => {
  S.sound = !S.sound; refreshSetup(); save();
  if (S.sound) { tone(660, 0.1); if (bgmOn) { bgm.volume = MUSIC_VOL; if (!bgm.src) bgm.src = new URL(pick(TRACKS), location.href).href; bgm.play().catch(() => {}); } }
  else { clearInterval(bgmFade); bgm.pause(); }
};
$('#btnSample').onclick = () => { elNames.value = SAMPLE.join('\n'); refreshSetup(); save(); };
$('#btnMix').onclick = () => { elNames.value = shuffle(parseNames()).join('\n'); refreshSetup(); save(); };
$('#btnClear').onclick = () => { elNames.value = ''; refreshSetup(); save(); elNames.focus(); };
$('#btnShare').onclick = async () => {
  const names = parseNames();
  if (!names.length) return toast('Isi daftar peserta terlebih dahulu.');
  const url = location.origin + location.pathname + '#m=' + S.mode + '&n=' + encodeURIComponent(names.join('|'));
  try { await navigator.clipboard.writeText(url); toast('Tautan disalin.'); }
  catch (e) { prompt('Salin tautan ini:', url); }
};
$('#btnDraft').onclick = goNext;

function goNext() {
  const n = parseNames().length;
  const hint = $('#setupHint');
  if (n < 2 || n > MAX_N) {
    hint.textContent = n < 2 ? 'Diperlukan minimal 2 peserta.' : `Jumlah peserta melebihi batas ${MAX_N} orang.`;
    hint.classList.add('err'); elNames.focus();
    return;
  }
  if (S.mode === 'riot') startRiot(); else runDraft();
}

/* ================= draft (animal lottery) ================= */
let draftToken = 0;
function buildRoster() {
  let pool = [];
  roster = parseNames().map((name, i) => {
    if (!pool.length) pool = shuffle(ANIMALS);
    const [emoji, animal] = pool.pop();
    return { idx: i, name, emoji, animal, tint: TINTS[i % TINTS.length] };
  });
}
function runDraft() {
  buildRoster();
  show('draft');
  const token = draftToken;
  const grid = $('#grid'), n = roster.length;
  grid.classList.toggle('dense', n > 40);
  grid.innerHTML = '';
  const cards = roster.map(p => {
    const el = document.createElement('div'); el.className = 'card';
    el.innerHTML = '<div class="em">❔</div><div class="nm"></div><div class="an">…</div>';
    el.querySelector('.nm').textContent = p.name;
    el.style.setProperty('--c', p.tint);
    grid.appendChild(el);
    return { el, em: el.firstChild, an: el.lastChild, p, last: 0, done: false };
  });
  $('#draftTitle').textContent = 'Mengundi hewan…';
  $('#btnRace').disabled = true;
  const stagger = Math.min(240, 3200 / n), t0 = performance.now();
  let lastTick = 0;
  (function tick(now) {
    if (token !== draftToken) return;
    let all = true;
    cards.forEach((c, i) => {
      if (c.done) return;
      if (now - t0 >= 800 + i * stagger) {
        c.done = true; c.em.textContent = c.p.emoji; c.an.textContent = c.p.animal;
        c.el.classList.add('locked');
        if (now - lastTick > 45) { tone(500 + (i % 8) * 60, 0.06, 'triangle', 0.04); lastTick = now; }
      } else {
        all = false;
        if (now - c.last > 75) { c.last = now; c.em.textContent = pick(ANIMALS)[0]; }
      }
    });
    if (!all) return requestAnimationFrame(tick);
    $('#draftTitle').textContent = `${n} peserta siap di garis start.`;
    $('#btnRace').disabled = false; $('#btnRace').focus();
  })(t0);
}
$('#btnRedraft').onclick = runDraft;
$('#btnRace').onclick = () => startRace();

/* ================= shared stage ================= */
const cv = $('#track'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
let R = null;                       // current race
let Q = null;                       // current riot
const G = {};                       // race geometry
const A = { scale: 1, s: 1, cx: 0, cy: 0, fh: 100, cr: 22 };   // riot geometry
const sprites = new Map();

function sprite(emoji, size, flip = true) {
  const key = emoji + '|' + size + '|' + DPR + '|' + flip;
  let c = sprites.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  const s = Math.ceil(size * 1.5 * DPR);
  c.width = c.height = s;
  const x = c.getContext('2d');
  if (flip) { x.translate(s, 0); x.scale(-1, 1); }   // emoji face left; flip so they run right
  x.font = `${size * DPR}px ${EMOJI_FONT}`;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(emoji, s / 2, s / 2 + size * DPR * 0.06);
  sprites.set(key, c);
  return c;
}

function sizeCanvas() {
  const r = cv.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = r.width; H = r.height;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return true;
}
function resize() {
  if (!sizeCanvas()) return;
  G.trackTop = H * 0.42; G.trackBot = H * 0.95;
  G.standTop = G.trackTop - Math.max(46, H * 0.13);
  if (R) layoutRace();
  if (Q) riotLayout();
}
new ResizeObserver(() => {
  resize();
  if (R && R.phase !== 'run') draw(performance.now() / 1000);
  if (Q && Q.phase !== 'run') riotDraw(performance.now() / 1000);
}).observe(cv);

function setStage(mode) {
  $('#stage').dataset.stage = mode;
  $('#alive').hidden = mode !== 'riot';
  const b = $('#board'); b.classList.toggle('feed', mode === 'riot'); b.innerHTML = '';
  $('#result').hidden = true;
  $('#comm').textContent = ''; $('#prog').style.width = '0';
  $('#btnAgain').textContent = MODES[mode].again;
  $('#btnReshuffle').hidden = mode === 'riot';
  $('#fullTitle').textContent = mode === 'riot' ? 'Urutan bertahan lengkap' : 'Klasemen lengkap';
}

function countdown(st, go) {
  const cd = $('#countdown');
  ['3', '2', '1', 'Mulai'].forEach((txt, i) => {
    st.timers.push(setTimeout(() => {
      cd.hidden = false; cd.textContent = txt; cd.classList.toggle('word', i === 3);
      cd.classList.remove('tick'); void cd.offsetWidth; cd.classList.add('tick');
      if (i < 3) tone(440, 0.15, 'square', 0.06);
      else { tone(880, 0.5, 'square', 0.07); go(); }
    }, 400 + i * 800));
  });
  st.timers.push(setTimeout(() => cd.hidden = true, 400 + 4 * 800));
}

function say(text) {
  const c = $('#comm'); c.textContent = text;
  c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
  const st = R || Q; if (st) st.lastSay = st.t;
}

/* ================= race ================= */
function layoutRace() {
  const n = R.racers.length, th = G.trackBot - G.trackTop;
  G.laneH = th / n;
  G.size = Math.round(clamp(G.laneH * 1.3, W < 600 ? 24 : 30, Math.min(76, th * 0.42)));
  G.showAll = G.laneH >= 21;
  G.fs = clamp(Math.round(G.laneH * 0.42), 11, 15);
  ctx.font = `700 ${G.fs}px ${UI_FONT}`;
  for (const r of R.racers) {
    r.label = cut(r.name, 16);
    r.lw = ctx.measureText(r.label).width;
    r.y = G.trackTop + (r.lane + 0.5) * G.laneH + Math.min(G.laneH * 0.25, 10);
  }
  R.camMin = -W * 0.14; R.camMax = R.L - W * 0.78;
  R.cam = clamp(R.cam, R.camMin, R.camMax);
}

function makeCurve() {
  // monotone random progress curve 0..1 so the pack keeps swapping places
  const N = 240, comps = [0, 1, 2].map(() => ({ a: 0.07 + rnd() * 0.14, f: 0.6 + rnd() * 2.8, p: rnd() * 6.283 }));
  const t = new Float32Array(N + 1); let acc = 0;
  for (let i = 1; i <= N; i++) {
    const u = (i - 0.5) / N; let v = 1;
    for (const c of comps) v += c.a * Math.sin(6.283 * c.f * u + c.p);
    v = Math.max(0.25, v) * Math.min(1, 0.2 + u / 0.04);
    acc += v; t[i] = acc;
  }
  for (let i = 1; i <= N; i++) t[i] /= acc;
  return t;
}
function posAt(r, t) {
  if (t >= r.T) return R.L + 150 * (1 - Math.exp(-(t - r.T) * 1.6));
  const f = clamp(t / r.T, 0, 1) * 240, i = Math.floor(f);
  return R.L * (r.curve[i] + (r.curve[Math.min(240, i + 1)] - r.curve[i]) * (f - i));
}

function stopRace() {
  if (!R) return;
  cancelAnimationFrame(R.raf); R.timers.forEach(clearTimeout);
  R = null;
  $('#countdown').hidden = true;
}

function startRace(opts = {}) {
  show('race');
  setStage('race');
  const D = effDur(), tail = Math.min(D * 0.1, 3);
  // The whole result is decided here: every racer draws an independent uniform number.
  const draw_ = roster.map(() => rnd()), mn = Math.min(...draw_);
  R = {
    phase: 'count', t: 0, last: performance.now(), raf: 0, timers: [], cam: 0, L: 0,
    leader: null, lastSay: 0, lastFlavor: 0, lastBoard: 0, half: false, final: false, won: false,
    racers: roster.map((p, i) => ({ ...p, lane: i, T: D + (draw_[i] - mn) * tail, curve: makeCurve(), ph: rnd() * 6, x: 0, rank: i })),
  };
  R.minT = D; R.maxT = Math.max(...R.racers.map(r => r.T));
  R.order = R.racers.slice();
  resize();
  R.L = Math.max(W * 3, D * 270);
  layoutRace(); R.cam = R.camMin;
  updateBoard();
  R.raf = requestAnimationFrame(frame);

  musicStart();
  if (opts.instant) { R.phase = 'run'; if (opts.at) { R.t = opts.at(R); update(0); if (R) R.cam = clamp(R.order[0].x - W * 0.7, R.camMin, R.camMax); } return; }
  countdown(R, () => { R.phase = 'run'; say('Balapan dimulai.'); });
}

function updateBoard() {
  $('#board').innerHTML = R.order.slice(0, 5).map((r, i) =>
    `<li><span class="rk">${i + 1}</span><span>${r.emoji}</span><span class="nm">${esc(r.name)}</span></li>`).join('');
}

function frame(now) {
  if (!R) return;
  const dt = Math.min(0.05, (now - R.last) / 1000); R.last = now;
  if (R.phase === 'run') {
    const toWin = R.minT - R.t;
    R.t += dt * (toWin < 0.8 && toWin > -0.35 ? 0.38 : 1);   // slow-mo photo finish
    update(dt);
    if (!R) return;
  } else {
    for (const r of R.racers) r.ph += dt * 5;
  }
  draw(now / 1000);
  R.raf = requestAnimationFrame(frame);
}

function update(dt) {
  const t = R.t;
  for (const r of R.racers) { const x = posAt(r, t); r.ph += (x - r.x) * 0.05; r.x = x; }
  R.order.sort((a, b) => b.x - a.x);
  R.order.forEach((r, i) => r.rank = i);
  const lead = R.order[0], prog = clamp(lead.x / R.L, 0, 1);
  R.cam += (clamp(lead.x - W * 0.7, R.camMin, R.camMax) - R.cam) * Math.min(1, dt * 4);

  $('#prog').style.width = (prog * 100).toFixed(1) + '%';
  $('#clock').textContent = Math.min(t, R.maxT).toFixed(1) + ' dtk';
  if (t - R.lastBoard > 0.2) { R.lastBoard = t; updateBoard(); }

  // commentary
  if (!R.won) {
    if (R.leader !== lead) {
      if (R.leader && t > 1.5 && t - R.lastSay > 1.3) { say(`${lead.name} (${lead.animal}) mengambil alih posisi terdepan.`); tone(700, 0.07, 'triangle', 0.035); }
      R.leader = lead;
    }
    if (!R.half && prog > 0.5) { R.half = true; say(`Setengah lintasan: ${lead.name} memimpin.`); }
    else if (!R.final && prog > 0.85) { R.final = true; say('Memasuki lintasan terakhir. Posisi masih bisa berubah.'); }
    else if (t - R.lastSay > 3.2 && t - R.lastFlavor > 3.2 && prog < 0.82) {
      R.lastFlavor = t;
      const n = R.order.length, mid = R.order[Math.floor(rnd() * Math.min(n, 6))], last = R.order[n - 1];
      say(pick([
        `${mid.name} (${mid.animal}) menambah kecepatan.`,
        `${mid.name} bertahan di posisi ${mid.rank + 1}.`,
        `${last.name} (${last.animal}) masih tertinggal di belakang.`,
        `${last.name} belum tersingkir dari perebutan juara.`,
        `${R.order[Math.min(1, n - 1)].name} menempel ketat di posisi kedua.`,
      ]));
    }
  }
  if (!R.won && t >= R.minT) {
    R.won = true;
    const w = R.racers.reduce((a, b) => a.T < b.T ? a : b);
    say(`${w.name} (${w.animal}) mencapai garis finis pertama.`);
    fanfare(); confetti();
  }
  if (t >= R.maxT + 1.4) finish();
}

/* ---------- race drawing ---------- */
function hills(par, base, amp, k, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, G.trackTop);
  for (let x = 0; x <= W + 16; x += 16) {
    const wx = (x + R.cam * par) * k;
    ctx.lineTo(x, base - amp * (0.6 + 0.5 * Math.sin(wx) + 0.3 * Math.sin(wx * 2.3 + 1)));
  }
  ctx.lineTo(W, G.trackTop); ctx.fill();
}
function banner(wx, text, color) {
  const x = wx - R.cam;
  if (x < -120 || x > W + 120) return;
  const top = G.standTop - 30;
  ctx.fillStyle = '#104378';
  ctx.fillRect(x - 3, top, 6, G.trackTop - top);
  ctx.fillStyle = color; ctx.strokeStyle = '#104378'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x - 52, top - 4, 104, 28, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#104378'; ctx.font = `800 15px ${UI_FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, top + 11);
}

function draw(time) {
  const cam = R.cam, { trackTop, trackBot, standTop, size } = G;
  const excite = R.phase === 'run' ? (R.final ? 2.2 : 1) : 0.5;

  // sky
  let g = ctx.createLinearGradient(0, 0, 0, trackTop);
  g.addColorStop(0, '#80c6f9'); g.addColorStop(1, '#e8eff9');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, trackTop);
  ctx.fillStyle = '#e3bd45'; ctx.beginPath(); ctx.arc(W * 0.8 - cam * 0.01, H * 0.13, Math.min(46, H * 0.08), 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (let i = 0; i < 6; i++) {
    const span = W + 320, cx = ((i * 337 - cam * 0.06 - time * 5) % span + span) % span - 160, cy = H * (0.05 + (i * 37 % 17) / 100);
    ctx.beginPath(); ctx.ellipse(cx, cy, 46, 13, 0, 0, 6.283); ctx.ellipse(cx + 28, cy - 9, 30, 13, 0, 0, 6.283); ctx.fill();
  }
  hills(0.12, standTop + 4, H * 0.1, 0.0045, '#A5D9A0');
  hills(0.3, standTop + 14, H * 0.06, 0.008, '#6BBF7F');

  // grandstand + crowd
  ctx.fillStyle = '#104378'; ctx.fillRect(0, standTop, W, trackTop - standTop);
  const sp = 15, rows = Math.max(2, Math.floor((trackTop - standTop - 8) / 13));
  for (let k = Math.floor(cam / sp) - 1, end = k + W / sp + 3; k < end; k++) {
    for (let r = 0; r < rows; r++) {
      const h = (Math.imul(k, 73856093) ^ Math.imul(r + 1, 19349663)) >>> 0;
      const jump = Math.abs(Math.sin(time * (3 + h % 5) + h)) * 2.6 * excite;
      ctx.fillStyle = CROWD[h % 6];
      ctx.beginPath(); ctx.arc(k * sp - cam + (r % 2) * 7, standTop + 11 + r * 13 - jump, 5, 0, 6.283); ctx.fill();
    }
  }
  // fence
  ctx.fillStyle = '#fff'; ctx.fillRect(0, trackTop - 5, W, 5);
  ctx.fillStyle = '#104378'; ctx.fillRect(0, trackTop, W, 2);

  // track
  ctx.fillStyle = '#D9905C'; ctx.fillRect(0, trackTop, W, trackBot - trackTop);
  const n = R.racers.length;
  if (G.laneH >= 12) {
    ctx.fillStyle = 'rgba(80,35,0,.07)';
    for (let i = 1; i < n; i += 2) ctx.fillRect(0, trackTop + i * G.laneH, W, G.laneH);
  }
  ctx.font = `700 12px ${UI_FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  for (let k = 1; k < 10; k++) {
    const x = R.L * k / 10 - cam;
    if (x < -40 || x > W + 40) continue;
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, trackTop + 2, 3, trackBot - trackTop - 2);
    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(k * 10 + '%', x + 7, trackTop + 5);
  }
  // start + finish lines
  let x = -cam + size * 0.6;
  if (x > -10 && x < W) { ctx.fillStyle = '#fff'; ctx.fillRect(x, trackTop + 2, 6, trackBot - trackTop - 2); }
  x = R.L - cam;
  if (x > -50 && x < W + 10) {
    const q = 11;
    for (let yy = trackTop + 2, r = 0; yy < trackBot; yy += q, r++)
      for (let c = 0; c < 3; c++) { ctx.fillStyle = (r + c) % 2 ? '#fff' : '#104378'; ctx.fillRect(x + c * q, yy, q, Math.min(q, trackBot - yy)); }
  }
  banner(size * 0.6, 'START', '#fff');
  banner(R.L + 16, 'FINIS', '#e3bd45');

  // grass
  ctx.fillStyle = '#58B368'; ctx.fillRect(0, trackBot, W, H - trackBot);
  ctx.fillStyle = '#104378'; ctx.fillRect(0, trackBot, W, 2);
  ctx.fillStyle = '#3F9A55';
  for (let k = Math.floor(cam * 1.25 / 70) - 1, end = k + W / 70 + 3; k < end; k++) ctx.fillRect(k * 70 - cam * 1.25, trackBot + (H - trackBot) * 0.45, 22, 3);

  // racers (back lanes first)
  const running = R.phase === 'run';
  for (const r of R.racers) {
    const sx = r.x - cam;
    if (sx < -size * 2 || sx > W + size) continue;
    const moving = running && R.t < r.T + 1;
    const bob = Math.abs(Math.sin(r.ph)) * size * (moving ? 0.16 : 0.05);
    ctx.fillStyle = 'rgba(60,25,0,.22)';
    ctx.beginPath(); ctx.ellipse(sx, r.y + size * 0.1, size * 0.34, size * 0.09, 0, 0, 6.283); ctx.fill();
    if (moving) {
      ctx.fillStyle = 'rgba(255,240,220,.55)';
      for (let k = 0; k < 3; k++) {
        const a = (r.ph * 0.35 + k / 3) % 1;
        ctx.beginPath(); ctx.arc(sx - size * (0.45 + a * 0.7), r.y + size * 0.05 - a * size * 0.25, size * 0.1 * (1 - a) + 1, 0, 6.283); ctx.fill();
      }
    }
    const sp_ = sprite(r.emoji, size), s = size * 1.5;
    ctx.save();
    ctx.translate(sx, r.y - size * 0.36 - bob);
    ctx.rotate(Math.sin(r.ph) * (moving ? 0.09 : 0.03));
    ctx.drawImage(sp_, -s / 2, -s / 2, s, s);
    ctx.restore();
  }
  // labels on top
  ctx.textBaseline = 'middle';
  const lab = r => {
    const sx = r.x - cam;
    if (sx < -size || sx > W + size + r.lw) return;
    const lead = r.rank === 0, fs = G.showAll ? G.fs : 13;
    ctx.font = `700 ${fs}px ${UI_FONT}`;
    const text = G.showAll ? r.label : `${r.rank + 1}. ${r.label}`;
    const tw = G.showAll ? r.lw : ctx.measureText(text).width, hh = fs + 7, ww = tw + 14;
    let px, py;
    if (G.showAll) { px = sx - size * 0.62 - ww; py = r.y - size * 0.3 - hh / 2; }
    else { px = sx - ww / 2; py = r.y - size * 1.0 - hh - r.rank * 2; }
    px = Math.max(4, px);
    ctx.fillStyle = lead ? '#e3bd45' : 'rgba(16,67,120,.9)';
    ctx.beginPath(); ctx.roundRect(px, py, ww, hh, 4); ctx.fill();
    if (lead) { ctx.strokeStyle = '#104378'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = lead ? '#4f3d00' : '#fff'; ctx.textAlign = 'left';
    ctx.fillText(text, px + 7, py + hh / 2 + 1);
  };
  if (G.showAll) R.racers.forEach(lab);
  else for (let i = Math.min(2, R.order.length - 1); i >= 0; i--) lab(R.order[i]);
}

/* ================= race result ================= */
let lastOrder = [];
const winnersOf = n => Math.min(S.winners, n - 1 || 1);
function finish() {
  const order = R.racers.slice().sort((a, b) => a.T - b.T);
  lastOrder = order;
  cancelAnimationFrame(R.raf); R.phase = 'done';
  draw(performance.now() / 1000);
  const K = winnersOf(order.length), w = order[0];
  $('#resEyebrow').textContent = K > 1 ? `${K} pemenang · juara pertama` : 'Juara balapan';
  $('#champEm').textContent = w.emoji;
  $('#champName').textContent = w.name;
  $('#champSub').textContent = `${w.animal} · ${w.T.toFixed(2)} detik`;
  const pod = order.length >= 3 ? [order[1], order[0], order[2]] : [];
  $('#podium').innerHTML = pod.map(r => {
    const k = order.indexOf(r) + 1;
    return `<div class="pod p${k}"><div class="em">${r.emoji}</div><div class="nm">${esc(r.name)}</div><div class="blk">${k}</div></div>`;
  }).join('');
  $('#fullList').innerHTML = order.map((r, i) =>
    `<li class="${i < K ? 'win' : ''}"><span class="rk">${i + 1}</span><span>${r.emoji}</span><span class="nm">${esc(r.name)} <small>${r.animal}</small></span><span class="tm">${i ? '+' + (r.T - w.T).toFixed(2) : r.T.toFixed(2)} dtk</span></li>`).join('');
  showResult(K, order.length);
}
function showResult(K, n) {
  $('#btnDrop').textContent = K > 1 ? `Singkirkan ${K} pemenang` : 'Singkirkan pemenang';
  $('#btnDrop').hidden = n - K < 2;
  $('#result').hidden = false; $('#result').scrollTop = 0;
  $('#btnAgain').focus();
  confetti(); musicDim();
}

/* ================= riot clash ================= */
const SHIRTS = ['#005ea3','#da251c','#cca72e','#2e7d32','#6a1b9a','#ef6c00','#00838f','#ad1457','#37474f','#1277c9','#8d6e63','#558b2f','#c62828','#4527a0','#f9a825','#00695c','#5d4037','#0277bd'];
const SKINS = ['#f5d3b8','#f1c7a5','#e0ac80','#c68a5e','#a86b43','#8a5532'];
const HAIRS = ['#1c1a19','#2d2420','#3b2a20','#5a3b24','#7a4e2a','#0f0f12'];
const PANTS = ['#26323f','#33475b','#3e2f28','#1f2a44','#4a4a4a','#2f3e2c'];
const OBJECTS = [['🪑','kursi'],['🥿','sandal'],['🍅','tomat'],['🧹','sapu'],['🪣','ember'],['🥖','roti'],['🧻','gulungan tisu'],['🥔','kentang']];
const BONKS = ['BUK!','PLAK!','DUAK!','BONK!','GEDEBUK!'];
const RW = 1000, SQ = 0.56;          // arena radius in world units, vertical squash of the 3/4 view
const sfx = (...a) => { if (!Q || !Q.silent) tone(...a); };

function stopRiot() {
  if (!Q) return;
  cancelAnimationFrame(Q.raf); Q.timers.forEach(clearTimeout);
  Q = null;
  $('#countdown').hidden = true;
}

function startRiot(opts = {}) {
  roster = parseNames().map((name, idx) => ({ idx, name }));
  show('race');
  setStage('riot');
  const n = roster.length, D = effDur(), shirts = shuffle(SHIRTS);
  const fs = roster.map((p, i) => {
    const a = vr() * 6.283, r = RW * 0.82 * Math.sqrt(vr());
    return {
      ...p, shirt: shirts[i % shirts.length], skin: pick(SKINS), hair: pick(HAIRS), pants: pick(PANTS),
      x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0, tx: 0, ty: 0, retarget: 0, speed: 150 + vr() * 90,
      face: vr() < 0.5 ? -1 : 1, ph: vr() * 6.283, moving: false, punch: 0, cool: 1 + vr() * 2,
      te: Infinity, foe: null, evKind: null, ko: null, alpha: 1, gone: false, kos: 0, tagUntil: 0, cheer: false,
    };
  });

  // The whole result is decided here: a cryptographic shuffle fixes the elimination order.
  // order[0] falls first, the last element is the winner. The animation only acts it out.
  const order = shuffle(fs);
  const m = n - 2, t0 = 1.2, tEnd = D - 3.5, times = [];
  for (let k = 0; k < m; k++) {
    const u = (k + 1) / (m + 1), gap = (tEnd - t0) / (m + 1);
    times.push(clamp(t0 + (tEnd - t0) * Math.pow(u, 1.35) + (vr() - 0.5) * gap * 0.8, t0, tEnd));
  }
  times.sort((a, b) => a - b);
  times.push(D);                                   // the final duel always lands at the full duration
  const ev = order.slice(0, n - 1).map((v, k) => { v.te = times[k]; return { te: times[k], v, a: null, kind: null, obj: null, flight: 0, p: null }; });

  Q = {
    phase: 'count', t: 0, D, last: performance.now(), raf: 0, timers: [], fs, ev, ei: 0,
    alive: n, live: fs.slice(), elim: [], feed: [], proj: [], junk: [], fx: [],
    shake: 0, shk: { x: 0, y: 0 }, cam: { x: 0, y: 0, z: 1 }, Rc: RW, duel: n === 2, winner: null, endAt: 0,
    nextJunk: 1.6, lastSay: 0, said: {}, silent: false, lastHitSfx: -1, crowd: [],
  };
  // spectators sit in tiers around the platform
  for (let row = 0; row < 5; row++) {
    const r = RW * (1.13 + row * 0.075), seats = Math.round(64 + row * 5);
    for (let i = 0; i < seats; i++) Q.crowd.push({ a: (i + (row % 2) * 0.5) / seats * 6.283, r, c: CROWD[(i * 7 + row * 3) % 6], h: vr() * 100 });
  }
  Q.crowd.sort((p, q) => Math.sin(p.a) * p.r - Math.sin(q.a) * q.r);   // back rows first
  A.fh = clamp(560 / Math.sqrt(n), 40, 130); A.cr = A.fh * 0.22;
  sizeCanvas(); riotLayout();
  $('#alive').textContent = `Tersisa ${n}/${n}`;
  $('#clock').textContent = '0.0 dtk';
  Q.raf = requestAnimationFrame(riotFrame);
  musicStart();

  if (opts.instant) {
    Q.phase = 'run'; Q.silent = true;
    while (Q && Q.phase === 'run' && Q.t < opts.at(Q)) riotStep(1 / 30);
    if (Q && Q.phase !== 'done') {
      Q.silent = false; renderFeed();
      $('#alive').textContent = `Tersisa ${Q.alive}/${n}`;
      for (let i = 0; i < 80; i++) riotCamera(0.05);
      Q.shake = 0; riotCamera(0.05);
    }
    return;
  }
  countdown(Q, () => { Q.phase = 'run'; say(`Laga dimulai: ${n} peserta di dalam arena.`); });
}

function riotLayout() {
  A.scale = Math.min(W * 0.46 / RW, H * 0.41 / (RW * SQ));
  A.cx = W / 2; A.cy = H * 0.55;
}
function P(x, y, z = 0) {
  return [A.cx + (x - Q.cam.x) * A.s + Q.shk.x, A.cy + (y - Q.cam.y) * A.s * SQ - z * A.s + Q.shk.y];
}

function riotFrame(now) {
  if (!Q) return;
  const rdt = Math.min(0.05, (now - Q.last) / 1000); Q.last = now;
  if (Q.phase === 'run') {
    riotStep(rdt * timeScale());
    if (!Q || Q.phase === 'done') return;
  } else {
    for (const f of Q.fs) f.ph += rdt * 0.6;
  }
  riotCamera(rdt);
  riotDraw(now / 1000);
  Q.raf = requestAnimationFrame(riotFrame);
}
function timeScale() {
  const fin = Q.ev[Q.ev.length - 1];
  return Q.duel && Q.t > fin.te - 1.0 && Q.t < fin.te + 0.3 ? 0.3 : 1;   // slow-mo final blow
}

function riotStep(dt) {
  Q.t += dt;
  riotUpdate(dt);
  if (Q.phase === 'done') return;
  const t = Q.t;
  Q.fx = Q.fx.filter(e => t - e.t < e.life);
  Q.junk = Q.junk.filter(j => t - j.t < 1.8);
  if (!Q.silent) {
    $('#prog').style.width = (clamp(t / Q.D, 0, 1) * 100).toFixed(1) + '%';
    $('#clock').textContent = Math.min(t, Q.D).toFixed(1) + ' dtk';
  }
  if (Q.endAt && t >= Q.endAt) finishRiot();
}

function riotUpdate(dt) {
  const t = Q.t, cr = A.cr, live = Q.live;
  Q.Rc = RW * (1 - 0.5 * smooth(clamp((t - 1) / (Q.D - 2.5), 0, 1)));

  // scheduled eliminations: pick an attacker 0.8 s ahead, launch the throw, land the blow on time
  for (let i = Q.ei; i < Q.ev.length; i++) {
    const e = Q.ev[i];
    if (e.te - t > 0.8) break;
    if (!e.a) prepare(e);
    if (e.kind === 'throw' && !e.p && t >= e.te - e.flight) launch(e);
    if (t >= e.te) { hit(e); Q.ei = i + 1; }
  }

  // stray throws that miss: pure chaos, never decides anything
  if (Q.alive > 2 && t >= Q.nextJunk) {
    Q.nextJunk = t + (0.2 + vr() * 0.6) * (Q.alive > 15 ? 0.6 : 1.3);
    const a = vpick(live), b = vpick(live);
    if (a !== b && !a.foe) {
      const ang = vr() * 6.283, off = cr * (2.5 + vr() * 3);
      const tx = b.x + Math.cos(ang) * off, ty = b.y + Math.sin(ang) * off, d = Math.hypot(tx - a.x, ty - a.y);
      a.punch = 1; a.face = tx >= a.x ? 1 : -1;
      Q.proj.push({ e: null, obj: vpick(OBJECTS)[0], x0: a.x, y0: a.y, tx, ty, t0: t, t1: t + clamp(d / 1300, 0.35, 0.8), spin: (vr() - 0.5) * 22 });
      sfx(700 + vr() * 300, 0.06, 'triangle', 0.018);
    }
  }
  Q.proj = Q.proj.filter(p => {
    if (t < p.t1) return true;
    if (!p.e) {
      Q.junk.push({ obj: p.obj, x: p.tx, y: p.ty, t, rot: p.spin * (p.t1 - p.t0) });
      Q.fx.push({ k: 'dust', x: p.tx, y: p.ty, t, life: 0.45, r: cr * 1.2 });
    }
    return false;
  });

  // steering
  const pair = Q.duel && live.length === 2 ? live : null;
  for (const f of live) {
    let gx, gy, sp = f.speed, hold = false;
    const foe = f.foe && !f.foe.ko ? f.foe : null;
    if (f.cheer) { gx = f.x; gy = f.y; hold = true; }
    else if (foe) {
      gx = foe.x; gy = foe.y; f.face = foe.x >= f.x ? 1 : -1;
      if (f.evKind === 'throw') hold = true; else sp *= 1.8;
    } else if (pair) {
      const o = pair[0] === f ? pair[1] : pair[0], mx = (f.x + o.x) / 2, my = (f.y + o.y) / 2;
      f.face = o.x >= f.x ? 1 : -1;
      if (t % 1.4 < 0.35) { gx = o.x; gy = o.y; sp *= 1.6; }
      else { const ang = Math.atan2(f.y - my, f.x - mx) + 0.9; gx = mx + Math.cos(ang) * cr * 5; gy = my + Math.sin(ang) * cr * 5; }
    } else {
      if (t >= f.retarget || Math.hypot(f.tx - f.x, f.ty - f.y) < cr * 2) {
        f.retarget = t + 0.8 + vr() * 1.8;
        if (vr() < 0.5 && live.length > 1) { const o = vpick(live); f.tx = o.x + (vr() - 0.5) * cr * 3; f.ty = o.y + (vr() - 0.5) * cr * 3; }
        else { const a = vr() * 6.283, r = (Q.Rc - cr) * 0.9 * Math.sqrt(vr()); f.tx = Math.cos(a) * r; f.ty = Math.sin(a) * r; }
      }
      gx = f.tx; gy = f.ty;
    }
    const dx = gx - f.x, dy = gy - f.y, d = Math.hypot(dx, dy) || 1;
    let dvx = hold ? 0 : dx / d * sp, dvy = hold ? 0 : dy / d * sp;
    if (!hold && !foe && d < cr * 2) { dvx *= d / (cr * 2); dvy *= d / (cr * 2); }
    const k = Math.min(1, dt * 4);
    f.vx += (dvx - f.vx) * k; f.vy += (dvy - f.vy) * k;
  }

  // crowding: keep bodies apart, and bodies that bump start harmless scuffles
  const m = live.length, min = cr * 2;
  for (let i = 0; i < m; i++) {
    const f = live[i];
    for (let j = i + 1; j < m; j++) {
      const g = live[j];
      let dx = g.x - f.x, dy = g.y - f.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min) continue;
      if (d2 < 1e-6) { dx = vr() - 0.5; dy = vr() - 0.5; }
      const d = Math.hypot(dx, dy), push = (min - Math.sqrt(d2)) / 2 / d;
      f.x -= dx * push; f.y -= dy * push; g.x += dx * push; g.y += dy * push;
      if (t > f.cool && t > g.cool && vr() < (pair ? 0.6 : 0.05)) scuffle(f, g);
    }
  }

  // integrate, keep inside the shrinking wall
  for (const f of live) {
    f.x += f.vx * dt; f.y += f.vy * dt;
    const r = Math.hypot(f.x, f.y), lim = Q.Rc - cr;
    if (r > lim) {
      const nx = f.x / r, ny = f.y / r, vn = f.vx * nx + f.vy * ny;
      f.x = nx * lim; f.y = ny * lim;
      if (vn > 0) { f.vx -= vn * nx; f.vy -= vn * ny; }
    }
    const sp = Math.hypot(f.vx, f.vy);
    f.ph += sp * dt * 0.055; f.moving = sp > 25;
    if (!f.foe && !pair && Math.abs(f.vx) > 20) f.face = f.vx > 0 ? 1 : -1;
    f.punch = Math.max(0, f.punch - dt * 2.5);
  }
  if (Q.winner) Q.winner.punch = 0;
  for (const f of Q.fs) if (f.ko && !f.gone) koStep(f, dt);

  // commentary
  if (Q.phase === 'run' && !Q.winner) {
    if (!Q.said.shrink && t > Q.D * 0.2 && Q.alive > 2) { Q.said.shrink = 1; say('Arena mulai menyempit.'); }
    else if (t - Q.lastSay > 4 && Q.alive > 2) {
      const top = live.reduce((a, b) => b.kos > a.kos ? b : a, live[0]);
      say(top.kos >= 2 ? `${top.name} sudah menjatuhkan ${top.kos} lawan.` : `Masih ${Q.alive} peserta bertahan.`);
    }
  }
}

function prepare(e) {
  const v = e.v;
  let a = null, bd = Infinity;
  for (const pass of [true, false]) {
    for (const f of Q.live) {
      if (f === v || f.te <= e.te + 0.35 || (pass && f.foe)) continue;
      const d = (f.x - v.x) ** 2 + (f.y - v.y) ** 2;
      if (d < bd) { bd = d; a = f; }
    }
    if (a) break;
  }
  e.a = a;
  const d = Math.sqrt(bd), r = Math.hypot(v.x, v.y);
  if (e === Q.ev[Q.ev.length - 1]) e.kind = 'final';
  else if (d < A.cr * 6) e.kind = r > Q.Rc * 0.7 && vr() < 0.6 ? 'out' : 'melee';
  else e.kind = 'throw';
  if (e.kind === 'throw') { e.obj = vpick(OBJECTS); e.flight = clamp(d / 1400, 0.35, 0.7); }
  else { v.foe = a; v.evKind = 'melee'; }        // both close in for the brawl
  a.foe = v; a.evKind = e.kind;
}

function launch(e) {
  const a = e.a;
  a.punch = 1; a.face = e.v.x >= a.x ? 1 : -1;
  e.p = { e, obj: e.obj[0], x0: a.x, y0: a.y, t0: Q.t, t1: e.te, spin: a.face * (10 + vr() * 8) };
  Q.proj.push(e.p);
  sfx(820, 0.08, 'triangle', 0.03);
}

function scuffle(f, g) {
  const t = Q.t;
  f.cool = g.cool = t + 0.9 + vr() * 1.4;
  f.punch = g.punch = 1; f.face = g.x >= f.x ? 1 : -1; g.face = -f.face;
  const dx = g.x - f.x, dy = g.y - f.y, d = Math.hypot(dx, dy) || 1, mx = (f.x + g.x) / 2, my = (f.y + g.y) / 2;
  f.vx -= dx / d * 220; f.vy -= dy / d * 220; g.vx += dx / d * 220; g.vy += dy / d * 220;
  Q.fx.push({ k: 'dust', x: mx, y: my, t, life: 0.5, r: A.cr * 1.6 });
  if (Q.duel || (vr() < 0.35 && Q.fx.filter(x => x.k === 'txt').length < 3)) Q.fx.push({ k: 'txt', x: mx, y: my, z: A.fh * 0.9, text: vpick(BONKS), t, life: 0.7, c: '#ffffff' });
  sfx(200 + vr() * 80, 0.05, 'square', 0.02);
}

function hit(e) {
  const v = e.v, a = e.a, t = Q.t, out = e.kind === 'out' || e.kind === 'final';
  let dx = v.x - a.x, dy = v.y - a.y, d = Math.hypot(dx, dy) || 1;
  dx /= d; dy /= d;
  if (e.kind === 'out') { const r = Math.hypot(v.x, v.y) || 1; dx += v.x / r; dy += v.y / r; d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d; }
  const pw = e.kind === 'final' ? 1000 : out ? 900 : e.kind === 'throw' ? 260 : 380;
  const side = dx >= 0 ? 1 : -1;
  v.ko = { t, vx: dx * pw, vy: dy * pw, z: 0, vz: out ? 720 : 260, rot: 0, spin: out ? side * 14 : 0, side };
  v.foe = null; v.evKind = null; v.punch = 0; v.tagUntil = t + 1.8;
  a.kos++; a.punch = 1; a.foe = null; a.evKind = null; a.face = side; a.tagUntil = t + 1.8;
  Q.alive--; Q.live = Q.live.filter(f => f !== v);
  Q.elim.push({ f: v, by: a, kind: e.kind, t });

  if (e.kind === 'final' || Q.fx.filter(x => x.k === 'txt').length < 3)
    Q.fx.push({ k: 'txt', x: v.x, y: v.y, z: A.fh * 1.05, text: e.kind === 'final' ? 'K.O.!' : vpick(BONKS), t, life: 0.9, c: '#e3bd45', big: true });
  Q.fx.push({ k: 'dust', x: v.x, y: v.y, t, life: 0.6, r: A.cr * 2.2 });
  Q.fx.push({ k: 'burst', x: v.x, y: v.y, z: A.fh * 0.6, t, life: 0.4 });
  Q.shake = Math.max(Q.shake, e.kind === 'final' ? 22 : out ? 10 : 5);
  if (t - Q.lastHitSfx > 0.05) { Q.lastHitSfx = t; sfx(150, 0.14, 'square', 0.055); sfx(80, 0.2, 'sawtooth', 0.035, 0.02); }

  const an = `<b>${esc(a.name)}</b>`, vn = `<b class="out">${esc(v.name)}</b>`;
  Q.feed.push(
    e.kind === 'throw' ? `${an} melempar ${e.obj[1]} ke ${vn}` :
    e.kind === 'out' ? `${an} mendorong ${vn} keluar arena` :
    e.kind === 'final' ? `${an} menjatuhkan ${vn} di duel terakhir` :
    `${an} ${vpick(['menjatuhkan', 'merobohkan', 'menumbangkan'])} ${vn}`);
  if (!Q.silent) { renderFeed(); $('#alive').textContent = `Tersisa ${Q.alive}/${Q.fs.length}`; }

  const n = Q.fs.length, al = Q.alive;
  if (al === 2) { Q.duel = true; say(`Duel terakhir: ${Q.live[0].name} melawan ${Q.live[1].name}.`); }
  else if (al === 3) say('Tersisa tiga peserta.');
  else if (al === 5 && n > 7) say('Tersisa lima peserta.');
  else if (al === 10 && n > 14) say('Tersisa sepuluh peserta.');
  else if (al === Math.ceil(n / 2) && n >= 8) say('Separuh peserta sudah tersingkir.');
  if (al === 1) {
    Q.winner = a; a.cheer = true; Q.endAt = t + 1.8;
    say(`${a.name} adalah orang terakhir yang bertahan.`);
    if (!Q.silent) { fanfare(); confetti(); }
  }
}

function koStep(f, dt) {
  const k = f.ko, age = Q.t - k.t;
  k.vz -= 2400 * dt; k.z += k.vz * dt;
  if (k.z <= 0) {
    k.z = 0; k.vz = k.vz < -350 ? -k.vz * 0.3 : 0;
    const fr = Math.pow(0.004, dt); k.vx *= fr; k.vy *= fr;
  }
  f.x += k.vx * dt; f.y += k.vy * dt;
  if (k.z > 0 && k.spin) k.rot += k.spin * dt;
  else {
    const tgt = Math.round((k.rot - k.side * 1.5708) / 6.2832) * 6.2832 + k.side * 1.5708;
    k.rot += (tgt - k.rot) * Math.min(1, dt * 14);
  }
  f.alpha = 1 - clamp((age - 1.5) / 0.8, 0, 1);
  if (f.alpha <= 0) f.gone = true;
}

function renderFeed() {
  $('#board').innerHTML = Q.feed.slice(-7).reverse().map(x => `<li>${x}</li>`).join('');
}

function riotCamera(rdt) {
  let tx = 0, ty = 0, tz = 1;
  if (Q.winner) { tx = Q.winner.x; ty = Q.winner.y - A.fh * 0.5; tz = clamp(Math.min(W, H) * 0.42 / (A.fh * 2.4 * A.scale), 1, 2.6); }
  else if (Q.duel && Q.live.length === 2) {
    const [p, q] = Q.live, d = Math.hypot(p.x - q.x, (p.y - q.y) * SQ) + A.fh * 3;
    tx = (p.x + q.x) / 2; ty = (p.y + q.y) / 2 - A.fh * 0.4;
    tz = clamp(Math.min(W, H * 1.3) * 0.6 / (d * A.scale), 1, 2.6);
  }
  const k = Math.min(1, rdt * 2.2);
  Q.cam.x += (tx - Q.cam.x) * k; Q.cam.y += (ty - Q.cam.y) * k; Q.cam.z += (tz - Q.cam.z) * k;
  Q.shake *= Math.pow(0.002, rdt); if (Q.shake < 0.3) Q.shake = 0;
  Q.shk.x = (vr() - 0.5) * Q.shake; Q.shk.y = (vr() - 0.5) * Q.shake;
}

/* ---------- riot drawing ---------- */
function oval(R_, fill, z = 0) {
  const [x, y] = P(0, 0, z);
  ctx.beginPath(); ctx.ellipse(x, y, R_ * A.s, R_ * A.s * SQ, 0, 0, 6.283);
  ctx.fillStyle = fill; ctx.fill();
}
function ring(R_, z = 0) {
  const [x, y] = P(0, 0, z);
  ctx.beginPath(); ctx.ellipse(x, y, R_ * A.s, R_ * A.s * SQ, 0, 0, 6.283); ctx.stroke();
}

function drawFighter(f, x, y, h, time) {
  const k = f.ko, lift = k ? k.z * A.s : f.cheer ? Math.abs(Math.sin(time * 9)) * h * 0.12 : 0;
  ctx.save();
  ctx.globalAlpha = k ? f.alpha : 1;
  ctx.fillStyle = 'rgba(10,25,45,.22)';
  ctx.beginPath(); ctx.ellipse(x, y, h * 0.2, h * 0.065, 0, 0, 6.283); ctx.fill();
  ctx.translate(x, y - lift);
  if (k) ctx.rotate(k.rot);
  ctx.scale(f.face, 1);
  const lw = Math.max(1.4, h * 0.1), sw = k ? 0 : Math.sin(f.ph) * (f.moving ? 1 : 0.12), ol = Math.max(1, h * 0.022);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // legs
  ctx.strokeStyle = f.pants; ctx.lineWidth = lw * 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.36); ctx.lineTo(h * (0.03 + sw * 0.13), -h * 0.03);
  ctx.moveTo(0, -h * 0.36); ctx.lineTo(h * (-0.03 - sw * 0.13), -h * 0.03);
  ctx.stroke();
  // back arm
  const shY = -h * 0.66;
  ctx.strokeStyle = f.skin; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(-h * 0.04, shY);
  if (f.cheer) ctx.lineTo(-h * 0.2, -h * 0.98);
  else if (k) ctx.lineTo(-h * 0.24, -h * 0.74);
  else ctx.lineTo(h * (-0.1 - sw * 0.12), -h * 0.42);
  ctx.stroke();
  // torso
  ctx.fillStyle = f.shirt; ctx.strokeStyle = 'rgba(10,25,45,.55)'; ctx.lineWidth = ol;
  ctx.beginPath(); ctx.roundRect(-h * 0.12, -h * 0.72, h * 0.24, h * 0.4, h * 0.07); ctx.fill(); ctx.stroke();
  // front arm
  ctx.strokeStyle = f.skin; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(h * 0.04, shY);
  if (f.cheer) ctx.lineTo(h * 0.2, -h * 0.98);
  else if (f.punch > 0) ctx.lineTo(h * (0.12 + 0.24 * f.punch), -h * (0.6 + 0.04 * f.punch));
  else if (k) ctx.lineTo(h * 0.26, -h * 0.72);
  else ctx.lineTo(h * (0.1 + sw * 0.12), -h * 0.42);
  ctx.stroke();
  // head + hair
  const hy = -h * 0.86, hr = h * 0.14;
  ctx.fillStyle = f.skin; ctx.strokeStyle = 'rgba(10,25,45,.55)'; ctx.lineWidth = ol;
  ctx.beginPath(); ctx.arc(h * 0.01, hy, hr, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.fillStyle = f.hair;
  ctx.beginPath(); ctx.arc(h * 0.0, hy - hr * 0.08, hr * 1.02, Math.PI * 1.0, Math.PI * 1.95); ctx.closePath(); ctx.fill();
  // eyes
  if (h >= 16) {
    ctx.strokeStyle = ctx.fillStyle = '#14202e';
    const ex = [h * 0.045, h * 0.1], ey = hy + hr * 0.15, er = Math.max(0.9, h * 0.016);
    if (k) {
      ctx.lineWidth = Math.max(1, h * 0.014);
      for (const e of ex) { ctx.beginPath(); ctx.moveTo(e - er * 1.6, ey - er * 1.6); ctx.lineTo(e + er * 1.6, ey + er * 1.6); ctx.moveTo(e + er * 1.6, ey - er * 1.6); ctx.lineTo(e - er * 1.6, ey + er * 1.6); ctx.stroke(); }
    } else for (const e of ex) { ctx.beginPath(); ctx.arc(e, ey, er, 0, 6.283); ctx.fill(); }
  }
  ctx.restore();
  // dizzy stars around a knocked-out head
  if (k && k.z <= 0 && Q.t - k.t < 1.7) {
    const hx = x + h * 0.86 * Math.sin(k.rot), hyy = y - h * 0.86 * Math.cos(k.rot) - h * 0.18;
    ctx.save(); ctx.globalAlpha = f.alpha; ctx.fillStyle = '#e3bd45';
    ctx.font = `${Math.max(9, h * 0.16)}px ${UI_FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 3; i++) {
      const a = time * 6 + i * 2.094;
      ctx.fillText('★', hx + Math.cos(a) * h * 0.2, hyy + Math.sin(a) * h * 0.07);
    }
    ctx.restore();
  }
}

function tag(f, x, y, style) {
  const fs = clamp(Math.round(A.fh * A.s * 0.2), 10, 17);
  ctx.font = `700 ${fs}px ${UI_FONT}`;
  const text = cut(f.name, 16), w = ctx.measureText(text).width + 12, hh = fs + 6;
  const px = clamp(x - w / 2, 4, W - w - 4), py = y - hh;
  ctx.globalAlpha = f.ko ? f.alpha : 1;
  ctx.fillStyle = style === 'gold' ? '#e3bd45' : style === 'out' ? '#da251c' : 'rgba(16,67,120,.92)';
  ctx.beginPath(); ctx.roundRect(px, py, w, hh, 4); ctx.fill();
  if (style === 'gold') { ctx.strokeStyle = '#104378'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.fillStyle = style === 'gold' ? '#4f3d00' : '#fff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, px + 6, py + hh / 2 + 1);
  ctx.globalAlpha = 1;
}

function riotDraw(time) {
  const s = A.s = A.scale * Q.cam.z, t = Q.t, h = A.fh * s;
  ctx.fillStyle = '#0d2b4d'; ctx.fillRect(0, 0, W, H);

  // stands + crowd around the arena
  oval(RW * 1.52, '#0a2340');
  ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = Math.max(1, 3 * s);
  for (let row = 0; row < 5; row++) ring(RW * (1.095 + row * 0.075));
  const ex = Q.phase === 'run' ? (Q.duel ? 2.2 : 1) : 0.4, cr_ = Math.max(2, 13 * s);
  ctx.globalAlpha = 0.7;
  for (const c of Q.crowd) {
    const [x, y] = P(Math.cos(c.a) * c.r, Math.sin(c.a) * c.r);
    if (x < -20 || x > W + 20 || y < -30 || y > H + 20) continue;
    const j = Math.abs(Math.sin(time * (3 + c.h % 4) + c.h)) * 5 * s * ex;
    ctx.fillStyle = c.c; ctx.beginPath(); ctx.arc(x, y - j - cr_, cr_, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // platform, danger ring, safe floor
  oval(RW * 1.03, '#173a63', -46);
  ctx.fillStyle = '#173a63'; { const [x, y] = P(0, 0); const [, y2] = P(0, 0, -46); ctx.fillRect(x - RW * 1.03 * s, y, RW * 2.06 * s, y2 - y); }
  oval(RW * 1.03, '#1f4b7c');
  oval(RW, '#e6cfc3');
  oval(Q.Rc, '#f2ede2');
  ctx.strokeStyle = 'rgba(16,67,120,.14)'; ctx.lineWidth = Math.max(1, 5 * s);
  ring(Q.Rc * 0.55); ring(RW * 0.1);

  // wall: posts and ropes on the current boundary
  const ph = 70;
  ctx.strokeStyle = '#104378'; ctx.lineWidth = Math.max(1.5, 8 * s); ctx.lineCap = 'round';
  ctx.beginPath();
  for (let k = 0; k < 36; k++) {
    const a = k / 36 * 6.283, wx = Math.cos(a) * Q.Rc, wy = Math.sin(a) * Q.Rc;
    const [x0, y0] = P(wx, wy), [x1, y1] = P(wx, wy, ph);
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(204,167,46,.55)'; ctx.lineWidth = Math.max(1, 4 * s); ring(Q.Rc, ph * 0.5);
  ctx.strokeStyle = '#cca72e'; ctx.lineWidth = Math.max(1.5, 6 * s); ring(Q.Rc, ph);

  // landed junk + dust
  const os = clamp(Math.round(A.fh * 0.3 * s / 2) * 2, 10, 60);
  for (const j of Q.junk) {
    const [x, y] = P(j.x, j.y), sp = sprite(j.obj, os, false), z = os * 1.5;
    ctx.save(); ctx.globalAlpha = 1 - clamp((t - j.t - 1.1) / 0.7, 0, 1);
    ctx.translate(x, y - os * 0.3); ctx.rotate(j.rot); ctx.drawImage(sp, -z / 2, -z / 2, z, z); ctx.restore();
  }
  for (const e of Q.fx) if (e.k === 'dust') {
    const u = (t - e.t) / e.life;
    ctx.fillStyle = `rgba(170,160,145,${0.45 * (1 - u)})`;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.257 + e.x, rr = e.r * (0.4 + u * 0.8);
      const [x, y] = P(e.x + Math.cos(a) * rr, e.y + Math.sin(a) * rr, 10 + u * 30);
      ctx.beginPath(); ctx.arc(x, y, Math.max(2, e.r * 0.45 * s * (0.6 + u)), 0, 6.283); ctx.fill();
    }
  }

  // fighters, back to front
  const vis = Q.fs.filter(f => !f.gone).sort((p, q) => p.y - q.y);
  for (const f of vis) { const [x, y] = P(f.x, f.y); drawFighter(f, x, y, h, time); }

  // projectiles in flight
  for (const p of Q.proj) {
    const u = clamp((t - p.t0) / (p.t1 - p.t0), 0, 1);
    const tx = p.e ? p.e.v.x : p.tx, ty = p.e ? p.e.v.y : p.ty, tz = p.e ? A.fh * 0.6 : 0;
    const d = Math.hypot(tx - p.x0, ty - p.y0);
    const [x, y] = P(p.x0 + (tx - p.x0) * u, p.y0 + (ty - p.y0) * u, A.fh * 0.7 * (1 - u) + tz * u + d * 0.35 * 4 * u * (1 - u));
    const sp = sprite(p.obj, os, false), z = os * 1.5;
    ctx.save(); ctx.translate(x, y); ctx.rotate((t - p.t0) * p.spin); ctx.drawImage(sp, -z / 2, -z / 2, z, z); ctx.restore();
  }

  // impact bursts and cartoon sound words
  for (const e of Q.fx) {
    const u = (t - e.t) / e.life;
    if (e.k === 'burst') {
      const [x, y] = P(e.x, e.y, e.z);
      ctx.strokeStyle = `rgba(227,189,69,${1 - u})`; ctx.lineWidth = Math.max(1.5, h * 0.05);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * 0.785 + 0.3, r0 = h * (0.15 + u * 0.35), r1 = h * (0.3 + u * 0.5);
        ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
      ctx.stroke();
    } else if (e.k === 'txt') {
      const [x, y] = P(e.x, e.y, e.z + u * 50);
      const sc = u < 0.2 ? 0.6 + u / 0.2 * 0.6 : 1.2 - (u - 0.2) * 0.25;
      const fs = (e.big ? 26 : 15) * sc * clamp(Q.cam.z, 1, 2) * clamp(h / 50, 0.75, 1.3);
      ctx.save(); ctx.globalAlpha = 1 - u * u;
      ctx.font = `800 ${fs}px ${UI_FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.strokeStyle = '#104378'; ctx.lineWidth = Math.max(2, fs * 0.18);
      ctx.strokeText(e.text, x, y); ctx.fillStyle = e.c; ctx.fillText(e.text, x, y);
      ctx.restore();
    }
  }

  // name tags: everyone while the field is small, otherwise only those in a fresh exchange
  const all = Q.fs.length <= 30 || Q.alive <= 30;
  const recent = new Set();
  if (!all) for (const x of Q.elim.slice(-4)) if (t - x.t < 1.8) { recent.add(x.f); recent.add(x.by); }
  const fresh = f => t < f.tagUntil && (all || recent.has(f));
  for (const f of vis) {
    const [x, y] = P(f.x, f.y);
    if (f.ko) { if (fresh(f)) tag(f, x, y - f.ko.z * s - h * 0.42, 'out'); }
    else if (all || fresh(f) || f === Q.winner) tag(f, x, y - h * 1.08 - (f.cheer ? h * 0.12 : 0), Q.alive <= 2 ? 'gold' : 'norm');
  }
}

/* ---------- riot result ---------- */
const avatar = (f, cls = '') => `<span class="av ${cls}" style="--c:${f.shirt}">${esc(initials(f.name))}</span>`;
function skipRiot() {
  Q.timers.forEach(clearTimeout); $('#countdown').hidden = true;
  Q.phase = 'run'; Q.silent = true;
  let guard = 0;
  while (Q && Q.phase === 'run' && guard++ < 100000) riotStep(1 / 30);
}
function finishRiot() {
  Q.phase = 'done'; cancelAnimationFrame(Q.raf);
  const w = Q.winner, n = Q.fs.length;
  if (Q.silent) { Q.silent = false; Q.cam = { x: w.x, y: w.y - A.fh * 0.5, z: clamp(Math.min(W, H) * 0.42 / (A.fh * 2.4 * A.scale), 1, 2.6) }; }
  Q.shake = 0; Q.shk = { x: 0, y: 0 };
  riotDraw(performance.now() / 1000);
  renderFeed();
  $('#prog').style.width = '100%';
  $('#clock').textContent = Q.D.toFixed(1) + ' dtk';
  $('#alive').textContent = `Tersisa 1/${n}`;

  const by = new Map(Q.elim.map(x => [x.f, x]));
  const order = [w, ...Q.elim.map(x => x.f).reverse()];
  lastOrder = order;
  const K = winnersOf(n);
  $('#resEyebrow').textContent = K > 1 ? `${K} pemenang · bertahan paling lama` : 'Bertahan terakhir';
  $('#champEm').innerHTML = avatar(w, 'big');
  $('#champName').textContent = w.name;
  $('#champSub').textContent = `${w.kos} lawan dijatuhkan · ${n} peserta`;
  const pod = order.length >= 3 ? [order[1], order[0], order[2]] : [];
  $('#podium').innerHTML = pod.map(r => {
    const k = order.indexOf(r) + 1;
    return `<div class="pod p${k}"><div class="em">${avatar(r, 'mid')}</div><div class="nm">${esc(r.name)}</div><div class="blk">${k}</div></div>`;
  }).join('');
  $('#fullList').innerHTML = order.map((r, i) => {
    const x = by.get(r);
    const note = i ? `dijatuhkan oleh ${esc(x.by.name)}` : 'bertahan terakhir';
    return `<li class="${i < K ? 'win' : ''}"><span class="rk">${i + 1}</span>${avatar(r)}<span class="nm">${esc(r.name)} <small>${note}</small></span><span class="tm">${i ? x.t.toFixed(1) + ' dtk' : '—'}</span></li>`;
  }).join('');
  showResult(K, n);
}

/* ================= result buttons ================= */
$('#btnSkip').onclick = () => {
  if (R && R.phase !== 'done') { R.timers.forEach(clearTimeout); $('#countdown').hidden = true; R.phase = 'run'; R.won = true; R.t = R.maxT + 1.4; }
  else if (Q && Q.phase !== 'done') skipRiot();
};
$('#btnAgain').onclick = () => S.mode === 'riot' ? startRiot() : startRace();
$('#btnReshuffle').onclick = runDraft;
$('#btnDrop').onclick = () => {
  const K = winnersOf(lastOrder.length);
  const gone = new Set(lastOrder.slice(0, K).map(r => r.idx));
  elNames.value = parseNames().filter((_, i) => !gone.has(i)).join('\n');
  refreshSetup(); save();
  if (S.mode === 'riot') startRiot(); else runDraft();
};
$('#btnFull').onclick = () => {
  const el = $('#stage');
  if (document.fullscreenElement) document.exitFullscreen();
  else (el.requestFullscreen || el.webkitRequestFullscreen || (() => toast('Layar penuh tidak didukung.'))).call(el);
};

/* ================= confetti ================= */
const fx = $('#fx'), fxc = fx.getContext('2d');
let bits = [], fxRaf = 0;
function confetti() {
  const w = fx.width = innerWidth, h = fx.height = innerHeight;
  for (let i = 0; i < 120; i++) bits.push({
    x: w * (0.2 + Math.random() * 0.6), y: h * 0.35, vx: (Math.random() - 0.5) * 900, vy: -300 - Math.random() * 700,
    s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 12, c: CROWD[i % 6], life: 3.2,
  });
  if (fxRaf) return;
  let last = performance.now();
  fxRaf = requestAnimationFrame(function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    fxc.clearRect(0, 0, fx.width, fx.height);
    bits = bits.filter(b => (b.life -= dt) > 0 && b.y < fx.height + 30);
    for (const b of bits) {
      b.vy += 1300 * dt; b.vx *= 0.985; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt;
      fxc.save(); fxc.translate(b.x, b.y); fxc.rotate(b.r); fxc.globalAlpha = Math.min(1, b.life);
      fxc.fillStyle = b.c; fxc.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); fxc.restore();
    }
    fxRaf = bits.length ? requestAnimationFrame(loop) : 0;
  });
}

/* ================= boot ================= */
const linkMode = load();
if (linkMode) S.mode = linkMode;
refreshSetup();

// ?tes=draft|race|hasil|riot|duel|riothasil — quick visual check with sample names
const tes = new URLSearchParams(location.search).get('tes');
if (tes) {
  if (!parseNames().length) elNames.value = SAMPLE.join('\n');
  S.sound = false;
  if (tes === 'draft') { S.mode = 'race'; runDraft(); }
  else if (tes === 'race' || tes === 'hasil') { S.mode = 'race'; buildRoster(); startRace({ instant: true, at: r => tes === 'hasil' ? r.maxT + 1.3 : r.minT * 0.55 }); }
  else if (tes === 'riot' || tes === 'duel') { S.mode = 'riot'; startRiot({ instant: true, at: q => tes === 'duel' ? q.D - 0.5 : q.D * 0.3 }); }
  else if (tes === 'riothasil') { S.mode = 'riot'; startRiot(); skipRiot(); }
  else if (tes === 'setup') show('setup');
  else show('mode');
} else show(linkMode ? 'setup' : 'mode');
})();
