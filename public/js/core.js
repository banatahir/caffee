/* ==========================================================================
   core.js — helper، کاتی کراوە/داخراو، سەبەتە، API و کاتە ئۆتۆماتیکەکان
   ========================================================================== */
(function () {
  const C = (window.Cafe = window.Cafe || {});
  const cfg = C.config;

  /* ---------- helpers ---------- */
  C.$ = (s, r = document) => r.querySelector(s);
  C.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  C.el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  C.money = (n) => `${Number(n).toLocaleString('en-US')} ${cfg.currency}`;
  C.store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  C.img = (name, w) => `img/${name}.webp`;
  C.byId = Object.fromEntries((C.menu || []).map((m) => [m.id, m]));

  C.toast = function (message) {
    let t = document.getElementById('siteToast');
    if (!t) { t = C.el('div', 'toast'); t.id = 'siteToast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.append(t); }
    t.textContent = message; t.classList.add('show');
    clearTimeout(C.toast.t); C.toast.t = setTimeout(() => t.classList.remove('show'), 2400);
  };

  /* ---------- کات (بە کاتی کافێکە، نەک بەکارهێنەر) ---------- */
  const DAYS = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];
  const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const pad = (n) => String(n).padStart(2, '0');
  const hhmm = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
  const fmt = (min) => { const h = Math.floor(min / 60), m = min % 60; return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'ی.ن' : 'پ.ن'}`.replace('ی.ن', 'ئێوارە').replace('پ.ن', 'بەیانی'); };
  const fmtShort = (min) => { const h = Math.floor(min / 60), m = min % 60; return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'ی.ن' : 'پ.ن'}`; };

  function tzNow() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: cfg.timezone, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = (t) => parts.find((p) => p.type === t).value;
    return { dow: SHORT.indexOf(g('weekday')), date: `${g('year')}-${g('month')}-${g('day')}`, min: Number(g('hour')) * 60 + Number(g('minute')) };
  }
  const hoursForDow = (dow) => { const h = cfg.hours[dow]; return h ? [toMin(h[0]), toMin(h[1])] : null; };
  const dowOf = (dateStr) => { const [y, m, d] = dateStr.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
  const addDays = (dateStr, n) => { const [y, m, d] = dateStr.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d + n)); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };

  function status() {
    const now = tzNow(), today = hoursForDow(now.dow);
    if (today && now.min >= today[0] && now.min < today[1]) {
      return today[1] - now.min <= 30
        ? { state: 'soon', text: `بەم زووانە دادەخرێت · ${fmt(today[1])}` }
        : { state: 'open', text: `ئێستا کراوەیە · تا ${fmt(today[1])}` };
    }
    if (today && now.min < today[0]) return { state: 'closed', text: `داخراوە · ئەمڕۆ لە ${fmt(today[0])} دەکرێتەوە` };
    for (let i = 1; i <= 7; i++) {
      const dow = (now.dow + i) % 7, h = hoursForDow(dow);
      if (h) return { state: 'closed', text: `داخراوە · ${i === 1 ? 'سبەی' : DAYS[dow]} لە ${fmt(h[0])} دەکرێتەوە` };
    }
    return { state: 'closed', text: 'داخراوە' };
  }
  function renderStatus() {
    const s = status();
    C.$$('[data-status]').forEach((el) => { el.dataset.state = s.state; const l = el.querySelector('.status-text'); (l || el).textContent = s.text; });
  }

  // کاتەکانی بەردەست بۆ ڕۆژێک (ئۆتۆماتیک لە کاتی کارکردنەوە)
  function slots(dateStr, { lead = 0 } = {}) {
    const h = hoursForDow(dowOf(dateStr));
    if (!h) return [];
    const now = tzNow(), b = cfg.booking;
    let start = h[0];
    if (dateStr === now.date) start = Math.max(start, Math.ceil((now.min + lead) / b.slotMinutes) * b.slotMinutes);
    const out = [];
    for (let t = Math.ceil(start / b.slotMinutes) * b.slotMinutes; t <= h[1] - b.closeBufferMin; t += b.slotMinutes) out.push(hhmm(t));
    return out;
  }
  // ڕۆژە بەردەستەکان (ڕۆژە داخراوەکان بەزێنراون)
  function days(n = cfg.booking.daysAhead, lead = 0) {
    const now = tzNow(), out = [];
    for (let i = 0; i <= n; i++) {
      const d = addDays(now.date, i);
      if (slots(d, { lead }).length) out.push({ date: d, label: i === 0 ? 'ئەمڕۆ' : i === 1 ? 'سبەی' : DAYS[dowOf(d)] + ' ' + d.slice(5).replace('-', '/') });
    }
    return out;
  }
  C.time = { tzNow, status, slots, days, fmt, fmtShort, toMin, hoursForDow, DAYS, dowOf };

  // سڵاو بەپێی کات
  C.greeting = function () {
    const m = tzNow().min;
    if (m < 11 * 60) return { text: 'بەیانیت باش', hint: 'coffee', sub: 'بۆ دەستپێکێکی خۆش، قاوە و نانی بەیانی ئامادەیە.' };
    if (m < 16 * 60) return { text: 'ڕۆژباش', hint: 'cold', sub: 'شەربەتێکی سارد یان قاوەیەکی تازە بۆ ناوەڕاستی ڕۆژ؟' };
    return { text: 'ئێوارەت باش', hint: 'dessert', sub: 'ئەمڕۆ کاتی کارکردن تەواو بووە؛ مێنیو ببینە و بۆ سبەی مێزێک حیجز بکە.' };
  };

  /* ---------- API + WhatsApp ---------- */
  C.whatsappUrl = (text) => `https://wa.me/${cfg.whatsapp.replace(/\D/g, '')}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  C.api = async function (path, body) {
    if (cfg.apiUrl === false) throw new Error('no-api');
    const r = await fetch((cfg.apiUrl || '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const err = new Error(j.error || 'server'); err.status = r.status; err.server = true; throw err; }
    return j;
  };

  /* ---------- سەبەتە ---------- */
  const KEY = 'cafe-cart-v2';
  let items = C.store.get(KEY, {});
  Object.keys(items).forEach((id) => { if (!C.byId[id]) delete items[id]; });
  const listeners = [];
  const save = () => { C.store.set(KEY, items); listeners.forEach((fn) => fn()); };
  C.cart = {
    get lines() { return Object.entries(items).map(([id, qty]) => ({ ...C.byId[id], qty })); },
    get count() { return Object.values(items).reduce((a, b) => a + b, 0); },
    get total() { return Object.entries(items).reduce((s, [id, q]) => s + C.byId[id].price * q, 0); },
    add(id) { items[id] = Math.min((items[id] || 0) + 1, 20); save(); },
    set(id, q) { if (q <= 0) delete items[id]; else items[id] = Math.min(q, 20); save(); },
    clear() { items = {}; save(); },
    onChange(fn) { listeners.push(fn); },
    message(extra = {}) {
      const lines = this.lines.map((l) => `• ${l.qty}× ${l.name} — ${C.money(l.price * l.qty)}`).join('\n');
      return `سڵاو، دەمەوێت ئەمە داوا بکەم (وەرگرتن لە کافێ):\n${lines}\nکۆی گشتی: ${C.money(this.total)}` +
        (extra.name ? `\nناو: ${extra.name}` : '') + (extra.time ? `\nکاتی وەرگرتن: ${extra.time}` : '') + (extra.notes ? `\nتێبینی: ${extra.notes}` : '');
    }
  };

  /* ---------- دڵخوازەکان ---------- */
  const FAV = 'cafe-fav-v2';
  let favs = new Set(C.store.get(FAV, []));
  C.favs = {
    has: (id) => favs.has(id), get size() { return favs.size; },
    toggle(id) { favs.has(id) ? favs.delete(id) : favs.add(id); C.store.set(FAV, [...favs]); return favs.has(id); }
  };

  /* ---------- پێشنیاری ڕۆژانە (هەموو ڕۆژێک خۆکارانە دەگۆڕێت) ---------- */
  C.dailyPick = function () {
    const day = Math.floor(Date.parse(tzNow().date) / 86400000);
    return C.menu[(day * 7 + 3) % C.menu.length];
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderStatus(); setInterval(renderStatus, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) renderStatus(); });
  });
  C.renderStatus = renderStatus;
})();
