// Станции поста (~90 px шириной, 100 px высотой). Рубежи добавляют детали: флажок, бочка, вывеска, золото, фонари.
(function (root) {
  const G = (root.G = root.G || {});
  const rr = (ctx, x, y, w, h, r) => G.roundRect(ctx, x, y, w, h, r);

  function awning(ctx, colorToken, gold) {
    const c = G.color(colorToken), c2 = G.mix(colorToken, '#ffffff', 0.4);
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(-54, -80); ctx.lineTo(-42, -100); ctx.lineTo(42, -100); ctx.lineTo(54, -80); ctx.closePath(); ctx.fill();
    // полосы
    ctx.save(); ctx.clip();
    ctx.fillStyle = c2;
    for (let i = -5; i < 5; i += 2) ctx.fillRect(i * 10.8, -100, 10.8, 20);
    ctx.restore();
    // фестоны снизу
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? c2 : c;
      ctx.beginPath(); ctx.arc(-43.2 + i * 21.6, -80, 10.8, 0, Math.PI); ctx.fill();
    }
    if (gold) { ctx.strokeStyle = G.color('coin'); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-54, -80); ctx.lineTo(-42, -100); ctx.lineTo(42, -100); ctx.lineTo(54, -80); ctx.stroke(); }
  }

  // Предметы на прилавке по типу станции
  function props(ctx, order, time) {
    if (order === 'food') { // котёл с паром
      ctx.fillStyle = G.color('stone_dark'); ctx.beginPath(); ctx.ellipse(-20, -36, 13, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = G.color('wood_dark'); ctx.fillRect(-33, -38, 26, 4);
      for (let i = 0; i < 3; i++) {
        const p = ((time * 0.6 + i / 3) % 1);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - p)) + ')';
        ctx.beginPath(); ctx.arc(-24 + i * 4 + Math.sin(p * 6 + i) * 2, -44 - p * 16, 3 + p * 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = G.color('skin_2'); ctx.beginPath(); ctx.ellipse(14, -33, 10, 5, 0, Math.PI, 0); ctx.fill(); // хлеб
      ctx.fillStyle = G.color('skin_3'); ctx.beginPath(); ctx.ellipse(28, -33, 7, 4, 0, Math.PI, 0); ctx.fill();
    } else if (order === 'weapon') { // наковальня + уголь
      ctx.fillStyle = G.color('stone_dark'); ctx.fillRect(-26, -34, 28, 6); rr(ctx, -20, -40, 22, 8, 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(2, -39); ctx.lineTo(14, -36); ctx.lineTo(2, -34); ctx.fill();
      const glow = 0.6 + 0.4 * Math.sin(time * 6);
      ctx.fillStyle = 'rgba(255,120,40,' + (0.85 * glow) + ')'; ctx.beginPath(); ctx.ellipse(24, -31, 9, 4, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = G.color('shovel'); ctx.fillRect(34, -46, 3, 18); // меч на стойке
    } else { // бутылки
      const cols = ['cloth_teal', 'cloth_red', 'gem'];
      for (let i = 0; i < 3; i++) {
        const x = -26 + i * 15;
        ctx.fillStyle = G.color(cols[i]); ctx.beginPath(); ctx.arc(x, -34, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = G.color('stone'); ctx.fillRect(x - 2, -46, 4, 7);
      }
      const b = Math.sin(time * 3) * 2;
      ctx.fillStyle = 'rgba(79,214,232,.7)'; ctx.beginPath(); ctx.arc(22, -44 - b, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = G.color('wood'); ctx.fillRect(14, -32, 20, 4);
    }
  }

  // st: {order,color}, opts: {level, tier, scale, time, workerLook, ghost}
  G.drawStation = function (ctx, cx, base, st, o) {
    ctx.save();
    ctx.translate(cx, base);
    if (o.ghost) ctx.globalAlpha = 0.3;
    ctx.scale(o.scale || 1, o.scale || 1);
    const tier = o.tier || 0, time = o.time || 0;
    // задняя стенка
    ctx.fillStyle = G.mix('wood_dark', 'ui_bg', 0.55); ctx.fillRect(-42, -82, 84, 60);
    if (!o.ghost && o.workerLook) G.drawPerson(ctx, 8, -26, o.workerLook, -1, null, 1.15, st.color);
    // столбы
    ctx.fillStyle = G.color('wood_dark'); ctx.fillRect(-46, -84, 6, 84); ctx.fillRect(40, -84, 6, 84);
    // бочка (рубеж 2)
    if (tier >= 2) {
      ctx.fillStyle = G.color('wood'); rr(ctx, -66, -24, 18, 24, 5); ctx.fill();
      ctx.fillStyle = G.color('stone_dark'); ctx.fillRect(-66, -18, 18, 2.5); ctx.fillRect(-66, -8, 18, 2.5);
    }
    // прилавок
    ctx.fillStyle = G.color('wood'); ctx.fillRect(-46, -26, 92, 26);
    ctx.fillStyle = G.mix('wood', 'sun', 0.3); ctx.fillRect(-49, -29, 98, 5);
    ctx.fillStyle = G.color('wood_dark'); ctx.fillRect(-46, -7, 92, 7);
    if (tier >= 4) { ctx.fillStyle = G.color('coin'); ctx.fillRect(-49, -29, 98, 2); ctx.fillRect(-46, -8, 92, 1.5); }
    props(ctx, st.order, time);
    awning(ctx, st.color, tier >= 4);
    // флажок (рубеж 1)
    if (tier >= 1) {
      ctx.fillStyle = G.color('wood_dark'); ctx.fillRect(34, -124, 2, 24);
      ctx.fillStyle = G.color('ui_accent');
      const w = Math.sin(time * 4) * 2;
      ctx.beginPath(); ctx.moveTo(36, -124); ctx.lineTo(50 + w, -119); ctx.lineTo(36, -113); ctx.fill();
    }
    // вывеска (рубеж 3)
    if (tier >= 3) {
      ctx.strokeStyle = G.color('wood_dark'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(24, -80); ctx.lineTo(24, -72); ctx.moveTo(40, -80); ctx.lineTo(40, -72); ctx.stroke();
      ctx.fillStyle = G.color('wood'); rr(ctx, 20, -72, 24, 16, 3); ctx.fill();
      G.drawOrderIcon(ctx, st.order, 32, -64);
    }
    // фонари и навершие (рубеж 5)
    if (tier >= 5) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 3);
      for (const lx of [-50, 50]) {
        ctx.fillStyle = 'rgba(255,207,63,' + (0.25 + 0.2 * pulse) + ')'; ctx.beginPath(); ctx.arc(lx, -74, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = G.color('coin'); rr(ctx, lx - 4, -80, 8, 10, 3); ctx.fill();
      }
      ctx.fillStyle = G.color('coin'); ctx.beginPath(); ctx.moveTo(0, -114); ctx.lineTo(6, -100); ctx.lineTo(-6, -100); ctx.fill();
    }
    ctx.restore();
  };

  // Полоска прогресса цикла над станцией
  G.drawProgress = function (ctx, cx, y, p, colorToken) {
    const w = 72, h = 7;
    ctx.fillStyle = 'rgba(42,27,46,.75)'; rr(ctx, cx - w / 2, y, w, h, 3.5); ctx.fill();
    if (p > 0) { ctx.fillStyle = G.color(colorToken === 'cloth_teal' ? 'gem' : 'ui_accent'); rr(ctx, cx - w / 2 + 1, y + 1, Math.max(5, (w - 2) * Math.min(1, p)), h - 2, 2.5); ctx.fill(); }
  };

  // Уровень на прилавке
  G.drawLevelBadge = function (ctx, cx, base, level) {
    ctx.save(); ctx.translate(cx, base - 13);
    ctx.fillStyle = G.color('ui_bg'); ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = G.color('ui_accent'); ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = G.color('ui_text'); ctx.font = 'bold ' + (level >= 100 ? 8 : 10) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(level, 0, 0.5);
    ctx.restore();
  };

  // Стопка монет-чаевых на прилавке
  G.drawTip = function (ctx, x, y, time, phase) {
    const bob = Math.sin(time * 5 + phase) * 1.5;
    ctx.save(); ctx.translate(x, y + bob);
    ctx.fillStyle = G.mix('coin', 'ui_bg', 0.35);
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, -i * 3, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = G.color('coin'); ctx.beginPath(); ctx.ellipse(0, -7, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    const tw = 0.5 + 0.5 * Math.sin(time * 7 + phase);
    ctx.fillStyle = 'rgba(255,255,255,' + tw + ')'; ctx.beginPath(); ctx.arc(5, -12, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
})(window);
