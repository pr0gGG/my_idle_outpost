// Форматирование чисел: 999 → "999", 1234 → "1.23K", 1e15 → "1.00aa", ...
(function (root) {
  const G = (root.G = root.G || {});

  function suffixFor(tier, suffixes) {
    if (tier < suffixes.length) return suffixes[tier];
    let n = tier - suffixes.length; // 0 → aa, 1 → ab, ...
    const a = Math.floor(n / 26) % 26, b = n % 26;
    return String.fromCharCode(97 + a) + String.fromCharCode(97 + b);
  }

  G.fmt = function fmt(value, suffixes) {
    suffixes = suffixes || (root.CONFIG && root.CONFIG.NUMBER_SUFFIXES) || ['', 'K', 'M', 'B', 'T'];
    if (!isFinite(value)) return value > 0 ? '∞' : value < 0 ? '-∞' : '0';
    if (value < 0) return '-' + fmt(-value, suffixes);
    if (value < 1000) return value < 10 && value % 1 ? value.toFixed(1) : String(Math.floor(value));
    let tier = Math.floor(Math.log10(value) / 3);
    let scaled = value / Math.pow(1000, tier);
    // защита от "1000.00K" из-за округления
    if (Number(scaled.toFixed(2)) >= 1000) { tier++; scaled /= 1000; }
    const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
    return scaled.toFixed(digits) + suffixFor(tier, suffixes);
  };

  if (typeof module !== 'undefined') module.exports = G.fmt;
})(typeof window !== 'undefined' ? window : globalThis);
