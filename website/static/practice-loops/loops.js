(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const host = document.querySelector('.demo'), map = document.querySelector('.lesson-map'), canvas = $('scene');
  const speak = $('speak'), pause = $('pause'), reset = $('reset'), slow = $('slow');
  const repeats = $('repeats'), repeatLesson = $('lesson-repeat'), auto = $('auto-speak');
  const phrases = ['Good morning.', 'How are you?', 'See you later.'];
  const animations = ['Model', 'Speak', 'Offset', 'Phrase Pattern'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const d = 1.5, hold = 1;
  let player, ready = false, running = !reduced.matches, inView = true;
  let part = 0, lap = 1, counts = [0,0,0], time = 0, speechStart = null, finishedAt = null;
  let motion = 'none', completed = false, last = null, frame, listenedAgain = false;
  const target = () => Number(repeats.value);
  function restart() {time=0;speechStart=null;finishedAt=null;motion='none';last=null;}
  function resetAll() {part=0;lap=1;counts=[0,0,0];completed=false;listenedAgain=false;restart();}
  const message = text => {if($('feedback').textContent!==text)$('feedback').textContent=text;};
  function fail() {
    ready=running=false;cancelAnimationFrame(frame);
    speak.disabled=pause.disabled=reset.disabled=true;
    message('読み込めませんでした。ページを再読み込みしてください。同じフレーズの反復と、レッスン全体の反復があります。');
  }
  const timer=setTimeout(fail,15000);
  function render() {
    if(!ready)return;
    const spoken=speechStart===null?0:Math.min(d,time-speechStart);
    const modelPlaying=time<d&&!completed, speaking=speechStart!==null&&spoken<d&&!completed;
    player.scrub('Phrase Pattern',part/2);
    player.scrub('Model',Math.min(2,time/d*2));
    player.scrub('Speak',spoken/d*2);
    player.scrub('Offset',(speechStart||0)/d*216/480);
    host.dataset.state=completed?'complete':!running?'paused':motion!=='none'?motion:speaking?'speaking':modelPlaying?'model':'gap';
    host.dataset.part=String(part);host.dataset.lap=String(lap);
    map.dataset.motion=motion;map.dataset.repeat=repeatLesson.checked?'on':'off';
    $('lap').textContent=lap+'周目';
    $('current-phrase').textContent=phrases[part];
    $('outer-label').textContent=repeatLesson.checked?'最後まで進んだら、先頭へ':'リピートOFF：最後で止まる';
    document.querySelectorAll('.loop-card').forEach((el,i)=>{
      el.classList.toggle('active',i===part&&!completed);el.classList.toggle('done',counts[i]===target());
      if(i===part&&!completed)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
      const tally=el.querySelector('.tally');
      const html=Array.from({length:target()},(_,n)=>'<i aria-hidden="true" class="'+(n<counts[i]?'filled':'')+'"></i>').join('')+'<em>'+counts[i]+' / '+target()+'回</em>';
      if(tally.innerHTML!==html)tally.innerHTML=html;
      tally.setAttribute('aria-label','この周で話した回数 '+counts[i]+' / '+target()+'回');
    });
    $('loop-badge').textContent=motion==='outer'?'大きなループ':motion==='inner'?'小さなループ':motion==='next'?'次のフレーズへ':completed?'レッスン終了':'フレーズの練習';
    $('model-state').textContent=modelPlaying?'お手本を再生中':'お手本の再生終了';
    $('voice-state').textContent=speaking?'話しています':speechStart!==null?'話し終わりました':'好きなタイミングで';
    speak.textContent=completed?'もう一度試す':'話す';
    speak.disabled=!completed&&(!running||speechStart!==null);
    pause.disabled=completed;pause.textContent=running?'一時停止':'再生する';
    if(completed)message('レッスンの最後まで進みました。リピートOFFなので、ここで止まります。');
    else if(!running)message('一時停止中です。「再生する」で続きを試せます。');
    else if(motion==='outer')message('3フレーズを終えました。大きなループでレッスンの先頭へ。');
    else if(motion==='inner')message('小さなループ。同じフレーズを、あと'+(target()-counts[part])+'回練習します。');
    else if(motion==='next')message(target()+'回話しました。次のフレーズへ進みます。');
    else if(speaking)message('話し終えたら、このフレーズの回数が1つ増えます。');
    else message(listenedAgain?'聞き直しています。話していないので、回数はそのままです。':'「話す」で進めるか、「自動で話す」で2つのループを続けて見られます。');
  }
  function tick(stamp) {
    const delta=last===null?0:Math.min((stamp-last)/1000,.1);last=stamp;
    if(ready&&running&&inView&&!document.hidden&&!completed){
      time+=delta*(slow.checked?.5:1);
      if(auto.checked&&speechStart===null&&time>=.35) speechStart=time;
      if(speechStart===null&&time>=d+.8){restart();listenedAgain=true;}
      else if(speechStart!==null&&time>=Math.max(d,speechStart+d)){
        if(finishedAt===null){
          finishedAt=time;counts[part]++;
          motion=counts[part]<target()?'inner':part<2?'next':repeatLesson.checked?'outer':'end';
        }
        if(time-finishedAt>=hold){
          if(motion==='inner')restart();
          else if(motion==='next'){part++;restart();}
          else if(motion==='outer'){lap++;part=0;counts=[0,0,0];restart();}
          else completed=true;
          listenedAgain=false;
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
    src:new URL('../animations/practice-timing.riv',location.href).href,
    canvas,artboard:'Practice Timing',animations,autoplay:false,
    enableRiveAssetCDN:false,shouldDisableRiveListeners:true,
    layout:new rive.Layout({fit:rive.Fit.Contain,alignment:rive.Alignment.Center}),
    onLoad(){clearTimeout(timer);ready=true;pause.disabled=reset.disabled=false;player.pause(animations);player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio||1,2));render();frame=requestAnimationFrame(tick);},
    onLoadError(){clearTimeout(timer);fail();}
  });
  speak.addEventListener('click',()=>{if(!ready)return;if(completed){resetAll();running=true;}else if(running&&speechStart===null)speechStart=time;render();});
  pause.addEventListener('click',()=>{running=!running;last=null;render();});
  reset.addEventListener('click',()=>{resetAll();render();});
  [repeats,repeatLesson].forEach(input=>input.addEventListener('change',()=>{resetAll();render();}));
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
