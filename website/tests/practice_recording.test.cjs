const test=require('node:test');const assert=require('node:assert/strict');const f=require('../static/practice-recording/flow.js');
const completed=s=>f.finish(f.speak(f.start(s)));
test('only a completed practice with recording ON replaces the saved voice',()=>{
 let s=f.initial();assert.equal(completed(s).saved,0);
 s=completed(f.toggle(s,true));assert.equal(s.saved,1);
 s=completed(s);assert.equal(s.saved,2);
 s=completed(f.toggle(s,false));assert.equal(s.saved,2);
});
test('interrupting practice or switching to playback preserves the earlier recording',()=>{
 const s=completed(f.toggle(f.initial(),true));
 assert.equal(f.stop(f.speak(f.start(s))).saved,1);
 assert.equal(f.play(f.speak(f.start(s)),'model').saved,1);
 assert.equal(f.finish(f.stop(f.speak(f.start(s)))).saved,1);
});
test('voice playback needs a recording and selecting either source stops the other',()=>{
 assert.deepEqual(f.play(f.initial(),'voice'),f.initial());
 let s=completed(f.toggle(f.initial(),true));
 s=f.play(s,'model');assert.equal(s.phase,'listen-model');
 s=f.play(s,'voice');assert.equal(s.phase,'listen-voice');
 assert.equal(f.stop(s).phase,'idle');assert.equal(f.stop(s).saved,1);
 assert.equal(f.initial().saved,0);
});
