// Логика поста: станции, клиенты, циклы заказов, чаевые. Формулы — в economy.js, числа — в config.js.
(function (root) {
  const G = (root.G = root.G || {});
  const C = root.CONFIG, E = root.Economy, V = C.VIEW, CU = C.CUSTOMERS;
  const rnd = Math.random;

  let state;
  const runtime = {}; // id → { queue, leaving, progress, bounce, spawnCd, tips, workerLook }

  const stationsOf = () => C.LOCATIONS[state.post.location].stations;
  const levelOf = (st) => state.post.stations[st.id].level;
  const stationX = (i, n) => V.W * (i + 0.5) / n;
  const laneY = (i) => 336 + i * 4;
  const rt = (st) => runtime[st.id] || (runtime[st.id] = { queue: [], leaving: [], progress: 0, bounce: 0, spawnCd: 0, tips: [], workerLook: G.randomLook(rnd) });

  function newCustomer(i) {
    return { x: CU.spawnX, y: laneY(i), tx: CU.spawnX, look: G.randomLook(rnd), facing: -1, walk: 0, arrived: 0 };
  }

  function moveCustomer(c, dt, speed) {
    const d = c.tx - c.x;
    if (Math.abs(d) < 0.5) { c.x = c.tx; c.moving = false; c.arrived += dt; return; }
    c.moving = true; c.arrived = 0;
    c.facing = d > 0 ? 1 : -1;
    c.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
    c.walk += dt;
  }

  function pay(st, r, i, n) {
    const lvl = levelOf(st);
    const amount = E.incomePerCycle(st, lvl, C.MILESTONES);
    state.res.coins += amount;
    const cx = stationX(i, n), c = r.queue.shift();
    r.bounce = C.STATION_VIEW.bounceSec;
    G.fx.coin(cx, V.GROUND_Y - 60);
    G.fx.text(cx, V.GROUND_Y - 116, '+' + G.fmt(amount), 'coin');
    if (c) { c.tx = CU.spawnX + 20; c.facing = 1; r.leaving.push(c); }
    r.queue.forEach((q, k) => { q.tx = cx - k * CU.slotGap; });
    // чаевые
    const T = C.TIPS;
    if (r.tips.length < T.maxPerStation && rnd() < T.chance) {
      r.tips.push({
        x: cx + (rnd() * 56 - 28), y: V.GROUND_Y - 29, phase: rnd() * 6,
        coins: amount * T.coinMult,
        shovels: rnd() < T.shovelChance ? T.shovelAmount : 0,
        brave: rnd() < T.braveChance ? T.braveMin + Math.floor(rnd() * (T.braveMax - T.braveMin + 1)) : 0,
      });
    }
  }

  G.post = {
    init(st) { state = st; },

    update(dt) {
      const list = stationsOf(), n = list.length;
      list.forEach((st, i) => {
        const r = rt(st), lvl = levelOf(st), cx = stationX(i, n);
        if (r.bounce > 0) r.bounce = Math.max(0, r.bounce - dt);
        for (const c of r.leaving) moveCustomer(c, dt, CU.walkSpeed);
        r.leaving = r.leaving.filter((c) => c.x < CU.spawnX + 10);
        if (lvl < 1) return;

        // появление клиентов
        r.spawnCd -= dt;
        if (r.queue.length < CU.queueMax && r.spawnCd <= 0) {
          const c = newCustomer(i); c.tx = cx - r.queue.length * CU.slotGap;
          r.queue.push(c); r.spawnCd = CU.spawnCooldown;
        }
        r.queue.forEach((c, k) => { c.tx = cx - k * CU.slotGap; moveCustomer(c, dt, c.x > c.tx + 40 ? CU.walkSpeed : CU.shuffleSpeed); });

        // цикл: идёт, пока у прилавка есть клиент (или он уже подходит)
        const first = r.queue[0];
        if (first && Math.abs(first.x - first.tx) <= 30) {
          r.progress += dt;
          while (r.progress >= st.cycle) {
            r.progress -= st.cycle;
            pay(st, r, i, n);
            if (!r.queue[0] || Math.abs(r.queue[0].x - r.queue[0].tx) > 30) { r.progress = 0; break; }
          }
        }
      });
      G.fx.update(dt);
    },

    draw(ctx, time) {
      const list = stationsOf(), n = list.length;
      const items = []; // клиенты сортируются по полосе для правильного перекрытия
      list.forEach((st, i) => {
        const r = rt(st), lvl = levelOf(st), cx = stationX(i, n);
        const p = C.STATION_VIEW;
        const sc = r.bounce > 0 ? 1 + p.bounceScale * Math.sin(Math.PI * (1 - r.bounce / p.bounceSec)) : 1;
        G.drawStation(ctx, cx, V.GROUND_Y, st, { tier: E.milestonesReached(lvl, C.MILESTONES), time, scale: sc, workerLook: r.workerLook, ghost: lvl < 1 });
        if (lvl >= 1) {
          G.drawLevelBadge(ctx, cx, V.GROUND_Y, lvl);
          G.drawProgress(ctx, cx, V.GROUND_Y - 116, r.progress / st.cycle, st.color);
          for (const t of r.tips) G.drawTip(ctx, t.x, t.y, time, t.phase);
        }
        for (const c of r.leaving) items.push({ c, st, bubble: false });
        r.queue.forEach((c, k) => items.push({ c, st, bubble: k === 0 && Math.abs(c.x - c.tx) <= 30 }));
      });
      items.sort((a, b) => a.c.y - b.c.y);
      for (const it of items) {
        G.drawPerson(ctx, it.c.x, it.c.y, it.c.look, it.c.facing, it.c.moving ? it.c.walk : null, 1);
        if (it.bubble) G.drawBubble(ctx, it.c.x, it.c.y - 44, it.st.order, Math.min(1, it.c.arrived / 0.2 + 0.05));
      }
      G.fx.draw(ctx);
    },

    // Нажатие по сцене в логических координатах; true если попали в чаевые
    tap(x, y) {
      let best = null, bd = C.TIPS.hitRadius;
      for (const st of stationsOf()) {
        const r = rt(st);
        for (const t of r.tips) {
          const d = Math.hypot(t.x - x, (t.y - 6) - y);
          if (d <= bd) { bd = d; best = { r, t }; }
        }
      }
      if (!best) return false;
      const { r, t } = best;
      r.tips.splice(r.tips.indexOf(t), 1);
      state.res.coins += t.coins;
      G.fx.coin(t.x, t.y); G.fx.text(t.x, t.y - 14, '+' + G.fmt(t.coins), 'coin', 14);
      let dy = 28;
      if (t.shovels) { state.res.shovels += t.shovels; G.fx.text(t.x, t.y - dy, '+' + t.shovels + ' ' + STR.tips.shovel, 'shovel', 12); dy += 14; }
      if (t.brave) { state.res.brave += t.brave; G.fx.text(t.x, t.y - dy, '+' + t.brave + ' ' + STR.tips.brave, 'brave', 12); }
      return true;
    },

    // --- для интерфейса ---
    stations() { return stationsOf(); },
    level: (st) => levelOf(st),
    totalIncomePerSec() { return stationsOf().reduce((s, st) => s + E.incomePerSec(st, levelOf(st), C.MILESTONES), 0); },

    buyInfo(st) {
      const lvl = levelOf(st), coins = state.res.coins, mode = state.post.buyMode;
      let k = E.buyCount(st, lvl, coins, mode, C.BUY_AMOUNT);
      if (k < 1) k = 1; // MAX без денег: показываем цену одного уровня
      const cost = E.bulkCost(st, lvl, k);
      const afford = coins >= cost;
      return { k, cost, afford, missing: Math.max(0, cost - coins) };
    },

    buy(id) {
      const st = stationsOf().find((s) => s.id === id);
      if (!st) return 0;
      const info = G.post.buyInfo(st);
      if (!info.afford || state.res.coins < info.cost) return 0;
      const before = E.milestonesReached(levelOf(st), C.MILESTONES);
      state.res.coins -= info.cost;
      state.post.stations[id].level += info.k;
      const lvl = levelOf(st), i = stationsOf().indexOf(st), cx = stationX(i, stationsOf().length);
      rt(st).bounce = C.STATION_VIEW.bounceSec;
      if (E.milestonesReached(lvl, C.MILESTONES) > before) {
        G.fx.text(cx, V.GROUND_Y - 140, STR.post.milestoneHit.replace('{m}', E.multiplierAt(lvl, C.MILESTONES) / E.multiplierAt(lvl - info.k, C.MILESTONES)), 'ui_accent', 16);
      }
      return info.k;
    },
  };
})(window);
