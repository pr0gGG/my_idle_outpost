// Статичная тестовая сцена поста (этап 1.5): вид спереди, слои поле → частокол → дорога → прилавок → двор.
// Палитра-предложение добавляется поверх CONFIG.PALETTE только в прототипе; при переносе уйдёт в config.js.
(function () {
  const P = CONFIG.PALETTE;
  Object.assign(P, {
    sand: '#d9a86a', sand_light: '#ecc994', sand_dark: '#b88445', road: '#c79658', clay: '#a8643f',
    ui_bg: '#2b2d33', ui_panel: '#3b3e46', ui_panel_light: '#4a4e58', ui_text: '#f4f1ea', ui_yellow: '#ffc93c', ui_blue: '#3d8bfd', ui_accent: '#ffc93c',
    state_disabled: '#6b6f78', state_locked: '#8a8e97',
  });
  const col = (t) => P[t] || t;
  const mix = (a, b, t) => G.mix(a, b, t);
  const dark = (c, t) => mix(c, '#2b1a10', t == null ? 0.22 : t);
  const light = (c, t) => mix(c, '#ffffff', t == null ? 0.14 : t);

  const W = 360, H = 660;
  const Y = { fieldEnd: H * 0.22, fenceEnd: H * 0.28, roadEnd: H * 0.38, counterEnd: H * 0.45 };
  const SLOT_X = [45, 135, 225, 315];

  const cv = document.getElementById('scene'), ctx = cv.getContext('2d');
  const dpr = 2;
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);

  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function shadow(x, y, rx, ry, a) {
    ctx.fillStyle = 'rgba(70,40,15,' + (a || 0.3) + ')'; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  // прямоугольник с тёмной нижней кромкой (объём без обводки)
  function block(x, y, w, h, color, r, edge) {
    ctx.save(); rr(x, y, w, h, r || 0); ctx.clip();
    ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x, y, w, Math.max(2, h * 0.12));
    ctx.fillStyle = dark(color, 0.3); ctx.fillRect(x, y + h - (edge || Math.max(3, h * 0.2)), w, edge || Math.max(3, h * 0.2));
    ctx.restore();
  }

  /* ---------------- чиби-человек (лицом к камере) ---------------- */
  // o: skin, cloth, hat(none|hood|cap|hat|band), ears(pointy), face(normal|skull|ghoul), prop(tray|shield|spear|none), scale, apron
  function chibi(x, y, o) {
    const s = o.scale || 1, skin = col(o.skin), cloth = col(o.cloth || 'cloth_teal');
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    shadow(0, 0, 14, 4.6, 0.3);
    // ноги
    ctx.fillStyle = dark(col('wood_dark'), 0.1); rr(-7, -8, 6, 8, 3); ctx.fill(); rr(1, -8, 6, 8, 3); ctx.fill();
    // тело
    block(-10, -23, 20, 17, cloth, 7);
    if (o.apron) { block(-6, -21, 12, 14, col(o.apron), 4); }
    // руки
    ctx.fillStyle = dark(skin, 0.05);
    ctx.beginPath(); ctx.ellipse(-12, -14, 3.2, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -14, 3.2, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    // реквизит перед телом
    if (o.prop === 'tray') { // поднос с товаром
      ctx.fillStyle = dark(col('wood'), 0); rr(-13, -18, 26, 4, 2); ctx.fill();
      ctx.fillStyle = col('skin_3'); ctx.beginPath(); ctx.ellipse(0, -21, 7, 4, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = col('cloth_red'); ctx.beginPath(); ctx.arc(-9, -21, 3, 0, Math.PI * 2); ctx.fill();
    } else if (o.prop === 'shield') {
      ctx.fillStyle = col('wood'); ctx.beginPath(); ctx.arc(-12, -16, 8.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col('stone_dark'); ctx.beginPath(); ctx.arc(-12, -16, 2.8, 0, Math.PI * 2); ctx.fill();
    } else if (o.prop === 'spear') {
      ctx.strokeStyle = col('wood_dark'); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(14, 2); ctx.lineTo(14, -52); ctx.stroke();
      ctx.fillStyle = col('shovel'); ctx.beginPath(); ctx.moveTo(14, -60); ctx.lineTo(18, -50); ctx.lineTo(10, -50); ctx.fill();
    }
    // уши
    if (o.ears === 'pointy') {
      ctx.fillStyle = skin;
      // узкие уши, торчат вверх и назад (не широкие горизонтальные)
      for (const sx of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(sx * 9.5, -38); ctx.quadraticCurveTo(sx * 13, -47, sx * 12, -55); ctx.quadraticCurveTo(sx * 8.5, -47, sx * 6.5, -43); ctx.closePath(); ctx.fill();
        ctx.fillStyle = dark(skin, 0.2); ctx.beginPath(); ctx.moveTo(sx * 9.2, -40); ctx.quadraticCurveTo(sx * 11.4, -46, sx * 11.2, -51); ctx.quadraticCurveTo(sx * 9, -46, sx * 8, -43); ctx.closePath(); ctx.fill();
        ctx.fillStyle = skin;
      }
    }
    // голова (с тёмной нижней кромкой)
    ctx.save(); ctx.beginPath(); ctx.arc(0, -34, 13, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = skin; ctx.fillRect(-14, -48, 28, 28);
    ctx.fillStyle = dark(skin, 0.16); ctx.beginPath(); ctx.ellipse(0, -18, 15, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.ellipse(-4, -43, 7, 3, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // головной убор
    if (o.hat === 'hood') { ctx.fillStyle = dark(cloth, 0.12); ctx.beginPath(); ctx.arc(0, -36, 14.5, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(10, -29); ctx.lineTo(-10, -29); ctx.closePath(); ctx.fill(); }
    if (o.hat === 'cap') { ctx.fillStyle = col(o.hatColor || 'cloth_mustard'); ctx.beginPath(); ctx.arc(0, -38, 13.4, Math.PI, 0); ctx.fill(); ctx.fillRect(-14, -39, 28, 3.5); }
    if (o.hat === 'hat') { ctx.fillStyle = col('wood_dark'); ctx.beginPath(); ctx.ellipse(0, -43, 18, 4.2, 0, 0, Math.PI * 2); ctx.fill(); rr(-9, -56, 18, 14, 5); ctx.fill(); ctx.fillStyle = col('cloth_red'); ctx.fillRect(-9, -47, 18, 3); }
    if (o.hat === 'band') { ctx.fillStyle = col(o.hatColor || 'cloth_red'); ctx.fillRect(-13, -42, 26, 4); }
    // лицо
    const face = o.face || 'normal';
    const ex = 5.2, ey = -33;
    if (face === 'skull') {
      ctx.fillStyle = '#3a3030';
      ctx.beginPath(); ctx.ellipse(-ex, ey, 3.6, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ex, ey, 3.6, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,90,60,.9)'; ctx.beginPath(); ctx.arc(-ex, ey + 0.5, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(ex, ey + 0.5, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a3030'; ctx.fillRect(-4, -25.5, 8, 2.4);
      ctx.fillStyle = skin; for (let i = -3; i <= 3; i += 2) ctx.fillRect(i - 0.4, -25.5, 0.9, 2.4);
    } else {
      for (const sx of [-ex, ex]) {
        ctx.fillStyle = face === 'ghoul' ? '#f2e08a' : '#2b2d33';
        ctx.beginPath(); ctx.ellipse(sx, ey, 3.5, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.ellipse(sx, ey, 3.5, 4, 0, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = dark(skin, 0.28); ctx.fillRect(sx - 4, ey - 5, 8, 4.6); // тяжёлое веко
        ctx.restore();
        ctx.strokeStyle = dark(skin, 0.55); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx - 3.6, ey - 0.4); ctx.lineTo(sx + 3.6, ey - 0.4); ctx.stroke();
        ctx.fillStyle = face === 'ghoul' ? '#3a2a10' : 'rgba(255,255,255,.9)';
        ctx.beginPath(); ctx.arc(sx - 0.8, ey + 1.4, 0.9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(224,110,100,.35)'; ctx.beginPath(); ctx.arc(-9, -28, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(9, -28, 2.6, 0, Math.PI * 2); ctx.fill();
      if (face === 'ghoul') { ctx.fillStyle = '#3a2430'; rr(-5, -27, 10, 5, 2); ctx.fill(); ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-4, -27, 2, 2.4); ctx.fillRect(2, -27, 2, 2.4); }
      else { ctx.strokeStyle = dark(skin, 0.5); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(0, -27.5, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
    }
    ctx.restore();
  }

  /* ---------------- иконки заказа и пузыри ---------------- */
  function orderIcon(kind, x, y) {
    ctx.save(); ctx.translate(x, y);
    if (kind === 'food') {
      ctx.fillStyle = col('wood'); ctx.beginPath(); ctx.ellipse(-1, -1, 7, 5.5, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = light(col('wood'), 0.25); ctx.beginPath(); ctx.ellipse(-3, -3, 3, 1.8, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col('skin_1'); ctx.fillRect(4, 2, 6, 2.6); ctx.beginPath(); ctx.arc(10, 3.3, 2.2, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'weapon') {
      ctx.fillStyle = col('shovel'); ctx.beginPath(); ctx.moveTo(-6, 7); ctx.lineTo(-8, -8); ctx.lineTo(-4.5, -8); ctx.lineTo(3, 4); ctx.fill();
      ctx.fillStyle = col('wood'); ctx.fillRect(-2, 2.5, 9, 3); ctx.fillRect(2.5, 5, 3, 6);
    } else {
      ctx.fillStyle = col('cloth_teal'); ctx.beginPath(); ctx.arc(0, 2, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col('stone'); ctx.fillRect(-2.2, -9, 4.4, 7);
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-2.4, 0, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // пузырь заказа: иконка товара + число в кружке; check = выдан (зелёная галочка)
  function bubble(x, y, kind, count, check) {
    ctx.save(); ctx.translate(x, y);
    shadow(0, 3, 13, 3, 0.18);
    ctx.fillStyle = '#fbf6ea'; rr(-19, -34, 38, 30, 11); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(0, 2); ctx.lineTo(5, -5); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.08)'; rr(-19, -10, 38, 6, 6); ctx.fill();
    if (check) {
      ctx.fillStyle = col('state_ok'); ctx.beginPath(); ctx.arc(0, -19, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-5, -19); ctx.lineTo(-1.5, -15); ctx.lineTo(5.5, -24); ctx.stroke();
    } else {
      orderIcon(kind, -3, -19);
      ctx.fillStyle = col('ui_yellow'); ctx.beginPath(); ctx.arc(13, -8, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2b2d33'; ctx.font = 'bold 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(count, 13, -7.6);
    }
    ctx.restore();
  }

  /* ---------------- слои ---------------- */
  function drawField() {
    ctx.fillStyle = col('sand'); ctx.fillRect(0, 0, W, Y.fenceEnd + 4);
    // пыльные пятна
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(236,201,148,.55)' : 'rgba(184,132,69,.35)';
      ctx.beginPath(); ctx.ellipse(rnd() * W, 8 + rnd() * (Y.fenceEnd - 40), 20 + rnd() * 30, 4 + rnd() * 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    // сухая трава и камни
    for (let i = 0; i < 26; i++) {
      const x = rnd() * W, y = 20 + rnd() * (Y.fenceEnd - 60);
      ctx.strokeStyle = 'rgba(139,100,48,.65)'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y - 5); ctx.moveTo(x, y); ctx.lineTo(x + 1, y - 6); ctx.moveTo(x, y); ctx.lineTo(x + 3, y - 4); ctx.stroke();
    }
    for (const [x, y, r] of [[30, 96, 6], [330, 84, 7], [262, 128, 5], [110, 70, 4]]) {
      shadow(x + 1, y + r * 0.6, r * 1.3, r * 0.5, 0.25); block(x - r, y - r * 0.8, r * 2, r * 1.6, col('stone'), r * 0.7);
    }
  }
  function drawRoad() {
    const y0 = Y.fenceEnd, y1 = Y.roadEnd;
    ctx.fillStyle = col('road'); ctx.fillRect(0, y0, W, y1 - y0);
    ctx.fillStyle = 'rgba(236,201,148,.4)'; ctx.fillRect(0, y0 + 22, W, 12); ctx.fillRect(0, y0 + 50, W, 10); // колеи
    ctx.fillStyle = 'rgba(184,132,69,.45)'; ctx.fillRect(0, y0 + 36, W, 3);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(139,100,48,.5)'; ctx.beginPath(); ctx.ellipse(rnd() * W, y0 + 6 + rnd() * (y1 - y0 - 12), 1.5 + rnd() * 2, 1 + rnd(), 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(139,100,48,.55)'; ctx.fillRect(0, y0, W, 2.5);
  }
  function drawFence(withEnemies) {
    const base = Y.fenceEnd, top = base - 40;
    // ворота: проём по центру
    const gapL = 148, gapR = 212;
    // колья
    for (let x = -4; x < W + 8; x += 13) {
      if (x + 12 > gapL && x < gapR) continue;
      const h = 40 + ((x * 7) % 5);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base - h + 9); ctx.lineTo(x + 6, base - h); ctx.lineTo(x + 12, base - h + 9); ctx.lineTo(x + 12, base); ctx.closePath(); ctx.clip();
      ctx.fillStyle = col('wood'); ctx.fillRect(x, base - h, 12, h);
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x, base - h, 5, h);
      ctx.fillStyle = dark(col('wood'), 0.35); ctx.fillRect(x, base - 9, 12, 9);
      ctx.restore();
    }
    // перекладины
    for (const [a, b] of [[-4, gapL], [gapR, W + 4]]) {
      block(a, base - 27, b - a, 6, col('wood_dark'), 2, 2); block(a, base - 12, b - a, 6, col('wood_dark'), 2, 2);
    }
    // створки ворот (распахнуты)
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? gapL : gapR;
      ctx.fillStyle = dark(col('wood'), 0.1); ctx.beginPath();
      ctx.moveTo(x0, base); ctx.lineTo(x0, base - 44); ctx.lineTo(x0 + side * 16, base - 40); ctx.lineTo(x0 + side * 16, base + 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col('wood_dark'); ctx.fillRect(x0 + side * 6, base - 40, 2.5, 40);
    }
    // столбы ворот и факелы
    for (const x of [gapL - 8, gapR + 2]) {
      block(x, base - 58, 10, 58, col('wood_dark'), 3);
      ctx.fillStyle = col('stone_dark'); rr(x - 1, base - 66, 12, 9, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,170,60,.28)'; ctx.beginPath(); ctx.arc(x + 5, base - 76, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(x + 5, base - 88); ctx.quadraticCurveTo(x + 12, base - 76, x + 5, base - 68); ctx.quadraticCurveTo(x - 2, base - 76, x + 5, base - 88); ctx.fill();
      ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.ellipse(x + 5, base - 73, 2.4, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
    shadow(W / 2, base + 3, 190, 3, 0.15);
  }
  function drawEnemiesBehind() {
    const E = [
      { x: 22, y: 122, sc: 0.8, skin: '#e8e4d8', cloth: 'stone_dark', face: 'skull', prop: 'spear' },
      { x: 88, y: 170, sc: 1.0, skin: 'goblin', cloth: 'wood', ears: 'pointy', hat: 'band', hatColor: 'cloth_red' },
      { x: 122, y: 118, sc: 0.78, skin: 'undead', cloth: 'stone_dark', face: 'ghoul' },
      { x: 250, y: 124, sc: 0.8, skin: 'goblin', cloth: 'cloth_mustard', ears: 'pointy', prop: 'shield' },
      { x: 288, y: 172, sc: 1.02, skin: '#e8e4d8', cloth: 'stone', face: 'skull' },
      { x: 334, y: 170, sc: 1.0, skin: 'undead', cloth: 'wood_dark', face: 'ghoul', hat: 'hood' },
    ];
    E.sort((a, b) => a.y - b.y).forEach((e) => chibi(e.x, e.y, Object.assign({ scale: e.sc }, e, { skin: P[e.skin] || e.skin })));
  }
  function drawCounter() {
    const top = Y.roadEnd, h = Y.counterEnd - Y.roadEnd;
    // верх столешницы (вид чуть сверху)
    ctx.fillStyle = light(col('wood'), 0.3); ctx.fillRect(-2, top, W + 4, 14);
    ctx.fillStyle = 'rgba(110,63,37,.25)';
    for (let x = 0; x < W; x += 28) ctx.fillRect(x, top, 1.5, 14);
    // передняя панель
    block(-2, top + 14, W + 4, h - 14, col('wood'), 0, 8);
    ctx.fillStyle = 'rgba(110,63,37,.3)';
    for (let x = 14; x < W; x += 30) ctx.fillRect(x, top + 16, 2, h - 30);
    // гирлянда флажков по передней панели
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = [col('cloth_red'), col('cloth_mustard'), col('cloth_teal')][i % 3];
      const x = 6 + i * 30; ctx.beginPath(); ctx.moveTo(x, top + 17); ctx.lineTo(x + 16, top + 17); ctx.lineTo(x + 8, top + 30); ctx.fill();
    }
    // метки слотов на столешнице
    for (const x of SLOT_X) { ctx.fillStyle = 'rgba(110,63,37,.3)'; ctx.beginPath(); ctx.ellipse(x, top + 7, 16, 3.6, 0, 0, Math.PI * 2); ctx.fill(); }
  }

  /* ---------------- станции ---------------- */
  const MS = [10, 25, 50, 100, 200, 250, 500];
  function awning(colorTok, gold) {
    const c = col(colorTok), c2 = light(c, 0.38);
    // крыша сверху (видна поверхность)
    ctx.fillStyle = light(c, 0.22); ctx.beginPath(); ctx.moveTo(-50, -92); ctx.lineTo(-42, -108); ctx.lineTo(42, -108); ctx.lineTo(50, -92); ctx.closePath(); ctx.fill();
    // фронтальная полосатая часть
    ctx.save(); rr(-52, -92, 104, 18, 3); ctx.clip();
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? c2 : c; ctx.fillRect(-52 + i * 13, -92, 13, 18); }
    ctx.fillStyle = dark(c, 0.3); ctx.fillRect(-52, -78, 104, 4);
    ctx.restore();
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? c2 : c; ctx.beginPath(); ctx.arc(-45.5 + i * 13, -74, 6.5, 0, Math.PI); ctx.fill(); }
    if (gold) { ctx.strokeStyle = col('coin'); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-50, -92); ctx.lineTo(-42, -108); ctx.lineTo(42, -108); ctx.lineTo(50, -92); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-52, -92); ctx.lineTo(52, -92); ctx.stroke(); }
  }
  function stationProps(kind) {
    if (kind === 'food') {
      ctx.fillStyle = col('stone_dark'); ctx.beginPath(); ctx.ellipse(-22, -38, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dark(col('stone_dark'), 0.3); ctx.beginPath(); ctx.ellipse(-22, -36, 13, 6, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-26 + i * 5, -49 - i * 5, 3 + i, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = col('skin_2'); ctx.beginPath(); ctx.ellipse(14, -34, 10, 5, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = col('skin_3'); ctx.beginPath(); ctx.ellipse(28, -34, 7, 4, 0, Math.PI, 0); ctx.fill();
    } else if (kind === 'weapon') {
      ctx.fillStyle = col('stone_dark'); rr(-28, -40, 26, 7, 2); ctx.fill(); ctx.fillRect(-20, -34, 10, 6);
      ctx.beginPath(); ctx.moveTo(-2, -39); ctx.lineTo(10, -36); ctx.lineTo(-2, -33); ctx.fill();
      ctx.fillStyle = 'rgba(255,120,40,.95)'; ctx.beginPath(); ctx.ellipse(24, -33, 9, 4, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,200,80,.9)'; ctx.beginPath(); ctx.ellipse(24, -34, 5, 2, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = col('shovel'); ctx.fillRect(35, -50, 3, 18);
    } else {
      [['cloth_teal', -26], ['cloth_red', -11], ['gem', 4]].forEach(([c, x]) => {
        ctx.fillStyle = col(c); ctx.beginPath(); ctx.arc(x, -36, 6.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(x - 2, -38, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col('stone'); ctx.fillRect(x - 2, -48, 4, 7);
      });
      ctx.fillStyle = col('wood'); rr(14, -34, 22, 5, 2); ctx.fill();
    }
  }
  function station(cx, base, def, o) {
    const tier = MS.filter((m) => o.level >= m);
    ctx.save(); ctx.translate(cx, base);
    if (o.bounce != null) { const k = 1 + 0.08 * Math.sin(Math.PI * o.bounce); ctx.scale(k, k); } // пружинка при покупке (ART_GUIDE §8)
    shadow(0, 2, 58, 9, 0.28);
    // задняя стенка и работник
    block(-42, -90, 84, 60, mix('wood_dark', 'ui_bg', 0.5), 2, 6);
    chibi_at(0, -30, o.worker);
    // столбы
    block(-48, -92, 7, 92, col('wood_dark'), 2); block(41, -92, 7, 92, col('wood_dark'), 2);
    // бочка (рубеж 50)
    if (o.level >= 50) { const bx = cx < 180 ? 50 : -72; shadow(bx + 11, 1, 14, 3.5, 0.25); block(bx, -28, 22, 28, col('wood'), 7); ctx.fillStyle = col('stone_dark'); ctx.fillRect(bx, -21, 22, 3); ctx.fillRect(bx, -9, 22, 3); }
    // прилавок: столешница сверху + фасад
    ctx.fillStyle = light(col('wood'), 0.3); ctx.fillRect(-52, -38, 104, 8);
    block(-52, -30, 104, 30, col('wood'), 2, 8);
    if (o.level >= 250) { ctx.fillStyle = col('coin'); ctx.fillRect(-52, -38, 104, 2); ctx.fillRect(-52, -10, 104, 2); }
    stationProps(def.order);
    awning(def.color, o.level >= 250);
    if (o.level >= 10) { ctx.fillStyle = col('wood_dark'); ctx.fillRect(38, -126, 2.5, 20); ctx.fillStyle = col('ui_yellow'); ctx.beginPath(); ctx.moveTo(40, -126); ctx.lineTo(55, -121); ctx.lineTo(40, -115); ctx.fill(); }
    if (o.level >= 100) {
      ctx.strokeStyle = col('wood_dark'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(24, -74); ctx.lineTo(24, -66); ctx.moveTo(42, -74); ctx.lineTo(42, -66); ctx.stroke();
      block(20, -66, 26, 18, col('wood'), 4); orderIcon(def.order, 33, -57);
    }
    // уровень
    ctx.fillStyle = col('ui_bg'); ctx.beginPath(); ctx.arc(0, -14, 10.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = col('ui_yellow'); ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = col('ui_text'); ctx.font = 'bold ' + (o.level >= 100 ? 8.5 : 10.5) + 'px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.level, 0, -13.4);
    ctx.restore();
  }
  function chibi_at(x, y, look) { chibi(x, y, look); }

  /* ---------------- реквизит двора ---------------- */
  function drawYardGround() {
    const y0 = Y.counterEnd;
    ctx.fillStyle = col('sand_light'); ctx.fillRect(0, y0, W, H - y0);
    // плитка двора
    for (let y = y0 + 6, r = 0; y < H; y += 26, r++) for (let x = (r % 2) * 20 - 20; x < W; x += 40) {
      ctx.fillStyle = (x + y) % 3 ? 'rgba(184,132,69,.16)' : 'rgba(184,132,69,.26)'; rr(x + 2, y + 2, 36, 22, 5); ctx.fill();
    }
    for (let i = 0; i < 30; i++) { ctx.fillStyle = 'rgba(139,100,48,.35)'; ctx.beginPath(); ctx.ellipse(rnd() * W, y0 + 10 + rnd() * (H - y0 - 20), 1.5 + rnd() * 2, 1 + rnd(), 0, 0, Math.PI * 2); ctx.fill(); }
  }
  function barrel(x, y) { shadow(x, y + 1, 15, 4, 0.28); block(x - 13, y - 28, 26, 28, col('wood'), 8); ctx.fillStyle = col('stone_dark'); ctx.fillRect(x - 13, y - 21, 26, 3); ctx.fillRect(x - 13, y - 9, 26, 3); ctx.fillStyle = dark(col('wood'), 0.35); ctx.beginPath(); ctx.ellipse(x, y - 28, 13, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = light(col('wood'), 0.1); ctx.beginPath(); ctx.ellipse(x, y - 28.5, 11, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  function crate(x, y, s) { s = s || 1; shadow(x, y + 1, 18 * s, 4.5, 0.28); block(x - 16 * s, y - 28 * s, 32 * s, 28 * s, col('wood'), 3, 6 * s); ctx.strokeStyle = dark(col('wood'), 0.4); ctx.lineWidth = 2; ctx.strokeRect(x - 12 * s, y - 24 * s, 24 * s, 18 * s); ctx.beginPath(); ctx.moveTo(x - 12 * s, y - 24 * s); ctx.lineTo(x + 12 * s, y - 6 * s); ctx.stroke(); }
  function sack(x, y) { shadow(x, y + 1, 14, 4, 0.26); ctx.fillStyle = col('skin_2'); ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.quadraticCurveTo(x - 16, y - 18, x - 5, y - 26); ctx.lineTo(x + 5, y - 26); ctx.quadraticCurveTo(x + 16, y - 18, x + 12, y); ctx.closePath(); ctx.fill(); ctx.fillStyle = dark(col('skin_2'), 0.3); ctx.fillRect(x - 12, y - 5, 24, 5); ctx.fillStyle = col('cloth_red'); ctx.fillRect(x - 6, y - 27, 12, 3); }
  function hay(x, y) { shadow(x, y + 1, 22, 5, 0.26); block(x - 20, y - 22, 40, 22, col('coin'), 6, 6); ctx.strokeStyle = 'rgba(110,63,37,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 7, y - 22); ctx.lineTo(x - 7, y); ctx.moveTo(x + 7, y - 22); ctx.lineTo(x + 7, y); ctx.stroke(); }
  function cart(x, y) {
    shadow(x, y + 2, 34, 6, 0.26);
    block(x - 28, y - 30, 56, 20, col('wood'), 5, 6); ctx.fillStyle = col('wood_dark'); ctx.fillRect(x - 30, y - 34, 60, 5);
    for (const wx of [x - 16, x + 18]) { ctx.fillStyle = col('wood_dark'); ctx.beginPath(); ctx.arc(wx, y - 8, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = col('wood'); ctx.beginPath(); ctx.arc(wx, y - 8, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = col('stone_dark'); ctx.beginPath(); ctx.arc(wx, y - 8, 2.4, 0, Math.PI * 2); ctx.fill(); }
    sackTop(x + 2, y - 34);
  }
  function sackTop(x, y) { ctx.fillStyle = col('skin_2'); ctx.beginPath(); ctx.ellipse(x, y - 6, 12, 9, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = col('cloth_teal'); ctx.fillRect(x - 10, y - 6, 20, 4); }
  function lampPost(x, y) { shadow(x, y + 1, 10, 3, 0.25); block(x - 3, y - 70, 6, 70, col('wood_dark'), 2); ctx.fillStyle = 'rgba(255,200,80,.3)'; ctx.beginPath(); ctx.arc(x, y - 76, 15, 0, Math.PI * 2); ctx.fill(); block(x - 6, y - 84, 12, 14, col('coin'), 4); }
  function coinTip(x, y) { // парящая вращающаяся монета (кадр «ребром»)
    shadow(x, y + 16, 8, 2.6, 0.22);
    ctx.fillStyle = 'rgba(255,207,63,.3)'; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dark(col('coin'), 0.25); ctx.beginPath(); ctx.ellipse(x, y, 7.5, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col('coin'); ctx.beginPath(); ctx.ellipse(x - 1.4, y, 6.2, 9.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(110,63,37,.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x - 1.4, y, 3.6, 6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff'; for (const [dx, dy, r] of [[11, -10, 2], [-12, -6, 1.5], [9, 10, 1.4]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill(); }
  }
  function floatText(x, y, text, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.font = 'bold 16px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(43,45,51,.85)'; ctx.strokeText(text, x, y); ctx.fillStyle = '#fff'; ctx.fillText(text, x, y); ctx.restore();
  }

  /* ---------------- сборка сцены ---------------- */
  const tav = CONFIG.LOCATIONS[0].stations;
  const workerA = { skin: 'skin_2', cloth: 'cloth_red', apron: '#f4f1ea', hat: 'cap', hatColor: 'cloth_red', scale: 0.92 };
  const workerB = { skin: 'skin_3', cloth: 'cloth_mustard', apron: 'wood_dark', hat: 'band', hatColor: 'stone', scale: 0.92 };
  const workerC = { skin: 'skin_1', cloth: 'cloth_teal', apron: '#f4f1ea', hat: 'hood', scale: 0.92 };
  const walker = { skin: 'skin_4', cloth: 'cloth_mustard', apron: 'wood_dark', hat: 'cap', hatColor: 'stone', prop: 'tray', scale: 1.0 };

  const POS = [{ id: 'tavern', x: 60, y: 428 }, { id: 'forge', x: 180, y: 448 }, { id: 'alchemist', x: 300, y: 428 }];
  const WORKERS = { tavern: workerA, forge: workerB, alchemist: workerC };
  const DEFAULT_STATE = { levels: { tavern: 60, forge: 26, alchemist: 260 }, bounce: {}, popups: [] };

  // state.bounce[id] — фаза пружинки 0..1 (нет ключа — покой); state.popups — всплывающие числа [{x, y, text, a}]
  function render(state) {
    state = state || DEFAULT_STATE;
    seed = 7; ctx.clearRect(0, 0, W, H);
    drawField();
    drawEnemiesBehind();
    drawFence();
    drawRoad();

    // клиенты стоят за прилавком в закреплённых слотах (рисуются до прилавка — нижняя часть скрыта столешницей)
    const clients = [
      { x: SLOT_X[0], skin: 'skin_2', cloth: 'cloth_teal', hat: 'hood', order: 'food', n: 2 },
      { x: SLOT_X[1], skin: 'skin_1', cloth: 'cloth_red', hat: 'hat', order: 'weapon', n: 1 },
      { x: SLOT_X[2], skin: 'skin_3', cloth: 'stone', hat: 'none', order: 'potion', n: 3 },
      { x: SLOT_X[3], skin: 'skin_4', cloth: 'cloth_mustard', hat: 'band', hatColor: 'cloth_red', order: 'food', n: 1, done: true },
    ];
    clients.forEach((c) => chibi(c.x, Y.roadEnd + 13, { skin: c.skin, cloth: c.cloth, hat: c.hat, hatColor: c.hatColor, scale: 1.2 }));
    drawCounter();
    drawYardGround();

    // объекты двора сортируются по y
    const st = (i) => ({ f: () => station(POS[i].x, POS[i].y, tav[i], { level: state.levels[POS[i].id], worker: WORKERS[POS[i].id], bounce: state.bounce[POS[i].id] }), y: POS[i].y });
    const drawables = [
      st(0), st(1), st(2),
      { y: 352, f: () => chibi(120, 352, walker) },
      { y: 344, f: () => sack(338, 352) },
      { y: 612, f: () => cart(58, 618) }, { y: 628, f: () => hay(146, 632) },
      { y: 612, f: () => sack(208, 614) }, { y: 626, f: () => sack(226, 628) },
      { y: 640, f: () => crate(270, 646, 1) }, { y: 600, f: () => lampPost(24, 560) },
    ];
    drawables.sort((a, b) => a.y - b.y).forEach((d) => d.f());

    // поверх: пузыри, чаевые, числа дохода
    clients.forEach((c) => bubble(c.x, Y.roadEnd - 60, c.order, c.n, c.done));
    coinTip(270, Y.roadEnd - 10);
    floatText(300, 318, '+128', 0.95);
    // у Таверны активен красный кружок → цифра дохода скрыта (правило ART_GUIDE §8а)
    (state.popups || []).forEach((p) => floatText(p.x, p.y, p.text, p.a));
  }
  render();
  window.__scene = { W, H, Y, SLOT_X, render, DEFAULT_STATE, stations: POS };
})();
