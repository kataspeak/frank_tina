(() => {
  'use strict';
  const $ = id => document.getElementById(id), flow = window.MedalFlow;
  const host = document.querySelector('.medal-demo'), phrases = ['Good morning.', 'How are you?', 'See you later.'];
  const ranks = ['ブロンズ', 'シルバー', 'ゴールド'];
  const buttons = [...document.querySelectorAll('[data-phrase]')], columns = [...document.querySelectorAll('.phrase-column')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), animations = ['Model','Speak','Offset','Phrase Pattern'];
  let state = flow.start(), selected = 0, busy = false, auto = false, running = true, inView = true;
  let time = 0, wait = 0, last = null, frame, award = 0, ready = false, player, loadTimer, heightObserver;
  let message = '上のボタンで、好きなフレーズを練習してみましょう。';
  const setText = (id, value) => {if ($(id).textContent !== value) $(id).textContent = value;};
  $('medal-shelf').innerHTML = ranks.map((name, i) => `<div class="medal-item" data-rank="${i + 1}"><svg viewBox="0 0 120 138" aria-hidden="true"><defs><linearGradient id="metal-${i}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--light)"/><stop offset=".5" stop-color="var(--metal)"/><stop offset="1" stop-color="var(--shade)"/></linearGradient></defs><path d="M34 76 L24 130 L44 119 L57 135 L65 86 M65 86 L77 135 L89 119 L108 128 L88 76" fill="var(--shade)"/><circle cx="60" cy="58" r="47" fill="url(#metal-${i})"/><circle cx="60" cy="58" r="38" fill="none" stroke="var(--light)" stroke-width="2"/><path d="M40 76 Q22 56 40 37 M80 76 Q98 56 80 37" fill="none" stroke="var(--shade)" stroke-width="3"/><path d="M60 27 L63 34 L71 35 L65 40 L67 48 L60 44 L53 48 L55 40 L49 35 L57 34 Z" fill="var(--light)"/><text x="60" y="76" text-anchor="middle" fill="var(--shade)" font-family="Georgia,serif" font-size="25" font-weight="bold">${['I','II','III'][i]}</text></svg><strong class="medal-name">${name}</strong><span class="medal-target"></span><span class="medal-state">これから</span></div>`).join('');
  const medals = [...document.querySelectorAll('.medal-item')];
  $('medal-shelf').replaceChildren(...[...medals].reverse());
  function rebuild() {
    for (let i = 0; i < 3; i++) {
      $('stack-' + i).replaceChildren(...Array.from({length:state.step * 3}, () => document.createElement('i')));
      medals[i].querySelector('.medal-target').textContent = '通し ' + state.step * (i + 1) + '回';
    }
  }
  function render() {
    const rounds = flow.rounds(state), gold = state.step * 3;
    host.dataset.mode = state.counting ? 'counting' : 'warmup';
    host.dataset.award = String(award > 0); host.dataset.frozen = String(!running || !inView || document.hidden);
    medals.forEach((el, i) => {
      el.classList.toggle('earned', i < state.rank); el.classList.toggle('celebrate', i + 1 === award);
      el.querySelector('.medal-state').textContent = i < state.rank ? '獲得済み' : 'これから';
    });
    $('award-icon').hidden = !award;
    if (award && $('award-icon').dataset.rank !== String(award)) {
      $('award-icon').dataset.rank = String(award);
      $('award-icon').innerHTML = medals[award - 1].querySelector('svg').outerHTML.replaceAll('metal-' + (award - 1), 'award-metal');
    }
    setText('rounds', String(rounds));
    setText('demo-setting-note', (state.step === 2 ? '体験用の目標' : 'アプリの初期設定') + '：各段階' + state.step + '回ずつ');
    setText('achievement-text', award ? ranks[award - 1] + '獲得！ ' + (award === 3 ? 'このレッスンの目標通し回数に届きました。' : '積み重ねた練習が、メダルになりました。') : !state.counting ? (state.counts.some(n => n > 0) ? '慣らし練習に戻りました。これまでの積み重ねは残ります。' : 'まずは慣らし練習。回数を気にせず、声に出して。') : 'すべてのフレーズで、ひとつずつ練習を積み重ねましょう。');
    setText('goal', !state.counting ? (state.rank ? 'カウントを休止中。これまでの回数とメダルは残ります。' : 'カウントを始めると、メダルに向けて練習を数えます。') : state.rank === 3 ? 'ゴールド獲得後も、練習を続けられます。' : ranks[state.rank] + 'まで、あと通し' + ((state.rank + 1) * state.step - rounds) + '回。');
    document.querySelector('.stack-area').style.setProperty('--matched', String(Math.min(1, rounds / gold)));
    columns.forEach((el, i) => {
      el.classList.toggle('active', i === selected);
      setText('count-' + i, String(state.counts[i]));
      $('stack-' + i).setAttribute('aria-label', 'フレーズ' + (i + 1) + 'の練習回数 ' + state.counts[i] + '回');
      [...$('stack-' + i).children].forEach((block, j) => {
        block.classList.toggle('filled', j < state.counts[i]); block.classList.toggle('matched', j < rounds);
        block.classList.toggle('latest', j === state.counts[i] - 1);
      });
      buttons[i].disabled = busy || auto;
    });
    setText('stack-caption', rounds ? '練習回数 ' + state.counts.join('・') + '回 → すべてでそろった ' + rounds + '回が、通し回数。' : state.counts.some(n => n > 0) ? 'ひとつだけ増えても、通し回数はまだ0回。3つすべての練習をそろえましょう。' : '3つすべてでそろった回数が、通し回数になります。');
    $('count-mode').disabled = busy || auto;
    setText('count-mode', state.counting ? 'カウントを休止する' : 'カウントを始める');
    $('auto').disabled = !state.counting || state.rank === 3 || (busy && !auto);
    setText('auto', auto ? '自動練習を止める' : state.rank === 3 ? 'ゴールドまで到達しました' : ranks[state.rank] + 'まで自動で練習');
    $('target').disabled = busy || auto;
    $('pause').disabled = !busy && !auto;
    setText('pause', running ? '一時停止' : '再生する');
    setText('mode-label', state.counting ? 'メダルに向けてカウント中' : '慣らし練習');
    setText('current-phrase', phrases[selected]);
    setText('practice-message', !running && busy ? '一時停止中です。「再生する」で続きを見られます。' : message);
    if (ready) {
      player.scrub('Phrase Pattern', selected * .5); player.scrub('Offset', .1);
      player.scrub('Model', busy && !reduced.matches ? Math.min(2, time / 1.6 * 2) : 2);
      player.scrub('Speak', busy && !reduced.matches ? Math.min(2, Math.max(0, time - .35) / 1.6 * 2) : 2);
    }
  }
  function begin(index) {
    selected = index; busy = true; running = true; time = 0; award = 0;
    message = 'フレーズ' + (index + 1) + 'を練習しています。'; render();
  }
  function complete() {
    const before = state, oldRounds = flow.rounds(state);
    state = flow.practice(state, selected); busy = false; wait = .5;
    if (state.rank > before.rank) {award = state.rank; auto = false;}
    message = !state.counting ? '慣らし中なので回数は増えません。準備ができたら、カウントを始めましょう。' : flow.rounds(state) > oldRounds ? '3つのフレーズで練習がそろい、通し回数が増えました。' : 'このフレーズの練習が1回増えました。他のフレーズもそろうと、通し回数が増えます。';
    render();
  }
  function reset() {state = flow.start(Number($('target').value)); selected = 0; busy = auto = false; running = true; time = 0; last = null; award = 0; message = '上のボタンで、好きなフレーズを練習してみましょう。'; rebuild(); render();}
  buttons.forEach((button, i) => button.addEventListener('click', () => begin(i)));
  $('count-mode').addEventListener('click', () => {state = flow.setCounting(state, !state.counting); award = 0; message = state.counting ? 'これからの練習を数えます。慣らし中の練習は加算しません。' : 'カウントを休止しました。これまでの回数とメダルは残ります。'; render();});
  $('auto').addEventListener('click', () => {auto = !auto; if (auto && !busy) begin(flow.nextPhrase(state)); else render();});
  $('pause').addEventListener('click', () => {running = !running; last = null; render();});
  $('reset').addEventListener('click', reset); $('target').addEventListener('change', reset);
  reduced.addEventListener('change', render); document.addEventListener('visibilitychange', () => {last = null; render();});
  function tick(stamp) {
    const delta = last === null ? 0 : Math.min(.1, (stamp - last) / 1000); last = stamp;
    if (running && inView && !document.hidden) {
      if (busy) {time += delta; if (time >= 1.95) complete(); else render();}
      else if (auto) {wait -= delta; if (wait <= 0) begin(flow.nextPhrase(state));}
    }
    frame = requestAnimationFrame(tick);
  }
  if (document.documentElement.classList.contains('embedded')) {
    const height = () => parent.postMessage({type:'practice-height', height:Math.ceil(document.body.getBoundingClientRect().height)}, location.origin);
    heightObserver = new ResizeObserver(height); heightObserver.observe(document.body);
    addEventListener('message', e => {if (e.origin === location.origin && e.source === parent && e.data?.type === 'practice-visibility') {inView = e.data.visible === true; last = null; render();}}); height();
  }
  const fail = () => {ready = false; host.dataset.failed = 'true'; render();};
  if (window.rive) {
    rive.RuntimeLoader.setWasmUrl(new URL('../vendor/rive-2.43.1/rive.wasm', location.href).href);
    rive.RuntimeLoader.setWasmFallbackUrl(new URL('../vendor/rive-2.43.1/rive_fallback.wasm', location.href).href);
    loadTimer = setTimeout(fail, 15000);
    player = new rive.Rive({src:new URL('../animations/practice-timing.riv', location.href).href, canvas:$('scene'), artboard:'Practice Timing', animations, autoplay:false, enableRiveAssetCDN:false, shouldDisableRiveListeners:true,
      layout:new rive.Layout({fit:rive.Fit.Contain, alignment:rive.Alignment.Center}),
      onLoad() {clearTimeout(loadTimer); ready = true; host.dataset.failed = 'false'; player.pause(animations); player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); render();}, onLoadError() {clearTimeout(loadTimer); fail();}
    });
  } else fail();
  const observer = new ResizeObserver(() => {if (ready) {player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); render();}}); observer.observe($('scene'));
  rebuild(); render(); frame = requestAnimationFrame(tick);
  addEventListener('pagehide', e => {if (!e.persisted) {clearTimeout(loadTimer); cancelAnimationFrame(frame); observer.disconnect(); heightObserver?.disconnect(); player?.cleanup();}});
})();
