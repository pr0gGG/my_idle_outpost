// Автотесты: node tools/test.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.join(__dirname, '..');
let passed = 0;
const test = (name, fn) => { try { fn(); passed++; console.log('ok   ' + name); } catch (e) { console.error('FAIL ' + name + '\n  ' + e.message); process.exitCode = 1; } };

globalThis.CONFIG = new Function(fs.readFileSync(path.join(root, 'config.js'), 'utf8') + ';return CONFIG;')();
const fmt = require(path.join(root, 'src/format.js'));
const E = require(path.join(root, 'src/economy.js'));
require(path.join(root, 'src/save.js'));
const C = CONFIG, MS = C.MILESTONES, ST = C.LOCATIONS[0].stations;
const tavern = ST[0];

// ---- форматирование чисел ----
test('fmt: малые числа', () => { assert.strictEqual(fmt(0), '0'); assert.strictEqual(fmt(999), '999'); assert.strictEqual(fmt(5.5), '5.5'); });
test('fmt: K/M/B/T', () => {
  assert.strictEqual(fmt(1234), '1.23K'); assert.strictEqual(fmt(12345), '12.3K'); assert.strictEqual(fmt(123456), '123K');
  assert.strictEqual(fmt(1.5e9), '1.50B'); assert.strictEqual(fmt(2e12), '2.00T');
});
test('fmt: переход через порог и суффиксы aa, ab', () => {
  assert.strictEqual(fmt(999999), '1.00M'); assert.strictEqual(fmt(1e15), '1.00aa'); assert.strictEqual(fmt(1e18), '1.00ab');
});
test('fmt: отрицательные и бесконечность', () => { assert.strictEqual(fmt(-2500), '-2.50K'); assert.strictEqual(fmt(Infinity), '∞'); });

// ---- цены ----
test('цена: первая покупка = baseCost', () => { assert.strictEqual(E.bulkCost(tavern, 0, 1), tavern.baseCost); });
test('цена: шаг n = base*growth^n', () => {
  assert.ok(Math.abs(E.stepCost(tavern, 1) - 11.5) < 1e-9);
  assert.strictEqual(E.bulkCost(tavern, 1, 1), 12);
});
test('цена: пакет ×10 равна сумме шагов (с единым округлением)', () => {
  for (const st of ST) for (const lvl of [0, 1, 9, 10, 57, 200]) {
    let sum = 0; for (let i = 0; i < 10; i++) sum += E.stepCost(st, lvl + i);
    const got = E.bulkCost(st, lvl, 10);
    assert.ok(Math.abs(got - sum) <= 1 + sum * 1e-12, `${st.id} lvl ${lvl}: ${got} vs ${sum}`); // float-погрешность на больших числах
  }
});
test('цена: bulkCost(0) = 0, монотонность по k', () => {
  assert.strictEqual(E.bulkCost(tavern, 5, 0), 0);
  for (let k = 1; k < 50; k++) assert.ok(E.bulkCost(tavern, 3, k + 1) > E.bulkCost(tavern, 3, k));
});

// ---- MAX ----
test('MAX: 0 если не хватает на один уровень', () => { assert.strictEqual(E.maxAffordable(tavern, 0, 9), 0); assert.strictEqual(E.maxAffordable(tavern, 0, 10), 1); });
test('MAX: cost(k) <= coins < cost(k+1) на случайных данных', () => {
  let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let i = 0; i < 2000; i++) {
    const st = ST[Math.floor(rnd() * ST.length)];
    const lvl = Math.floor(rnd() * 300);
    const coins = Math.pow(10, rnd() * 30);
    const k = E.maxAffordable(st, lvl, coins);
    if (k > 0) assert.ok(E.bulkCost(st, lvl, k) <= coins, 'affordable');
    assert.ok(E.bulkCost(st, lvl, k + 1) > coins, `not max: ${st.id} lvl ${lvl} coins ${coins} k ${k}`);
  }
});
test('buyCount: режимы x1, x10, max', () => {
  assert.strictEqual(E.buyCount(tavern, 0, 1e6, 'x1', C.BUY_AMOUNT), 1);
  assert.strictEqual(E.buyCount(tavern, 0, 1e6, 'x10', C.BUY_AMOUNT), 10);
  assert.strictEqual(E.buyCount(tavern, 0, 1e6, 'max', C.BUY_AMOUNT), E.maxAffordable(tavern, 0, 1e6));
});

// ---- рубежи и доход ----
test('рубежи: множитель растёт ровно на порогах', () => {
  assert.strictEqual(E.multiplierAt(9, MS), 1); assert.strictEqual(E.multiplierAt(10, MS), 2); assert.strictEqual(E.multiplierAt(24, MS), 2);
  assert.strictEqual(E.multiplierAt(25, MS), 4); assert.strictEqual(E.multiplierAt(50, MS), 8);
  assert.strictEqual(E.multiplierAt(100, MS), 24); assert.strictEqual(E.multiplierAt(200, MS), 72); assert.strictEqual(E.multiplierAt(5000, MS), 72);
});
test('рубежи: следующий и число достигнутых', () => {
  assert.strictEqual(E.nextMilestone(12, MS).level, 25); assert.strictEqual(E.nextMilestone(200, MS), null);
  assert.strictEqual(E.milestonesReached(0, MS), 0); assert.strictEqual(E.milestonesReached(50, MS), 3); assert.strictEqual(E.milestonesReached(200, MS), 5);
});
test('доход: уровень 0 = 0, линейный рост и рубеж', () => {
  assert.strictEqual(E.incomePerCycle(tavern, 0, MS), 0);
  assert.strictEqual(E.incomePerCycle(tavern, 1, MS), 3);
  assert.strictEqual(E.incomePerCycle(tavern, 9, MS), 27);
  assert.strictEqual(E.incomePerCycle(tavern, 10, MS), 60);
  assert.strictEqual(E.incomePerSec(tavern, 1, MS), 1.5);
});
test('рубеж выгоднее соседнего уровня (скачок дохода ≥ множителя)', () => {
  for (const m of MS) assert.ok(E.incomePerCycle(tavern, m.level, MS) > E.incomePerCycle(tavern, m.level - 1, MS) * (m.mult * 0.9));
});

// ---- окно звёзд рубежей ----
const MSL = [10, 25, 50, 100, 200, 250, 500];
const flags = (w) => w.map((x) => x.level + (x.reached ? '*' : '') + (x.next ? '>' : '')).join(' ');
test('звёзды: начало игры — первые 5, ближайший 10', () => { assert.strictEqual(flags(E.starWindow(0, MSL)), '10> 25 50 100 200'); });
test('звёзды: ур. 26 — два пройденных, ближайший 50', () => { assert.strictEqual(flags(E.starWindow(26, MSL)), '10* 25* 50> 100 200'); });
test('звёзды: ур. 100 — окно сдвигается за двумя пройденными', () => { assert.strictEqual(flags(E.starWindow(100, MSL)), '50* 100* 200> 250 500'); });
test('звёзды: осталось меньше 5 — окно упирается в конец (ур. 260)', () => { assert.strictEqual(flags(E.starWindow(260, MSL)), '50* 100* 200* 250* 500>'); });
test('звёзды: всё пройдено — без ближайшего', () => {
  const w = E.starWindow(500, MSL); assert.strictEqual(flags(w), '50* 100* 200* 250* 500*'); assert.ok(!w.some((x) => x.next));
});
test('звёзды: рубежей меньше размера окна — показываются все', () => {
  assert.strictEqual(flags(E.starWindow(30, [10, 25, 50])), '10* 25* 50>');
  assert.strictEqual(E.starWindow(0, []).length, 0);
});
test('звёзды: всегда не больше size и без повторов', () => {
  for (let lv = 0; lv <= 600; lv += 7) { const w = E.starWindow(lv, MSL); assert.strictEqual(w.length, 5); assert.ok(w.filter((x) => x.next).length <= 1); }
});

// ---- требования к старту ----
test('старт: хватает на первую станцию сразу', () => { assert.ok(C.START.coins >= E.bulkCost(tavern, 0, 1)); });
test('старт: первая прибыль после покупки не позже лимита', () => {
  const cu = C.CUSTOMERS;
  const worstWalk = (cu.spawnX - 60 /* ближайший x станции */ + 0) / cu.walkSpeed;
  assert.ok(worstWalk + tavern.cycle <= cu.firstIncomeMaxSec, `${worstWalk + tavern.cycle}s`);
});
test('конфиг: станции имеют все поля, рубежи по возрастанию', () => {
  for (const st of ST) for (const f of ['id', 'baseCost', 'growth', 'profit', 'cycle', 'color', 'order']) assert.ok(st[f] !== undefined, st.id + '.' + f);
  for (let i = 1; i < MS.length; i++) assert.ok(MS[i].level > MS[i - 1].level);
});

// ---- сохранение ----
test('сохранение: экспорт/импорт сохраняет данные', () => {
  const s = G.defaultState(); s.res.coins = 42; s.post.stations.tavern.level = 7;
  const back = G.importSave(G.exportSave(s));
  assert.strictEqual(back.res.coins, 42); assert.strictEqual(back.post.stations.tavern.level, 7);
});
test('сохранение: старое сохранение без post дополняется', () => {
  const old = G.defaultState(); delete old.post;
  const s = G.parseSave(JSON.stringify(old));
  assert.strictEqual(s.post.stations.forge.level, 0); assert.strictEqual(s.post.buyMode, C.DEFAULT_BUY_MODE);
});
test('сохранение: мусор и сохранение из будущего отклоняются', () => {
  assert.throws(() => G.parseSave('junk')); assert.throws(() => G.parseSave('{"saveVersion":99}'));
});

console.log(`\n${passed} tests passed` + (process.exitCode ? ', FAILURES above' : ''));
