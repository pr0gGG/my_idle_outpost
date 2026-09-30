// Точка входа: состояние, масштабирование холста, игровой цикл, автосохранение.
(function () {
  const G = window.G, C = CONFIG, V = C.VIEW;
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = G.state = G.load();
  document.title = STR.title;

  const game = $('game'), canvas = $('scene'), ctx = canvas.getContext('2d');
  let renderScale = 1;

  // Подгонка игрового поля 360×640 под экран с сохранением пропорций
  function resize() {
    const vp = $('viewport');
    const s = Math.min(vp.clientWidth / V.W, vp.clientHeight / V.H);
    game.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    const r = Math.min(V.DPR_MAX, Math.max(1, Math.ceil((window.devicePixelRatio || 1) * s)));
    if (r !== renderScale || !canvas.width) {
      renderScale = r;
      canvas.width = V.W * r;
      canvas.height = Math.round(V.H * V.SCENE_FRAC) * r;
    }
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // День/ночь: плавный переход при смене вкладки
  const isNight = (tab) => C.NIGHT_TABS.includes(tab);
  let night = isNight(state.ui.tab) ? 1 : 0;
  let nightTarget = night;
  const transSec = reduceMotion ? 0.3 : C.DAYNIGHT_TRANSITION_SEC;

  G.initUI(state, { onTabChange: (tab) => { nightTarget = isNight(tab) ? 1 : 0; } });
  resize();

  let last = performance.now(), saveAcc = 0, notifyAcc = 0, time = 0;
  function frame(now) {
    const dt = Math.min(C.MAX_DT, (now - last) / 1000); last = now;
    time += dt;
    if (night !== nightTarget) {
      const step = dt / transSec;
      night = night < nightTarget ? Math.min(nightTarget, night + step) : Math.max(nightTarget, night - step);
    }
    saveAcc += dt; notifyAcc += dt;
    if (saveAcc >= C.AUTOSAVE_SEC) { saveAcc = 0; G.save(state); }
    if (notifyAcc >= C.NOTIFY_CHECK_SEC) { notifyAcc = 0; G.updateBadges(); }

    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    G.drawScene(ctx, night, time);
    G.updateCurrencies();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Сохранение при сворачивании/закрытии
  document.addEventListener('visibilitychange', () => { if (document.hidden) G.save(state); });
  window.addEventListener('pagehide', () => G.save(state));
})();
