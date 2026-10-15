(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const host = document.querySelector('.demo'), canvas = $('scene');
  const speak = $('speak'), pause = $('pause'), reset = $('reset'), slow = $('slow');
  const parts = ['I would like', 'a cup of coffee', 'and a sandwich, please.'];
  const animations = ['Model', 'Speak', 'Offset', 'Chunk Scope'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let player, ready = false, running = !reduced.matches, inView = true;
  let mode = 'whole', part = 0, time = 0, speechStart = null, finishedAt = null, completed = false, last = null, frame;
  const duration = () => mode === 'whole' ? 3.6 : 1.2;
  function restart() {time = 0; speechStart = null; finishedAt = null; last = null;}
  function resetAll() {part = 0; completed = false; restart();}
  const message = text => {if ($('feedback').textContent !== text) $('feedback').textContent = text;};
  function fail() {
    ready = running = false; cancelAnimationFrame(frame);
    speak.disabled = pause.disabled = reset.disabled = true;
    message('読み込めませんでした。ページを再読み込みしてください。長いフレーズは短く区切って練習できます。');
  }
  const timer = setTimeout(fail, 15000);
  function render() {
    if (!ready) return;
    const d = duration(), spoken = speechStart === null ? 0 : Math.min(d, time - speechStart);
    const modelPlaying = time < d && !completed, speaking = speechStart !== null && spoken < d && !completed;
    player.scrub('Chunk Scope', mode === 'whole' ? 0 : (part + 1) / 3);
    player.scrub('Model', modelPlaying ? time / 3.6 * 2 : 2);
    player.scrub('Speak', completed || (speechStart !== null && spoken >= d) ? 2 : spoken / 3.6 * 2);
    player.scrub('Offset', (speechStart || 0) * (240 / 3.6) / 480);
    host.dataset.unit = mode;
    host.dataset.part = String(part);
    host.dataset.state = completed ? 'complete' : !running ? 'paused' : speaking ? 'speaking' : modelPlaying ? 'model' : 'gap';
    document.querySelectorAll('.chunk').forEach((el, i) => {
      el.classList.toggle('active', !completed && (mode === 'whole' || i === part));
      el.classList.toggle('done', completed || (mode === 'chunks' && i < part));
    });
    $('scope-title').textContent = completed ? 'フレーズの最後まで進みました' : mode === 'whole' ? 'フレーズ全体を練習' : parts[part];
    $('scope-count').textContent = mode === 'whole' ? '1フレーズ' : (part + 1) + ' / 3 区切り';
    $('scope-hint').textContent = mode === 'whole' ? '長く感じたら「短く区切る」を試してみましょう。' : '今はこの短い部分だけ。話し終えたら、次へ。';
    $('model-state').textContent = modelPlaying ? 'お手本を再生中' : 'お手本の再生終了';
    $('voice-state').textContent = speaking ? '話しています' : speechStart !== null ? '話し終わりました' : '好きなタイミングで';
    speak.textContent = completed ? 'もう一度試す' : '話す';
    speak.disabled = !completed && (!running || speechStart !== null);
    pause.disabled = completed; pause.textContent = running ? '一時停止' : '再生する';
    if (completed) message(mode === 'chunks' ? '3つの区切りを練習できました。「フレーズ全体」に戻して、長さを比べてみましょう。' : 'フレーズ全体を練習できました。「短く区切る」でも試せます。');
    else if (!running) message('一時停止中です。「再生する」で続きを試せます。');
    else if (speaking) message(mode === 'whole' ? 'フレーズ全体を話しています。' : 'この区切りを話しています。');
    else if (finishedAt !== null) message(mode === 'chunks' ? '話し終わりました。次の区切りへ。' : '話し終わりました。');
    else message(mode === 'chunks' ? '話すまでは、この区切りを繰り返します。' : 'フレーズ全体を繰り返します。「短く区切る」で長さを変えてみましょう。');
  }
  function tick(stamp) {
    const delta = last === null ? 0 : Math.min((stamp-last)/1000,.1); last = stamp;
    if (ready && running && inView && !document.hidden && !completed) {
      time += delta * (slow.checked ? .5 : 1);
      const d = duration();
      if (speechStart === null && time >= d + .8) restart();
      else if (speechStart !== null && time >= Math.max(d,speechStart+d)) {
        finishedAt ??= time;
        if (time-finishedAt >= .45) {
          if (mode === 'chunks' && part < 2) {part++;restart();}
          else completed = true;
        }
      }
      render();
    }
    frame=requestAnimationFrame(tick);
  }
  if (!window.rive) {clearTimeout(timer);fail();return;}
  rive.RuntimeLoader.setWasmUrl(new URL('../vendor/rive-2.43.1/rive.wasm',location.href).href);
  rive.RuntimeLoader.setWasmFallbackUrl(new URL('../vendor/rive-2.43.1/rive_fallback.wasm',location.href).href);
  player=new rive.Rive({
    src:new URL('../animations/practice-chunks.riv',location.href).href,
    canvas,artboard:'Practice Timing',animations,autoplay:false,
    enableRiveAssetCDN:false,shouldDisableRiveListeners:true,
    layout:new rive.Layout({fit:rive.Fit.Contain,alignment:rive.Alignment.Center}),
    onLoad(){clearTimeout(timer);ready=true;pause.disabled=reset.disabled=false;player.pause(animations);player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio||1,2));render();frame=requestAnimationFrame(tick);},
    onLoadError(){clearTimeout(timer);fail();}
  });
  speak.addEventListener('click',()=>{
    if (!ready) return;
    if (completed) {resetAll();running=true;}
    else if (running && speechStart === null) speechStart=time;
    render();
  });
  pause.addEventListener('click',()=>{running=!running;last=null;render();});
  reset.addEventListener('click',()=>{resetAll();render();});
  document.querySelectorAll('input[name=unit]').forEach(input=>input.addEventListener('change',()=>{
    if (!input.checked) return;
    mode=input.value;resetAll();render();
  }));
  document.addEventListener('visibilitychange',()=>{last=null;});
  reduced.addEventListener('change',e=>{if(e.matches){running=false;render();}});
  let heightObserver;
  if(document.documentElement.classList.contains('embedded')){
    const height=()=>parent.postMessage({type:'practice-height',height:Math.ceil(document.body.getBoundingClientRect().height)},location.origin);
    heightObserver=new ResizeObserver(height);heightObserver.observe(document.body);
    addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='practice-visibility'){inView=e.data.visible===true;last=null;}});
    height();
  }
  const observer=new ResizeObserver(()=>{if(ready){player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio||1,2));render();}});
  observer.observe(canvas);
  addEventListener('pagehide',e=>{if(!e.persisted){cancelAnimationFrame(frame);clearTimeout(timer);observer.disconnect();heightObserver?.disconnect();player.cleanup();}});
})();
