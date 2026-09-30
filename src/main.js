// Точка входа: состояние, подгонка под экран (ширина 360, высота 640–800), offscreen-слои, игровой цикл, автосохранение.
(function () {
  const G = window.G, C = CONFIG, V = C.VIEW;
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = G.state = G.load();
  document.title = STR.title;

  const vp = $('viewport'), game = $('game'), canvas = $('scene'), ctx = canvas.getContext('2d');
  const layers = { back: document.createElement('canvas'), mid: document.createElement('canvas'), front: document.createElement('canvas') };
  let renderScale = 1, sceneH = 0;

  // Логическая высота игры подстраивается под экран (640…800), ширина всегда 360. Сцена — всё между верхней полосой и таб-баром.
  function resize() {
    const vw = vp.clientWidth, vh = vp.clientHeight;
    const Htot = Math.max(V.Hmin, Math.min(V.Hmax, vh / (vw / V.W)));
    const s = Math.min(vw / V.W, vh / Htot);
    game.style.width = V.W + 'px'; game.style.height = Htot + 'px';
    game.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    const newSceneH = Math.round(Htot - V.TOPBAR_H - V.TABBAR_H);
    const r = Math.min(V.DPR_MAX, Math.max(1, Math.ceil((window.devicePixelRatio || 1) * s)));
    if (r === renderScale && newSceneH === sceneH && canvas.width) return;
    renderScale = r; sceneH = newSceneH;
    canvas.style.height = sceneH + 'px';
    canvas.width = V.W * r; canvas.height = sceneH * r;
    G.post.layout(sceneH);
    // статичные слои рисуются один раз на размер экрана
    for (const [name, fn] of [['back', 'renderBack'], ['mid', 'renderMid'], ['front', 'renderFront']]) {
      const c = layers[name]; c.width = V.W * r; c.height = sceneH * r;
      const cx = c.getContext('2d'); cx.setTransform(r, 0, 0, r, 0, 0); G.PostArt[fn](cx);
    }
    if (G.layoutHud) G.layoutHud();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // День/ночь: плавный переход при смене вкладки (кроссфейд вида спереди и вида сбоку)
  const isNight = (tab) => C.NIGHT_TABS.includes(tab);
  let night = isNight(state.ui.tab) ? 1 : 0, nightTarget = night;
  const transSec = reduceMotion ? 0.3 : C.DAYNIGHT_TRANSITION_SEC;

  G.post.init(state);
  G.post.layout(Math.round(V.Hmin - V.TOPBAR_H - V.TABBAR_H));   // стартовая раскладка; точная — в resize()
  G.initUI(state, { onTabChange: (tab) => { nightTarget = isNight(tab) ? 1 : 0; } });
  resize();
  // подсказка первого хода: если ничего не куплено и хватает на первую станцию — сразу открываем её карточку
  const first = G.post.stations()[0];
  if (G.post.stations().every((st) => G.post.level(st) < 1) && G.post.affordable(first.id) && state.ui.tab === 'post') G.openCard(first.id);

  // dev-параметр ?open=<id станции> открывает её карточку (используется tools/shot_live.py)
  const openParam = new URLSearchParams(location.search).get('open');
  if (openParam && G.post.def(openParam) && state.ui.tab === 'post') G.openCard(openParam);

  // dev-параметр ?warp=N прокручивает N секунд симуляции до первого кадра (для скриншотов и проверок)
  const warp = parseFloat(new URLSearchParams(location.search).get('warp')) || 0;
  for (let t = 0; t < warp; t += 1 / 30) G.post.update(1 / 30);

  let last = performance.now(), saveAcc = 0, notifyAcc = 0, uiAcc = 0, time = 0;
  function frame(now) {
    const dt = Math.min(C.MAX_DT, (now - last) / 1000); last = now;
    time += dt;
    if (night !== nightTarget) {
      const step = dt / transSec;
      night = night < nightTarget ? Math.min(nightTarget, night + step) : Math.max(nightTarget, night - step);
    }
    saveAcc += dt; notifyAcc += dt; uiAcc += dt;
    G.post.update(dt);
    G.tickHold(dt);
    if (saveAcc >= C.AUTOSAVE_SEC) { saveAcc = 0; G.save(state); }
    if (notifyAcc >= C.NOTIFY_CHECK_SEC) { notifyAcc = 0; G.updateBadges(); }
    if (uiAcc >= 0.12) { uiAcc = 0; G.updateHud(); }

    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    if (night < 1) G.post.draw(ctx, layers);
    if (night > 0) { ctx.globalAlpha = night; G.drawBattleBg(ctx, V.W, sceneH, time); ctx.globalAlpha = 1; }
    G.updateCurrencies();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Нажатие по сцене: чаевые / станция (тултип) / пустое место (закрыть тултип). Экранные координаты → логические.
  canvas.addEventListener('pointerdown', (e) => {
    if (night >= 0.5) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * V.W, y = (e.clientY - rect.top) / rect.height * sceneH;
    const hit = G.post.tap(x, y);
    if (hit && hit.station) G.toggleCard(hit.station); else if (!hit) G.closeCard();
    if (hit) e.preventDefault();
  });

  // Сохранение при сворачивании/закрытии
  document.addEventListener('visibilitychange', () => { if (document.hidden) G.save(state); });
  window.addEventListener('pagehide', () => G.save(state));
})();
