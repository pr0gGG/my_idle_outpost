// Формулы экономики поста. Чистые функции без DOM — тестируются в Node (tools/test.js).
(function (root) {
  const E = (root.Economy = root.Economy || {});

  // Цена перехода с уровня `level` на level+1
  E.stepCost = (st, level) => st.baseCost * Math.pow(st.growth, level);

  // Суммарная цена k уровней начиная с `level` (геометрическая сумма, округление вверх один раз)
  E.bulkCost = function (st, level, k) {
    if (k <= 0) return 0;
    const g = st.growth;
    return Math.ceil(st.baseCost * Math.pow(g, level) * (Math.pow(g, k) - 1) / (g - 1));
  };

  // Наибольшее k, для которого bulkCost(level, k) <= coins
  E.maxAffordable = function (st, level, coins) {
    if (!(coins >= E.bulkCost(st, level, 1))) return 0;
    const g = st.growth;
    let k = Math.floor(Math.log(1 + coins * (g - 1) / (st.baseCost * Math.pow(g, level))) / Math.log(g));
    if (!isFinite(k) || k < 0) k = 0;
    while (E.bulkCost(st, level, k + 1) <= coins) k++;
    while (k > 0 && E.bulkCost(st, level, k) > coins) k--;
    return k;
  };

  // Сколько уровней покупает режим: 'x1' | 'x10' | 'max'
  E.buyCount = function (st, level, coins, mode, amounts) {
    if (mode === 'max') return E.maxAffordable(st, level, coins);
    return amounts[mode] || 1;
  };

  // Совокупный множитель рубежей на данном уровне
  E.multiplierAt = function (level, milestones) {
    let m = 1;
    for (const ms of milestones) if (level >= ms.level) m *= ms.mult;
    return m;
  };

  E.milestonesReached = (level, milestones) => milestones.filter((m) => level >= m.level).length;

  // Ближайший рубеж впереди или null
  E.nextMilestone = function (level, milestones) {
    for (const ms of milestones) if (level < ms.level) return ms;
    return null;
  };

  E.incomePerCycle = (st, level, milestones) => (level <= 0 ? 0 : st.profit * level * E.multiplierAt(level, milestones));
  E.incomePerSec = (st, level, milestones) => E.incomePerCycle(st, level, milestones) / st.cycle;

  if (typeof module !== 'undefined') module.exports = E;
})(typeof window !== 'undefined' ? window : globalThis);
