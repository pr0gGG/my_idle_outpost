// Оверлей поста: красные маркеры над станциями, тултип-карточка станции (тап = +1 уровень, удержание = серия покупок),
// большая кнопка каталога с бейджем, значок «×N profit». Всё в логических координатах игры (360×H).
(function (root) {
  const G = (root.G = root.G || {});
  const C = root.CONFIG, S = root.STR, E = root.Economy, HC = C.BUY.hold;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const set = (n, t) => { if (n.textContent !== t) n.textContent = t; };
  const MSL = C.MILESTONES.map((m) => m.level);
  const CARD_W = 216, CATALOG_W = 64;

  let state, hud, card, btn, markers = {}, catalogBtn, badgeEl, openId = null, pressing = false;
  const R = {};   // узлы карточки
  const hold = root.Hold.create(HC);

  // Число доступных покупок каталога. Каталога ещё нет (этап 2a), поэтому 0; для проверки вида есть ?badge=N.
  G.catalogAvailable = function () {
    const n = parseInt(new URLSearchParams(location.search).get(C.CATALOG.badgeDebugParam), 10);
    return Number.isFinite(n) ? n : 0;
  };

  G.buildHud = function (st) {
    state = st; hud = document.getElementById('hud');
    // красные маркеры «можно купить уровень» над станциями
    for (const s of G.post.stations()) {
      const b = el('button', 'stn-up', '<span class="upcircle">' + G.icons.arrow + '</span>');
      b.setAttribute('aria-label', S.post.upgrade.replace('{name}', S.stations[s.id].name)); b.hidden = true;
      b.addEventListener('click', (e) => { e.stopPropagation(); G.openCard(s.id); });
      hud.appendChild(b); markers[s.id] = b;
    }
    // значок «×N profit» — заглушка до этапа 6 (Total Profit % из реликвий)
    hud.appendChild(el('div', 'profit', S.post.profit.replace('{n}', 1)));
    // большая кнопка каталога улучшений
    catalogBtn = el('button', 'catalog upcircle', G.icons.arrow); catalogBtn.setAttribute('aria-label', S.post.catalog);
    badgeEl = el('span', 'badge'); catalogBtn.appendChild(badgeEl);
    catalogBtn.addEventListener('click', () => G.toast(S.soon.catalog));
    hud.appendChild(catalogBtn);
    // карточка станции (каркас статичный: узлы не пересоздаются, чтобы не терять удержание кнопки)
    card = el('div', 'card'); card.hidden = true;
    card.innerHTML = '<h3><span class="nm"></span><span class="lv"></span></h3><div class="stars"></div><div class="bar"><i></i><span></span></div>' +
      '<button class="buy" aria-label="' + S.post.buyAria + '"><b class="b1"></b><small class="b2"></small></button>';
    hud.appendChild(card);
    btn = card.querySelector('.buy');
    Object.assign(R, { nm: card.querySelector('.nm'), lv: card.querySelector('.lv'), stars: card.querySelector('.stars'), barI: card.querySelector('.bar i'), barT: card.querySelector('.bar span'), b1: btn.querySelector('.b1'), b2: btn.querySelector('.b2') });
    bindHold();
    // нажатие вне карточки (по другим элементам интерфейса) закрывает её; по сцене — обрабатывает main.js
    document.addEventListener('pointerdown', (e) => { if (openId && !card.contains(e.target) && !e.target.closest('.stn-up') && e.target.id !== 'scene') G.closeCard(); });
  };

  // Положение маркеров и карточки зависит от раскладки сцены
  G.layoutHud = function () {
    for (const s of G.post.stations()) {
      const p = G.post.stationPos(s.id);
      Object.assign(markers[s.id].style, { left: (p.x - 22) + 'px', top: (C.VIEW.TOPBAR_H + p.y - 126 - 22) + 'px' });
    }
    if (openId) placeCard();
  };

  function placeCard() {
    const p = G.post.stationPos(openId), tail = 0;
    const left = Math.max(6, Math.min(C.VIEW.W - CARD_W - 6 - CATALOG_W - 4, p.x - CARD_W / 2));
    Object.assign(card.style, { left: left + 'px', top: (C.VIEW.TOPBAR_H + p.y + 8) + 'px' });
    card.style.setProperty('--tail', Math.max(18, Math.min(CARD_W - 18, p.x - left)) + 'px');
  }

  G.openCard = function (id) {
    if (openId === id) return;
    if (pressing) releaseHold();
    openId = id; card.hidden = false; placeCard(); G.updateHud(true);
  };
  G.closeCard = function () { if (pressing) releaseHold(); openId = null; if (card) card.hidden = true; };
  G.toggleCard = function (id) { if (openId === id) G.closeCard(); else G.openCard(id); };

  // Обновление значений (каждые ~0.12 с и после покупок)
  G.updateHud = function (force) {
    for (const s of G.post.stations()) markers[s.id].hidden = !(G.post.affordable(s.id) && openId !== s.id);
    const n = G.catalogAvailable();
    badgeEl.hidden = n < 1; set(badgeEl, String(n)); catalogBtn.classList.toggle('pulse', n > 0);
    if (!openId) return;
    const def = G.post.def(openId), info = G.post.buyInfo(openId), lvl = info.level;
    set(R.nm, S.stations[openId].name); set(R.lv, S.post.level + ' ' + lvl);
    const win = E.starWindow(lvl, MSL, 5);
    const html = win.map((w) => '<span class="star' + (w.reached ? ' on' : '') + (w.next ? ' next' : '') + '">' + G.icons.star(w.reached) + '</span>').join('');
    if (R.stars.dataset.h !== html) { R.stars.innerHTML = html; R.stars.dataset.h = html; }
    const next = E.nextMilestone(lvl, C.MILESTONES);
    if (next) { R.barI.style.width = Math.min(100, lvl / next.level * 100) + '%'; set(R.barT, S.post.milestone.replace('{cur}', lvl).replace('{next}', next.level).replace('{m}', next.mult)); }
    else { R.barI.style.width = '100%'; set(R.barT, S.post.milestoneDone); }
    set(R.b1, lvl < 1 ? S.post.buyFirst : S.post.buy);
    btn.classList.toggle('off', !info.afford); btn.setAttribute('aria-disabled', String(!info.afford));
    const b2 = info.afford ? G.currencyIcon('coins') + ' ' + G.fmt(info.cost) : G.icons.lock + ' ' + S.post.missing.replace('{n}', G.fmt(info.missing));
    if (btn.dataset.b2 !== b2) { R.b2.innerHTML = b2; btn.dataset.b2 = b2; }
    void def; void force;
  };

  // ---- удержание кнопки покупки: тап = +1, удержание = серия по +1 (src/hold.js) ----
  function press() {
    if (pressing || !openId) return; pressing = true;
    const n = hold.start();
    for (let i = 0; i < n; i++) if (!G.post.buyOne(openId, true)) { hold.stop(); break; }
    btn.classList.toggle('holding', hold.active); G.updateHud();
  }
  function releaseHold() { if (!pressing) return; pressing = false; hold.stop(); btn.classList.remove('holding'); G.updateHud(); }
  // вызывается каждый кадр из main.js
  G.tickHold = function (dt) {
    if (!pressing || !hold.active || !openId) return;
    const n = hold.update(dt); let bought = false;
    for (let i = 0; i < n; i++) { if (G.post.buyOne(openId, false)) bought = true; else { hold.stop(); break; } }
    if (bought || !hold.active) { btn.classList.toggle('holding', hold.active); G.updateHud(); }
  };

  function bindHold() {
    const inside = (x, y) => { const r = btn.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
    if (window.PointerEvent) {                           // мышь и тач
      btn.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; e.preventDefault(); press(); });
      window.addEventListener('pointerup', releaseHold);
      window.addEventListener('pointercancel', releaseHold);                       // ≈ touchcancel
      btn.addEventListener('pointerleave', releaseHold);                           // ≈ mouseleave
      window.addEventListener('pointermove', (e) => { if (pressing && !inside(e.clientX, e.clientY)) releaseHold(); }); // палец ушёл с кнопки
    } else {                                             // запасной путь для старых браузеров
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); press(); }, { passive: false });
      window.addEventListener('touchend', releaseHold); window.addEventListener('touchcancel', releaseHold);
      window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (pressing && t && !inside(t.clientX, t.clientY)) releaseHold(); }, { passive: true });
      btn.addEventListener('mousedown', (e) => { if (e.button === 0) press(); });
      window.addEventListener('mouseup', releaseHold); btn.addEventListener('mouseleave', releaseHold);
    }
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    btn.addEventListener('click', (e) => { if (e.detail === 0 && openId && G.post.buyOne(openId, true)) G.updateHud(); }); // клавиатура: +1 за нажатие
    window.addEventListener('blur', releaseHold);
  }
})(window);
