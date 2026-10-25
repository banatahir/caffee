/* ==========================================================================
   Live opening status + hours table. Uses the café's own time zone,
   so it is correct no matter where the visitor is.
   ========================================================================== */
(function () {
  const cfg = Cafe.config;
  const DAYS = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];
  const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fmt = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'ی.ئ' : 'ب.ئ'}`;
  };

  // Current date/time in the café's time zone.
  function tzNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: cfg.timezone, weekday: 'short', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return {
      dow: SHORT.indexOf(get('weekday')),
      date: `${get('year')}-${get('month')}-${get('day')}`,
      min: Number(get('hour')) * 60 + Number(get('minute'))
    };
  }

  // [openMin, closeMin] for a weekday index, or null when closed all day.
  function hoursForDow(dow) {
    const h = cfg.hours[dow];
    return h ? [toMin(h[0]), toMin(h[1])] : null;
  }
  function hoursForDate(dateStr) { // 'YYYY-MM-DD'
    const [y, m, d] = dateStr.split('-').map(Number);
    return hoursForDow(new Date(y, m - 1, d).getDay());
  }

  function compute() {
    const now = tzNow();
    const today = hoursForDow(now.dow);
    if (today && now.min >= today[0] && now.min < today[1]) {
      const left = today[1] - now.min;
      return left <= 30
        ? { state: 'soon', text: `بەم زووانە دادەخرێت · کاتژمێر ${fmt(today[1])}` }
        : { state: 'open', text: `ئێستا کراوەیە · دادەخرێت کاتژمێر ${fmt(today[1])}` };
    }
    if (today && now.min < today[0]) return { state: 'closed', text: `داخراوە · ئەمڕۆ دەکرێتەوە کاتژمێر ${fmt(today[0])}` };
    for (let i = 1; i <= 7; i++) {
      const dow = (now.dow + i) % 7, h = hoursForDow(dow);
      if (h) return { state: 'closed', text: `داخراوە · دەکرێتەوە ${i === 1 ? 'سبەی' : DAYS[dow]} کاتژمێر ${fmt(h[0])}` };
    }
    return { state: 'closed', text: 'داخراوە' };
  }

  function render() {
    const s = compute();
    document.querySelectorAll('[data-status]').forEach((el) => {
      el.dataset.state = s.state;
      const label = el.querySelector('.status-text');
      (label || el).textContent = s.text;
    });
  }

  function renderTable() {
    const body = document.getElementById('hoursTable');
    if (!body) return;
    const today = tzNow().dow;
    body.replaceChildren();
    // Start the week on Saturday, the usual order in Iraq.
    [6, 0, 1, 2, 3, 4, 5].forEach((dow) => {
      const tr = document.createElement('tr');
      if (dow === today) tr.className = 'is-today';
      const h = hoursForDow(dow);
      const th = document.createElement('th'); th.scope = 'row'; th.textContent = DAYS[dow];
      const td = document.createElement('td'); td.textContent = h ? `${fmt(h[0])} – ${fmt(h[1])}` : 'داخراوە';
      tr.append(th, td); body.append(tr);
    });
  }

  Cafe.time = { tzNow, hoursForDate, fmt, toMin };
  render(); renderTable();
  setInterval(render, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); renderTable(); } });
})();
