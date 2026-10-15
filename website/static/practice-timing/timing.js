(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const host = document.querySelector('.demo'), canvas = $('scene');
  const speak = $('speak'), pause = $('pause'), reset = $('reset'), gap = $('gap'), slow = $('slow');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 2, pixelsPerSecond = 108, animations = ['Model', 'Speak', 'Offset', 'Phrase Pattern'];
  const phrases = ['Good morning.', 'How are you?', 'See you later.'];
  let phraseIndex = 0, inView = true;
  let player, ready = false, running = !reduced.matches, time = 0, speechStart = null;
  let cycleGap = Number(gap.value), last = null, frame, cycles = 0, finishedAt = null;
  const setFeedback = message => { if ($('feedback').textContent !== message) $('feedback').textContent = message; };
  function fail() {
    ready = false; running = false; cancelAnimationFrame(frame);
    host.dataset.state = 'error'; speak.disabled = pause.disabled = reset.disabled = true;
    setFeedback('読み込めませんでした。ページを再読み込みしてください。お手本に重ねても、聞き終えてからでも話せます。');
  }
  const timer = setTimeout(fail, 15000);
  function newCycle(advance = false) {
    if (advance) phraseIndex = (phraseIndex + 1) % phrases.length;
    time = 0; speechStart = null; finishedAt = null; cycleGap = Number(gap.value); cycles++;
  }
  function render() {
    const spoken = speechStart === null ? 0 : Math.min(duration, Math.max(0, time - speechStart));
    player.scrub('Phrase Pattern', phraseIndex / 2);
    $('current-phrase').textContent = phrases[phraseIndex];
    $('phrase-number').textContent = (phraseIndex + 1) + ' / 3';
    document.querySelectorAll('.phrase-step').forEach((el, i) => {
      el.classList.toggle('active', i === phraseIndex);
      if (i === phraseIndex) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
    player.scrub('Model', Math.min(duration, time));
    player.scrub('Speak', spoken);
    player.scrub('Offset', (speechStart || 0) * pixelsPerSecond / 480);
    const modelPlaying = time < duration, speaking = speechStart !== null && spoken < duration;
    const complete = speechStart !== null && !speaking && !modelPlaying;
    host.dataset.state = !running ? 'paused' : complete ? 'complete' : speaking ? 'speaking' : modelPlaying ? 'model' : 'gap';
    host.dataset.cycles = String(cycles);
    $('model-state').textContent = modelPlaying ? 'お手本を再生中' : 'お手本の再生終了';
    $('voice-state').textContent = speaking ? '話しています' : speechStart !== null ? '話し終わりました' : '好きなタイミングで';
    speak.disabled = !ready || !running || speechStart !== null;
    pause.textContent = running ? '一時停止' : '再生する';
    if (!running) setFeedback('一時停止中です。「再生する」で続きを試せます。');
    else if (complete) setFeedback('話し終わりました。次のお手本へ。');
    else if (speaking) setFeedback(speechStart < duration ? 'お手本に重ねて話しています。' : '聞き終わってから話しています。');
    else if (!modelPlaying) setFeedback('今から話しても大丈夫。押さなければ、もう一度お手本が流れます。');
    else setFeedback(cycles ? '話すまでは、同じフレーズを繰り返します。' : '好きなタイミングで「話す」を押してみましょう。');
  }
  function tick(stamp) {
    const delta = last === null ? 0 : Math.min((stamp - last) / 1000, .1);
    last = stamp;
    if (ready && running && inView && !document.hidden) {
      time += delta * (slow.checked ? .5 : 1);
      if (speechStart === null && time >= duration + cycleGap) newCycle();
      else if (speechStart !== null && time >= Math.max(duration, speechStart + duration)) {
        // Short visual hold lets the visitor compare where the two waves began.
        finishedAt ??= time;
        if (time - finishedAt >= .45) newCycle(true);
      }
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  if (!window.rive) {clearTimeout(timer);fail();return;}
  rive.RuntimeLoader.setWasmUrl(new URL('../vendor/rive-2.43.1/rive.wasm', location.href).href);
  rive.RuntimeLoader.setWasmFallbackUrl(new URL('../vendor/rive-2.43.1/rive_fallback.wasm', location.href).href);
  player = new rive.Rive({
    src: new URL('../animations/practice-timing.riv', location.href).href,
    canvas, artboard: 'Practice Timing', animations, autoplay: false,
    enableRiveAssetCDN: false, shouldDisableRiveListeners: true,
    layout: new rive.Layout({fit: rive.Fit.Contain, alignment: rive.Alignment.Center}),
    onLoad() {
      clearTimeout(timer); ready = true; pause.disabled = reset.disabled = false;
      player.pause(animations); player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2));
      render(); frame = requestAnimationFrame(tick);
    },
    onLoadError() {clearTimeout(timer);fail();}
  });
  speak.addEventListener('click', () => {
    if (!ready || !running || speechStart !== null) return;
    speechStart = time; render();
  });
  pause.addEventListener('click', () => {running = !running;last = null;render();});
  reset.addEventListener('click', () => {phraseIndex = 0;newCycle();cycles = 0;last = null;render();});
  gap.addEventListener('input', () => {
    $('gap-value').textContent = Number(gap.value).toFixed(1) + ' 秒';
    // Apply from the next cycle so shortening the gap never steals the current opportunity.
  });
  document.addEventListener('visibilitychange', () => {last = null;});
  reduced.addEventListener('change', e => {if (e.matches && ready) {running = false;render();}});
  if (document.documentElement.classList.contains('embedded')) {
    const reportHeight = () => parent.postMessage({type:'practice-height', height:Math.ceil(document.body.getBoundingClientRect().height)}, location.origin);
    new ResizeObserver(reportHeight).observe(document.body);
    addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'practice-visibility') return;
      inView = event.data.visible === true; last = null;
    });
    reportHeight();
  }
  const observer = new ResizeObserver(() => {
    if (ready) {player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2));render();}
  });
  observer.observe(canvas);
  addEventListener('pagehide', e => {if (!e.persisted) {cancelAnimationFrame(frame);observer.disconnect();clearTimeout(timer);player.cleanup();}});
})();
