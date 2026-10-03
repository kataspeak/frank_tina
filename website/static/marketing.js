/* Explanatory simulations only: no audio, recording or microphone APIs. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), {threshold: 0.12});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // An explicit navigation token scopes restoration to this journey, not old visits.
  const storageKey = 'frankendojo.home-return.v1';
  const readReturn = () => { try { return JSON.parse(sessionStorage.getItem(storageKey)); } catch { return null; } };
  const validReturn = value => value && /^[a-z-]+$/.test(value.slug) && /^[\w-]+$/.test(value.token) && Number.isFinite(value.y) && Number.isFinite(value.width);
  const plainClick = event => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  const navigation = performance.getEntriesByType('navigation')[0];
  if (location.pathname === '/ja/') {
    document.querySelectorAll('[data-feature-link]').forEach(link => link.addEventListener('click', event => {
      if (!plainClick(event)) return;
      const record = {slug:link.dataset.featureLink, focus:link.id, y:scrollY, width:innerWidth, token:`${Date.now()}-${Math.random().toString(36).slice(2)}`};
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(record));
        history.replaceState({...history.state, dojoReturn:record}, '', location.href);
        const target = new URL(link.href); target.searchParams.set('from', record.token); link.href = target.href;
      } catch { /* Static anchors still provide the feature fallback. */ }
    }));
    const restore = async event => {
      const params = new URLSearchParams(location.search); const token = params.get('return');
      let record = token ? readReturn() : ((event.persisted || navigation?.type === 'back_forward') ? history.state?.dojoReturn : null);
      if (token && (!validReturn(record) || record.token !== token)) record = null;
      if (token) { params.delete('return'); history.replaceState(validReturn(record) ? {...history.state,dojoReturn:record} : history.state, '', location.pathname + (params.size ? `?${params}` : '') + location.hash); }
      if (document.fonts) await document.fonts.ready;
      requestAnimationFrame(() => {
        if (validReturn(record)) {
          const link = document.getElementById(record.focus); const section = document.getElementById(`feature-${record.slug}`);
          link?.focus({preventScroll:true});
          if (record.width === innerWidth) scrollTo({top:record.y,behavior:'instant'});
          else section?.scrollIntoView({behavior:'instant',block:'start'});
        } else if (location.hash.startsWith('#feature-')) {
          const section = document.getElementById(location.hash.slice(1));
          section?.querySelector('[data-feature-link]')?.focus({preventScroll:true});
          section?.scrollIntoView({behavior:'instant',block:'start'});
        }
      });
    };
    addEventListener('pageshow', restore);
  } else if (location.pathname.startsWith('/ja/features/')) {
    const params = new URLSearchParams(location.search); const record = readReturn();
    const token = params.get('from') || history.state?.dojoToken;
    if (validReturn(record) && token === record.token) {
      history.replaceState({...history.state,dojoToken:token}, '', location.pathname + location.hash);
      document.querySelectorAll('a[href^="/ja/#feature-"]').forEach(link => { link.href = `/ja/?return=${token}#feature-${record.slug}`; });
      document.querySelectorAll('.related-features a').forEach(link => { const url = new URL(link.href); url.searchParams.set('from', token); link.href = url.href; });
    }
  }

  const dataElement = document.getElementById('feature-data');
  const ui = document.querySelector('[data-demo-ui]');
  if (!dataElement || !ui) return;
  const {feature, settings} = JSON.parse(dataElement.textContent);
  const get = selector => ui.querySelector(selector);
  const play = get('[data-demo-play]'); const next = get('[data-demo-next]');
  const restart = get('[data-demo-restart]'); const track = get('[data-demo-track]');
  let frames = [], labels = [], index = 0, timer = null, playing = false, hasInteracted = false;
  ui.addEventListener('click', () => { hasInteracted = true; }, true);
  ui.addEventListener('keydown', () => { hasInteracted = true; }, true);
  const frame = (title,text,cue,active) => ({title,text,cue,active});
  const option = name => get(`input[name="${name}"]:checked`)?.value;
  const countOverrides = {...settings.repeatCounts};
  function buildFrames() {
    frames = feature.steps.map((step,i) => ({...step,active:i}));
    labels = feature.steps.map(step => step.title);
    switch (feature.slug) {
      case 'shadowing':
        labels = ['お手本', '聞き直す', '発話', '次の試行'];
        if (option('voice') === 'listening') frames = [frames[0], frames[1], frame('同じお手本を、もう一度','声を出さなかったので、同じ予定試行の模範を再生します。','LISTEN AGAIN',1), frame('自分のタイミングで声を出そう','アプリでは無発話の間、同じ模範を繰り返します。デモはここで一度止まります。','TAKE YOUR TIME',1)];
        break;
      case 'repeating':
        labels = ['模範再生','思い出す時間','発話','1セット完了'];
        if (option('unit') === 'chunk') {
          frames = [];
          for (let chunk=1;chunk<=3;chunk++) {
            frames.push(frame(`チャンク ${chunk} / 3 を聞く`,'3つのチャンクに分かれたフレーズの例です。','LISTEN',0));
            frames.push(frame(`チャンク ${chunk} を思い出す`,'想起タイムには、音量を調整できるピンクノイズ。','RECALL',1));
            frames.push(frame(`チャンク ${chunk} を声に出す`,'話し始めるとピンクノイズが止まり、発話の終了を待ちます。','SPEAK',2));
          }
          frames.push(frame('全チャンクで、1セット完了','次のセットがあれば、最初のチャンクから練習します。','ONE SET',3));
        }
        break;
      case 'speech-detection': labels = ['発話受付','発話中','終了待ち','次へ']; break;
      case 'difficulty-speed': {
        const difficulty = option('difficulty'); const speeds = settings.shadowSpeeds[difficulty];
        labels = speeds.map(speed => `${speed.toFixed(1)}倍`);
        frames = speeds.map((speed,i) => frame(`${settings.difficultyLabels[difficulty]}：${speed.toFixed(1)}倍で練習`,`${i+1} / ${speeds.length} 枠目。模範と発話の終了後、次の予定試行へ。`,'SHADOWING',i));
        frames.push(frame('メニュー完了。次のフレーズへ','設定された速度の枠を、すべて練習しました。','NEXT PHRASE',speeds.length));
        break;
      }
      case 'difficulty-repeat': {
        const difficulty = option('difficulty'); const count = countOverrides[difficulty];
        labels = Array.from({length:count},(_,i)=>`${i+1}セット`);
        frames = labels.map((_,i) => frame(`${settings.difficultyLabels[difficulty]}：${i+1} / ${count} セット`,'フレーズ全体、または全チャンクを練習して1セット。','REPEATING',i));
        frames.push(frame('予定したセットが完了','通常終了した未達の試行も進行し、ランクへの加算は別に判定します。','NEXT PHRASE',count));
        break;
      }
      case 'lesson-selection': {
        const lessons = [...ui.querySelectorAll('input[name="lesson"]:checked')].map(input=>input.value);
        labels = lessons.map(n=>`レッスン ${n.padStart(2,'0')}`);
        frames = labels.map((label,i)=>frame(label+' を練習','学習中だけが連続練習・リピート・シャッフルの対象です。','STUDYING',i));
        if (!frames.length) frames = [frame('練習対象がありません','レッスンを学習中にすると、練習リストに戻ります。','WAITING',-1)];
        break;
      }
      case 'sleep-stop': {
        const maximum = get('[data-sleep-maximum]').value; const silence = get('[data-sleep-silence]').value;
        labels = ['練習開始','発話を記録','静かに停止','翌朝に確認'];
        frames[0].text = `最大${maximum}分・発話受付中の無発話${silence}分で停止する設定です。`;
        frames[2].text = `無発話${silence}分、または開始から最大${maximum}分で停止。模範再生・一時停止などは無発話の計測から除きます。`;
        break;
      }
      case 'own-materials': labels = ['音源','解析','区切り編集','練習']; break;
    }
  }
  function stop() { clearTimeout(timer); timer=null; playing=false; play.textContent=index === frames.length-1 ? '再実行' : '再生'; }
  function render(announce=false) {
    const current = frames[index];
    if (feature.slug === 'difficulty-repeat') {
      const difficulty = option('difficulty');
      const lower = difficulty === 'easy' ? 1 : countOverrides[difficulty === 'normal' ? 'easy' : 'normal'];
      const upper = difficulty === 'hard' ? 10 : countOverrides[difficulty === 'easy' ? 'normal' : 'hard'];
      for (const choice of get('[data-repeat-count]').options) choice.disabled = Number(choice.value) < lower || Number(choice.value) > upper;
    }
    get('[data-demo-cue]').textContent = current.cue;
    get('[data-demo-title]').textContent = current.title;
    get('[data-demo-text]').textContent = current.text;
    track.replaceChildren(...labels.map((label,i)=>{const item=document.createElement('span');item.textContent=label;if(i===current.active){item.className='active';item.setAttribute('aria-current','step');}else if(i<current.active)item.className='done';return item;}));
    get('[data-demo-progress]').textContent = `${index+1} / ${frames.length} ステップ`;
    next.disabled = index === frames.length-1;
    play.disabled = feature.slug === 'lesson-selection' && labels.length===0;
    if (announce) get('.demo-announcement').textContent = `${index+1} / ${frames.length}。${current.title}。${current.text}`;
  }
  function schedule() {
    timer=setTimeout(()=>{ if(index<frames.length-1){index++;render();if(index===frames.length-1)stop();else schedule();}else stop(); },2600);
  }
  function start() { if(play.disabled)return;clearTimeout(timer);if(index===frames.length-1)index=0;playing=true;play.textContent='一時停止';render();schedule(); }
  play.addEventListener('click',()=>playing?stop():start());
  restart.addEventListener('click',()=>{stop();index=0;render(true);if(!reduced.matches)start();});
  next.addEventListener('click',()=>{stop();index=Math.min(index+1,frames.length-1);render(true);play.textContent=index===frames.length-1?'再実行':'再生';});
  ui.addEventListener('change',event=>{
    if(feature.slug==='difficulty-repeat') {
      const difficulty=option('difficulty');
      if(event.target.matches('[data-repeat-count]')) countOverrides[difficulty]=Number(event.target.value);
      get('[data-repeat-count]').value=String(countOverrides[difficulty]);
    }
    stop();buildFrames();index=0;render(true);play.textContent='再生';
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  addEventListener('pagehide',stop);
  reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
  buildFrames();render();ui.hidden=false;
  stop();
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const demoObserver = new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){demoObserver.disconnect();if(!reduced.matches && !playing && !hasInteracted)start();}}, {threshold:0.2});
    demoObserver.observe(get('[data-demo-stage]'));
  } else if (!reduced.matches) start();
})();
