// Интерактивная демонстрация покупки уровня в прототипе: тап = +1 уровень, удержание = серия покупок по +1.
// Логика серии — src/hold.js (тестируется в Node), цены — src/economy.js. Здесь только связка с DOM и эффекты.
// Режимы URL: ?card=forge|alchemist, ?demo=hold (Кузня ур. 8, 4.2K монет), ?sim=T (детерминированный кадр через T секунд удержания — для GIF).
(function () {
  const P = new URLSearchParams(location.search);
  const H = window.__hud, S = window.__scene, C = CONFIG, E = Economy, HC = C.BUY.hold, FX = C.BUY.fx;
  const def = C.LOCATIONS[0].stations[H.card.idx], id = H.card.id;
  const MSL = [10, 25, 50, 100, 200, 250, 500];
  const MSTAB = { 10: ['×2', '−10%'], 25: ['×2', '−10%'], 50: ['×3', '−15%'], 100: ['×3', '−15%'], 200: ['×5', '−20%'], 250: ['×5', '−20%'], 500: ['×10', '−25%'] };
  const SPRING = C.STATION_VIEW.bounceSec;

  const game = { coins: H.card.coins, levels: Object.assign({}, S.DEFAULT_STATE.levels), spring: null, popup: null, lastSpring: -1, lastSfx: -1, series: 0, time: 0 };
  if (P.get('demo') === 'hold') { game.levels.forge = 8; game.coins = 4200; }

  const card = document.querySelector('.card'), btn = card.querySelector('.buy');
  const el = { lv: card.querySelector('.lv'), stars: card.querySelector('.stars'), barI: card.querySelector('.bar i'), barT: card.querySelector('.bar span'), b1: btn.querySelector('.b1'), b2: btn.querySelector('.b2') };
  const pillEl = H.pillCoinsEl;
  const set = (n, t) => { if (n.textContent !== t) n.textContent = t; };

  // --- звук-заглушка: журнал + ограничение частоты, тон растёт с длиной серии ---
  window.sfx = { log: [], play(name, pitch) { this.log.push({ name, pitch: +pitch.toFixed(2), t: +game.time.toFixed(2) }); } };

  function updateCard() {
    const lvl = game.levels[id];
    set(el.lv, 'Ур. ' + lvl);
    const win = E.starWindow(lvl, MSL, 5);
    const html = win.map((w) => '<span class="star' + (w.reached ? ' on' : '') + (w.next ? ' next' : '') + '">' + H.STAR(w.reached) + '</span>').join('');
    if (el.stars.dataset.h !== html) { el.stars.innerHTML = html; el.stars.dataset.h = html; }
    const next = E.nextMilestone(lvl, MSL.map((l) => ({ level: l })));
    if (next) { el.barI.style.width = Math.min(100, lvl / next.level * 100) + '%'; set(el.barT, lvl + '/' + next.level + ' → ' + MSTAB[next.level][0] + ' · ' + MSTAB[next.level][1]); }
    else { el.barI.style.width = '100%'; set(el.barT, 'все рубежи пройдены'); }
    const cost = E.bulkCost(def, lvl, 1), afford = game.coins >= cost;
    btn.classList.toggle('off', !afford);
    btn.setAttribute('aria-disabled', String(!afford));
    const b2 = afford ? G.currencyIcon('coins') + ' ' + G.fmt(cost) : H.LOCK + ' ещё ' + G.fmt(cost - game.coins);
    if (btn.dataset.b2 !== b2) { el.b2.innerHTML = b2; btn.dataset.b2 = b2; }
    set(pillEl, G.fmt(game.coins));
  }

  // --- одна покупка: состояние + отклик (пружинка станции, цифра дохода, звук-заглушка) ---
  function purchase() {
    const lvl = game.levels[id];
    const r = E.tryBuyOne(def, lvl, game.coins);
    if (!r.bought) return false;
    const gain = E.incomePerSec(def, lvl + 1, C.MILESTONES) - E.incomePerSec(def, lvl, C.MILESTONES);
    game.coins = r.coins; game.levels[id] = r.level; game.series++;
    // пружинка: в быстрой серии не перезапускается чаще springMinGap, чтобы не было дрожания
    if (game.time - game.lastSpring >= FX.springMinGap) { game.spring = 0; game.lastSpring = game.time; }
    // цифра дохода: серия сливается в одно всплывающее число (сумма прироста), а не в шум из десятков
    const st = S.stations[H.card.idx];
    if (game.popup && game.time - game.popup.lastBuy < FX.popupMergeSec) { game.popup.total += gain; game.popup.age = Math.min(game.popup.age, 0.25); }
    else game.popup = { total: gain, age: 0, x: st.x, y: st.y - 122, lastBuy: 0 };
    game.popup.lastBuy = game.time;
    // звук-заглушка: не чаще sfxMinGap, тон растёт с номером покупки в серии
    if (game.time - game.lastSfx >= FX.sfxMinGap) { window.sfx.play('buy', 1 + 0.06 * Math.min(game.series - 1, 8)); game.lastSfx = game.time; }
    return true;
  }

  // --- удержание ---
  const hold = Hold.create(HC);
  let pressing = false;
  function press() {
    if (pressing) return; pressing = true; game.series = 0;
    const n = hold.start();
    for (let i = 0; i < n; i++) if (!purchase()) { hold.stop(); break; }
    btn.classList.toggle('holding', hold.active); updateCard();
  }
  function release() { if (!pressing) return; pressing = false; hold.stop(); btn.classList.remove('holding'); updateCard(); }

  function step(dt) {
    game.time += dt;
    if (pressing && hold.active) {
      const n = hold.update(dt); let bought = false;
      for (let i = 0; i < n; i++) { if (purchase()) bought = true; else { hold.stop(); break; } }
      if (bought || !hold.active) { btn.classList.toggle('holding', hold.active); updateCard(); }
    }
    if (game.spring != null) { game.spring += dt; if (game.spring >= SPRING) game.spring = null; }
    if (game.popup) { game.popup.age += dt; if (game.popup.age > 1.4) game.popup = null; }
  }

  function draw() {
    const state = { levels: game.levels, bounce: {}, popups: [] };
    if (game.spring != null) state.bounce[id] = game.spring / SPRING;
    if (game.popup) { const p = game.popup, a = Math.max(0, 1 - Math.max(0, p.age - 0.5) / 0.9); state.popups.push({ x: p.x, y: p.y - Math.min(p.age, 1) * 18, text: '+' + G.fmt(p.total) + '/с', a }); }
    S.render(state);
  }

  // --- подключение событий: Pointer Events; для старых браузеров — touch*/mouse* ---
  const inside = (x, y) => { const r = btn.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
  if (window.PointerEvent) {
    btn.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; e.preventDefault(); press(); });
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);                 // ≈ touchcancel
    btn.addEventListener('pointerleave', release);                     // ≈ mouseleave (мышь)
    window.addEventListener('pointermove', (e) => { if (pressing && !inside(e.clientX, e.clientY)) release(); }); // палец ушёл с кнопки
  } else {
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); press(); }, { passive: false });
    window.addEventListener('touchend', release); window.addEventListener('touchcancel', release);
    window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (pressing && t && !inside(t.clientX, t.clientY)) release(); }, { passive: true });
    btn.addEventListener('mousedown', (e) => { if (e.button === 0) press(); });
    window.addEventListener('mouseup', release); btn.addEventListener('mouseleave', release);
  }
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  btn.addEventListener('click', (e) => { if (e.detail === 0 && purchase()) { updateCard(); } }); // клавиатура (Enter/Пробел): +1 за нажатие
  window.addEventListener('blur', release);

  // --- режимы ---
  const simT = P.get('sim');
  if (simT != null) { // детерминированный кадр: удержание с t=0 до T секунд
    press();
    const T = parseFloat(simT) || 0;
    for (let t = 0; t + 1e-9 < T; t += 1 / 60) step(1 / 60);
    updateCard(); draw();
    window.__sim = { coins: game.coins, level: game.levels[id], sfx: window.sfx.log.length, purchases: game.series };
  } else {
    updateCard(); draw();
    let last = performance.now();
    (function loop(now) { step(Math.min(0.1, (now - last) / 1000)); last = now; draw(); requestAnimationFrame(loop); })(last);
  }
})();
