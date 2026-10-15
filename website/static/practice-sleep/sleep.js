(() => {
  'use strict';
  const $ = id => document.getElementById(id), flow = window.SleepFlow;
  const host = document.querySelector('.sleep-demo'), action = $('action'), pause = $('pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = ['Model', 'Speak', 'Offset', 'Phrase Pattern'];
  let state = null, time = 0, last = null, running = true, inView = true;
  let player, ready = false, frame, loadTimer, heightObserver;
  const setText = (id, text) => {if ($(id).textContent !== text) $(id).textContent = text;};
  const phase = () => state?.phase || 'idle';
  function render() {
    const p = phase(), active = p === 'practice' || p === 'sleeping';
    host.dataset.phase = p;
    host.dataset.frozen = String(!running || !inView || document.hidden);
    $('silence').disabled = p !== 'idle';
    action.disabled = p === 'sleeping';
    action.textContent = {idle:'練習を始める', practice:'眠る', sleeping:'静かに停止するのを待つ', stopped:'朝にする', morning:'もう一度試す'}[p];
    pause.disabled = !active;
    pause.textContent = running ? '一時停止' : '再生する';
    const stepIndex = {idle:0, practice:0, sleeping:1, stopped:2, morning:3}[p];
    document.querySelectorAll('.story-steps li').forEach((el, i) => {
      if (i === stepIndex) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
    });
    setText('time-label', p === 'morning' ? 'GOOD MORNING' : 'GOOD NIGHT');
    setText('scene-title', {idle:'眠りにつくまで、語学にひたる', practice:'聞いて、話して、じっくりと', sleeping:'すう、すう……', stopped:'そのまま、ゆっくり', morning:'昨夜の積み重ねを、朝に確認'}[p]);
    $('stop-sign').hidden = p !== 'stopped';
    $('phone').hidden = p !== 'morning';
    $('scene').setAttribute('aria-label', p === 'sleeping' ? 'フランケンくんは眠っています。お手本だけが繰り返されています。' : p === 'stopped' ? 'お手本の再生も止まり、フランケンくんは静かに眠っています。' : 'お手本を聞きながら、フランケンくんが声に出して練習します。');
    const result = state && flow.result(state);
    if (result) {
      // A representative night, rather than the few seconds spent operating this demo.
      setText('result-minutes', '38');
      setText('result-seconds', '24');
      setText('stop-reason', result.reason === 'maximum' ? '上限時間に達したため自動停止' : '無発話が続いたため自動停止');
    }
    const ratio = state ? Math.min(1, state.silence / state.limit) : 0;
    $('silence-fill').style.width = (ratio * 100) + '%';
    setText('silence-label', p === 'sleeping' ? '声が途切れています。お手本を繰り返しながら、静かに待ちます。' : p === 'stopped' ? (state.reason === 'maximum' ? '上限時間に達したので、再生を止めました。' : $('silence').value + '分間、声がなかったので再生を止めました。') : p === 'morning' ? '朝、アプリを開いて。声に出した時間を振り返れます。' : '設定した上限時間まで、声が続く間は練習を続けます。');
    let feedback = {
      idle:'「練習を始める」で、夜の練習を体験できます。',
      practice:'フランケンくんが練習中です。「眠る」を押して、声が止まったあとの変化を見てみましょう。',
      sleeping:'声が止まっても、すぐには停止しません。設定した無発話時間が続くのを待ちます。',
      stopped:'静かに停止しました。結果は朝のお楽しみ。「朝にする」でティナが起こしてくれます。',
      morning:'おはよう！ 昨夜の練習を振り返りましょう。画面は38分24秒、声に出して練習した例です。'
    }[p];
    if (active && !running) feedback = 'デモを一時停止しています。「再生する」で続きを見られます。';
    setText('feedback', feedback);
    if (ready) {
      const cycle = time % 2.5;
      const showMotion = active && !reduced.matches;
      player.scrub('Phrase Pattern', 0);
      player.scrub('Offset', .1);
      player.scrub('Model', showMotion ? Math.min(2, cycle / 1.6 * 2) : 2);
      player.scrub('Speak', showMotion && p === 'practice' ? Math.min(2, Math.max(0, cycle - .35) / 1.6 * 2) : 2);
    }
  }
  function reset() {state = null; time = 0; last = null; running = true; render();}
  action.addEventListener('click', () => {
    if (phase() === 'idle') {state = flow.start(Number($('silence').value)); time = 0; running = true;}
    else if (phase() === 'practice') {state = flow.sleep(state); running = true;}
    else if (phase() === 'stopped') state = flow.morning(state);
    else if (phase() === 'morning') {reset(); return;}
    last = null; render();
  });
  pause.addEventListener('click', () => {running = !running; last = null; render();});
  $('reset').addEventListener('click', reset);
  reduced.addEventListener('change', render);
  document.addEventListener('visibilitychange', () => {last = null; render();});
  function tick(stamp) {
    const delta = last === null ? 0 : Math.min(.1, (stamp - last) / 1000); last = stamp;
    if (running && inView && !document.hidden && ['practice', 'sleeping'].includes(phase())) {
      time += delta;
      const cycle = time % 2.5;
      state = flow.step(state, delta * 30, cycle >= .35 && cycle < 1.95);
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  if (document.documentElement.classList.contains('embedded')) {
    const height = () => parent.postMessage({type:'practice-height', height:Math.ceil(document.body.getBoundingClientRect().height)}, location.origin);
    heightObserver = new ResizeObserver(height); heightObserver.observe(document.body);
    addEventListener('message', e => {if (e.origin === location.origin && e.source === parent && e.data?.type === 'practice-visibility') {inView = e.data.visible === true; last = null; render();}});
    height();
  }
  const fail = () => {ready = false; host.dataset.failed = 'true'; render();};
  if (window.rive) {
    rive.RuntimeLoader.setWasmUrl(new URL('../vendor/rive-2.43.1/rive.wasm', location.href).href);
    rive.RuntimeLoader.setWasmFallbackUrl(new URL('../vendor/rive-2.43.1/rive_fallback.wasm', location.href).href);
    loadTimer = setTimeout(fail, 15000);
    player = new rive.Rive({src:new URL('../animations/practice-timing.riv', location.href).href, canvas:$('scene'), artboard:'Practice Timing', animations, autoplay:false, enableRiveAssetCDN:false, shouldDisableRiveListeners:true,
      layout:new rive.Layout({fit:rive.Fit.Contain, alignment:rive.Alignment.Center}),
      onLoad() {clearTimeout(loadTimer); ready = true; host.dataset.failed = 'false'; player.pause(animations); player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); render();},
      onLoadError() {clearTimeout(loadTimer); fail();}
    });
  } else fail();
  const observer = new ResizeObserver(() => {if (ready) {player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); render();}});
  observer.observe($('scene'));
  render(); frame = requestAnimationFrame(tick);
  addEventListener('pagehide', e => {if (!e.persisted) {clearTimeout(loadTimer); cancelAnimationFrame(frame); observer.disconnect(); heightObserver?.disconnect(); player?.cleanup();}});
})();
