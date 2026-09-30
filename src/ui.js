// DOM-интерфейс: верхняя зона (Сейф, валюты, настройки), панели вкладок-заглушек, нижний таб-бар, красные точки, тосты.
(function (root) {
  const G = (root.G = root.G || {});
  const C = root.CONFIG, S = root.STR;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  const refs = { tabBtns: {}, dots: {}, panels: {}, curChips: {}, dropRows: {}, incomeEl: null };
  let state, onTabChange;

  // Проверки красных точек на вкладках (условия — GAME_DESIGN §12.3). Этапы 2a/5/6 подставят настоящие.
  G.badgeChecks = { post: () => false, battle: () => false, chests: () => false, inventory: () => false };

  function buildTopbar() {
    const bar = $('topbar');
    const safe = el('button', 'safe', G.icons.safe); safe.id = 'btn-safe'; safe.setAttribute('aria-label', S.post.safe);
    safe.addEventListener('click', () => G.toast(S.soon.safe));
    const pills = el('button', 'cur-bar'); pills.id = 'cur-bar'; pills.setAttribute('aria-haspopup', 'true'); pills.setAttribute('aria-expanded', 'false');
    const gear = el('button', 'gear', G.icons.gear); gear.id = 'btn-settings'; gear.setAttribute('aria-label', S.settings.open);
    const drop = el('div', 'cur-drop'); drop.id = 'cur-drop'; drop.hidden = true;
    drop.appendChild(el('div', 'cur-drop-title', S.allCurrencies));
    for (const id of C.CURRENCIES) {
      const row = el('div', 'cur-row', '<span class="ico">' + G.currencyIcon(id) + '</span><span class="nm">' + S.currencies[id] + '</span>');
      const val = el('span', 'val'); row.appendChild(val);
      refs.dropRows[id] = val; drop.appendChild(row);
    }
    bar.append(safe, pills, gear, drop);
    refs.curBar = pills; refs.drop = drop;
    pills.addEventListener('click', (e) => { e.stopPropagation(); toggleDrop(); G.updateCurrencies(); });
    document.addEventListener('click', (e) => { if (!refs.drop.hidden && !refs.drop.contains(e.target)) toggleDrop(false); });
  }

  function toggleDrop(force) {
    const open = force === undefined ? refs.drop.hidden : force;
    refs.drop.hidden = !open;
    refs.curBar.setAttribute('aria-expanded', String(open));
  }

  // Валюты текущей вкладки — «таблетки» с крупными иконками
  function renderCurChips() {
    refs.curBar.innerHTML = ''; refs.curChips = {}; refs.incomeEl = null;
    for (const id of C.TAB_CURRENCIES[state.ui.tab]) {
      const chip = el('span', 'pill', '<span class="ico">' + G.currencyIcon(id) + '</span>');
      const v = el('b', 'val'); chip.appendChild(v);
      if (id === 'coins' && state.ui.tab === 'post') { refs.incomeEl = el('small', 'income'); chip.appendChild(refs.incomeEl); }
      refs.curBar.appendChild(chip); refs.curChips[id] = v;
    }
    refs.curBar.setAttribute('aria-label', S.allCurrencies);
  }

  // Панели вкладок-заглушек: у «Поста» панели нет — вся сцена интерактивна
  function buildPanels() {
    const host = $('panel');
    const battle = el('section', 'tab-panel'); battle.dataset.tab = 'battle';
    const seg = el('div', 'segment'); seg.setAttribute('role', 'tablist');
    const hint = el('p', 'hint');
    for (const m of C.BATTLE_MODES) {
      const b = el('button', 'seg-btn', S.battleModes[m]); b.dataset.mode = m; b.setAttribute('role', 'tab');
      b.addEventListener('click', () => { state.ui.battleMode = m; renderBattleMode(); });
      seg.appendChild(b);
    }
    battle.append(seg, hint);
    refs.seg = seg; refs.battleHint = hint;
    const chests = el('section', 'tab-panel'); chests.dataset.tab = 'chests'; chests.appendChild(el('p', 'hint', S.chests.placeholder));
    const inv = el('section', 'tab-panel'); inv.dataset.tab = 'inventory'; inv.appendChild(el('p', 'hint', S.inventory.placeholder));
    for (const p of [battle, chests, inv]) { host.appendChild(p); refs.panels[p.dataset.tab] = p; }
  }

  function renderBattleMode() {
    const m = state.ui.battleMode;
    for (const b of refs.seg.children) { const on = b.dataset.mode === m; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); }
    refs.battleHint.textContent = S.battle.placeholder[m];
  }

  function buildTabbar() {
    const nav = $('tabbar');
    for (const id of C.TABS) {
      const b = el('button', 'tab-btn', G.tabIcons[id] + '<span class="lbl">' + S.tabs[id] + '</span>');
      b.dataset.tab = id; b.setAttribute('aria-label', S.tabs[id]);
      const dot = el('i', 'dot'); dot.hidden = true; b.appendChild(dot);
      b.addEventListener('click', () => G.setTab(id));
      nav.appendChild(b); refs.tabBtns[id] = b; refs.dots[id] = dot;
    }
  }

  G.setTab = function (id) {
    if (!C.TABS.includes(id)) return;
    state.ui.tab = id;
    for (const t of C.TABS) {
      refs.tabBtns[t].classList.toggle('active', t === id);
      refs.tabBtns[t].setAttribute('aria-current', t === id ? 'page' : 'false');
      if (refs.panels[t]) refs.panels[t].hidden = t !== id;
    }
    $('panel').hidden = id === 'post';
    $('hud').hidden = id !== 'post';
    if (G.closeCard) G.closeCard();
    toggleDrop(false);
    renderCurChips();
    G.updateCurrencies();
    if (onTabChange) onTabChange(id);
  };

  G.updateCurrencies = function () {
    for (const id in refs.curChips) refs.curChips[id].textContent = G.fmt(state.res[id]);
    if (refs.incomeEl) refs.incomeEl.textContent = '+' + G.fmt(G.post.totalIncomePerSec()) + S.post.perSec;
    if (!refs.drop.hidden) for (const id in refs.dropRows) refs.dropRows[id].textContent = G.fmt(state.res[id]);
  };

  G.updateBadges = function () { for (const id of C.TABS) refs.dots[id].hidden = !G.badgeChecks[id](); };

  let toastTimer;
  G.toast = function (text) {
    const t = $('toast'); t.textContent = text; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  };

  G.initUI = function (st, opts) {
    state = st; onTabChange = opts.onTabChange;
    buildTopbar(); buildPanels(); buildTabbar();
    renderBattleMode();
    G.initSettings(state);
    G.buildHud(state);
    G.setTab(state.ui.tab);
    G.updateBadges();
  };
})(window);
