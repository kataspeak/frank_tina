(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const flow = window.DifficultyFlow, host = document.querySelector('.demo'), canvas = $('scene');
  const speak = $('speak'), pause = $('pause'), reset = $('reset'), auto = $('auto-speak'), slow = $('slow');
  const radios = [...document.querySelectorAll('.choice input')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = ['Model', 'Speak', 'Offset', 'Phrase Pattern'];
  const baseDuration = 1.8, gap = .8, hold = .65;
  let state = flow.start(), pending = null, steps = [];
  let player, ready = false, failed = false, running = !reduced.matches, inView = true;
  let time = 0, speechStart = null, finishedAt = null, last = null, frame, heardAgain = false;
  const duration = () => baseDuration / flow.menu(state)[state.slot];
  const setText = (id, value) => {if ($(id).textContent !== value) $(id).textContent = value;};
  function restartAttempt() {time = 0; speechStart = finishedAt = pending = last = null;}
  function rebuildMenu() {
    $('menu').replaceChildren(...flow.menu(state).map((speed, i) => {
      const item = document.createElement('li'); item.className = 'menu-step';
      const label = document.createElement('small'); label.textContent = state.mode === 'speed' ? 'お手本 ' + (i + 1) : '声に出す';
      const value = document.createElement('strong'); value.textContent = state.mode === 'speed' ? speed.toFixed(1) + '×' : (i + 1) + '回目';
      const status = document.createElement('span'); status.textContent = 'これから';
      item.append(label, value, status); return item;
    }));
    steps = [...$('menu').children];
    const preset = flow.presets[state.difficulty];
    setText('menu-title', preset.label + (state.mode === 'speed' ? 'の速度メニュー' : 'の回数メニュー'));
    setText('menu-summary', state.mode === 'speed' ? preset.speeds[0].toFixed(1) + '倍から、' + preset.speeds.length + 'つのお手本' : '同じ速さで、' + preset.count + '回話す');
    setText('menu-rule', state.mode === 'speed' ? 'どこかで一度話せば、残りのお手本を聞いて次へ。' : '話した回数がそろったら次へ。聞くだけでは回数は増えません。');
  }
  function resetAll() {
    state = flow.start(document.querySelector('[name=mode]:checked').value, document.querySelector('[name=difficulty]:checked').value);
    heardAgain = false; restartAttempt(); rebuildMenu(); render();
  }
  function render() {
    const d = duration(), spoken = speechStart === null ? 0 : Math.min(d, time - speechStart);
    const speaking = speechStart !== null && spoken < d && !state.complete;
    const modelPlaying = time < d && !state.complete;
    const established = state.established || pending?.established || (speechStart !== null && spoken >= d);
    if (ready) {
      player.scrub('Phrase Pattern', .5);
      player.scrub('Model', Math.min(2, time / d * 2));
      player.scrub('Speak', spoken / d * 2);
      player.scrub('Offset', (speechStart || 0) / d * 216 / 480);
    }
    host.dataset.state = failed ? 'error' : !ready ? 'loading' : state.complete ? 'complete' : !running ? 'paused' : pending ? 'between' : speaking ? 'speaking' : modelPlaying ? 'model' : 'gap';
    host.dataset.mode = state.mode; host.dataset.difficulty = state.difficulty;
    host.dataset.slot = String(state.slot); host.dataset.cycle = String(state.cycle);
    host.dataset.count = String(pending?.count ?? state.count);
    steps.forEach((el, i) => {
      const done = state.mode === 'count' ? i < (pending?.count ?? state.count) : state.complete || i < state.slot || (pending !== null && i === state.slot);
      const active = !state.complete && i === state.slot && !done;
      el.classList.toggle('done', done); el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      el.style.setProperty('--progress', active ? String(state.mode === 'speed' ? Math.min(1, time / d) : spoken / d) : '0');
      const label = done ? (state.mode === 'speed' ? '再生済み' : '話しました') : active ? (state.mode === 'speed' ? '再生中' : '練習中') : 'これから';
      if (el.lastChild.textContent !== label) el.lastChild.textContent = label;
    });
    $('speed-value').firstChild.textContent = flow.menu(state)[state.slot].toFixed(1);
    setText('model-state', modelPlaying ? 'お手本を再生中' : 'お手本の再生終了');
    setText('voice-state', speaking ? '話しています' : established && state.mode === 'speed' ? 'この周では発話済み' : speechStart !== null ? '話し終わりました' : '好きなタイミングで');
    speak.textContent = state.complete ? 'もう一度試す' : '話す';
    speak.disabled = !ready || (!state.complete && (!running || speechStart !== null || pending !== null));
    pause.disabled = !ready || state.complete; reset.disabled = !ready;
    pause.textContent = running ? '一時停止' : '再生する';
    $('next-phrase').hidden = !state.complete;
    if (!ready) return;
    let feedback;
    if (state.complete) feedback = state.mode === 'speed' ? '発話を確認し、速度メニューの最後まで再生しました。次のフレーズへ進めます。' : flow.presets[state.difficulty].count + '回話しました。次のフレーズへ進めます。';
    else if (!running) feedback = '一時停止中です。「再生する」で続きを試せます。';
    else if (speaking) feedback = '話しています。お手本と発話が終わるまで待ちます。';
    else if (state.mode === 'speed' && established) feedback = '声を確認しました。残りのお手本を聞くと、次へ進みます。';
    else if (state.mode === 'speed' && (state.cycle > 1 || (pending && pending.cycle > state.cycle))) feedback = 'まだ話していないので、同じ速度メニューをもう一周。話せそうなところでどうぞ。';
    else if (state.mode === 'speed') feedback = '難易度を切り替えると、速度メニューが変わります。話せそうな速さで「話す」を。';
    else if (pending && pending.count > state.count) feedback = pending.complete ? '設定した回数がそろいました。' : 'あと' + (flow.presets[state.difficulty].count - pending.count) + '回。同じ速さでもう一度。';
    else if (heardAgain) feedback = '聞き直しています。話していないので、回数はそのままです。';
    else feedback = '「話す」で回数が増えます。「自動で話す」でメニュー全体を見られます。';
    setText('feedback', feedback);
  }
  function tick(stamp) {
    const delta = last === null ? 0 : Math.min((stamp - last) / 1000, .1); last = stamp;
    if (ready && running && inView && !document.hidden && !state.complete) {
      time += delta * (slow.checked ? .5 : 1);
      const d = duration();
      if (!pending && auto.checked && speechStart === null && time >= .35 && !(state.mode === 'speed' && state.established)) speechStart = time;
      const attemptEnd = speechStart === null ? d + gap : Math.max(d, speechStart + d);
      if (!pending && time >= attemptEnd) {
        pending = flow.next(state, speechStart !== null); finishedAt = time;
        heardAgain = speechStart === null;
      }
      if (pending && time - finishedAt >= hold) {
        state = pending;
        if (!state.complete) restartAttempt();
        else pending = null;
      }
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  function fail() {
    ready = running = false; failed = true; cancelAnimationFrame(frame); render();
    setText('feedback', 'アニメーションを読み込めませんでした。難易度と方式を切り替えて、上のメニューを比較できます。');
  }
  rebuildMenu(); render();
  radios.forEach(input => input.addEventListener('change', resetAll));
  speak.addEventListener('click', () => {
    if (!ready) return;
    if (state.complete) {resetAll(); running = true;}
    else if (running && speechStart === null && !pending) speechStart = time;
    render();
  });
  pause.addEventListener('click', () => {running = !running; last = null; render();});
  reset.addEventListener('click', resetAll);
  document.addEventListener('visibilitychange', () => {last = null;});
  reduced.addEventListener('change', e => {if (e.matches) {running = false; render();}});
  let heightObserver;
  if (document.documentElement.classList.contains('embedded')) {
    const height = () => parent.postMessage({type: 'practice-height', height: Math.ceil(document.body.getBoundingClientRect().height)}, location.origin);
    heightObserver = new ResizeObserver(height); heightObserver.observe(document.body);
    addEventListener('message', e => {if (e.origin === location.origin && e.source === parent && e.data?.type === 'practice-visibility') {inView = e.data.visible === true; last = null;}});
    height();
  }
  if (!window.rive) {fail(); return;}
  const timer = setTimeout(fail, 15000);
  rive.RuntimeLoader.setWasmUrl(new URL('../vendor/rive-2.43.1/rive.wasm', location.href).href);
  rive.RuntimeLoader.setWasmFallbackUrl(new URL('../vendor/rive-2.43.1/rive_fallback.wasm', location.href).href);
  player = new rive.Rive({
    src: new URL('../animations/practice-timing.riv', location.href).href,
    canvas, artboard: 'Practice Timing', animations, autoplay: false,
    enableRiveAssetCDN: false, shouldDisableRiveListeners: true,
    layout: new rive.Layout({fit: rive.Fit.Contain, alignment: rive.Alignment.Center}),
    onLoad() {clearTimeout(timer); failed = false; ready = true; player.pause(animations); player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); render(); frame = requestAnimationFrame(tick);},
    onLoadError() {clearTimeout(timer); fail();}
  });
  const observer = new ResizeObserver(() => {if (ready) {player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); render();}});
  observer.observe(canvas);
  addEventListener('pagehide', e => {if (!e.persisted) {cancelAnimationFrame(frame); clearTimeout(timer); observer.disconnect(); heightObserver?.disconnect(); player.cleanup();}});
})();
