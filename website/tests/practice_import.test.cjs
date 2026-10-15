const test = require('node:test'), assert = require('node:assert/strict');
const {initial, split, move, join, MIN, MAX_PIECES} = require('../static/practice-import/flow.js');
function valid(bounds) {
  assert.equal(bounds[0],0); assert.equal(bounds.at(-1),12);
  for(let i=1;i<bounds.length;i++) assert.ok(bounds[i]-bounds[i-1]>=MIN-1e-8);
}
test('split preserves the source duration and neighboring boundaries', () => {
  const b = split(initial(),1,5.9);
  assert.deepEqual(b,[0,3.2,5.9,8.6,12]); valid(b);
  assert.deepEqual(join(b,1),initial());
});
test('boundary movement cannot cross neighbors or move source endpoints', () => {
  const b = initial(); assert.deepEqual(move(b,0,4),b); assert.deepEqual(move(b,3,10),b);
  assert.equal(move(b,1,-9)[1],.6); assert.equal(move(b,1,99)[1],8);
  for(const at of [-100,0,3.5,8.6,100]) valid(move(b,2,at));
});
test('too-small pieces and the demo piece limit prevent additional splits', () => {
  let b = initial(); b = split(b,0,-99); assert.equal(b[1],.6);
  assert.deepEqual(split(b,0,.3),b);
  while(b.length-1<MAX_PIECES) {
    const i = b.slice(1).findIndex((n,i)=>n-b[i]>=MIN*2-1e-8);
    b = split(b,i,(b[i]+b[i+1])/2); valid(b);
  }
  assert.deepEqual(split(b,b.length-2,11),b);
});
test('joining every piece leaves a single full-length source; reset is fresh', () => {
  let b = initial(); while(b.length>2) b = join(b,0);
  assert.deepEqual(b,[0,12]); assert.deepEqual(join(b,0),b);
  assert.deepEqual(initial(),[0,3.2,8.6,12]);
});
