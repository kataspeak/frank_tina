/* Explanation of phrase-unit practice; values match the app's defaults. */
(function (root) {
  'use strict';
  const presets = {
    easy: {label: '簡単', count: 1, speeds: [1.0]},
    normal: {label: '普通', count: 2, speeds: [0.8, 0.8, 1.0]},
    hard: {label: '困難', count: 3, speeds: [0.6, 0.6, 0.6, 0.8, 0.8, 1.0]}
  };
  const start = (mode = 'speed', difficulty = 'normal') => ({mode, difficulty, slot: 0, count: 0, cycle: 1, established: false, complete: false});
  const menu = state => state.mode === 'speed' ? presets[state.difficulty].speeds : Array(presets[state.difficulty].count).fill(1);
  function next(state, spoke) {
    if (state.complete) return state;
    if (state.mode === 'count') {
      const count = state.count + (spoke ? 1 : 0);
      return {...state, count, slot: Math.min(count, menu(state).length - 1), complete: count === menu(state).length};
    }
    const established = state.established || spoke;
    if (state.slot < menu(state).length - 1) return {...state, slot: state.slot + 1, established};
    if (established) return {...state, established, complete: true};
    return {...state, slot: 0, cycle: state.cycle + 1, established: false};
  }
  const api = {presets, start, menu, next};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DifficultyFlow = api;
})(typeof window === 'undefined' ? this : window);
