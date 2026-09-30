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

  const h = [];
  h.push('<div class="topbar"><button class="safe" aria-label="Сейф">' + SAFE + '</button>' +
    '<div class="pills"><div class="pill"><span class="ico">' + G.currencyIcon('coins') + '</span><span>12.4K</span><small>+136/с</small></div></div>' +
    '<button class="gear" aria-label="Настройки">' + GEAR + '</button></div>');
  // квесты
  h.push('<div class="quest-nodes"><i class="qn done">✓</i><i class="ql done"></i><i class="qn done">✓</i><i class="ql done"></i><i class="qn cur">3</i><i class="ql"></i><i class="qn">4</i><i class="ql"></i><i class="qn pin">📍</i></div>');
  h.push('<div class="profit">×1 profit</div>');
  h.push('<div class="quest-pill"><span class="qt">Собери чаевые</span><span class="qp">3/5</span><span class="qr">' + G.currencyIcon('coins') + '120</span></div>');
  // красный кружок строго над Таверной (центр по оси станции, над крышей). Зона нажатия 44×44.
  const top = 44; // смещение сцены
  const s0 = S.stations[0];
  h.push('<button class="stn-up" style="left:' + (s0.x - 22) + 'px;top:' + (top + s0.y - 126 - 22) + 'px" aria-label="Улучшить"><span class="upcircle">' + ARROW + '</span></button>');

  // карточка станции: ?card=forge (по умолчанию) | alchemist
  const which = new URLSearchParams(location.search).get('card') === 'alchemist' ? 'alchemist' : 'forge';
  const MSL = [10, 25, 50, 100, 200, 250, 500];
  const CARDS = {
    forge:     { idx: 1, name: 'Кузня',   level: 26,  next: 50,  effect: 'до 50 ур.: цена товара ×3 · цикл −15%', income: fmt(24000), cycle: '3.2с', cost: 379 },
    alchemist: { idx: 2, name: 'Алхимик', level: 260, next: 500, effect: 'до 500 ур.: цена товара ×10 · цикл −25%', income: fmt(7.5e7), cycle: '2.2с', cost: fmt(6.4e9) },
  };
  const c = CARDS[which], st = S.stations[c.idx];
  const win = Economy.starWindow(c.level, MSL, 5);
  const cardW = 236, cardLeft = Math.max(6, Math.min(360 - cardW - 6 - 64 - 4, st.x - cardW / 2));
  const tail = Math.max(18, Math.min(cardW - 18, st.x - cardLeft));
  // заполнение дорожки: звёзды стоят в центрах пяти колонок (10%, 30%, …, 90%); до ближайшей звезды — пропорционально уровню
  const pos = (i) => 0.1 + 0.2 * i;
  const rw = win.filter((w) => w.reached).length;
  let fill;
  if (rw === win.length) fill = 1;
  else if (rw === 0) fill = pos(0) * c.level / win[0].level;
  else fill = pos(rw - 1) + (pos(rw) - pos(rw - 1)) * (c.level - win[rw - 1].level) / (win[rw].level - win[rw - 1].level);
  h.push('<div class="card" data-card="' + which + '" style="left:' + cardLeft + 'px;top:' + (top + st.y + 8) + 'px;--tail:' + tail + 'px">' +
    '<h3>' + c.name + '<span class="lv">Ур. ' + c.level + '</span><span class="inc">' + c.income + '/с · ' + c.cycle + '</span></h3>' +
    '<div class="rb"><div class="track"><i style="width:' + (fill * 100).toFixed(1) + '%"></i></div>' +
    win.map((w) => '<div class="star' + (w.reached ? ' on' : '') + (w.next ? ' next' : '') + '">' + STAR(w.reached) + '<span>' + (w.next ? c.level + '/' + w.level : w.level) + '</span></div>').join('') + '</div>' +
    '<p class="eff">' + c.effect + '</p>' +
    '<div class="row"><div class="seg"><button class="on">×1</button><button>×10</button><button>MAX</button></div>' +
    '<button class="buy">+1 ур.<small>' + G.currencyIcon('coins') + c.cost + '</small></button></div></div>');

  // большая кнопка каталога
  h.push('<button class="catalog upcircle" aria-label="Каталог улучшений">' + ARROW + '<span class="badge">3</span></button>');
  // таб-бар
  h.push('<nav class="tabbar">' + tabs.map(([id, name], i) => '<button class="tab' + (i === 0 ? ' on' : '') + '">' + G.tabIcons[id] + '<span>' + name + '</span>' + (id === 'chests' ? '<i class="dot"></i>' : '') + '</button>').join('') + '</nav>');
  hud.innerHTML = h.join('');

  // масштаб под окно
  function fit() {
    const vp = document.getElementById('viewport'), ph = document.getElementById('phone');
    const s = Math.min(vp.clientWidth / 360, vp.clientHeight / 760);
    ph.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();
})();
