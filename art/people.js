// Люди: клиенты (путники и беженцы) и работники. Плоский вектор, ~34 px высотой.
(function (root) {
  const G = (root.G = root.G || {});
  const CLOTHES = ['cloth_red', 'cloth_teal', 'cloth_mustard', 'stone'];

  // Случайный облик: тело (вариант), кожа, цвет одежды
  G.randomLook = function (rnd) {
    return { variant: Math.floor(rnd() * 4), skin: 1 + Math.floor(rnd() * 4), cloth: CLOTHES[Math.floor(rnd() * CLOTHES.length)] };
  };

  // Рисует человека с ногами на (x, y). facing: 1 вправо, -1 влево. walk: фаза шага (сек) или null.
  G.drawPerson = function (ctx, x, y, look, facing, walk, scale, apron) {
    const sc = scale || 1;
    const bob = walk != null ? Math.abs(Math.sin(walk * 10)) * 2 : 0;
    const swing = walk != null ? Math.sin(walk * 10) * 4 : 0;
    const skin = G.color('skin_' + look.skin), cloth = G.color(look.cloth);
    const dark = G.mix(look.cloth, 'ui_bg', 0.35);
    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing * sc, sc);
    // тень
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.ellipse(0, bob + 0.5, 9, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    // ноги
    ctx.fillStyle = G.color('wood_dark');
    ctx.fillRect(-5 + swing * 0.4, -10, 4, 10 + (walk != null ? 0 : 0));
    ctx.fillRect(1 - swing * 0.4, -10, 4, 10);
    // рюкзак (вариант 2) — сзади
    if (look.variant === 2) { ctx.fillStyle = G.color('wood'); rr(ctx, -12, -25, 7, 13, 3); ctx.fill(); }
    // тело
    ctx.fillStyle = cloth; rr(ctx, -7, -26, 14, 17, 5); ctx.fill();
    ctx.fillStyle = dark; ctx.fillRect(-7, -14, 14, 3);
    if (apron) { ctx.fillStyle = G.color(apron); rr(ctx, -5, -22, 10, 13, 3); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-5, -22, 10, 2); }
    // рука
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(6.5, -17 + (walk != null ? swing * 0.3 : 0), 2.4, 0, Math.PI * 2); ctx.fill();
    // голова
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -33, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = G.color('ui_bg'); ctx.beginPath(); ctx.arc(2.6, -33.5, 1.1, 0, Math.PI * 2); ctx.fill();
    // головные уборы по варианту
    if (look.variant === 1) { // капюшон беженца
      ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(0, -34, 8, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(7, -31); ctx.lineTo(-7, -31); ctx.fill();
    } else if (look.variant === 3) { // шляпа путника
      ctx.fillStyle = G.color('wood_dark'); ctx.fillRect(-9, -39, 18, 2.5); rr(ctx, -5, -45, 10, 7, 2); ctx.fill();
    } else if (look.variant === 0) { // повязка
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(-7, -37, 14, 2.5);
    }
    ctx.restore();
  };

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  G.roundRect = rr;

  // Иконки заказа в пузыре (центр в x, y; размер ~14 px)
  G.drawOrderIcon = function (ctx, kind, x, y) {
    ctx.save(); ctx.translate(x, y);
    if (kind === 'food') { // окорок
      ctx.fillStyle = G.color('wood'); ctx.beginPath(); ctx.ellipse(-1, -1, 6, 5, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = G.color('skin_1'); ctx.fillRect(3, 2, 6, 2.5); ctx.beginPath(); ctx.arc(9, 3, 2, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'weapon') { // меч
      ctx.fillStyle = G.color('shovel'); ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(-7, -7); ctx.lineTo(-4, -7); ctx.lineTo(3, 3); ctx.fill();
      ctx.fillStyle = G.color('wood'); ctx.fillRect(-2, 2, 8, 2.5); ctx.fillRect(2, 4, 2.5, 6);
    } else { // зелье
      ctx.fillStyle = G.color('cloth_teal'); ctx.beginPath(); ctx.arc(0, 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = G.color('stone'); ctx.fillRect(-2, -8, 4, 6);
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-2, 0, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  // Пузырь заказа над головой клиента
  G.drawBubble = function (ctx, x, y, kind, pop) {
    const s = pop < 1 ? 0.6 + 0.4 * pop : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, pop * 1.5);
    ctx.fillStyle = '#fff4e0';
    rr(ctx, -15, -28, 30, 24, 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(0, 1); ctx.lineTo(4, -5); ctx.fill();
    G.drawOrderIcon(ctx, kind, 0, -16);
    ctx.restore();
  };
})(window);
