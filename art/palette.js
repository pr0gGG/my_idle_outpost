// Доступ к цветам из CONFIG.PALETTE и смешивание цветов.
(function (root) {
  const G = (root.G = root.G || {});
  const P = root.CONFIG.PALETTE;

  function parse(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  G.color = function (token) {
    if (!(token in P)) throw new Error('unknown palette token: ' + token);
    return P[token];
  };

  // t=0 → a, t=1 → b; a и b — токены палитры или hex
  G.mix = function (a, b, t) {
    const ca = parse(P[a] || a), cb = parse(P[b] || b);
    const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  };
})(window);
