// Логика поста: станции, клиенты в слотах у прилавка, работники с подносом, чаевые, покупка уровней.
// Экономика не менялась: доход за цикл, рубежи, чаевые — как в этапе 1 (формулы в economy.js, числа в config.js).
// Клиент «занимает» станцию с момента назначения (даже пока подходит к слоту), поэтому цикл станции идёт без простоев.
(function (root) {
  const G = (root.G = root.G || {});
  const C = root.CONFIG, E = root.Economy, CU = C.CUSTOMERS, WK = C.WORKERS, FX = C.BUY.fx, SV = C.STATION_VIEW;
  const rnd = Math.random;
  const PER_SEC = root.STR.post.perSec;

  let state, L = null, time = 0, seq = 0;
  const runtime = {};                 // id станции → { progress, spring, popup, tips, payWalk, lastTargetX }
  let slots = [];                     // клиенты у прилавка (по слотам)
  let leaving = [];                   // обслуженные и уходящие клиенты
  const lastSpring = {};
  let lastSfx = -1, series = 0;

  const stations = () => C.LOCATIONS[state.post.location].stations;
  const levelOf = (st) => state.post.stations[st.id].level;
  const owned = () => stations().filter((st) => levelOf(st) >= 1);
  const rt = (st) => runtime[st.id] || (runtime[st.id] = { progress: 0, spring: null, popup: null, tips: [], payWalk: false, lastTargetX: 0 });
  const stIndex = (id) => stations().findIndex((s) => s.id === id);
  const pos = (id) => L.stationPos(stIndex(id), stations().length);

  // звук-заглушка: журнал вызовов (подключение настоящих звуков — этап 8)
  G.sfx = G.sfx || { log: [], play(name, pitch) { this.log.push({ name, pitch }); if (this.log.length > 50) this.log.shift(); } };

  function newCustomer(i) {
    const counts = {};
    for (const c of slots) if (c) counts[c.station] = (counts[c.station] || 0) + 1;
    const station = root.Slots.pickStation(owned().map((s) => s.id), counts);
    if (!station) return null;
    return { seq: seq++, slot: i, station, state: 'arriving', t: 0, side: rnd() < 0.5 ? -1 : 1, look: G.randomLook(rnd) };
  }

  function pay(st, c) {
    const r = rt(st), p = pos(st.id), lvl = levelOf(st);
    const amount = E.incomePerCycle(st, lvl, C.MILESTONES);
    state.res.coins += amount;
    r.payWalk = true; r.lastTargetX = L.slotX[c.slot];
    const cx = L.slotX[c.slot];
    G.fx.coin(cx, L.slotFootY - 30);
    if (!G.post.affordable(st.id)) G.fx.text(p.x, p.y - 118, '+' + G.fmt(amount), 'coin'); // у станции с красным кружком цифры дохода нет
    // клиент уходит с галочкой, на его слот сразу приходит следующий
    leaving.push({ look: c.look, t: 0, dir: c.side, slot: c.slot, order: st.order });
    slots[c.slot] = newCustomer(c.slot);
    // чаевые
    const T = C.TIPS;
    if (r.tips.length < T.maxPerStation && rnd() < T.chance) {
      r.tips.push({
        x: cx + (rnd() * 40 - 20), phase: rnd() * 6, coins: amount * T.coinMult,
        shovels: rnd() < T.shovelChance ? T.shovelAmount : 0,
        brave: rnd() < T.braveChance ? T.braveMin + Math.floor(rnd() * (T.braveMax - T.braveMin + 1)) : 0,
      });
    }
  }

  // Поза работника: дома (внутри станции) или в пути с подносом к клиенту и обратно (доли цикла станции, config WORKERS)
  function workerPose(st, r, p) {
    const prog = r.progress / st.cycle;
    const c = root.Slots.activeCustomer(slots, st.id);
    const home = { x: p.x, y: p.y + 8 };
    const go = (tx, t, tray) => {
      const e = t * t * (3 - 2 * t);
      return { away: t > 0.001 && t < 0.999, x: home.x + (tx - home.x) * e, y: home.y + (L.counterFrontY - home.y) * e, tray };
    };
    if (c && prog >= WK.walkStart) { r.lastTargetX = L.slotX[c.slot]; return go(r.lastTargetX, Math.min(1, (prog - WK.walkStart) / (WK.walkEnd - WK.walkStart)), true); }
    if (r.payWalk) { if (prog < WK.returnEnd) return go(r.lastTargetX, 1 - prog / WK.returnEnd, false); r.payWalk = false; }
    return { away: false };
  }

  G.post = {
    init(st) { state = st; slots = new Array(CU.slots).fill(null); },

    // Высота сцены изменилась: пересчитать раскладку (после этого нужно перерисовать статичные слои)
    layout(sceneH) { L = G.PostArt.layout(sceneH, CU.slots); return L; },
    L: () => L,

    update(dt) {
      time += dt;
      G.fx.update(dt);
      for (let i = 0; i < slots.length; i++) if (!slots[i]) slots[i] = newCustomer(i);
      for (const c of slots) if (c) { c.t += dt; if (c.state === 'arriving' && c.t >= CU.arriveSec) c.state = 'waiting'; }
      leaving = leaving.filter((c) => (c.t += dt) < CU.leaveSec);

      for (const st of stations()) {
        const r = rt(st);
        if (r.spring != null) { r.spring += dt; if (r.spring >= SV.bounceSec) r.spring = null; }
        if (r.popup) { r.popup.age += dt; if (r.popup.age > 1.4) r.popup = null; }
        if (levelOf(st) < 1) { r.progress = 0; continue; }
        // цикл идёт, пока у станции есть клиент (самый давний необслуженный)
        let c = root.Slots.activeCustomer(slots, st.id);
        if (!c) { r.progress = 0; continue; }
        r.progress += dt;
        while (r.progress >= st.cycle) {
          r.progress -= st.cycle;
          pay(st, c);
          c = root.Slots.activeCustomer(slots, st.id);
          if (!c) { r.progress = 0; break; }
        }
      }
    },

    // Отрисовка: статичные слои (offscreen) + динамика. layers: { back, mid, front } — холсты размером W×H сцены.
    draw(ctx, layers) {
      const A = G.PostArt, n = stations().length;
      ctx.drawImage(layers.back, 0, 0, L.W, L.H);
      A.drawEnemies(ctx, time);
      ctx.drawImage(layers.mid, 0, 0, L.W, L.H);
      // клиенты стоят за прилавком (нижняя часть скрыта столешницей)
      const drawCust = (look, x, alpha) => {
        ctx.globalAlpha = alpha;
        A.chibi(ctx, x, L.slotFootY, { skin: 'skin_' + look.skin, cloth: look.cloth, hat: look.hat, hatColor: look.hatColor, scale: 1.2 });
        ctx.globalAlpha = 1;
      };
      const leaveX = (c) => L.slotX[c.slot] + c.dir * CU.sideOffset * 1.4 * (c.t / CU.leaveSec) ** 2;
      for (const c of slots) {
        if (!c) continue;
        const k = Math.min(1, c.t / CU.arriveSec), e = 1 - (1 - k) * (1 - k);
        drawCust(c.look, L.slotX[c.slot] + c.side * CU.sideOffset * (1 - e), 0.3 + 0.7 * e);
      }
      for (const c of leaving) drawCust(c.look, leaveX(c), 1 - (c.t / CU.leaveSec) ** 2);
      ctx.drawImage(layers.front, 0, 0, L.W, L.H);

      // станции и ходящие работники сортируются по y
      const items = [];
      stations().forEach((st, i) => {
        const r = rt(st), p = L.stationPos(i, n), lvl = levelOf(st);
        const sp = r.spring != null ? r.spring / SV.bounceSec : undefined;
        const w = lvl >= 1 ? workerPose(st, r, p) : null;
        items.push({ y: p.y, f: () => A.station(ctx, p.x, p.y, st, { level: lvl, ghost: lvl < 1, bounce: sp, worker: w && w.away ? null : A.LOOKS[st.id] }) });
        if (w && w.away) items.push({ y: w.y, f: () => A.chibi(ctx, w.x, w.y - Math.abs(Math.sin(time * 9)) * 2.2, Object.assign({}, A.LOOKS[st.id], { prop: w.tray ? 'tray' : undefined, scale: 1.0 })) });
      });
      items.sort((a, b) => a.y - b.y).forEach((it) => it.f());

      // пузыри заказов: ждущие — иконка и число; уходящие — зелёная галочка
      for (const c of slots) if (c && c.state === 'waiting') A.bubble(ctx, L.slotX[c.slot], L.bubbleY, G.post.def(c.station).order, 1, false);
      for (const c of leaving) if (c.t < CU.checkSec) {
        ctx.globalAlpha = 1 - Math.max(0, (c.t - CU.checkSec * 0.6) / (CU.checkSec * 0.4));
        A.bubble(ctx, leaveX(c), L.bubbleY, c.order, 1, true); ctx.globalAlpha = 1;
      }
      // чаевые
      for (const st of stations()) for (const t of rt(st).tips) A.coinTip(ctx, t.x, L.tipY + Math.sin(time * 5 + t.phase) * 1.5);
      // число прироста дохода от покупок: серия сливается в одно, растворяется вверх
      for (const st of stations()) {
        const pp = rt(st).popup; if (!pp) continue;
        const p = pos(st.id);
        A.floatText(ctx, p.x, p.y - 122 - Math.min(pp.age, 1) * 18, '+' + G.fmt(pp.total) + PER_SEC, Math.max(0, 1 - Math.max(0, pp.age - 0.5) / 0.9));
      }
      G.fx.draw(ctx);
    },

    // Нажатие по сцене в логических координатах: чаевые → {tip}, станция → {station: id}, иначе null
    tap(x, y) {
      let best = null, bd = C.TIPS.hitRadius;
      for (const st of stations()) for (const t of rt(st).tips) {
        const d = Math.hypot(t.x - x, (L.tipY - 2) - y);
        if (d <= bd) { bd = d; best = { st, t }; }
      }
      if (best) {
        const { st, t } = best, r = rt(st);
        r.tips.splice(r.tips.indexOf(t), 1);
        state.res.coins += t.coins;
        G.fx.coin(t.x, L.tipY); G.fx.text(t.x, L.tipY - 14, '+' + G.fmt(t.coins), 'coin', 14);
        let dy = 28;
        if (t.shovels) { state.res.shovels += t.shovels; G.fx.text(t.x, L.tipY - dy, '+' + t.shovels + ' ' + STR.tips.shovel, 'shovel', 12); dy += 14; }
        if (t.brave) { state.res.brave += t.brave; G.fx.text(t.x, L.tipY - dy, '+' + t.brave + ' ' + STR.tips.brave, 'brave', 12); }
        return { tip: true };
      }
      const n = stations().length;
      for (let i = 0; i < n; i++) {
        const p = L.stationPos(i, n);
        if (x >= p.x - 54 && x <= p.x + 54 && y >= p.y - 112 && y <= p.y + 10) return { station: stations()[i].id };
      }
      return null;
    },

    // ---- для интерфейса ----
    stations, level: (st) => levelOf(st), stationPos: pos, def: (id) => stations().find((s) => s.id === id),
    totalIncomePerSec() { return stations().reduce((s, st) => s + E.incomePerSec(st, levelOf(st), C.MILESTONES), 0); },

    // цена и доступность следующего уровня
    buyInfo(id) {
      const st = G.post.def(id), lvl = levelOf(st), cost = E.bulkCost(st, lvl, 1), coins = state.res.coins;
      return { level: lvl, cost, afford: coins >= cost, missing: Math.max(0, cost - coins) };
    },
    affordable(id) { return G.post.buyInfo(id).afford; },

    // Покупка одного уровня (тап и каждый шаг удержания) с откликом: пружинка, цифра прироста дохода, звук-заглушка.
    // Эффекты сглажены для быстрой серии (config BUY.fx): пружинка не чаще springMinGap, цифры сливаются в одно.
    buyOne(id, newSeries) {
      const st = G.post.def(id), lvl = levelOf(st);
      const r = E.tryBuyOne(st, lvl, state.res.coins);
      if (!r.bought) return false;
      if (newSeries) series = 0;
      series++;
      const gain = E.incomePerSec(st, lvl + 1, C.MILESTONES) - E.incomePerSec(st, lvl, C.MILESTONES);
      const before = E.milestonesReached(lvl, C.MILESTONES);
      state.res.coins = r.coins; state.post.stations[id].level = r.level;
      const run = rt(st);
      if (time - (lastSpring[id] == null ? -9 : lastSpring[id]) >= FX.springMinGap) { run.spring = 0; lastSpring[id] = time; }
      if (run.popup && time - run.popup.lastBuy < FX.popupMergeSec) { run.popup.total += gain; run.popup.age = Math.min(run.popup.age, 0.25); }
      else run.popup = { total: gain, age: 0, lastBuy: 0 };
      run.popup.lastBuy = time;
      if (time - lastSfx >= FX.sfxMinGap) { G.sfx.play('buy', 1 + 0.06 * Math.min(series - 1, 8)); lastSfx = time; }
      if (E.milestonesReached(r.level, C.MILESTONES) > before) {
        const p = pos(id);
        G.fx.text(p.x, p.y - 140, STR.post.milestoneHit.replace('{m}', E.multiplierAt(r.level, C.MILESTONES) / E.multiplierAt(lvl, C.MILESTONES)), 'ui_accent', 16);
      }
      return true;
    },
  };
})(window);
