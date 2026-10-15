const test = require('node:test');
const assert = require('node:assert/strict');
const {start, menu, next, presets} = require('../static/practice-difficulty/flow.js');

test('defaults match the app for all difficulties', () => {
  assert.deepEqual(['easy', 'normal', 'hard'].map(d => menu(start('speed', d))), [[1], [.8, .8, 1], [.6, .6, .6, .8, .8, 1]]);
  assert.deepEqual(['easy', 'normal', 'hard'].map(d => menu(start('count', d)).length), [1, 2, 3]);
});
test('silence preserves established count; speech completes only at each target', () => {
  for (const difficulty of Object.keys(presets)) {
    let s = start('count', difficulty);
    for (let n = 0; n < presets[difficulty].count; n++) {
      for (let i = 0; i < 4; i++) s = next(s, false);
      assert.equal(s.count, n); assert.equal(s.complete, false);
      s = next(s, true);
      assert.equal(s.count, n + 1);
      assert.equal(s.complete, n + 1 === presets[difficulty].count);
    }
    assert.deepEqual(next(s, true), s);
  }
});
test('speed menus advance through silence and repeat when there is no speech', () => {
  for (const difficulty of Object.keys(presets)) {
    let s = start('speed', difficulty);
    const length = menu(s).length;
    for (let i = 0; i < length * 3; i++) {
      s = next(s, false);
      assert.equal(s.slot, (i + 1) % length); assert.equal(s.complete, false);
    }
    assert.equal(s.cycle, 4); assert.equal(s.established, false);
  }
});
test('a single speech at ANY slot completes only after remaining speeds', () => {
  for (const difficulty of Object.keys(presets)) {
    const length = menu(start('speed', difficulty)).length;
    for (let spokenAt = 0; spokenAt < length; spokenAt++) {
      let s = start('speed', difficulty);
      for (let i = 0; i < length; i++) {
        s = next(s, i === spokenAt);
        assert.equal(s.complete, i === length - 1);
        assert.equal(s.established, i >= spokenAt);
      }
      assert.deepEqual(next(s, true), s);
    }
  }
});
