const test = require('node:test'), assert = require('node:assert/strict');
const {start, current, next} = require('../static/practice-selection/flow.js');
test('every nonempty selection visits only selected lessons and wraps in order', () => {
  for (let mask = 1; mask < 16; mask++) {
    const selected = [0,1,2,3].filter(i => mask & (1 << i));
    let state = start(selected);
    for (let n = 0; n < selected.length * 3; n++) {
      assert.equal(current(state), selected[n % selected.length]);
      assert.equal(state.lap, Math.floor(n / selected.length) + 1);
      state = next(state, true);
    }
    assert.equal(state.complete, false);
  }
});
test('repeat OFF stops at the last selected lesson, including a single lesson', () => {
  for (const selected of [[2], [0,2], [1,2,3], [0,1,2,3]]) {
    let state = start(selected);
    for (let i = 0; i < selected.length; i++) {
      assert.equal(current(state), selected[i]); assert.equal(state.complete, false);
      state = next(state, false);
    }
    assert.equal(state.complete, true); assert.equal(state.lap, 1);
    assert.deepEqual(next(state, true), state);
  }
});
test('empty selection stays stopped and reselection starts at first chosen lesson', () => {
  const empty = start([]);
  assert.equal(current(empty), null); assert.deepEqual(next(empty, true), empty);
  let old = next(start([0,2]), true);
  assert.equal(current(old), 2);
  const changed = start([3,1]);
  assert.equal(current(changed), 1); assert.equal(changed.lap, 1);
  assert.deepEqual(changed.selected, [1,3]);
});
