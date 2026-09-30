// Удержание кнопки покупки: серия покупок по +1 уровню. Чистая логика без DOM — тестируется в Node (tools/test.js).
//   const h = Hold.create(CONFIG.BUY.hold);
//   h.start()      → сколько покупок сделать сейчас (1 — обычное нажатие покупает сразу)
//   h.update(dt)   → сколько покупок пора сделать за прошедшие dt секунд (0, 1 или maxPerUpdate)
//   h.stop()       → отпустили кнопку / ушли с неё / кончились монеты: серия прекращается сразу
(function (root) {
  const Hold = (root.Hold = root.Hold || {});

  // Скорость (покупок/с) через t секунд удержания: rateStart до rampAfter, затем плавно до rateMax
  Hold.rateAt = function (t, c) {
    const k = Math.max(0, Math.min(1, (t - c.rampAfter) / c.rampDuration));
    return c.rateStart + (c.rateMax - c.rateStart) * k;
  };

  Hold.create = function (cfg) {
    const h = { active: false, t: 0, next: 0 };
    h.start = function () { h.active = true; h.t = 0; h.next = cfg.initialDelay; return 1; };
    h.update = function (dt) {
      if (!h.active) return 0;
      h.t += dt;
      let n = 0;
      while (h.active && h.t >= h.next && n < cfg.maxPerUpdate) { n++; h.next += 1 / Hold.rateAt(h.next, cfg); }
      if (h.t >= h.next) h.next = h.t + 1 / Hold.rateAt(h.t, cfg); // лаг: пропущенные покупки не копятся
      return n;
    };
    h.stop = function () { h.active = false; };
    return h;
  };

  if (typeof module !== 'undefined') module.exports = Hold;
})(typeof window !== 'undefined' ? window : globalThis);
