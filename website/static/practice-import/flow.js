(function(root) {
  'use strict';
  const MIN = .6, MAX_PIECES = 8;
  const initial = () => [0, 3.2, 8.6, 12];
  const round = n => Math.round(n * 10) / 10;
  const clamp = (n, lo, hi) => round(Math.max(lo, Math.min(hi, n)));
  function split(bounds, index, at) {
    if (index < 0 || index >= bounds.length - 1 || bounds.length > MAX_PIECES || bounds[index + 1] - bounds[index] < MIN * 2 - 1e-8) return bounds;
    const cut = clamp(at, bounds[index] + MIN, bounds[index + 1] - MIN);
    return [...bounds.slice(0, index + 1), cut, ...bounds.slice(index + 1)];
  }
  function move(bounds, index, at) {
    if (index <= 0 || index >= bounds.length - 1) return bounds;
    return bounds.map((n, i) => i === index ? clamp(at, bounds[index - 1] + MIN, bounds[index + 1] - MIN) : n);
  }
  const join = (bounds, index) => index < 0 || index >= bounds.length - 2 ? bounds : bounds.filter((_, i) => i !== index + 1);
  const api = {MIN, MAX_PIECES, initial, split, move, join};
  if (typeof module !== 'undefined') module.exports = api; else root.ImportFlow = api;
})(typeof window === 'undefined' ? globalThis : window);
