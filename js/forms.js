/* forms.js — حیجزی مێز، پەیوەندی، نیوزلێتەر، خشتەی کات، نەخشە، ڕۆژژمێر (.ics) */
(function () {
  const C = Cafe, cfg = C.config, { $, el } = C;

  /* ---------- خشتەی کاتەکان ---------- */
  const body = $('#hoursTable');
  if (body) {
    const today = C.time.tzNow().dow;
    [6, 0, 1, 2, 3, 4, 5].forEach((d) => {
      const tr = el('tr', d === today ? 'is-today' : ''); const h = C.time.hoursForDow(d);
      tr.append(el('th', null, C.time.DAYS[d]), el('td', null, h ? `${C.time.fmtShort(h[0])} – ${C.time.fmtShort(h[1])}` : 'داخراوە'));
      tr.firstChild.scope = 'row'; body.append(tr);
    });
  }

  /* ---------- نەخشە (تەنها کاتێک دەبینرێت دەکرێتەوە) ---------- */
  const map = $('#mapFrame');
  if (map && 'IntersectionObserver' in window) {
    const mo = new IntersectionObserver((en) => { if (en[0].isIntersecting) { map.src = 'https://www.google.com/maps?q=' + encodeURIComponent(cfg.mapsQuery) + '&output=embed'; mo.disconnect(); } }, { rootMargin: '300px' });
    mo.observe(map);
  }

  function msg(form, kind, text, extra) { const m = $('.form-msg', form); m.hidden = false; m.className = 'form-msg ' + kind; m.textContent = text; if (extra) m.append(extra); m.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  const isPhone = (s) => /^[+\d][\d\s()-]{6,24}$/.test(s);
  function waBtn(text) { const a = el('a', 'btn btn-small btn-primary', 'بنێرە بە واتسئەپ'); a.href = C.whatsappUrl(text); a.target = '_blank'; a.rel = 'noopener'; return a; }

  /* ---------- ڕۆژژمێر .ics ---------- */
  function ics({ title, date, time, minutes = 90, where }) {
    const d = date.replace(/-/g, ''), t = time.replace(':', '') + '00';
    const [h, m] = time.split(':').map(Number); const e = h * 60 + m + minutes;
    const end = String(Math.floor(e / 60) % 24).padStart(2, '0') + String(e % 60).padStart(2, '0') + '00';
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cafe//KU//', 'BEGIN:VEVENT', `UID:${Date.now()}@cafe`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;TZID=${cfg.timezone}:${d}T${t}`, `DTEND;TZID=${cfg.timezone}:${d}T${end}`, `SUMMARY:${title}`, `LOCATION:${where}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = el('a', 'btn btn-small btn-ghost', '📅 زیادکردن بۆ ڕۆژژمێر'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'cafe-booking.ics'; return a;
  }

  /* ---------- حیجزی مێز ---------- */
  const rf = $('#reserveForm');
  if (rf) {
    const dateSel = $('[name=date]', rf), timeSel = $('[name=time]', rf), guests = $('[name=guests]', rf);
    const ds = C.time.days(cfg.booking.daysAhead, 30);
    dateSel.replaceChildren(...ds.map((d) => { const o = el('option', null, d.label); o.value = d.date; return o; }));
    function fillTimes() {
      const ts = C.time.slots(dateSel.value, { lead: 30 });
      timeSel.replaceChildren(...ts.map((t) => { const o = el('option', null, C.time.fmtShort(C.time.toMin(t))); o.value = t; return o; }));
    }
    dateSel.addEventListener('change', fillTimes); fillTimes();
    for (let i = 1; i <= cfg.booking.maxGuests; i++) { const o = el('option', null, i + ' کەس'); o.value = i; if (i === 2) o.selected = true; guests.append(o); }

    const stepper = $('#guestsHint');
    const updWa = () => { const f = Object.fromEntries(new FormData(rf)); $('#reserveWa').href = C.whatsappUrl(`سڵاو، دەمەوێت مێزێک حیجز بکەم:\nناو: ${f.name || ''}\nڕۆژ: ${dateSel.selectedOptions[0]?.text}\nکات: ${timeSel.selectedOptions[0]?.text}\nژمارەی کەس: ${f.guests}${f.notes ? '\nتێبینی: ' + f.notes : ''}`); };
    rf.addEventListener('input', updWa); updWa();

    rf.addEventListener('submit', async (e) => {
      e.preventDefault(); const f = Object.fromEntries(new FormData(rf));
      if (!f.name.trim()) return msg(rf, 'error', 'تکایە ناوەکەت بنووسە.');
      if (!isPhone(f.phone.trim())) return msg(rf, 'error', 'تکایە ژمارەی مۆبایلێکی دروست بنووسە.');
      if (f.email && !isEmail(f.email)) return msg(rf, 'error', 'ئیمەیڵەکە دروست نییە.');
      if (!f.time) return msg(rf, 'error', 'هیچ کاتێک بەردەست نییە، ڕۆژێکی تر هەڵبژێرە.');
      const b = $('button[type=submit]', rf); b.disabled = true; b.textContent = 'دەنێردرێت…';
      try {
        const r = await C.api('/api/reservations', { type: 'table', ...f });
        msg(rf, 'success', r.message || 'حیجزەکەت گەیشت. بەم زووانە پشتڕاستی دەکەینەوە. ', ics({ title: 'حیجز لە ' + cfg.name, date: f.date, time: f.time, where: cfg.address }));
        rf.reset(); fillTimes(); updWa();
      } catch (err) {
        if (err.server && err.status < 500) msg(rf, 'error', err.message);
        else msg(rf, 'error', 'سێرڤەر وەڵام نادات. دەتوانیت ڕاستەوخۆ بە واتسئەپ حیجزەکەت بنێریت: ', waBtn($('#reserveWa').href.split('?text=')[1] ? decodeURIComponent($('#reserveWa').href.split('?text=')[1]) : ''));
      } finally { b.disabled = false; b.textContent = 'حیجزکردن'; }
    });
  }

  /* ---------- پەیوەندی ---------- */
  const cf = $('#contactForm');
  if (cf) cf.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(cf));
    if (!f.name.trim()) return msg(cf, 'error', 'تکایە ناوەکەت بنووسە.');
    if (!isEmail(f.email)) return msg(cf, 'error', 'تکایە ئیمەیڵێکی دروست بنووسە.');
    if (f.message.trim().length < 3) return msg(cf, 'error', 'تکایە نامەیەکی کورت بنووسە.');
    const b = $('button[type=submit]', cf); b.disabled = true; b.textContent = 'دەنێردرێت…';
    try { const r = await C.api('/api/contact', f); msg(cf, 'success', r.message || 'نامەکەت گەیشت. سوپاس!'); cf.reset(); }
    catch (err) { err.server && err.status < 500 ? msg(cf, 'error', err.message) : msg(cf, 'error', 'نەتوانرا بنێردرێت. دەتوانیت بە واتسئەپ پەیوەندیمان پێوە بکەیت: ', waBtn(`سڵاو، ناوم ${f.name}ە. ${f.message}`)); }
    finally { b.disabled = false; b.textContent = 'ناردنی نامە'; }
  });

  /* ---------- نیوزلێتەر ---------- */
  C.$$('.newsletter').forEach((nf) => nf.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(nf)); f.consent = !!f.consent;
    if (!isEmail(f.email)) return msg(nf, 'error', 'تکایە ئیمەیڵێکی دروست بنووسە.');
    if (!f.consent) return msg(nf, 'error', 'تکایە ڕەزامەندی دیاری بکە.');
    try { const r = await C.api('/api/newsletter', f); msg(nf, 'success', r.message || 'بەشداربووی. بەخێربێیت!'); nf.reset(); }
    catch (err) { msg(nf, 'error', err.server && err.status < 500 ? err.message : 'ئێستا ناتوانین تۆمارت بکەین. دواتر هەوڵبدەرەوە.'); }
  }));

  /* ---------- ڕای کڕیاران (Google) ---------- */
  const track = $('#reviewTrack');
  if (track) {
    fetch((cfg.apiUrl || '') + '/api/reviews').then((r) => r.ok ? r.json() : { reviews: [] }).then((d) => {
      if (!d.reviews || !d.reviews.length) { $('#reviewsEmpty').hidden = false; return; }
      if (d.rating) { const s = $('#reviewSummary'); s.hidden = false; s.textContent = `★ ${d.rating} لە ${d.count} ڕا لە Google`; }
      track.hidden = false;
      track.replaceChildren(...d.reviews.map((r) => { const f = el('figure', 'review'); f.append(el('div', 'stars', '★'.repeat(r.rating)), el('blockquote', null, r.text), el('figcaption', null, r.author)); return f; }));
    }).catch(() => { $('#reviewsEmpty').hidden = false; });
  }
})();
