// Панель вкладки «Пост»: переключатель ×1/×10/MAX, Сейф, строки станций с кнопками покупки.
(function (root) {
  const G = (root.G = root.G || {});
  const C = root.CONFIG, S = root.STR, E = root.Economy;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const LOCK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M7 10V7a5 5 0 0 1 10 0v3h1v11H6V10zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>';

  const rows = {}; // id → ссылки на узлы
  const modeBtns = {};
  let state, hintedFirstBuy = false;

  G.buildPostPanel = function (host, st) {
    state = st;
    const head = el('div', 'post-head');
    const seg = el('div', 'segment mini'); seg.setAttribute('role', 'group');
    for (const m of C.BUY_MODES) {
      const b = el('button', 'seg-btn', S.post.buyModes[m]); b.dataset.mode = m;
      b.addEventListener('click', () => { state.post.buyMode = m; G.refreshPost(); });
      seg.appendChild(b); modeBtns[m] = b;
    }
    const safe = el('button', 'btn small', S.post.safe); safe.id = 'btn-safe';
    safe.addEventListener('click', () => G.toast(S.soon.safe));
    head.append(seg, safe);
    host.appendChild(head);

    const list = el('div', 'st-list');
    for (const def of G.post.stations()) {
      const row = el('div', 'st-row');
      const dot = el('span', 'st-dot'); dot.style.background = C.PALETTE[def.color];
      const info = el('div', 'st-info');
      const top = el('div', 'st-top');
      const name = el('b', 'st-name', S.stations[def.id].name);
      const lvl = el('span', 'st-lvl'), mult = el('span', 'st-mult'), rate = el('span', 'st-rate');
      top.append(name, lvl, mult, rate);
      const ms = el('div', 'ms'); const fill = el('i', 'ms-fill'); const label = el('span', 'ms-label');
      ms.append(fill, label);
      info.append(top, ms);
      const btn = el('button', 'buy');
      const l1 = el('span', 'buy-l1'), l2 = el('span', 'buy-l2');
      btn.append(l1, l2);
      btn.addEventListener('click', () => { if (G.post.buy(def.id)) G.refreshPost(); });
      row.append(dot, info, btn); list.appendChild(row);
      rows[def.id] = { def, lvl, mult, rate, fill, label, btn, l1, l2 };
    }
    host.appendChild(list);
  };

  const set = (node, text) => { if (node.textContent !== text) node.textContent = text; };

  // Обновляет значения на существующих узлах (кнопки не пересоздаются — клики не теряются)
  G.refreshPost = function () {
    for (const m in modeBtns) { modeBtns[m].classList.toggle('active', m === state.post.buyMode); modeBtns[m].setAttribute('aria-pressed', String(m === state.post.buyMode)); }
    let firstAffordableNew = false;
    for (const id in rows) {
      const r = rows[id], def = r.def, lvl = G.post.level(def);
      const info = G.post.buyInfo(def);
      const mult = E.multiplierAt(lvl, C.MILESTONES);
      set(r.lvl, lvl > 0 ? S.post.level + ' ' + lvl : '');
      set(r.mult, mult > 1 ? '×' + mult : '');
      set(r.rate, lvl > 0 ? '+' + G.fmt(E.incomePerSec(def, lvl, C.MILESTONES)) + S.post.perSec
        : S.post.afterBuy.replace('{n}', G.fmt(E.incomePerSec(def, 1, C.MILESTONES))));
      const next = E.nextMilestone(lvl, C.MILESTONES);
      if (lvl < 1) { r.fill.style.width = '0%'; set(r.label, ''); }
      else if (next) {
        r.fill.style.width = Math.min(100, lvl / next.level * 100) + '%';
        set(r.label, S.post.milestone.replace('{cur}', lvl).replace('{next}', next.level).replace('{m}', next.mult));
      } else { r.fill.style.width = '100%'; set(r.label, S.post.milestoneDone); }

      set(r.l1, lvl < 1 && info.k === 1 ? S.post.buy : S.post.upgrade.replace('{k}', info.k));
      r.btn.classList.toggle('off', !info.afford);
      r.btn.setAttribute('aria-disabled', String(!info.afford));
      if (info.afford) { r.l2.innerHTML = ''; set(r.l2, G.fmt(info.cost)); }
      else r.l2.innerHTML = LOCK + ' ' + S.post.missing.replace('{n}', G.fmt(info.missing));
      if (id === G.post.stations()[0].id) firstAffordableNew = lvl < 1 && info.afford;
    }
    // подсказка: подсветить самую первую покупку
    rows[G.post.stations()[0].id].btn.classList.toggle('pulse', firstAffordableNew);
  };
})(window);
