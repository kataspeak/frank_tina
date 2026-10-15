(() => {
  'use strict';
  const $=id=>document.getElementById(id), flow=window.RecordingFlow, host=document.querySelector('.recording-demo');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), animations=['Model','Speak','Offset','Phrase Pattern'];
  let state=flow.initial(), running=true, inView=true, frame, player, ready=false, loadTimer, heightObserver;
  let feedback='録音をONにして、「練習する様子を見る」を押してみましょう。';
  const text=(id,value)=>{if($(id).textContent!==value)$(id).textContent=value;};
  const practicing=()=>['model','speech'].includes(state.phase);
  const active=()=>state.phase!=='idle';
  const audio={model:$('model-audio'),voice:$('voice-audio')};
  let audioRequest=0;
  const currentAudio=()=>audio[state.phase==='model'||state.phase==='listen-model'?'model':'voice'];
  const duration=()=>Number.isFinite(currentAudio().duration)&&currentAudio().duration>0?currentAudio().duration:1;
  function stopAudio(){audioRequest++;Object.values(audio).forEach(el=>{el.pause();el.currentTime=0;});}
  function playAudio(){
    const el=currentAudio(),request=++audioRequest;
    running=true;
    el.play().catch(()=>{
      if(request!==audioRequest)return;
      el.pause();running=false;feedback='音声を再生できませんでした。「再生する」を押してもう一度お試しください。';render();
    });
  }
  function pauseForVisibility(){
    if(active()){audioRequest++;currentAudio().pause();running=false;render();}
  }
  Object.values(audio).forEach(el=>{
    el.addEventListener('ended',()=>{
      // Ignore an ended event queued before the user switched or stopped playback.
      if(el!==currentAudio()||!el.ended||!active())return;
      const phase=state.phase, shouldContinue=running&&inView&&!document.hidden;
      stopAudio();
      if(phase==='model'){
        state=flow.speak(state);
        feedback=state.capture?'話した声を残しています。下の「あなたの声」に波形が現れます。':'フランケンくんが話しています。録音OFFなので、声は残しません。';
        if(shouldContinue)playAudio();else running=false;
      }else if(phase==='speech'){
        const saved=state.capture;state=flow.finish(state);
        feedback=saved?'声が残りました。お手本と「あなたの声」のカードを交互に押してみましょう。':state.saved?'練習が終わりました。録音OFFなので、以前の録音を残しています。':'練習が終わりました。録音をONにしてもう一度試すと、声を残せます。';
      }else{
        state=flow.stop(state);feedback='もう一方のカードも押して、同じフレーズを聞き比べてみましょう。';
      }
      render();
    });
  });
  function waveform(id,voice){
    const ns='http://www.w3.org/2000/svg';
    $(id).replaceChildren(...Array.from({length:70},(_,i)=>{
      const t=i/69, h=1+window.RecordingWaveforms[voice?'voice':'model'].bars[i]*32;
      const line=document.createElementNS(ns,'line'); Object.entries({x1:4+t*392,x2:4+t*392,y1:36-h,y2:36+h}).forEach(([k,v])=>line.setAttribute(k,v)); return line;
    }));
  }
  waveform('model-bars',false);waveform('voice-bars',true);
  function render(){
    $('record').checked=state.enabled;$('record').disabled=practicing();text('record-label',state.enabled?'ON':'OFF');
    text('practice',practicing()?'練習を中断する':'練習する様子を見る');
    text('phase-label',state.phase==='model'?'お手本を聞いています':state.phase==='speech'?'フランケンくんが話しています':state.phase.startsWith('listen-')?'聞き比べ中':state.saved?'もう一度練習することもできます':state.enabled?'声を残す準備ができました':'まず録音をONに');
    text('record-note',state.enabled?'聞き終えてから話す例を見てみましょう。':state.saved?'録音OFFでも、残した声を聞き返せます。':'録音ONで、練習した声を残せます。');
    $('record-indicator').hidden=!(state.phase==='speech'&&state.capture);
    $('voice').disabled=!state.saved;
    text('saved-label',state.saved?'フランケンくんの録音例 · '+state.saved+'回目':'まだ録音がありません');
    const capturing=state.phase==='speech'&&state.capture&&!state.saved;
    $('empty-wave').hidden=!!state.saved||capturing;
    $('voice-bars').style.visibility=state.saved||capturing?'visible':'hidden';
    ['model','voice'].forEach(source=>{
      const selected=state.phase==='listen-'+source;$(source).setAttribute('aria-pressed',String(selected));
      text(source+'-action',selected?(running?'再生中 · 押すと停止':'一時停止中 · 押すと停止'):source==='voice'&&!state.saved?'録音ONで練習してみましょう':'音声を聞く');
    });
    $('pause').disabled=!active();text('pause',running?'一時停止':'再生する');text('feedback',feedback);renderMotion();
  }
  function renderMotion(){
    const p=Math.min(1,currentAudio().currentTime/duration());
    ['model','voice'].forEach(source=>{const x=4+p*392;$(source+'-cursor').setAttribute('x1',x);$(source+'-cursor').setAttribute('x2',x);});
    $('voice-bars').style.clipPath=state.phase==='speech'&&state.capture&&!state.saved&&!reduced.matches?'inset(0 '+((1-p)*100)+'% 0 0)':'none';
    if(ready){
      player.scrub('Phrase Pattern',.5);player.scrub('Offset',0);
      const modelPlaying=state.phase==='model'||state.phase==='listen-model';
      const voicePlaying=state.phase==='speech'||state.phase==='listen-voice';
      player.scrub('Model',modelPlaying?(reduced.matches?1:2*p):state.phase==='speech'?2:0);
      player.scrub('Speak',voicePlaying?(reduced.matches?1:2*p):0);
    }
  }
  function resetTime(){running=true;}
  $('record').addEventListener('change',()=>{state=flow.toggle(state,$('record').checked);feedback=state.enabled?'録音をONにしました。練習した声を残せます。':state.saved?'録音をOFFにしました。保存済みの声は、そのまま聞き返せます。':'録音OFFでは、練習しても声は残りません。';render();});
  $('practice').addEventListener('click',()=>{
    stopAudio();
    if(practicing()){state=flow.stop(state);feedback=state.saved?'練習を中断しました。以前の録音を残しています。':'練習を中断しました。まだ録音は残っていません。';}
    else{state=flow.start(state);feedback=state.capture?'まずお手本を聞き、続けてフランケンくんが話します。':'録音OFFの練習です。今回は声を残しません。';}
    resetTime();if(practicing())playAudio();render();
  });
  ['model','voice'].forEach(source=>$(source).addEventListener('click',()=>{
    const stopping=state.phase==='listen-'+source;stopAudio();state=stopping?flow.stop(state):flow.play(state,source);resetTime();
    feedback=stopping?'再生を止めました。何度でも切り替えて比べられます。':source==='model'?'ティナのお手本です。言葉のリズムや間に注目してみましょう。':'フランケンくんの録音例です。お手本と切り替えて、リズムや間を聞き比べてみましょう。';
    if(!stopping)playAudio();render();
  }));
  $('pause').addEventListener('click',()=>{
    if(!active())return;
    if(running){audioRequest++;currentAudio().pause();running=false;}else playAudio();
    render();
  });
  $('reset').addEventListener('click',()=>{stopAudio();state=flow.initial();resetTime();feedback='録音をONにして、「練習する様子を見る」を押してみましょう。';render();});
  function tick(){
    if(active())renderMotion();
    frame=requestAnimationFrame(tick);
  }
  reduced.addEventListener('change',render);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseForVisibility();});
  if(document.documentElement.classList.contains('embedded')){
    const height=()=>parent.postMessage({type:'practice-height',height:Math.ceil(document.body.getBoundingClientRect().height)},location.origin);
    heightObserver=new ResizeObserver(height);heightObserver.observe(document.body);
    addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='practice-visibility'){inView=e.data.visible===true;if(!inView)pauseForVisibility();}});height();
  }
  const fail=()=>{ready=false;host.dataset.failed='true';};
  if(window.rive){
    rive.RuntimeLoader.setWasmUrl(new URL('../vendor/rive-2.43.1/rive.wasm',location.href).href);
    rive.RuntimeLoader.setWasmFallbackUrl(new URL('../vendor/rive-2.43.1/rive_fallback.wasm',location.href).href);
    loadTimer=setTimeout(fail,15000);
    player=new rive.Rive({src:new URL('../animations/practice-timing.riv',location.href).href,canvas:$('scene'),artboard:'Practice Timing',animations,autoplay:false,enableRiveAssetCDN:false,shouldDisableRiveListeners:true,
      layout:new rive.Layout({fit:rive.Fit.Contain,alignment:rive.Alignment.Center}),
      onLoad(){clearTimeout(loadTimer);ready=true;host.dataset.failed='false';player.pause(animations);player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio||1,2));renderMotion();},onLoadError(){clearTimeout(loadTimer);fail();}});
  }else fail();
  const observer=new ResizeObserver(()=>{if(ready){player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio||1,2));renderMotion();}});observer.observe($('scene'));
  render();frame=requestAnimationFrame(tick);
  addEventListener('pagehide',e=>{pauseForVisibility();if(!e.persisted){clearTimeout(loadTimer);cancelAnimationFrame(frame);observer.disconnect();heightObserver?.disconnect();player?.cleanup();}});
})();
