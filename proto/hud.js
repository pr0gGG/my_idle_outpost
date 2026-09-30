// Статичный HUD прототипа: верхняя зона, квесты, карточка станции, кнопка каталога, таб-бар.
(function () {
  const hud = document.getElementById('hud');
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 3l9 10h-6v8H9v-8H3z"/></svg>';
  const STAR = (on) => '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5 6 20.9l1.3-6.7-5-4.7 6.8-.8z" fill="' + (on ? '#ffc93c' : 'none') + '" stroke="' + (on ? '#d9971a' : '#9aa0ac') + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  const SAFE = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M3 10a9 7 0 0 1 18 0v2H3z"/><path fill="currentColor" opacity=".7" d="M3 13h18v7H3z"/><rect x="10.5" y="11" width="3" height="4" rx="1" fill="#fff"/></svg>';
  const GEAR = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4L10.7 6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>';
  const fmt = G.fmt;
  const S = window.__scene;
  const tabs = [['post', 'Пост'], ['battle', 'Бой'], ['chests', 'Сундуки'], ['inventory', 'Инвентарь']];

  const CARDS_COINS = new URLSearchParams(location.search).get('card') === 'alchemist' ? 1.5e19 : 12400;
  const h = [];
  h.push('<div class="topbar"><button class="safe" aria-label="Сейф">' + SAFE + '</button>' +
    '<div class="pills"><div class="pill"><span class="ico">' + G.currencyIcon('coins') + '</span><span>' + fmt(CARDS_COINS) + '</span><small>+136/с</small></div></div>' +
    '<button class="gear" aria-label="Настройки">' + GEAR + '</button></div>');
  // квесты
  h.push('<div class="quest-nodes"><i class="qn done">✓</i><i class="ql done"></i><i class="qn done">✓</i><i class="ql done"></i><i class="qn cur">3</i><i class="ql"></i><i class="qn">4</i><i class="ql"></i><i class="qn pin">📍</i></div>');
  h.push('<div class="profit">×1 profit</div>');
  h.push('<div class="quest-pill"><span class="qt">Собери чаевые</span><span class="qp">3/5</span><span class="qr">' + G.currencyIcon('coins') + '120</span></div>');
  // красный кружок строго над Таверной (центр по оси станции, над крышей). Зона нажатия 44×44.
  const top = 44; // смещение сцены
  const s0 = S.stations[0];
  h.push('<button class="stn-up" style="left:' + (s0.x - 22) + 'px;top:' + (top + s0.y - 126 - 22) + 'px" aria-label="Улучшить"><span class="upcircle">' + ARROW + '</span></button>');

  // карточка станции: ?card=forge (по умолчанию) | alchemist. Узкий плавающий тултип с хвостиком к станции.
  // Каркас статичный, значения обновляет demo.js (updateCard), чтобы кнопка не пересоздавалась во время удержания.
  const which = new URLSearchParams(location.search).get('card') === 'alchemist' ? 'alchemist' : 'forge';
  const CARDS = {
    forge:     { idx: 1, id: 'forge',     name: 'Кузня',   coins: 12400 },
    alchemist: { idx: 2, id: 'alchemist', name: 'Алхимик', coins: 1.5e19 },
  };
  const c = CARDS[which], st = S.stations[c.idx];
  const cardW = 216, cardLeft = Math.max(6, Math.min(360 - cardW - 6 - 64 - 4, st.x - cardW / 2));
  const tail = Math.max(18, Math.min(cardW - 18, st.x - cardLeft));
  h.push('<div class="card" data-card="' + which + '" style="left:' + cardLeft + 'px;top:' + (top + st.y + 8) + 'px;--tail:' + tail + 'px">' +
    '<h3><span class="nm">' + c.name + '</span><span class="lv"></span></h3>' +
    '<div class="stars"></div>' +
    '<div class="bar"><i></i><span></span></div>' +
    '<button class="buy" aria-label="Купить уровень. Удерживайте для серии покупок"><b class="b1">+1 ур.</b><small class="b2"></small></button></div>');


  // большая кнопка каталога
  h.push('<button class="catalog upcircle" aria-label="Каталог улучшений">' + ARROW + '<span class="badge">3</span></button>');
  // таб-бар
  h.push('<nav class="tabbar">' + tabs.map(([id, name], i) => '<button class="tab' + (i === 0 ? ' on' : '') + '">' + G.tabIcons[id] + '<span>' + name + '</span>' + (id === 'chests' ? '<i class="dot"></i>' : '') + '</button>').join('') + '</nav>');
  hud.innerHTML = h.join('');

  window.__hud = { which, card: CARDS[which], pillCoinsEl: document.querySelector('.pill span:nth-of-type(2)'), STAR, LOCK: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 10V7a5 5 0 0 1 10 0v3h1v11H6V10zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>' };

  // масштаб под окно
  function fit() {
    const vp = document.getElementById('viewport'), ph = document.getElementById('phone');
    if (new URLSearchParams(location.search).has('shot')) { // режим съёмки: телефон 360×760 в левом верхнем углу без масштаба
      ph.style.left = '0'; ph.style.top = '0'; ph.style.transform = 'none'; return;
    }
    const s = Math.min(vp.clientWidth / 360, vp.clientHeight / 760);
    ph.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();
})();
