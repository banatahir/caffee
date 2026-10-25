/* gallery.js — فلتەر + لایتبۆکس (کیبۆرد و پەنجەی مۆبایل) */
(function () {
  const C = Cafe, { $, $$, el } = C;
  const grid = $('#galleryGrid'); if (!grid) return;
  const filters = $('#galleryFilters');
  const CATS = [['all', 'هەمووی'], ['coffee', 'قاوە'], ['drinks', 'شەربەت و سمۆزی'], ['tea', 'چا'], ['sweets', 'شیرینی']];
  let cur = 'all', visible = [], idx = 0;

  function render() {
    visible = C.gallery.filter((g) => cur === 'all' || g.cat === cur);
    grid.replaceChildren(...visible.map((g, i) => {
      const b = el('button', 'tile' + (g.tall ? ' tall' : '') + (g.wide ? ' wide' : '')); b.type = 'button';
      b.innerHTML = `<img src="img/${g.img}.webp" alt="${g.alt}" loading="lazy" decoding="async"><span class="tile-cap">${g.cap}</span>`;
      b.setAttribute('aria-label', 'کردنەوەی وێنە: ' + g.cap);
      b.onclick = () => open(i); return b;
    }));
  }
  CATS.forEach(([id, label]) => { const b = el('button', 'chip', label); b.type = 'button'; b.setAttribute('aria-pressed', String(id === cur)); b.onclick = () => { cur = id; $$('.chip', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); render(); }; filters.append(b); });

  const lb = el('div', 'lightbox'); lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'وێنە');
  lb.innerHTML = `<button class="lb-close icon-btn" type="button" aria-label="داخستن">✕</button><button class="lb-nav lb-prev icon-btn" type="button" aria-label="وێنەی پێشوو">›</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-nav lb-next icon-btn" type="button" aria-label="وێنەی دواتر">‹</button>`;
  document.body.append(lb);
  const limg = $('img', lb), lcap = $('figcaption', lb);
  let last;
  function show(i) { idx = (i + visible.length) % visible.length; const g = visible[idx]; limg.src = `img/${g.img}.jpg`; limg.alt = g.alt; lcap.textContent = g.cap; }
  function open(i) { last = document.activeElement; show(i); lb.hidden = false; document.body.classList.add('no-scroll'); $('.lb-close', lb).focus(); }
  function close() { lb.hidden = true; document.body.classList.remove('no-scroll'); last && last.focus(); }
  $('.lb-close', lb).onclick = close; $('.lb-prev', lb).onclick = () => show(idx - 1); $('.lb-next', lb).onclick = () => show(idx + 1);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx + 1); if (e.key === 'ArrowRight') show(idx - 1); });
  let x0 = null; lb.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); x0 = null; });
  render();
})();
