(function(root) {
  'use strict';
  const start = (silenceMinutes = 3) => ({phase: 'practice', elapsed: 0, spoken: 0, silence: 0, limit: silenceMinutes * 60, maximum: 3600, reason: null});
  function step(state, seconds, speaking = false) {
    if (!['practice', 'sleeping'].includes(state.phase) || seconds <= 0) return state;
    const voice = state.phase === 'practice' && speaking;
    const remaining = Math.min(state.maximum - state.elapsed, voice ? Infinity : state.limit - state.silence);
    const dt = Math.min(seconds, remaining);
    const next = {...state, elapsed: state.elapsed + dt, spoken: state.spoken + (voice ? dt : 0), silence: voice ? 0 : state.silence + dt};
    if (next.elapsed >= next.maximum || next.silence >= next.limit) {
      next.phase = 'stopped'; next.reason = next.elapsed >= next.maximum ? 'maximum' : 'silence';
    }
    return next;
  }
  const sleep = state => state.phase === 'practice' ? {...state, phase: 'sleeping'} : state;
  const morning = state => state.phase === 'stopped' ? {...state, phase: 'morning'} : state;
  const result = state => state.phase === 'morning' ? {spoken: Math.floor(state.spoken), reason: state.reason} : null;
  const api = {start, step, sleep, morning, result};
  if (typeof module !== 'undefined') module.exports = api;
  else root.SleepFlow = api;
})(typeof window === 'undefined' ? globalThis : window);
