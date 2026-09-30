// Слоты клиентов у прилавка: какой станции нужен заказ нового клиента. Чистая логика (тесты — tools/test.js).
(function (root) {
  const Slots = (root.Slots = root.Slots || {});

  // Выбирает станцию для нового клиента: с наименьшим числом ожидающих (чтобы у каждой купленной станции всегда был клиент);
  // при равенстве — первая по порядку. owned — id купленных станций по порядку; counts — {id: сколько клиентов ждёт}.
  Slots.pickStation = function (owned, counts) {
    let best = null, bc = Infinity;
    for (const id of owned) { const c = counts[id] || 0; if (c < bc) { bc = c; best = id; } }
    return best;
  };

  // Кто обслуживается станцией: самый давний клиент, ещё не обслуженный (по номеру появления seq)
  Slots.activeCustomer = function (customers, stationId) {
    let best = null;
    for (const c of customers) if (c && c.station === stationId && c.state !== 'served' && (best === null || c.seq < best.seq)) best = c;
    return best;
  };

  if (typeof module !== 'undefined') module.exports = Slots;
})(typeof window !== 'undefined' ? window : globalThis);
