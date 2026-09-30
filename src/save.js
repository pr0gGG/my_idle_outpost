// Состояние игры, сохранение в localStorage с версией и миграциями, экспорт/импорт.
(function (root) {
  const G = (root.G = root.G || {});
  const C = root.CONFIG;

  function defaultStations() {
    const out = {};
    for (const loc of C.LOCATIONS) for (const st of loc.stations) out[st.id] = { level: 0 };
    return out;
  }

  function defaultState() {
    return {
      saveVersion: C.SAVE_VERSION,
      createdAt: Date.now(),
      lastSeen: Date.now(),
      res: Object.assign({}, C.START),
      ui: { tab: C.DEFAULT_TAB, battleMode: C.BATTLE_MODES[0] },
      post: { location: 0, stations: defaultStations() },
    };
  }

  // migrations[n] переводит сохранение версии n в версию n+1
  const migrations = {
    // 1: (s) => { ...; s.saveVersion = 2; return s; },
  };

  function migrate(s) {
    while (s.saveVersion < C.SAVE_VERSION) {
      const fn = migrations[s.saveVersion];
      if (!fn) throw new Error('no migration from ' + s.saveVersion);
      s = fn(s);
    }
    return s;
  }

  // Мержит загруженные данные поверх дефолтов, чтобы новые поля не пропадали
  function normalize(loaded) {
    const base = defaultState();
    const s = Object.assign(base, loaded);
    s.res = Object.assign(base.res, loaded.res);
    s.ui = Object.assign(base.ui, loaded.ui);
    const lp = loaded.post || {};
    s.post = Object.assign({}, base.post, lp);
    s.post.stations = Object.assign({}, base.post.stations, lp.stations);
    for (const id in s.post.stations) {
      const lv = s.post.stations[id] && s.post.stations[id].level;
      s.post.stations[id] = { level: Number.isFinite(lv) && lv > 0 ? Math.floor(lv) : 0 };
    }
    delete s.post.buyMode; // режимы ×1/×10/MAX удалены (этап 1.5)
    if (!C.TABS.includes(s.ui.tab)) s.ui.tab = C.DEFAULT_TAB;
    if (!C.BATTLE_MODES.includes(s.ui.battleMode)) s.ui.battleMode = C.BATTLE_MODES[0];
    return s;
  }

  G.parseSave = function (text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj.saveVersion !== 'number') throw new Error('bad save');
    if (obj.saveVersion > C.SAVE_VERSION) throw new Error('save from newer version');
    return normalize(migrate(obj));
  };

  G.load = function () {
    try {
      const text = localStorage.getItem(C.SAVE_KEY);
      if (text) return G.parseSave(text);
    } catch (e) { console.warn('load failed, starting fresh', e); }
    return defaultState();
  };

  G.save = function (state) {
    if (G.suppressSave) return true; // после импорта: не затирать записанное сохранение
    state.lastSeen = Date.now();
    try { localStorage.setItem(C.SAVE_KEY, JSON.stringify(state)); return true; }
    catch (e) { console.warn('save failed', e); return false; }
  };

  // Экспорт/импорт в текст (base64 от JSON) — для переноса между устройствами
  G.exportSave = function (state) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  };
  G.importSave = function (text) {
    return G.parseSave(decodeURIComponent(escape(atob(text.trim()))));
  };

  G.defaultState = defaultState;
})(typeof window !== 'undefined' ? window : globalThis);
