/* Supplied two-second opening. All Rive resources are served locally. */
(() => {
  'use strict';
  const host = document.querySelector('[data-opening]');
  if (!host || !window.rive) return;
  const canvas = host.querySelector('canvas');
  const button = host.querySelector('button');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const params = {artboard: 'FrankenDojo Opening', stateMachine: 'Opening Player', autoplay: true};
  let player, ready = false, failed = false, elapsed = 0, playing = false;
  const setState = state => { host.dataset.openingState = state; };
  function fallback() {
    failed = true; ready = false; playing = false;
    host.classList.remove('opening-ready');
    button.hidden = true;
    setState('fallback');
    player?.cleanup();
  }
  const timeout = setTimeout(fallback, 15000);
  function replay(reason) {
    if (!ready || document.hidden) return;
    elapsed = 0; playing = true;
    host.dataset.openingTrigger = reason;
    setState('playing');
    // Reset the existing file's state machine to Entry, without fetching it again.
    player.reset(params);
    player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2));
  }
  rive.RuntimeLoader.setWasmUrl('/assets/vendor/rive-2.43.1/rive.wasm');
  rive.RuntimeLoader.setWasmFallbackUrl('/assets/vendor/rive-2.43.1/rive_fallback.wasm');
  try {
    player = new rive.Rive({
      ...params, autoplay: false, canvas,
      src: '/assets/animations/frankendojo_opening.riv',
      layout: new rive.Layout({fit: rive.Fit.Contain, alignment: rive.Alignment.Center}),
      enableRiveAssetCDN: false, shouldDisableRiveListeners: true,
      onLoad() {
        clearTimeout(timeout);
        if (failed) return;
        ready = true; button.hidden = false;
        player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2));
        setState('ready');
        if (!reduced.matches) replay('load');
      },
      onLoadError() { clearTimeout(timeout); fallback(); },
      onAdvance(event) {
        if (!playing) return;
        host.classList.add('opening-ready');
        elapsed += event.data;
        // The supplied timeline is one-shot, 120 frames at 60 fps. Stop its
        // state machine after the final frame so it does not keep rendering.
        if (elapsed >= 2) {
          playing = false;
          queueMicrotask(() => { if (ready && !playing) { player.pause(); setState('complete'); } });
        }
      },
    });
  } catch { clearTimeout(timeout); fallback(); }
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && !reduced.matches) replay('hover');
  });
  button.addEventListener('click', () => replay('activate'));
  const resize = () => { if (ready) player.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio || 1, 2)); };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  addEventListener('resize', resize);
  reduced.addEventListener('change', () => {
    if (reduced.matches && ready) {
      playing = false; player.pause(); host.classList.remove('opening-ready'); setState('ready');
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (ready && playing && document.hidden) { playing = false; player.pause(); setState('paused'); }
    else if (ready && !document.hidden && !reduced.matches) {
      if (host.dataset.openingState === 'paused') { playing = true; player.play(); setState('playing'); }
      else if (host.dataset.openingState === 'ready') replay('visible');
    }
  });
  addEventListener('pagehide', event => {
    if (event.persisted) {
      if (ready) { playing = false; player.pause(); }
    } else {
      clearTimeout(timeout); observer.disconnect(); player?.cleanup(); ready = false;
    }
  });
  addEventListener('pageshow', event => {
    if (event.persisted && !reduced.matches) replay('pageshow');
  });
})();
