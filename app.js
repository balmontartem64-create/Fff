const DEF = { bal: 100, cb: 0, g: 0, w: 0, th: 'cyber', daily: 0, promos: '' };
let S = JSON.parse(localStorage.getItem('nx_s')) || Object.assign({}, DEF);
const save = () => { localStorage.setItem('nx_s', JSON.stringify(S)); upd(); };
const val = id => parseFloat(document.getElementById(id).value) || 0;
const sbet = v => document.getElementById('bet').value = v;
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };

if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
  if (u) {
    document.getElementById('pn').textContent = u.first_name;
    document.getElementById('uid').textContent = 'ID: ' + u.id;
  }
}

function tst(m) {
  const t = document.getElementById('tst');
  t.textContent = m;
  t.classList.remove('hid');
  clearTimeout(window._t);
  window._t = setTimeout(() => t.classList.add('hid'), 2400);
}

function tab(n) {
  Array.of('games', 'play', 'cases', 'bonus', 'dep', 'prof').forEach(x => document.getElementById('t-' + x).classList.add('hid'));
  document.getElementById('t-' + n).classList.remove('hid');
  document.querySelectorAll('.nb').forEach(b => b.classList.toggle('act', b.dataset.n === n));
  if (n === 'dep') uprev();
}

const GAMES = Array.of(
  { id: 'mines', nm: 'Mines 5x5', ml: 'До x24', ic: 'M' },
  { id: 'dice', nm: 'Dice Roll', ml: 'До x19', ic: 'D' },
  { id: 'wheel', nm: 'Wheel', ml: 'До x10', ic: 'W' },
  { id: 'tower', nm: 'Tower', ml: 'До x12', ic: 'T' },
  { id: 'coin', nm: 'CoinFlip', ml: 'x1.95', ic: 'C' },
  { id: 'hilo', nm: 'Hi-Lo', ml: 'x1.95', ic: 'H' },
  { id: 'roul', nm: 'Roulette', ml: 'До x14', ic: 'R' },
  { id: 'slots', nm: 'Slots 777', ml: 'До x25', ic: '7' },
  { id: 'keno', nm: 'Keno', ml: 'До x15', ic: 'K' },
  { id: 'limbo', nm: 'Limbo', ml: 'До x100', ic: 'L' }
);

const gg = document.getElementById('gg');
GAMES.forEach(g => {
  const b = el('button', 'gb');
  b.onclick = () => openg(g.id, g.nm);
  const top = el('div', 'row');
  top.style.width = '100%';
  top.append(el('div', 'gic', g.ic), el('span', 'gm', g.ml));
  b.append(top, el('div', 'ttl', g.nm));
  gg.appendChild(b);
});

function gbet() {
  const b = val('bet');
  if (b < 1) { tst('Мин. ставка 1 RUB'); return 0; }
  if (b > S.bal) { tst('Недостаточно средств'); return 0; }
  return b;
}

function fin(b, w) {
  S.bal = +(S.bal - b + w).toFixed(2);
  S.g++;
  if (w > 0) S.w += w;
  else S.cb += b * 0.1;
  save();
}

let M = {}, TW = {}, KN = new Set();

function openg(id, nm) {
  document.getElementById('gt').textContent = nm;
  tab('play');
  const st = document.getElementById('gs');
  st.replaceChildren();
  if (id === 'mines') { M = { on: 0, b: new Set(), o: new Set(), bet: 0, m: 1 }; dmines(st); }
  if (id === 'dice') {
    const box = el('div', 'sb'), res = el('div', 'bn', '--'); res.id = 'dr';
    const lbl = el('div', 'sub', 'Шанс победы: 50%'); box.append(res, lbl);
    const rng = el('input'); rng.id = 'ds2'; rng.type = 'range'; rng.min = 5; rng.max = 90; rng.value = 50; rng.style.width = '100%'; rng.style.marginBottom = '12px';
    rng.oninput = () => lbl.textContent = 'Шанс победы: ' + rng.value + '%';
    const btn = el('button', 'btn acc', 'Бросить кубик'); btn.onclick = pdice;
    st.append(box, rng, btn);
  }
  if (id === 'wheel') {
    const box = el('div', 'sb'), res = el('div', 'bn', 'x1.0'); res.id = 'wr'; box.appendChild(res);
    const btn = el('button', 'btn acc', 'Вращать колесо'); btn.onclick = pwheel;
    st.append(box, btn);
  }
  if (id === 'tower') { TW = { on: 0, l: 0, t: new Map(), bet: 0, m: 1 }; dtower(st); }
  if (id === 'coin') {
    const box = el('div', 'sb'), res = el('div', 'ttl', 'Выберите сторону'); res.id = 'cr'; box.appendChild(res);
    const r = el('div', 'g2'), b1 = el('button', 'btn acc', 'Орел x1.95'), b2 = el('button', 'btn gh', 'Решка x1.95');
    b1.onclick = () => pcoin('ОРЕЛ'); b2.onclick = () => pcoin('РЕШКА');
    r.append(b1, b2); st.append(box, r);
  }
  if (id === 'hilo') {
    const box = el('div', 'sb'), res = el('div', 'bn', '50'); res.id = 'hr'; box.appendChild(res);
    const r = el('div', 'g2'), b1 = el('button', 'btn gh', 'Меньше 50'), b2 = el('button', 'btn acc', 'Больше 50');
    b1.onclick = () => philo(0); b2.onclick = () => philo(1);
    r.append(b1, b2); st.append(box, r);
  }
  if (id === 'roul') {
    const box = el('div', 'sb'), res = el('div', 'ttl', 'Сектор: --'); res.id = 'rr'; box.appendChild(res);
    const r = el('div', 'g3'), b1 = el('button', 'btn btn-red', 'Красн x2'), b2 = el('button', 'btn btn-grn', 'Зеро x14'), b3 = el('button', 'btn gh', 'Черн x2');
    b1.onclick = () => proul('r'); b2.onclick = () => proul('g'); b3.onclick = () => proul('b');
    r.append(b1, b2, b3); st.append(box, r);
  }
  if (id === 'slots') {
    const box = el('div', 'sb'), res = el('div', 'bn', '7 - 7 - 7'); res.id = 'sr'; box.appendChild(res);
    const btn = el('button', 'btn acc', 'Крутить барабаны'); btn.onclick = pslots;
    st.append(box, btn);
  }
  if (id === 'keno') { KN = new Set(); dkeno(st); }
  if (id === 'limbo') {
    const box = el('div', 'sb'), res = el('div', 'bn', 'x1.00'); res.id = 'lr'; box.appendChild(res);
    const inp = el('input', 'inp mb8'); inp.id = 'lt'; inp.type = 'number'; inp.value = '2.0'; inp.step = '0.1'; inp.style.textAlign = 'center';
    const btn = el('button', 'btn acc', 'Пробить множитель'); btn.onclick = plimbo;
    st.append(box, inp, btn);
  }
}
function dmines(st) {
  st.replaceChildren();
  const g = el('div', 'g5 mb12');
  for (let i = 0; i < 25; i++) {
    const op = M.o.has(i), bm = !M.on && M.b.has(i);
    const b = el('button', 'mc' + (op ? ' mo' : (bm ? ' mb' : '')), op ? '+' : (bm ? 'X' : '?'));
    b.onclick = () => hmine(i);
    g.appendChild(b);
  }
  const a = M.on ? el('button', 'btn acc', 'Забрать ' + (M.bet * M.m).toFixed(2) + ' RUB') : el('button', 'btn acc', 'Начать игру (5 мин)');
  a.onclick = M.on ? cmine : smine;
  st.append(g, a);
}
function smine() { const b = gbet(); if (!b) return; S.bal -= b; save(); const bm = new Set(); while (bm.size < 5) bm.add(Math.floor(Math.random() * 25)); M = { on: 1, b: bm, o: new Set(), bet: b, m: 1 }; dmines(document.getElementById('gs')); }
function hmine(i) { if (!M.on || M.o.has(i)) return; if (M.b.has(i)) { M.on = 0; S.cb += M.bet * 0.1; S.g++; save(); tst('Мина!'); dmines(document.getElementById('gs')); return; } M.o.add(i); M.m = +(1 + M.o.size * 0.35).toFixed(2); dmines(document.getElementById('gs')); }
function cmine() { if (!M.on || !M.o.size) return; const w = +(M.bet * M.m).toFixed(2); M.on = 0; S.bal += w; S.w += w; S.g++; save(); tst('+' + w + ' RUB'); dmines(document.getElementById('gs')); }

function pdice() { const b = gbet(); if (!b) return; const c = val('ds2'), r = +(Math.random() * 100).toFixed(2), w = r <= c ? +(b * (98 / c)).toFixed(2) : 0; document.getElementById('dr').textContent = r; fin(b, w); tst(w ? '+' + w + ' RUB' : 'Выпало ' + r); }
function pwheel() { const b = gbet(); if (!b) return; const m = Array.of(0, 0.5, 1.2, 1.5, 2, 3, 5, 10).at(Math.floor(Math.random() * 8)), w = +(b * m).toFixed(2); document.getElementById('wr').textContent = 'x' + m; fin(b, w); tst(w ? '+' + w + ' RUB' : 'Сектор x0'); }

function dtower(st) {
  st.replaceChildren();
  const wr = el('div', 'mb12');
  for (let l = 4; l >= 0; l--) {
    const r = el('div', 'g3 mb8');
    for (let d = 0; d < 3; d++) {
      const b = el('button', l < TW.l ? 'btn acc' : 'gh', 'Дверь ' + (d + 1));
      b.style.padding = '8px';
      b.onclick = () => htow(l, d);
      r.appendChild(b);
    }
    wr.appendChild(r);
  }
  const a = TW.on ? el('button', 'btn acc', 'Забрать ' + (TW.bet * TW.m).toFixed(2) + ' RUB') : el('button', 'btn acc', 'Старт башни');
  a.onclick = TW.on ? ctow : stow;
  st.append(wr, a);
}
function stow() { const b = gbet(); if (!b) return; S.bal -= b; save(); const tr = new Map(); for (let i = 0; i < 5; i++) tr.set(i, Math.floor(Math.random() * 3)); TW = { on: 1, l: 0, t: tr, bet: b, m: 1 }; dtower(document.getElementById('gs')); }
function htow(l, d) { if (!TW.on || l !== TW.l) return; if (TW.t.get(l) === d) { TW.on = 0; S.cb += TW.bet * 0.1; S.g++; save(); tst('Ловушка!'); dtower(document.getElementById('gs')); return; } TW.l++; TW.m = +(1 + TW.l * 0.45).toFixed(2); if (TW.l === 5) ctow(); else dtower(document.getElementById('gs')); }
function ctow() { if (!TW.on || !TW.l) return; const w = +(TW.bet * TW.m).toFixed(2); TW.on = 0; S.bal += w; S.w += w; S.g++; save(); tst('+' + w + ' RUB'); dtower(document.getElementById('gs')); }

function pcoin(s) { const b = gbet(); if (!b) return; const r = Math.random() < 0.5 ? 'ОРЕЛ' : 'РЕШКА', w = r === s ? +(b * 1.95).toFixed(2) : 0; document.getElementById('cr').textContent = r; fin(b, w); tst(w ? '+' + w + ' RUB' : 'Выпал ' + r); }
function philo(hi) { const b = gbet(); if (!b) return; const n = Math.floor(Math.random() * 100) + 1, w = ((hi && n > 50) || (!hi && n < 50)) ? +(b * 1.95).toFixed(2) : 0; document.getElementById('hr').textContent = n; fin(b, w); tst(w ? '+' + w + ' RUB' : 'Число ' + n); }
function proul(c) { const b = gbet(); if (!b) return; const n = Math.floor(Math.random() * 37), rc = n === 0 ? 'g' : (n % 2 ? 'r' : 'b'), w = c === rc ? +(b * (c === 'g' ? 14 : 2)).toFixed(2) : 0; document.getElementById('rr').textContent = n + ' (' + (rc === 'g' ? 'ЗЕРО' : rc === 'r' ? 'КРАСН' : 'ЧЕРН') + ')'; fin(b, w); tst(w ? '+' + w + ' RUB' : 'Мимо'); }
function pslots() { const b = gbet(); if (!b) return; const sm = Array.of('BAR', 'GEM', '777'), a1 = sm.at(Math.floor(Math.random() * 3)), a2 = sm.at(Math.floor(Math.random() * 3)), a3 = sm.at(Math.floor(Math.random() * 3)); document.getElementById('sr').textContent = a1 + ' - ' + a2 + ' - ' + a3; const m = (a1 === a2 && a2 === a3) ? (a1 === '777' ? 25 : 8) : (a1 === a2 || a2 === a3 ? 1.4 : 0), w = +(b * m).toFixed(2); fin(b, w); tst(w ? '+' + w + ' RUB' : 'Пусто'); }

function dkeno(st) {
  st.replaceChildren();
  const g = el('div', 'g5 mb12');
  for (let i = 1; i <= 20; i++) {
    const b = el('button', KN.has(i) ? 'mc mo' : 'mc', String(i));
    b.onclick = () => tkeno(i);
    g.appendChild(b);
  }
  const a = el('button', 'btn acc', 'Играть Кено (' + KN.size + '/5)');
  a.onclick = pkeno;
  st.append(g, a);
}
function tkeno(i) { if (KN.has(i)) KN.delete(i); else if (KN.size < 5) KN.add(i); dkeno(document.getElementById('gs')); }
function pkeno() { if (!KN.size) return tst('Выберите числа'); const b = gbet(); if (!b) return; const d = new Set(); while (d.size < 5) d.add(Math.floor(Math.random() * 20) + 1); let m = 0; KN.forEach(x => { if (d.has(x)) m++; }); const w = +(b * (m * 1.8)).toFixed(2); fin(b, w); tst('Совпадений: ' + m + (w ? ' (+' + w + ' RUB)' : '')); }
function plimbo() { const b = gbet(); if (!b) return; const t = Math.max(1.1, val('lt')), c = Math.max(1, +(0.96 / Math.random()).toFixed(2)), w = c >= t ? +(b * t).toFixed(2) : 0; document.getElementById('lr').textContent = 'x' + c; fin(b, w); tst(w ? '+' + w + ' RUB' : 'Упало на x' + c); }

const CASES = Array.of(
  { id: 0, n: 'Starter Box', p: 50, r: Array.of(20, 40, 50, 100, 300) },
  { id: 1, n: 'Cyber Vault', p: 250, r: Array.of(100, 200, 250, 600, 1500) },
  { id: 2, n: 'Imperial Chest', p: 1000, r: Array.of(400, 800, 1000, 3000, 10000) }
);

const cl = document.getElementById('cl');
CASES.forEach(c => {
  const card = el('div', 'card row'), inf = el('div'), sub = el('div', 'sub', 'Цена: ');
  sub.appendChild(el('span', 'link', c.p + ' RUB'));
  inf.append(el('div', 'ttl', c.n), sub);
  const btn = el('button', 'acc okbtn', 'Открыть');
  btn.onclick = () => ocase(c.id);
  card.append(inf, btn);
  cl.appendChild(card);
});

let spn = 0;
function ocase(id) {
  if (spn) return;
  const c = CASES.at(id);
  if (S.bal < c.p) return tst('Недостаточно средств');
  S.bal -= c.p; save(); spn = 1;
  const win = c.r.at(Math.floor(Math.random() * c.r.length));
  const box = document.getElementById('csb'), tr = document.getElementById('ct');
  box.classList.remove('hid'); tr.style.transition = 'none'; tr.style.transform = 'translateX(0)'; tr.replaceChildren();
  for (let i = 0; i < 25; i++) tr.appendChild(el('div', 'ci', (i === 20 ? win : c.r.at(i % 5)) + ' ₽'));
  setTimeout(() => { tr.style.transition = 'transform 3s cubic-bezier(.12,.85,.2,1)'; tr.style.transform = 'translateX(-' + (20 * 82 - box.clientWidth / 2 + 37) + 'px)'; }, 50);
  setTimeout(() => { S.bal += win; S.w += win; S.g++; if (win < c.p) S.cb += (c.p - win) * 0.1; save(); tst('Выигрыш: +' + win + ' RUB'); spn = 0; }, 3150);
}

let pm = 'sbp', pend = 0;
const GWS = {
  sbp: { n: 'СБП / Карты РФ', r: 1, u: 'RUB', q: '+7 (999) 842-19-30 (Т-Банк / Сбер)' },
  cb: { n: 'CryptoBot (USD)', r: 92.5, u: 'USDT', q: 't.me/CryptoBot?start=IV-NEXUS-8842' },
  ton: { n: 'TON / USD Wallet', r: 485, u: 'TON', q: 'UQD9x_NexusArenaWallet_8842' }
};

function spay(k, b) { pm = k; document.querySelectorAll('.pm').forEach(x => x.classList.remove('pact')); b.classList.add('pact'); document.getElementById('ib').classList.add('hid'); uprev(); }
function sdep(v) { document.getElementById('ds').value = v; uprev(); }
function uprev() { const rub = val('ds'), g = GWS.sbp; const cur = pm === 'cb' ? GWS.cb : (pm === 'ton' ? GWS.ton : g); document.getElementById('pp').textContent = cur.u === 'RUB' ? rub.toFixed(2) + ' RUB' : (rub / cur.r).toFixed(cur.u === 'TON' ? 3 : 2) + ' ' + cur.u; }
function minv() { const rub = val('ds'); if (rub < 50) return tst('Минимальная сумма 50 RUB'); pend = rub; const cur = pm === 'cb' ? GWS.cb : (pm === 'ton' ? GWS.ton : GWS.sbp); document.getElementById('im').textContent = cur.n; document.getElementById('it').textContent = document.getElementById('pp').textContent; document.getElementById('ir').textContent = cur.q; document.getElementById('ib').classList.remove('hid'); }
function creq() { navigator.clipboard.writeText(document.getElementById('ir').textContent); tst('Скопировано'); }
function cinv() { if (pend < 50) return; S.bal += pend; save(); tst('Зачислено +' + pend + ' RUB'); pend = 0; document.getElementById('ib').classList.add('hid'); tab('games'); }

function ccb() { if (S.cb < 1) return tst('Минимум 1 RUB'); const v = +S.cb.toFixed(2); S.bal += v; S.cb = 0; save(); tst('+' + v + ' RUB'); }
function cdly() { if (Date.now() - S.daily < 86400000) return tst('Уже получено сегодня'); S.bal += 150; S.daily = Date.now(); save(); tst('+150 RUB'); }
function uprm() { const c = document.getElementById('prm').value.trim().toUpperCase(); if (c === 'START2026' && !S.promos.includes(c)) { S.bal += 500; S.promos += ',' + c; save(); tst('+500 RUB'); } else tst('Неверный или использованный код'); }
function sthm(t) { S.th = t; save(); tst('Тема изменена'); }
function rall() { S = Object.assign({}, DEF); save(); tst('Сброшено'); }

function upd() {
  document.documentElement.setAttribute('data-theme', S.th);
  document.getElementById('bal').textContent = S.bal.toFixed(2);
  document.getElementById('cbv').textContent = S.cb.toFixed(2);
  document.getElementById('sg').textContent = S.g;
  document.getElementById('sw').textContent = Math.round(S.w);
}
upd();
