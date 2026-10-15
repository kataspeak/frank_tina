const test = require('node:test'), assert = require('node:assert/strict');
const {start, rounds, setCounting, practice, nextPhrase} = require('../static/practice-medals/flow.js');
test('warmup is not counted retroactively and pausing preserves progress and medals', () => {
  let s = start(); for (let i = 0; i < 9; i++) s = practice(s, i % 3);
  assert.deepEqual(s.counts, [0,0,0]); s = setCounting(s, true);
  for (let i = 0; i < 6; i++) s = practice(s, i % 3);
  assert.equal(s.rank, 1); s = setCounting(s, false);
  assert.deepEqual(practice(s, 0), s);
  assert.deepEqual(setCounting(s, true).counts, [2,2,2]); assert.equal(s.rank, 1);
});
test('rounds use the least practiced phrase, never an average or sum', () => {
  let s = setCounting(start(), true);
  for (let i = 0; i < 6; i++) s = practice(s, 0);
  assert.equal(rounds(s), 0); assert.equal(s.rank, 0);
  s = practice(practice(s, 1), 2);
  assert.deepEqual(s.counts, [6,1,1]); assert.equal(rounds(s), 1);
  s = practice(s, 1); assert.equal(rounds(s), 1);
  s = practice(s, 2); assert.equal(rounds(s), 2); assert.equal(s.rank, 1);
});
test('demo and app defaults award at cumulative thresholds; continued practice preserves gold', () => {
  for (const step of [2,10]) {
    let s = setCounting(start(step), true);
    for (let n = 1; n <= step * 3 + 1; n++) {
      for (let j = 0; j < 3; j++) s = practice(s, nextPhrase(s));
      assert.equal(rounds(s), n); assert.equal(s.rank, Math.min(3, Math.floor(n / step)));
    }
    assert.equal(s.rank, 3); assert.equal(start(step).rank, 0);
  }
});
