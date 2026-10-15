'use strict';
// Only the neutral entry page loads this script. Explicit /ja/ and /en/ links
// remain available regardless of the browser's preferred language.
(() => {
  let selected;
  try { selected = localStorage.getItem('frankendojo.language'); } catch { /* Storage may be unavailable. */ }
  const language = navigator.languages?.[0] || navigator.language || 'en';
  const preferred = selected === 'ja' || selected === 'en' ? selected : (/^ja(?:-|$)/i.test(language) ? 'ja' : 'en');
  const destination = `/${preferred}/`;
  location.replace(destination + location.search + location.hash);
})();
