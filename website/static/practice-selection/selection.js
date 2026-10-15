(() => {
  'use strict';
  const $ = id => document.getElementById(id), flow = window.SelectionFlow;
  const host = document.querySelector('.demo'), canvas = $('scene'), repeat = $('course-repeat');
  const pause = $('pause'), reset = $('reset'), slow = $('slow');
  const inputs = [...document.querySelectorAll('[name=lesson]')];
  const lessons = [
    {title: 'あいさつ', phrase: 'Good morning.', pattern: 0},
    {title: '注文', phrase: 'A coffee, please.', pattern: .5},
    {title: '道案内', phrase: 'Where is the station?', pattern: 1},
    {title: '買い物', phrase: 'How much is this?', pattern: .5}
  ];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = ['Model', 'Speak', 'Offset', 'Phrase Pattern'];
  const duration = 1.6, speechAt = .35, travelDuration = 1;
  const practiceEnd = duration + speechAt;
  let state = flow.start([0, 2]), pending = null, time = 0, last = null;
  let player, frame, ready = false, failed = false, running = !reduced.matches, inView = true;
  let returnLength = 0, nodes = [], selectionChanged = false;
  const number = id => String(id + 1).padStart(2, '0');
  const x = index => (index + .5) / state.selected.length * 1000;
  const setText = (id, text) => {if ($(id).textContent !== text) $(id).textContent = text;};
  function rebuildRoute() {
    $('route-nodes').replaceChildren(...state.selected.map(id => {
      const item = document.createElement('li'), label = document.createElement('span');
      label.textContent = number(id); item.setAttribute('aria-label', 'レッスン' + number(id) + ' ' + lessons[id].title);
      item.append(label); return item;
    }));
    nodes = [...$('route-nodes').children];
    const count = state.selected.length;
    if (!count) return;
    const first = x(0), end = x(count - 1);
    $('forward-path').setAttribute('d', `M ${first} 60 H ${end}`);
    $('return-path').setAttribute('d', count === 1 ? 'M 500 60 C 700 60 700 120 500 120 C 300 120 300 60 500 60' : `M ${end} 60 V 90 Q ${end} 120 ${end - 30} 120 H ${first + 30} Q ${first} 120 ${first} 90 V 60`);
    returnLength = $('return-path').getTotalLength();
  }
  function restart() {time = 0; pending = null; last = null;}
  function resetSelection(changed = false) {
    state = flow.start(inputs.filter(el => el.checked).map(el => Number(el.value)));
    selectionChanged = changed; restart(); rebuildRoute(); render();
  }
  function render() {
    const id = flow.current(state), hasLessons = id !== null;
    const returning = !!pending && pending.lap > state.lap;
    host.dataset.state = failed ? 'error' : !ready ? 'loading' : !hasLessons ? 'empty' : state.complete ? 'complete' : !running ? 'paused' : pending ? 'moving' : 'practicing';
    host.dataset.motion = returning ? 'return' : pending && !pending.complete ? 'forward' : 'none';
    host.dataset.current = hasLessons ? number(id) : '';
    host.dataset.lap = String(state.lap);
    inputs.forEach(input => {
      const card = input.closest('.lesson-card');
      card.classList.toggle('selected', input.checked);
      card.classList.toggle('current', hasLessons && Number(input.value) === id && !state.complete);
      const label = card.querySelector('.selection-label'), text = input.checked ? '学習中' : '今回はお休み';
      if (label.textContent !== text) label.textContent = text;
    });
    setText('selected-count', '4つのうち、' + state.selected.length + 'つを学習中');
    $('route-diagram').hidden = !hasLessons; $('empty-selection').hidden = hasLessons;
    $('practice-preview').hidden = !hasLessons;
    $('route-diagram').dataset.repeat = repeat.checked ? 'on' : 'off';
    setText('lap', hasLessons ? state.lap + '周目' : '選択なし');
    $('select-all').disabled = state.selected.length === 4;
    $('clear-selection').disabled = !hasLessons;
    pause.disabled = reset.disabled = !ready || !hasLessons;
    pause.textContent = state.complete ? 'もう一度見る' : running ? '一時停止' : '再生する';
    if (hasLessons) {
      const lesson = lessons[id];
      setText('current-number', 'LESSON ' + number(id)); setText('current-title', lesson.title); setText('current-phrase', lesson.phrase);
      setText('route-caption', repeat.checked ? '選んだレッスンだけで、もう一周' : '選んだレッスンの最後で止まる');
      nodes.forEach((el, i) => {
        el.classList.toggle('active', i === state.index && !state.complete);
        if (i === state.index && !state.complete) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      });
      let point = {x: x(state.index), y: 60};
      if (pending && !pending.complete) {
        const progress = Math.min(1, (time - practiceEnd) / travelDuration);
        point = returning ? $('return-path').getPointAtLength(progress * returnLength) : {x: x(state.index) + (x(pending.index) - x(state.index)) * progress, y: 60};
      }
      $('runner').setAttribute('cx', point.x); $('runner').setAttribute('cy', point.y);
      if (ready) {
        player.scrub('Phrase Pattern', lesson.pattern);
        player.scrub('Model', Math.min(2, time / duration * 2));
        player.scrub('Speak', Math.min(2, Math.max(0, time - speechAt) / duration * 2));
        player.scrub('Offset', speechAt / duration * 216 / 480);
      }
    }
    let feedback;
    if (failed) feedback = 'アニメーションを読み込めませんでした。カードを切り替えて練習ルートを比較できます。';
    else if (!ready) feedback = 'アニメーションを読み込んでいます…';
    else if (!hasLessons) feedback = '学習中のレッスンがないので、デモは停止しています。';
    else if (state.complete) feedback = '選んだレッスンを最後まで進みました。リピートOFFなので、ここで止まります。';
    else if (!running) feedback = '一時停止中です。レッスンの選択は変えられます。';
    else if (returning) feedback = state.selected.length === 1 ? '選んだレッスンは1つ。このレッスンを繰り返します。' : '選んだレッスンをひと通り。先頭のレッスンへ戻ります。';
    else if (pending && !pending.complete) feedback = '次は、学習中のレッスン' + number(flow.current(pending)) + 'へ。';
    else if (selectionChanged && time < 1.2) feedback = '練習ルートを変更しました。選んだレッスンの先頭から始めます。';
    else feedback = 'レッスン' + number(id) + 'を練習中。「学習中」を切り替えて、ルートを変えてみましょう。';
    setText('feedback', feedback);
  }
  function tick(stamp) {
    const delta = last === null ? 0 : Math.min((stamp - last) / 1000, .1); last = stamp;
    if (ready && running && inView && !document.hidden && state.selected.length && !state.complete) {
      time += delta * (slow.checked ? .5 : 1);
      if (!pending && time >= practiceEnd) pending = flow.next(state, repeat.checked);
      if (pending && time >= practiceEnd + travelDuration) {
        state = pending;
        if (!state.complete) restart(); else pending = null;
        selectionChanged = false;
      }
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  function fail() {ready = false; failed = true; running = false; cancelAnimationFrame(frame); render();}
  inputs.forEach(input => input.addEventListener('change', () => resetSelection(true)));
  $('select-all').addEventListener('click', () => {inputs.forEach(input => {input.checked = true;}); resetSelection(true);});
  $('clear-selection').addEventListener('click', () => {inputs.forEach(input => {input.checked = false;}); resetSelection(true);});
  repeat.addEventListener('change', () => resetSelection(true));
  reset.addEventListener('click', () => resetSelection());
  pause.addEventListener('click', () => {if (state.complete) {resetSelection(); running = true;} else running = !running; last = null; render();});
  reduced.addEventListener('change', e => {if (e.matches) {running = false; render();}});
  document.addEventListener('visibilitychange', () => {last = null;});
  rebuildRoute(); render();
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
  player = new rive.Rive({src: new URL('../animations/practice-timing.riv', location.href).href,
    canvas, artboard: 'Practice Timing', animations, autoplay: false, enableRiveAssetCDN: false, shouldDisableRiveListeners: true,
    layout: new rive.Layout({fit: rive.Fit.Contain, alignment: rive.Alignment.Center}),
    onLoad() {clearTimeout(timer); ready = true; failed = false; player.pause(animations); player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); render(); frame = requestAnimationFrame(tick);},
    onLoadError() {clearTimeout(timer); fail();}
  });
  const observer = new ResizeObserver(() => {
    const bounds = $('route-diagram').querySelector('svg').getBoundingClientRect();
    if (bounds.width && bounds.height) {
      // Keep the moving marker round and legible as the route changes width.
      $('runner').setAttribute('rx', 6000 / bounds.width);
      $('runner').setAttribute('ry', 840 / bounds.height);
    }
    if (ready) {player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); render();}
  });
  observer.observe(canvas); observer.observe($('route-diagram').querySelector('svg'));
  addEventListener('pagehide', e => {if (!e.persisted) {clearTimeout(timer); cancelAnimationFrame(frame); observer.disconnect(); heightObserver?.disconnect(); player.cleanup();}});
})();
