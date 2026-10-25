/* ==========================================================================
   کافێی ئێمە — backend (Node/Express)
   Serves /public and provides:
     POST /api/reservations   حیجزی مێز / داواکاریی وەرگرتن → ئیمەیڵ + تێلێگرام + وەڵامی ئۆتۆماتیک
     POST /api/contact        فۆرمی پەیوەندی               → ئیمەیڵ + وەڵامی ئۆتۆماتیک
     POST /api/newsletter     نیوزلێتەر                    → data/subscribers.jsonl + ئیمەیڵی بەخێرهاتن
     GET  /api/reviews        ڕای Google (پێویستی بە GOOGLE_API_KEY هەیە)
     GET  /api/health         تاقیکردنەوەی کارکردن
     GET  /sitemap.xml, /robots.txt   ئۆتۆماتیک دروست دەکرێن (SITE_URL)
   هەموو داواکارییەک لە data/orders.jsonl پاشەکەوت دەکرێت (پشتگیری ئەگەر ئیمەیڵ نەنێردرا).
   ئەگەر SMTP ڕێکنەخرابێت، ئیمەیڵەکان لە console دەچاپکرێن.
   ========================================================================== */
require('dotenv').config();
const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const env = process.env;
const CAFE = env.CAFE_NAME || 'کافێی ئێمە';
const OWNER_EMAIL = env.OWNER_EMAIL || '';
const OPEN = toMin(env.OPEN_TIME || '08:00');
const CLOSE = toMin(env.CLOSE_TIME || '16:00');
const TZ = env.TIMEZONE || 'Asia/Baghdad';
const PORT = Number(env.PORT) || 3000;
const SITE_URL = (env.SITE_URL || '').replace(/\/$/, '');
const DATA = path.join(__dirname, '..', 'data');
const PUBLIC = path.join(__dirname, '..', 'public');

/* ---------- helpers ---------- */
function toMin(s) { const [h, m] = s.split(':').map(Number); return h * 60 + m; }
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 120;
const isPhone = (s) => /^[+\d][\d\s()-]{6,24}$/.test(s);
const money = (n) => `${Number(n).toLocaleString('en-US')} دینار`;
const bad = (res, msg) => res.status(400).json({ error: msg });

function nowInCafeTz() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t).value;
  return { date: `${g('year')}-${g('month')}-${g('day')}`, min: Number(g('hour')) * 60 + Number(g('minute')) };
}

async function log(file, obj) {
  try { await fs.mkdir(DATA, { recursive: true }); await fs.appendFile(path.join(DATA, file), JSON.stringify({ at: new Date().toISOString(), ...obj }) + '\n'); }
  catch (e) { console.error('log:', e.message); }
}

/* ---------- notifications: email + Telegram ---------- */
const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT) || 587, secure: env.SMTP_SECURE === 'true', auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined })
  : null;

async function sendMail({ to, subject, html, text, replyTo }) {
  if (!to) return;
  const msg = { from: env.MAIL_FROM || `"${CAFE}" <${env.SMTP_USER || 'no-reply@localhost'}>`, to, subject, html, text, replyTo };
  if (!transporter) { console.log('\n[email – SMTP ڕێکنەخراوە، لێرە چاپ دەکرێت]\n', JSON.stringify({ to, subject, text }, null, 2)); return; }
  await transporter.sendMail(msg);
}

// Telegram: ئاگادارکردنەوەی دەستبەجێ بۆ خاوەنی کافێ (ئارەزووی — TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
async function notifyTelegram(text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true })
    });
    if (!r.ok) console.error('telegram:', r.status);
  } catch (e) { console.error('telegram:', e.message); }
}
// هەر ئاگادارکردنەوەیەک بە شێوەیەکی سەربەخۆ دەچێت؛ هەڵەی یەکێکیان ئەوی تر ناوەستێنێت.
const safe = (p) => p.catch((e) => console.error('notify:', e.message));

const wrapHtml = (title, body) => `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:auto;color:#21160f;line-height:1.8">
  <h2 style="color:#b05f2a">${esc(title)}</h2>${body}<p style="color:#6d5b4e;font-size:13px">— ${esc(CAFE)}</p></div>`;
const rows = (pairs) => '<table cellpadding="6" style="border-collapse:collapse">' +
  pairs.filter(([, v]) => v).map(([k, v]) => `<tr><td style="color:#6d5b4e">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`).join('') + '</table>';

/* ---------- app ---------- */
const app = express();
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': ["'self'", 'https://www.googletagmanager.com'],
      'connect-src': ["'self'", 'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://www.googletagmanager.com'],
      'img-src': ["'self'", 'data:', 'blob:', 'https://*.google-analytics.com', 'https://www.googletagmanager.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'font-src': ["'self'"],
      'frame-src': ['https://www.google.com'],
      'form-action': ["'self'"],
      'worker-src': ["'self'"],
      'manifest-src': ["'self'"]
    }
  }
}));
if (env.ALLOWED_ORIGIN) app.use('/api', cors({ origin: env.ALLOWED_ORIGIN.split(',') }));
app.use(express.json({ limit: '20kb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'داواکاری زۆرە. تکایە چەند خولەکێکی تر هەوڵبدەرەوە.' } });
app.use('/api', (req, res, next) => (req.method === 'POST' ? limiter(req, res, next) : next()));
const trap = (req, res, next) => (req.body && req.body.website ? res.json({ ok: true }) : next()); // honeypot

app.get('/api/health', (req, res) => res.json({ ok: true, email: !!transporter, telegram: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID), reviews: !!(env.GOOGLE_API_KEY && env.GOOGLE_PLACE_ID) }));

/* ---------- reservations & pickup orders ---------- */
app.post('/api/reservations', trap, async (req, res) => {
  try {
    const b = req.body || {};
    const type = b.type === 'pickup' ? 'pickup' : 'table';
    const name = clean(b.name, 80), phone = clean(b.phone, 25), email = clean(b.email, 120), notes = clean(b.notes, 500);
    const date = clean(b.date, 10), time = clean(b.time, 5);

    if (!name) return bad(res, 'تکایە ناوەکەت بنووسە.');
    if (!isPhone(phone)) return bad(res, 'تکایە ژمارەی مۆبایلێکی دروست بنووسە.');
    if (email && !isEmail(email)) return bad(res, 'ئیمەیڵەکە دروست نییە.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return bad(res, 'تکایە ڕۆژ و کات هەڵبژێرە.');

    const now = nowInCafeTz(), t = toMin(time);
    if (date < now.date || (date === now.date && t < now.min)) return bad(res, 'تکایە کاتێکی داهاتوو هەڵبژێرە.');
    if (t < OPEN || t > CLOSE - 30) return bad(res, `حیجز لە نێوان ${env.OPEN_TIME || '08:00'} و ٣٠ خولەک پێش داخستن وەردەگیرێت.`);

    let guests = null, items = [], total = 0;
    if (type === 'table') {
      guests = Math.round(Number(b.guests));
      if (!(guests >= 1 && guests <= 20)) return bad(res, 'ژمارەی کەس دەبێت لە نێوان ١ و ٢٠ بێت. بۆ گروپی گەورەتر پەیوەندیمان پێوە بکە.');
    } else {
      items = (Array.isArray(b.items) ? b.items : []).slice(0, 40).map((i) => ({ name: clean(i.name, 60), qty: Math.min(Math.max(Math.round(Number(i.qty)) || 0, 0), 20), price: Math.max(Number(i.price) || 0, 0) })).filter((i) => i.name && i.qty > 0);
      if (!items.length) return bad(res, 'سەبەتەکەت بەتاڵە.');
      total = items.reduce((s, i) => s + i.price * i.qty, 0);
    }

    const label = type === 'table' ? 'حیجزی مێز' : 'داواکاریی وەرگرتن';
    const details = [['ناو', name], ['مۆبایل', phone], ['ئیمەیڵ', email], ['ڕۆژ', date], ['کات', time], ['ژمارەی کەس', guests], ['تێبینی', notes]];
    const itemHtml = items.length ? `<ul>${items.map((i) => `<li>${i.qty}× ${esc(i.name)} — ${money(i.price * i.qty)}</li>`).join('')}</ul><p><strong>کۆی گشتی: ${money(total)}</strong> (لە کاتی وەرگرتن دەدرێت)</p>` : '';
    const itemText = items.map((i) => `  ${i.qty}× ${i.name}`).join('\n');
    const plain = `${label}\n${details.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')}${itemText ? '\n' + itemText : ''}${total ? `\nکۆی گشتی: ${money(total)}` : ''}`;

    await log('orders.jsonl', { type, name, phone, email, date, time, guests, notes, items, total }); // پاشەکەوتکردن پێش ناردن
    await Promise.all([
      safe(sendMail({ to: OWNER_EMAIL, replyTo: email || undefined, subject: `${label}ی نوێ: ${name} — ${date} ${time}`, html: wrapHtml(`${label}ی نوێ`, rows(details) + itemHtml), text: plain })),
      safe(notifyTelegram('🔔 ' + plain))
    ]);
    if (email) await safe(sendMail({
      to: email, subject: `${label}ەکەت گەیشت — ${CAFE}`,
      html: wrapHtml(`سوپاس، ${name}!`, `<p>${label}ەکەتمان بۆ <strong>${esc(date)} کاتژمێر ${esc(time)}</strong> وەرگرت. بەم زووانە بە تەلەفۆن یان نامە پشتڕاستی دەکەینەوە.</p>${itemHtml}<p>ئەگەر دەتەوێت شتێک بگۆڕیت، ڕاستەوخۆ وەڵامی ئەم ئیمەیڵە بدەرەوە.</p>`),
      text: `سوپاس ${name}! ${label}ەکەتمان بۆ ${date} کاتژمێر ${time} وەرگرت و بەم زووانە پشتڕاستی دەکەینەوە.`
    }));
    res.json({ ok: true, message: `سوپاس، ${name}! داواکارییەکەتمان وەرگرت و بەم زووانە پشتڕاستی دەکەینەوە. ` });
  } catch (err) { console.error(err); res.status(500).json({ error: 'هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدەرەوە یان بە واتسئەپ پەیوەندیمان پێوە بکە.' }); }
});

/* ---------- contact ---------- */
app.post('/api/contact', trap, async (req, res) => {
  try {
    const name = clean(req.body.name, 80), email = clean(req.body.email, 120), message = clean(req.body.message, 2000);
    if (!name) return bad(res, 'تکایە ناوەکەت بنووسە.');
    if (!isEmail(email)) return bad(res, 'تکایە ئیمەیڵێکی دروست بنووسە.');
    if (message.length < 3) return bad(res, 'تکایە نامەیەکی کورت بنووسە.');
    await log('messages.jsonl', { name, email, message });
    await Promise.all([
      safe(sendMail({ to: OWNER_EMAIL, replyTo: email, subject: `نامەی ماڵپەڕ لە ${name}`, html: wrapHtml('نامەی نوێ لە ماڵپەڕ', rows([['ناو', name], ['ئیمەیڵ', email]]) + `<p style="white-space:pre-wrap">${esc(message)}</p>`), text: `لە: ${name} <${email}>\n\n${message}` })),
      safe(notifyTelegram(`✉️ نامەی نوێ لە ${name} (${email}):\n\n${message}`))
    ]);
    await safe(sendMail({ to: email, subject: `نامەکەتمان وەرگرت — ${CAFE}`, html: wrapHtml(`سڵاو ${name}،`, `<p>سوپاس بۆ پەیوەندیکردنت. نامەکەتمان وەرگرت و بە زووترین کات وەڵام دەدەینەوە (بەزۆری لە ماوەی یەک ڕۆژدا).</p><p style="white-space:pre-wrap;color:#6d5b4e">${esc(message)}</p>`), text: `سڵاو ${name}، نامەکەتمان وەرگرت و وەڵام دەدەینەوە.` }));
    res.json({ ok: true, message: 'نامەکەت نێردرا. پشتڕاستکردنەوەیەکت بۆ ئیمەیڵەکەت نێردرا.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'هەڵەیەک ڕوویدا. تکایە دواتر هەوڵبدەرەوە.' }); }
});

/* ---------- newsletter ---------- */
const SUBS = path.join(DATA, 'subscribers.jsonl');
app.post('/api/newsletter', trap, async (req, res) => {
  try {
    const email = clean(req.body.email, 120).toLowerCase();
    if (!isEmail(email)) return bad(res, 'تکایە ئیمەیڵێکی دروست بنووسە.');
    if (req.body.consent !== true) return bad(res, 'تکایە ڕەزامەندی دیاری بکە.');
    await fs.mkdir(DATA, { recursive: true });
    const existing = await fs.readFile(SUBS, 'utf8').catch(() => '');
    if (!existing.split('\n').some((l) => { try { return l && JSON.parse(l).email === email; } catch (e) { return false; } })) {
      await fs.appendFile(SUBS, JSON.stringify({ email, at: new Date().toISOString() }) + '\n');
      await safe(sendMail({ to: email, subject: `بەخێربێیت بۆ ${CAFE}`, html: wrapHtml('بەخێربێیت!', '<p>بەشدارت کرا. هەواڵی بەرهەمی نوێ و پێشنیارەکانت بۆ دەنێرین — هیچ سپامێک نییە.</p>'), text: 'بەخێربێیت! بەشدارت کرا.' }));
      await safe(notifyTelegram('📬 بەشداربووی نوێی نیوزلێتەر: ' + email));
    }
    res.json({ ok: true, message: 'بەشداربووی. بەخێربێیت!' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'هەڵەیەک ڕوویدا. تکایە دواتر هەوڵبدەرەوە.' }); }
});

/* ---------- Google reviews (cache 6h) ---------- */
let reviewCache = { at: 0, data: { reviews: [] } };
app.get('/api/reviews', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  if (!env.GOOGLE_API_KEY || !env.GOOGLE_PLACE_ID) return res.json({ reviews: [] });
  if (Date.now() - reviewCache.at < 6 * 3600 * 1000) return res.json(reviewCache.data);
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(env.GOOGLE_PLACE_ID)}?languageCode=ckb`, { headers: { 'X-Goog-Api-Key': env.GOOGLE_API_KEY, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' } });
    if (!r.ok) throw new Error('Places API ' + r.status);
    const j = await r.json();
    reviewCache = { at: Date.now(), data: { rating: j.rating, count: j.userRatingCount, reviews: (j.reviews || []).filter((x) => x.rating >= 4 && x.text && x.text.text).map((x) => ({ author: (x.authorAttribution && x.authorAttribution.displayName) || 'بەکارهێنەری Google', rating: x.rating, text: x.text.text.slice(0, 400) })) } };
    res.json(reviewCache.data);
  } catch (err) { console.error('reviews:', err.message); res.json(reviewCache.data); }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'نەدۆزرایەوە' }));

/* ---------- robots.txt + sitemap.xml (ئۆتۆماتیک) ---------- */
const PAGES = ['', 'menu.html', 'gallery.html', 'about.html', 'reserve.html', 'contact.html'];
app.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nAllow: /\n${SITE_URL ? `Sitemap: ${SITE_URL}/sitemap.xml\n` : ''}`));
app.get('/sitemap.xml', (req, res) => {
  const base = SITE_URL || `${req.protocol}://${req.get('host')}`;
  const day = new Date().toISOString().slice(0, 10);
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map((p) => `  <url><loc>${base}/${p}</loc><lastmod>${day}</lastmod></url>`).join('\n')}\n</urlset>\n`);
});

/* ---------- static site ---------- */
app.use(express.static(PUBLIC, {
  extensions: ['html'],
  setHeaders(res, file) {
    res.setHeader('Cache-Control', /\.(html|js|css)$/.test(file) || /sw\.js$/.test(file) ? 'no-cache' : 'public, max-age=604800');
  }
}));
app.use((req, res) => res.status(404).sendFile(path.join(PUBLIC, '404.html')));

app.listen(PORT, () => console.log(`${CAFE} — http://localhost:${PORT}  (ئیمەیڵ: ${transporter ? 'SMTP' : 'console'} · تێلێگرام: ${env.TELEGRAM_BOT_TOKEN ? 'ئامادە' : 'ناچالاک'})`));
