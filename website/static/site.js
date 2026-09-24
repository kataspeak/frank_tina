'use strict';
// Progressive enhancement only. Every story and translation is already HTML.
for (const element of document.querySelectorAll('[data-enhancement]')) element.hidden = false;
const search = document.querySelector('#story-search');
if (search) {
  const cards = [...document.querySelectorAll('#story-results .episode-card')];
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('en').trim();
  const filter = () => {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      card.hidden = !words.every(word => normalize(card.dataset.search).includes(word));
      if (!card.hidden) visible++;
    }
    document.querySelector('#search-count').textContent = `${visible} / ${cards.length}話`;
    document.querySelector('#no-results').hidden = visible !== 0;
  };
  search.addEventListener('input', filter);
  for (const id of ['clear-search', 'reset-search']) document.getElementById(id).addEventListener('click', () => {
    search.value = ''; filter(); search.focus();
  });
}
const translationToggle = document.querySelector('#translation-toggle');
if (translationToggle) translationToggle.addEventListener('click', () => {
  const hidden = document.getElementById('script-content').classList.toggle('hide-translations');
  translationToggle.setAttribute('aria-pressed', String(!hidden));
  translationToggle.textContent = hidden ? '日本語訳を表示' : '日本語訳を隠す';
});
const signup = document.querySelector('#signup-form');
if (signup) {
  const lesson = new URLSearchParams(location.search).get('lesson') || '';
  if (/^A[12]-(0[1-9]|[1-5][0-9]|60)$/.test(lesson)) {
    document.querySelector('#selected-lesson').textContent = `${lesson}の練習をお待ちの方へ。公開時期は、このページでご案内します。`;
    document.querySelector('#selected-lesson').hidden = false;
    document.querySelector('#signup-lesson').value = lesson;
  }
  signup.addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.querySelector('#signup-status');
    if (signup.dataset.enabled !== 'true') {
      status.textContent = '現在は受付準備中のため、送信できません。'; return;
    }
    if (!signup.reportValidity()) return;
    const submit = signup.querySelector('button[type="submit"]');
    submit.disabled = true; status.textContent = '送信しています…';
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 10000);
    try {
      const response = await fetch(signup.action, { method: 'POST', body: new FormData(signup), signal: timeout.signal, headers: {Accept:'application/json'} });
      if (!response.ok) throw new Error('Request failed');
      const result = await response.json();
      if (result.accepted !== true) throw new Error('Acceptance not confirmed');
      status.textContent = '公開案内の受付が完了しました。'; signup.reset();
    } catch {
      status.textContent = '送信できませんでした。時間をおいてもう一度お試しください。';
    } finally { clearTimeout(timer); submit.disabled = false; }
  });
}
