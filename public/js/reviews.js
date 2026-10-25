/* ==========================================================================
   Reviews: pulls real Google reviews from the backend (/api/reviews).
   Nothing is invented — if the backend has no Google keys yet, visitors
   just see the "Write a review" call-to-action.
   ========================================================================== */
(function () {
  const cfg = Cafe.config;
  const track = document.getElementById('reviewTrack');
  if (!track) return;
  const summary = document.getElementById('reviewSummary');
  const cta = document.getElementById('reviewCta');

  if (cfg.googleReviewUrl) { cta.href = cfg.googleReviewUrl; cta.hidden = false; }

  const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

  function show(data) {
    if (!data || !data.reviews || !data.reviews.length) return;
    if (data.rating) {
      summary.textContent = `${data.rating.toFixed(1)} ${stars(data.rating)} · ${data.count || data.reviews.length} Google reviews`;
      summary.hidden = false;
    }
    track.replaceChildren(...data.reviews.map((r) => {
      const fig = document.createElement('figure'); fig.className = 'review';
      const s = document.createElement('div'); s.className = 'stars'; s.textContent = stars(r.rating);
      s.setAttribute('role', 'img'); s.setAttribute('aria-label', `${r.rating} out of 5 stars`);
      const q = document.createElement('blockquote'); q.textContent = r.text;
      const c = document.createElement('figcaption'); c.textContent = r.author + (r.when ? ' · ' + r.when : '');
      fig.append(s, q, c); return fig;
    }));
    document.getElementById('reviewControls').hidden = false;
    track.hidden = false;
  }

  if (cfg.apiUrl !== false) {
    fetch((cfg.apiUrl || '') + '/api/reviews').then((r) => (r.ok ? r.json() : null)).then(show).catch(() => {});
  }

  const step = () => track.clientWidth * 0.8;
  document.getElementById('reviewPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  document.getElementById('reviewNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
})();
