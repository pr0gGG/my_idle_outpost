// Эффекты: летящие монеты к счётчику, всплывающие числа. Не больше MAX_FX одновременно.
(function (root) {
  const G = (root.G = root.G || {});
  const MAX_FX = 40;
  const list = [];
  const COIN_TARGET = { x: 70, y: -8 };   // счётчик монет в верхней полосе (над холстом сцены)

  G.fx = {
    coin(x, y) {
      if (list.length >= MAX_FX) list.shift();
      list.push({ t: 'coin', x, y, sx: x, sy: y, age: 0, dur: 0.45 });
    },
    text(x, y, text, color, size) {
      if (list.length >= MAX_FX) list.shift();
      list.push({ t: 'text', x: Math.max(45, Math.min(315, x)), y, age: 0, dur: 1.1, text, color: color || 'ui_text', size: size || 13 });
    },
    update(dt) {
      for (let i = list.length - 1; i >= 0; i--) { list[i].age += dt; if (list[i].age >= list[i].dur) list.splice(i, 1); }
    },
    draw(ctx) {
      for (const f of list) {
        const p = f.age / f.dur;
        if (f.t === 'coin') {
          const e = p * p; // ускорение к цели
          const x = f.sx + (COIN_TARGET.x - f.sx) * e;
          const y = f.sy + (COIN_TARGET.y - f.sy) * e - Math.sin(p * Math.PI) * 30;
          ctx.fillStyle = G.color('coin'); ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(42,27,46,.35)'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.globalAlpha = 1 - p * p;
          ctx.font = 'bold ' + f.size + 'px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(42,27,46,.8)'; ctx.strokeText(f.text, f.x, f.y - p * 26);
          ctx.fillStyle = G.color(f.color); ctx.fillText(f.text, f.x, f.y - p * 26);
          ctx.globalAlpha = 1;
        }
      }
    },
  };
})(window);
