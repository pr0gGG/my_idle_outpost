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
  // красный кружок над Таверной (можно улучшить)
  const top = 44; // смещение сцены
  h.push('<button class="stn-up upcircle" style="left:' + (S.stations[0].x - 34) + 'px;top:' + (top + S.stations[0].y - 160) + 'px" aria-label="Улучшить">' + ARROW + '</button>');
  // карточка Кузни
  const cx = S.stations[1].x, cy = top + S.stations[1].y + 10;
  const cardLeft = Math.max(6, Math.min(360 - 216 - 6, cx - 108));
  const stars = [[10, 1], [25, 1], [50, 0, 1], [100, 0], [200, 0]];
  h.push('<div class="card" style="left:' + cardLeft + 'px;top:' + cy + 'px">' +
    '<h3>Кузня <span class="lv">Ур. 26</span><span class="sub">растёт: цена товара</span></h3>' +
    ''+
    '<div class="stars">' + stars.map(([lv, on, next]) => '<div class="star' + (on ? ' on' : '') + (next ? ' next' : '') + '">' + STAR(on) + lv + '</div>').join('') + '</div>' +
    '<div class="bar"><i style="width:' + (26 / 50 * 100) + '%"></i><span>26/50 → ×3 · −15%</span></div>' +
    '<div class="stats"><div class="stat">Доход<b>' + fmt(24000) + '/с</b></div><div class="stat">Цикл<b>3.2 с</b></div></div>' +
    '<div class="row"><div class="seg"><button class="on">×1</button><button>×10</button><button>MAX</button></div>' +
    '<button class="buy">+1 ур.<small>' + G.currencyIcon('coins') + fmt(379) + '</small></button></div></div>');
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
