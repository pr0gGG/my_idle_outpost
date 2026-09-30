// Фон вкладки «Бой» (вид сбоку, ночь): плоское небо без градиента, луна, силуэты холмов, земля. Полноценная сцена — этап 4.
(function (root) {
  const G = (root.G = root.G || {});
  G.drawBattleBg = function (ctx, W, H, time) {
    const P = root.CONFIG.PALETTE, ground = H * 0.66;
    ctx.fillStyle = P.sky_night; ctx.fillRect(0, 0, W, ground);
    // звёзды
    ctx.fillStyle = 'rgba(230,236,255,.75)';
    for (let i = 0; i < 26; i++) { const x = (i * 97) % W, y = 14 + ((i * 53) % Math.floor(ground * 0.6)); ctx.globalAlpha = 0.45 + 0.4 * Math.sin(time * 1.3 + i); ctx.fillRect(x, y, 1.6, 1.6); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = P.moon; ctx.beginPath(); ctx.arc(W * 0.78, ground * 0.3, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = G.mix('sky_night', 'ground_night', 0.55);
    ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(0, ground - 60); ctx.quadraticCurveTo(W * 0.3, ground - 100, W * 0.55, ground - 50); ctx.quadraticCurveTo(W * 0.8, ground - 15, W, ground - 55); ctx.lineTo(W, ground); ctx.fill();
    ctx.fillStyle = P.ground_night; ctx.fillRect(0, ground, W, H - ground);
  };
})(window);
