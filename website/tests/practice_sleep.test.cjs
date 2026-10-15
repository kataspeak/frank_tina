const test = require('node:test'), assert = require('node:assert/strict');
const {start, step, sleep, morning, result} = require('../static/practice-sleep/flow.js');
test('speech accumulates only while speaking and resets the silence timer', () => {
  let s = step(start(), 50, false);
  s = step(s, 10, true);
  assert.equal(s.spoken, 10); assert.equal(s.silence, 0); assert.equal(s.elapsed, 60);
  assert.equal(s.phase, 'practice'); assert.equal(result(s), null);
});
test('sleep does not immediately stop; each silence setting stops exactly at its threshold', () => {
  for (const minutes of [1,3,5]) {
    let s = step(start(minutes), 42, true);
    s = sleep(s); assert.equal(s.phase, 'sleeping');
    s = step(s, minutes * 60 - 1, true); // A sleeping character cannot emit speech.
    assert.equal(s.phase, 'sleeping'); assert.equal(s.spoken, 42);
    s = step(s, 10, false);
    assert.equal(s.phase, 'stopped'); assert.equal(s.silence, minutes * 60);
    assert.equal(s.reason, 'silence'); assert.equal(s.elapsed, minutes * 60 + 42);
    assert.equal(result(s), null); assert.deepEqual(step(s, 100, true), s);
    assert.deepEqual(result(morning(s)), {spoken:42, reason:'silence'});
  }
});
test('morning is unavailable before stopping, and zero speech is a valid result', () => {
  const s = start(); assert.deepEqual(morning(s), s);
  const sleeping = sleep(s); assert.deepEqual(morning(sleeping), sleeping);
  assert.equal(result(morning(step(sleeping, 180))).spoken, 0);
});
test('maximum session length stops continued speech and never counts beyond the cap', () => {
  let s = step(start(), 4000, true);
  assert.equal(s.phase, 'stopped'); assert.equal(s.reason, 'maximum');
  assert.equal(s.spoken, 3600); assert.equal(s.elapsed, 3600);
  s = morning(s); assert.deepEqual(step(s, 10, true), s);
  assert.equal(start().spoken, 0);
});
