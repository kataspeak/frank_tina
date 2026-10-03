// Playback lifecycle checks; the actual .riv rendering is checked in the browser.
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(`${__dirname}/../static/opening.js`, 'utf8');
function setup({reduced = false, runtime = true} = {}) {
  const events = {}, buttonEvents = {}, documentEvents = {};
  const classes = new Set();
  const button = {hidden: true, addEventListener: (name, fn) => buttonEvents[name] = fn};
  const host = {dataset: {}, classList: {add: n => classes.add(n), remove: n => classes.delete(n)}, querySelector: s => s === 'button' ? button : {}};
  const media = {matches: reduced, addEventListener: (_, fn) => media.change = fn};
  const document = {hidden: false, querySelector: () => host, addEventListener: (n, fn) => documentEvents[n] = fn};
  let options, player, timeout;
  class Rive {
    constructor(opts) { options = opts; player = this; this.resets = 0; this.pauses = 0; this.cleaned = 0; }
    reset() { this.resets++; }
    resizeDrawingSurfaceToCanvas() {}
    pause() { this.pauses++; }
    play() {}
    cleanup() { this.cleaned++; }
  }
  const rive = {Rive, RuntimeLoader: {setWasmUrl() {}, setWasmFallbackUrl() {}}, Layout: class {}, Fit: {Contain: 1}, Alignment: {Center: 1}};
  runInNewContext(source, {window: {rive: runtime && rive}, rive, document, devicePixelRatio: 1,
    matchMedia: () => media, setTimeout: fn => { timeout = fn; }, clearTimeout() {}, queueMicrotask: fn => fn(),
    ResizeObserver: class { observe() {} disconnect() {} }, addEventListener: (n, fn) => events[n] = fn});
  return {host, button, buttonEvents, document, documentEvents, events, media, classes,
    get player() { return player; }, load: () => options.onLoad(), fail: () => options.onLoadError(),
    advance: seconds => options.onAdvance({data: seconds}), timeout: () => timeout()};
}
let t = setup(); t.load();
assert.equal(t.host.dataset.openingTrigger, 'load');
t.advance(1); assert.equal(t.host.dataset.openingState, 'playing');
t.advance(1); assert.equal(t.host.dataset.openingState, 'complete'); assert.equal(t.player.pauses, 1);
t.buttonEvents.pointerenter({pointerType: 'touch'}); assert.equal(t.player.resets, 1);
t.buttonEvents.pointerenter({pointerType: 'mouse'}); assert.equal(t.host.dataset.openingTrigger, 'hover');
t.advance(0.5); assert.equal(t.host.dataset.openingState, 'playing');
t.buttonEvents.click(); assert.equal(t.host.dataset.openingTrigger, 'activate');
t.advance(1.5); assert.equal(t.host.dataset.openingState, 'playing');
t.document.hidden = true; t.documentEvents.visibilitychange(); assert.equal(t.host.dataset.openingState, 'paused');
t.document.hidden = false; t.documentEvents.visibilitychange(); t.advance(0.5); assert.equal(t.host.dataset.openingState, 'complete');
t.events.pagehide({persisted: true}); t.events.pageshow({persisted: true}); assert.equal(t.host.dataset.openingTrigger, 'pageshow');
t.media.matches = true; t.media.change(); assert.equal(t.classes.has('opening-ready'), false);
t.events.pagehide({persisted: false}); assert.equal(t.player.cleaned, 1);
t = setup({reduced: true}); t.load(); assert.equal(t.player.resets, 0);
t.buttonEvents.pointerenter({pointerType: 'mouse'}); assert.equal(t.player.resets, 0);
t.buttonEvents.click(); assert.equal(t.player.resets, 1); t.advance(2); assert.equal(t.host.dataset.openingState, 'complete');
t = setup(); t.fail(); assert.equal(t.button.hidden, true); assert.equal(t.classes.has('opening-ready'), false);
t = setup(); t.timeout(); t.load(); assert.equal(t.button.hidden, true); assert.equal(t.player.resets, 0);
t = setup({runtime: false}); assert.equal(t.button.hidden, true);
console.log('PASS: auto start, one-shot completion, hover restart, touch/keyboard activation, reduced motion, visibility, history, load failure and timeout');
