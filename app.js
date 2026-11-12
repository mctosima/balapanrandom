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

/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const rnd = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
const pick = a => a[Math.floor(rnd() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cut = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;

const S = { duration: 20, winners: 1, sound: true };
let roster = [];

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
const fanfare = () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.14, 'triangle', 0.09, i * 0.13));

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
    }
  } catch (e) {}
  const m = location.hash.match(/^#n=(.+)/);
  if (m) {
    try { elNames.value = decodeURIComponent(m[1]).split('|').join('\n'); } catch (e) {}
    history.replaceState(null, '', location.pathname + location.search);
  }
}

/* ================= screens ================= */
const screens = { setup: $('#s-setup'), draft: $('#s-draft'), race: $('#s-race') };
function show(name) {
  if (name !== 'race') stopRace();
  draftToken++;
  for (const k in screens) screens[k].hidden = k !== name;
  if (name !== 'race' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if (b) show(b.dataset.go);
});

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 1800);
}

/* ================= setup ================= */
const parseNames = () => elNames.value.split('\n').map(s => s.trim()).filter(Boolean);
function refreshSetup() {
  const n = parseNames().length;
  $('#count').textContent = n + ' peserta';
  $('#durLabel').textContent = S.duration + ' detik';
  $('#dur').value = S.duration;
  $('#winLabel').textContent = S.winners;
  $('#btnSound').textContent = S.sound ? '🔊 Suara' : '🔇 Senyap';
  $('#btnSound').setAttribute('aria-pressed', S.sound);
  const hint = $('#setupHint');
  hint.classList.remove('err');
  hint.textContent = n > MAX_N ? `Kebanyakan: maksimal ${MAX_N} peserta.` : 'Minimal 2 peserta, maksimal 200.';
  if (n > MAX_N) hint.classList.add('err');
}
elNames.addEventListener('input', () => { refreshSetup(); save(); });
elNames.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) goDraft(); });
$('#dur').addEventListener('input', e => { S.duration = +e.target.value; refreshSetup(); save(); });
$('#winMinus').onclick = () => { S.winners = clamp(S.winners - 1, 1, 10); refreshSetup(); save(); };
$('#winPlus').onclick = () => { S.winners = clamp(S.winners + 1, 1, 10); refreshSetup(); save(); };
$('#btnSound').onclick = () => { S.sound = !S.sound; refreshSetup(); save(); if (S.sound) tone(660, 0.1); };
$('#btnSample').onclick = () => { elNames.value = SAMPLE.join('\n'); refreshSetup(); save(); };
$('#btnMix').onclick = () => { elNames.value = shuffle(parseNames()).join('\n'); refreshSetup(); save(); };
$('#btnClear').onclick = () => { elNames.value = ''; refreshSetup(); save(); elNames.focus(); };
$('#btnShare').onclick = async () => {
  const names = parseNames();
  if (!names.length) return toast('Isi nama dulu ya');
  const url = location.origin + location.pathname + '#n=' + encodeURIComponent(names.join('|'));
  try { await navigator.clipboard.writeText(url); toast('Link disalin ✔'); }
  catch (e) { prompt('Salin link ini:', url); }
};
$('#btnDraft').onclick = goDraft;

function goDraft() {
  const n = parseNames().length;
  const hint = $('#setupHint');
  if (n < 2 || n > MAX_N) {
    hint.textContent = n < 2 ? 'Butuh minimal 2 peserta buat balapan.' : `Kebanyakan: maksimal ${MAX_N} peserta.`;
    hint.classList.add('err'); elNames.focus();
    return;
  }
  runDraft();
}

/* strip of animals on the landing page */
(() => {
  const html = shuffle(ANIMALS).map(a => `<span>${a[0]}</span>`).join('');
  $('#strip').innerHTML = html + html;
  $('#stickerCount').textContent = ANIMALS.length + ' hewan';
})();

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
        c.done = true; c.em.textContent = c.p.emoji; c.an.textContent = 'si ' + c.p.animal;
        c.el.classList.add('locked');
        if (now - lastTick > 45) { tone(500 + (i % 8) * 60, 0.06, 'triangle', 0.05); lastTick = now; }
      } else {
        all = false;
        if (now - c.last > 75) { c.last = now; c.em.textContent = pick(ANIMALS)[0]; }
      }
    });
    if (!all) return requestAnimationFrame(tick);
    $('#draftTitle').textContent = `${n} pembalap siap di garis start!`;
    $('#btnRace').disabled = false; $('#btnRace').focus();
  })(t0);
}
$('#btnRedraft').onclick = runDraft;
$('#btnRace').onclick = () => startRace();

/* ================= race ================= */
const cv = $('#track'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
let R = null;                       // current race
const G = {};                       // geometry
const sprites = new Map();

function sprite(emoji, size) {
  const key = emoji + '|' + size + '|' + DPR;
  let c = sprites.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  const s = Math.ceil(size * 1.5 * DPR);
  c.width = c.height = s;
  const x = c.getContext('2d');
  x.translate(s, 0); x.scale(-1, 1);          // emoji face left; flip so they run right
  x.font = `${size * DPR}px ${EMOJI_FONT}`;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(emoji, s / 2, s / 2 + size * DPR * 0.06);
  sprites.set(key, c);
  return c;
}

function resize() {
  const r = cv.getBoundingClientRect();
  if (!r.width || !r.height) return;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = r.width; H = r.height;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  G.trackTop = H * 0.42; G.trackBot = H * 0.95;
  G.standTop = G.trackTop - Math.max(46, H * 0.13);
  if (R) layoutRace();
}
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
new ResizeObserver(() => { resize(); if (R && R.phase !== 'run') draw(performance.now() / 1000); }).observe(cv);

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
  stopRace();
  show('race');
  $('#result').hidden = true;
  $('#comm').textContent = ''; $('#prog').style.width = '0';
  const D = S.duration, tail = Math.min(D * 0.1, 3);
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

  if (opts.instant) { R.phase = 'run'; if (opts.at) { R.t = opts.at(R); update(0); if (R) R.cam = clamp(R.order[0].x - W * 0.7, R.camMin, R.camMax); } return; }
  const cd = $('#countdown');
  ['3', '2', '1', 'GO!'].forEach((txt, i) => {
    R.timers.push(setTimeout(() => {
      cd.hidden = false; cd.textContent = txt;
      cd.classList.remove('tick'); void cd.offsetWidth; cd.classList.add('tick');
      if (i < 3) tone(440, 0.15, 'square', 0.07);
      else { tone(880, 0.5, 'square', 0.08); R.phase = 'run'; say('Dan mereka melesat! 💨'); }
    }, 400 + i * 800));
  });
  R.timers.push(setTimeout(() => cd.hidden = true, 400 + 4 * 800));
}

function say(text) {
  const c = $('#comm'); c.textContent = text;
  c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
  if (R) R.lastSay = R.t;
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
      if (R.leader && t > 1.5 && t - R.lastSay > 1.3) { say(`🔥 ${lead.name} si ${lead.animal} merebut posisi terdepan!`); tone(700, 0.07, 'triangle', 0.04); }
      R.leader = lead;
    }
    if (!R.half && prog > 0.5) { R.half = true; say(`Setengah jalan! ${lead.name} masih di depan.`); }
    else if (!R.final && prog > 0.85) { R.final = true; say('😱 Sprint terakhir! Siapa pun masih bisa menang!'); }
    else if (t - R.lastSay > 3.2 && t - R.lastFlavor > 3.2 && prog < 0.82) {
      R.lastFlavor = t;
      const n = R.order.length, mid = R.order[Math.floor(rnd() * Math.min(n, 6))], last = R.order[n - 1];
      say(pick([
        `${mid.name} si ${mid.animal} tancap gas!`,
        `Penonton bersorak untuk ${mid.name}!`,
        `${mid.name} nempel ketat di posisi ${mid.rank + 1}.`,
        `${last.name} si ${last.animal} masih santai di belakang…`,
        `${last.name} belum menyerah, jangan dicoret dulu!`,
        `${R.order[Math.min(1, n - 1)].name} mengintai dari belakang 👀`,
      ]));
    }
  }
  if (!R.won && t >= R.minT) {
    R.won = true;
    const w = R.racers.reduce((a, b) => a.T < b.T ? a : b);
    say(`🏁 ${w.name} si ${w.animal} menyentuh garis finis!`);
    fanfare(); confetti();
  }
  if (t >= R.maxT + 1.4) finish();
}

/* ---------- drawing ---------- */
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
  ctx.beginPath(); ctx.roundRect(x - 52, top - 4, 104, 28, 7); ctx.fill(); ctx.stroke();
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
  banner(R.L + 16, 'FINISH', '#e3bd45');

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
    ctx.beginPath(); ctx.roundRect(px, py, ww, hh, hh / 2); ctx.fill();
    if (lead) { ctx.strokeStyle = '#104378'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = lead ? '#4f3d00' : '#fff'; ctx.textAlign = 'left';
    ctx.fillText(text, px + 7, py + hh / 2 + 1);
  };
  if (G.showAll) R.racers.forEach(lab);
  else for (let i = Math.min(2, R.order.length - 1); i >= 0; i--) lab(R.order[i]);
}

/* ================= result ================= */
let lastOrder = [];
function finish() {
  const order = R.racers.slice().sort((a, b) => a.T - b.T);
  lastOrder = order;
  cancelAnimationFrame(R.raf); R.phase = 'done';
  draw(performance.now() / 1000);
  const K = Math.min(S.winners, order.length - 1 || 1), w = order[0];
  $('#resEyebrow').textContent = K > 1 ? `${K} pemenang · juara pertama` : 'Juara balapan';
  $('#champEm').textContent = w.emoji;
  $('#champName').textContent = w.name;
  $('#champSub').textContent = `si ${w.animal} · ${w.T.toFixed(2)} detik`;
  const pod = order.length >= 3 ? [order[1], order[0], order[2]] : [];
  $('#podium').innerHTML = pod.map(r => {
    const k = order.indexOf(r) + 1;
    return `<div class="pod p${k}"><div class="em">${r.emoji}</div><div class="nm">${esc(r.name)}</div><div class="blk">${k}</div></div>`;
  }).join('');
  $('#fullList').innerHTML = order.map((r, i) =>
    `<li class="${i < K ? 'win' : ''}"><span class="rk">${i + 1}</span><span>${r.emoji}</span><span class="nm">${esc(r.name)} <small>si ${r.animal}</small></span><span class="tm">${i ? '+' + (r.T - w.T).toFixed(2) : r.T.toFixed(2)} dtk</span></li>`).join('');
  $('#btnDrop').textContent = K > 1 ? `Singkirkan ${K} pemenang` : 'Singkirkan pemenang';
  $('#btnDrop').hidden = order.length - K < 2;
  $('#result').hidden = false; $('#result').scrollTop = 0;
  $('#btnAgain').focus();
  confetti();
}
$('#btnSkip').onclick = () => { if (R && R.phase !== 'done') { R.timers.forEach(clearTimeout); $('#countdown').hidden = true; R.phase = 'run'; R.won = true; R.t = R.maxT + 1.4; } };
$('#btnAgain').onclick = () => startRace();
$('#btnReshuffle').onclick = runDraft;
$('#btnDrop').onclick = () => {
  const K = Math.min(S.winners, lastOrder.length - 1 || 1);
  const gone = new Set(lastOrder.slice(0, K).map(r => r.idx));
  elNames.value = parseNames().filter((_, i) => !gone.has(i)).join('\n');
  refreshSetup(); save();
  runDraft();
};
$('#btnFull').onclick = () => {
  const el = $('#stage');
  if (document.fullscreenElement) document.exitFullscreen();
  else (el.requestFullscreen || el.webkitRequestFullscreen || (() => toast('Layar penuh tidak didukung'))).call(el);
};

/* ================= confetti ================= */
const fx = $('#fx'), fxc = fx.getContext('2d');
let bits = [], fxRaf = 0;
function confetti() {
  const w = fx.width = innerWidth, h = fx.height = innerHeight;
  for (let i = 0; i < 160; i++) bits.push({
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
load();
refreshSetup();

// ?tes=draft|race|hasil — quick visual check with sample names
const tes = new URLSearchParams(location.search).get('tes');
if (tes) {
  if (!parseNames().length) elNames.value = SAMPLE.join('\n');
  S.sound = false;
  if (tes === 'draft') runDraft();
  else { buildRoster(); startRace({ instant: true, at: r => tes === 'hasil' ? r.maxT + 1.3 : r.minT * 0.55 }); }
}
})();
