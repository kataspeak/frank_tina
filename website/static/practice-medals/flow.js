(function(root) {
  'use strict';
  const start = (step = 2) => ({counts:[0,0,0], step, counting:false, rank:0});
  const rounds = state => Math.min(...state.counts);
  const setCounting = (state, counting) => ({...state, counting});
  function practice(state, index) {
    if (!state.counting || !Number.isInteger(index) || index < 0 || index >= state.counts.length) return state;
    const counts = state.counts.map((n, i) => n + (i === index ? 1 : 0));
    return {...state, counts, rank:Math.max(state.rank, Math.min(3, Math.floor(Math.min(...counts) / state.step)))};
  }
  const nextPhrase = state => state.counts.indexOf(Math.min(...state.counts));
  const api = {start, rounds, setCounting, practice, nextPhrase};
  if (typeof module !== 'undefined') module.exports = api; else root.MedalFlow = api;
})(typeof window === 'undefined' ? globalThis : window);
