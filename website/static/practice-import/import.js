(() => {
  'use strict';
  const $ = id => document.getElementById(id), flow = window.ImportFlow, host = document.querySelector('.import-demo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), animations = ['Model','Speak','Offset','Phrase Pattern'];
  const NS = 'http://www.w3.org/2000/svg', total = 12;
  let bounds = flow.initial(), selected = 1, cut = 5.9, phase = 'idle', training = false, running = true, inView = true;
  let time = 0, scanTime = 0, last = null, frame, player, ready = false, loadTimer, heightObserver;
  let feedback = 'まずはサンプル音源を取り込んでみましょう。';
  const text = (id, value) => {if ($(id).textContent !== value) $(id).textContent = value;};
  const secs = n => n.toFixed(1) + '秒';
  const length = () => bounds[selected + 1] - bounds[selected];
  const x = n => n / total * 1000;
  function line(x1, y1, y2) {const el = document.createElementNS(NS, 'line'); Object.entries({x1, x2:x1, y1, y2}).forEach(([k,v]) => el.setAttribute(k,v)); return el;}
  const bars = Array.from({length:140}, (_, i) => {
    const t = (i + .5) / 140 * total;
    const nearSilence = Math.min(...[0,3.2,5.9,8.6,12].map(v => Math.abs(t-v)));
    const height = 4 + Math.min(1, nearSilence * 4) * (12 + 34 * Math.abs(Math.sin(i * 1.73)) + 18 * Math.abs(Math.sin(i * .17)));
    return line(x(t), 75 - height, 75 + height);
  });
  $('wave-bars').replaceChildren(...bars);
  function stopForEdit() {training = false; time = 0; running = true; last = null;}
  function resetCut() {cut = Math.round((bounds[selected] + bounds[selected + 1]) * 5) / 10;}
  function rebuild() {
    $('piece-tabs').replaceChildren(...bounds.slice(0,-1).map((start, i) => {
      const button = document.createElement('button'); button.textContent = String(i + 1);
      button.style.flexBasis = (bounds[i+1] - start) / total * 100 + '%';
      button.setAttribute('aria-label', '区切り' + (i + 1) + 'を選ぶ、' + secs(bounds[i+1] - start));
      button.addEventListener('click', () => {stopForEdit(); selected = i; resetCut(); feedback = '区切り' + (i + 1) + 'を選びました。この範囲を編集・練習できます。'; render();});
      return button;
    }));
    $('boundaries').replaceChildren(...bounds.slice(1,-1).map(at => line(x(at), 0, 150)));
  }
  function range(id, lo, hi, value, disabled) {const el = $(id); el.min = lo; el.max = hi; el.value = value; el.disabled = disabled;}
  function render() {
    const imported = phase === 'ready', canSplit = length() >= flow.MIN * 2 - 1e-8 && bounds.length <= flow.MAX_PIECES;
    host.dataset.phase = phase;
    $('editor').setAttribute('aria-busy', String(phase === 'importing'));
    $('import').disabled = phase !== 'idle'; text('import', phase === 'idle' ? 'サンプル音源を取り込む' : phase === 'importing' ? '区切りを準備中…' : '取り込みました');
    text('import-state', phase === 'idle' ? '音源を取り込む' : phase === 'importing' ? '自動で区切る' : '練習の準備ができました');
    $('import-placeholder').hidden = imported || phase === 'importing'; $('scan').hidden = phase !== 'importing';
    $('edit-controls').hidden = !imported; $('piece-tabs').hidden = !imported;
    $('boundaries').style.visibility = imported ? 'visible' : 'hidden';
    $('selection').style.visibility = imported ? 'visible' : 'hidden';
    $('cut-line').style.visibility = imported && !training && canSplit ? 'visible' : 'hidden';
    $('play-line').style.visibility = imported && training ? 'visible' : 'hidden';
    text('piece-count', imported ? (bounds.length - 1) + 'つの区切り' : phase === 'importing' ? '音の切れ目を確認する様子' : '取り込み前');
    if (imported) {
      text('selected-title', '区切り' + (selected + 1)); text('selected-duration', secs(length()));
      text('selected-range', secs(bounds[selected]) + ' → ' + secs(bounds[selected + 1]));
      $('selection').setAttribute('x', x(bounds[selected])); $('selection').setAttribute('width', x(length()));
      [...$('piece-tabs').children].forEach((el,i) => el.setAttribute('aria-pressed', String(i === selected)));
      range('cut', canSplit ? bounds[selected] + flow.MIN : bounds[selected], canSplit ? bounds[selected + 1] - flow.MIN : bounds[selected + 1], cut, !canSplit);
      text('cut-value', secs(cut)); $('cut-line').setAttribute('x1', x(cut)); $('cut-line').setAttribute('x2', x(cut));
      $('split').disabled = !canSplit; $('join').disabled = selected === bounds.length - 2;
      range('start', selected > 0 ? bounds[selected - 1] + flow.MIN : 0, bounds[selected + 1] - flow.MIN, bounds[selected], selected === 0);
      range('end', bounds[selected] + flow.MIN, selected < bounds.length - 2 ? bounds[selected + 2] - flow.MIN : total, bounds[selected + 1], selected === bounds.length - 2);
      text('start-value', secs(bounds[selected])); text('end-value', secs(bounds[selected + 1]));
      text('practice', training ? '練習を止めて編集する' : 'この区切りで練習を見る');
    }
    $('practice-preview').hidden = !training;
    text('feedback', feedback);
    $('pause').disabled = phase !== 'importing' && !training; text('pause', running ? '一時停止' : '再生する');
    renderMotion();
  }
  function renderMotion() {
    if (phase === 'importing') $('scan').style.left = (reduced.matches ? 35 : scanTime / 1.4 * 100 - 30) + '%';
    if (!training) return;
    const duration = Math.max(.7, Math.min(3.5, length() * .55)), cycle = time % (duration + .8);
    text('practice-piece', '区切り' + (selected + 1) + 'だけを練習');
    text('practice-range', secs(bounds[selected]) + ' → ' + secs(bounds[selected + 1]) + ' ／ ' + secs(length()));
    text('practice-caption', !running ? '一時停止中です。' : 'この範囲だけを繰り返す自動デモです。');
    const at = bounds[selected] + length() * Math.min(1, cycle / duration);
    $('play-line').setAttribute('x1', x(reduced.matches ? bounds[selected] : at)); $('play-line').setAttribute('x2', x(reduced.matches ? bounds[selected] : at));
    if (ready) {
      player.scrub('Phrase Pattern', (selected % 3) * .5); player.scrub('Offset', .1);
      player.scrub('Model', reduced.matches ? 2 : Math.min(2, cycle / duration * 2));
      player.scrub('Speak', reduced.matches ? 2 : Math.min(2, Math.max(0, cycle - .35) / duration * 2));
    }
  }
  $('import').addEventListener('click', () => {phase = 'importing'; scanTime = 0; running = true; feedback = '音源を取り込み、音の切れ目をもとに区切る様子を表示しています。'; render();});
  $('cut').addEventListener('input', () => {stopForEdit(); cut = Number($('cut').value); feedback = 'オレンジの線が分割位置です。「ここで分割」で短くできます。'; render();});
  $('split').addEventListener('click', () => {
    const before = length(), oldEnd = bounds[selected + 1];
    bounds = flow.split(bounds, selected, cut); stopForEdit();
    feedback = secs(before) + 'の区切りを、' + secs(length()) + 'と' + secs(oldEnd - bounds[selected + 1]) + 'に分けました。短くなった区切りで練習してみましょう。';
    resetCut(); rebuild(); render();
  });
  $('join').addEventListener('click', () => {bounds = flow.join(bounds, selected); stopForEdit(); resetCut(); feedback = '隣の区切りとつなぎ、' + secs(length()) + 'にしました。'; rebuild(); render();});
  ['start','end'].forEach(id => $(id).addEventListener('input', () => {
    bounds = flow.move(bounds, selected + (id === 'end' ? 1 : 0), Number($(id).value)); stopForEdit(); resetCut();
    feedback = '境界を動かしました。選んだ区切りは' + secs(length()) + 'です。'; rebuild(); render();
  }));
  $('restore').addEventListener('click', () => {bounds = flow.initial(); selected = 1; stopForEdit(); resetCut(); feedback = '自動の区切りに戻しました。このまま練習を始められます。'; rebuild(); render();});
  $('practice').addEventListener('click', () => {training = !training; time = 0; running = true; last = null; feedback = training ? '取り込んだ音源の、選んだ区切りで練習します。範囲を変えると、練習する長さも変わります。' : '練習を止めました。区切りを選び直したり、長さを調整できます。'; render();});
  $('pause').addEventListener('click', () => {running = !running; last = null; render();});
  $('reset').addEventListener('click', () => {phase = 'idle'; bounds = flow.initial(); selected = 1; stopForEdit(); resetCut(); feedback = 'まずはサンプル音源を取り込んでみましょう。'; rebuild(); render();});
  reduced.addEventListener('change', render); document.addEventListener('visibilitychange', () => {last = null;});
  function tick(stamp) {
    const delta = last === null ? 0 : Math.min(.1, (stamp - last) / 1000); last = stamp;
    if (running && inView && !document.hidden) {
      if (phase === 'importing') {
        scanTime += delta;
        if (scanTime >= 1.4) {phase = 'ready'; feedback = '3つの区切りができました。そのまま練習しても、長い区切り2を短くしても。'; rebuild(); render();}
        else renderMotion();
      } else if (training) {time += delta; renderMotion();}
    }
    frame = requestAnimationFrame(tick);
  }
  if (document.documentElement.classList.contains('embedded')) {
    const height = () => parent.postMessage({type:'practice-height',height:Math.ceil(document.body.getBoundingClientRect().height)}, location.origin);
    heightObserver = new ResizeObserver(height); heightObserver.observe(document.body);
    addEventListener('message', e => {if(e.origin === location.origin && e.source === parent && e.data?.type === 'practice-visibility') {inView = e.data.visible === true; last = null;}}); height();
  }
  const fail = () => {ready = false; host.dataset.failed = 'true';};
  if (window.rive) {
    rive.RuntimeLoader.setWasmUrl(new URL('../vendor/rive-2.43.1/rive.wasm',location.href).href);
    rive.RuntimeLoader.setWasmFallbackUrl(new URL('../vendor/rive-2.43.1/rive_fallback.wasm',location.href).href);
    loadTimer = setTimeout(fail,15000);
    player = new rive.Rive({src:new URL('../animations/practice-timing.riv',location.href).href,canvas:$('scene'),artboard:'Practice Timing',animations,autoplay:false,enableRiveAssetCDN:false,shouldDisableRiveListeners:true,
      layout:new rive.Layout({fit:rive.Fit.Contain,alignment:rive.Alignment.Center}),
      onLoad() {clearTimeout(loadTimer);ready = true;host.dataset.failed = 'false';player.pause(animations);player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1,2));renderMotion();},onLoadError() {clearTimeout(loadTimer);fail();}
    });
  } else fail();
  const observer = new ResizeObserver(() => {if(ready) {player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1,2));renderMotion();}}); observer.observe($('scene'));
  render(); frame = requestAnimationFrame(tick);
  addEventListener('pagehide', e => {if(!e.persisted) {clearTimeout(loadTimer);cancelAnimationFrame(frame);observer.disconnect();heightObserver?.disconnect();player?.cleanup();}});
})();
