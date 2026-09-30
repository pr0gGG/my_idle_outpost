// Фон сцены: небо, светила, холмы, земля. night: 0 (день) … 1 (ночь).
(function (root) {
  const G = (root.G = root.G || {});
  const V = root.CONFIG.VIEW;

  const HILLS = 'M0 {g} L0 {a} C60 {b} 120 {c} 190 {a} C250 {d} 310 {b} 360 {a} L360 {g} Z';
  function hillPath(g, a, b, c, d) {
    return new Path2D(HILLS.replace(/\{g\}/g, g).replace(/\{a\}/g, a).replace(/\{b\}/g, b)
      .replace(/\{c\}/g, c).replace(/\{d\}/g, d));
  }
  const hillsFar = hillPath(V.GROUND_Y, 235, 205, 250, 215);
  const hillsNear = hillPath(V.GROUND_Y, 265, 250, 280, 245);

  G.drawScene = function (ctx, night, time) {
    const H = Math.round(V.H * V.SCENE_FRAC);
    const sky = ctx.createLinearGradient(0, 0, 0, V.GROUND_Y);
    sky.addColorStop(0, G.mix('sky_day_top', 'sky_night_top', night));
    sky.addColorStop(1, G.mix('sky_day_bot', 'sky_night_bot', night));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, V.W, V.GROUND_Y);

    // солнце опускается, луна поднимается
    ctx.fillStyle = G.color('sun');
    ctx.globalAlpha = 1 - night;
    ctx.beginPath(); ctx.arc(70, 190 + night * 90, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = G.color('moon');
    ctx.globalAlpha = night;
    ctx.beginPath(); ctx.arc(280, 130 - night * 30 + 30, 18, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = G.mix('#c97b4f', '#3a2a55', night); ctx.fill(hillsFar);
    ctx.fillStyle = G.mix('#a8643f', '#2f2246', night); ctx.fill(hillsNear);

    ctx.fillStyle = G.mix('ground_day', 'ground_night', night);
    ctx.fillRect(0, V.GROUND_Y, V.W, H - V.GROUND_Y);
  };
})(window);
