(function (root) {
  'use strict';
  const start = selected => ({selected: [...new Set(selected)].sort((a, b) => a - b), index: 0, lap: 1, complete: false});
  const current = state => state.selected[state.index] ?? null;
  function next(state, repeat) {
    if (!state.selected.length || state.complete) return state;
    if (state.index + 1 < state.selected.length) return {...state, index: state.index + 1};
    return repeat ? {...state, index: 0, lap: state.lap + 1} : {...state, complete: true};
  }
  const api = {start, current, next};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SelectionFlow = api;
})(typeof window === 'undefined' ? this : window);
