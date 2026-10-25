/* ==========================================================================
   layout.js — هێدەر، فووتەر، دراوەری سەبەتە، دۆخی تاریک، ئاگادارکەرەوە
   یەک جار لێرە دروست دەکرێت و بۆ هەموو پەڕەکان دەردەکەوێت.
   ========================================================================== */
(function () {
  const C = Cafe, cfg = C.config, { $, $$, el, money } = C;
  const page = document.body.dataset.page || 'home';

  const NAV = [
    ['home', 'index.html', 'سەرەکی'], ['menu', 'menu.html', 'مێنیو'], ['gallery', 'gallery.html', 'گاڵەری'],
    ['about', 'about.html', 'دەربارە'], ['reserve', 'reserve.html', 'حیجزکردن'], ['contact', 'contact.html', 'پەیوەندی']
  ];

  /* ---------- theme (auto from system, remembered) ---------- */
  const savedTheme = C.store.get('cafe-theme', null);
  const applyTheme = (t) => { document.documentElement.dataset.theme = t; const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#17110d' : '#fbf6ee'; };
  applyTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  /* ---------- header ---------- */
  const header = el('header', 'site-header');
  header.innerHTML = `
    <div class="wrap bar">
      <a class="brand" href="index.html" aria-label="${cfg.name}"><span class="brand-mark" aria-hidden="true">☕</span><span>${cfg.name}</span></a>
      <nav id="navLinks" class="nav" aria-label="ناڤیگەیشن">
        ${NAV.map(([id, href, label]) => `<a href="${href}"${id === page ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('')}
        <p class="status-pill nav-status" data-status data-state="closed" role="status"><span class="dot" aria-hidden="true"></span><span class="status-text">…</span></p>
      </nav>
      <div class="bar-actions">
        <button id="themeToggle" class="icon-btn" type="button" aria-label="گۆڕینی دۆخی تاریک/ڕووناک"><span aria-hidden="true">🌓</span></button>
        <button id="cartOpen" class="icon-btn cart-btn" type="button" aria-label="سەبەتەی داواکاری"><span aria-hidden="true">🛍</span><span id="cartBadge" class="badge" hidden>0</span></button>
        <button id="navToggle" class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="navLinks" aria-label="کردنەوەی لیست"><span></span><span></span><span></span></button>
      </div>
    </div>`;
  document.body.prepend(header);
  const skip = el('a', 'skip-link', 'بڕۆ بۆ ناوەڕۆک'); skip.href = '#main'; document.body.prepend(skip);
  const main = $('main'); if (main && !main.id) main.id = 'main';

  /* ---------- footer ---------- */
  const footer = el('footer', 'site-footer');
  footer.innerHTML = `
    <div class="wrap foot-grid">
      <div class="foot-brand">
        <p class="brand"><span class="brand-mark" aria-hidden="true">☕</span><span>${cfg.name}</span></p>
        <p>${cfg.tagline}. بۆنێکی تایبەت، تامێکی نایاب.</p>
        <p class="status-pill" data-status data-state="closed" role="status"><span class="dot" aria-hidden="true"></span><span class="status-text">…</span></p>
      </div>
      <div><h3>پەڕەکان</h3><ul>${NAV.map(([, h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>
      <div><h3>پەیوەندی</h3><ul>
        <li><a data-cfg="phone-link" href="#"><span data-cfg="phone"></span></a></li>
        <li><a data-cfg="email-link" href="#"><span data-cfg="email"></span></a></li>
        <li><span data-cfg="address"></span></li></ul></div>
      <div><h3>شوێنکەوتنمان بکە</h3><ul class="social">
        <li><a data-cfg="instagram" href="#" target="_blank" rel="noopener">ئینستاگرام</a></li>
        <li><a data-cfg="facebook" href="#" target="_blank" rel="noopener">فەیسبووک</a></li>
        <li><a data-cfg="telegram" href="#" target="_blank" rel="noopener">تێلێگرام</a></li>
        <li><a data-cfg="whatsapp" href="#" target="_blank" rel="noopener">واتسئەپ</a></li></ul></div>
    </div>
    <div class="wrap foot-base"><p>© <span data-cfg="year"></span> ${cfg.name}. هەموو مافەکان پارێزراون.</p></div>`;
  document.body.append(footer);

  /* ---------- config → page ---------- */
  const tel = cfg.phone.replace(/\s/g, '');
  $$('[data-cfg="phone"]').forEach((n) => (n.textContent = cfg.phone));
  $$('[data-cfg="phone-link"]').forEach((a) => (a.href = 'tel:' + tel));
  $$('[data-cfg="email"]').forEach((n) => (n.textContent = cfg.email));
  $$('[data-cfg="email-link"]').forEach((a) => (a.href = 'mailto:' + cfg.email));
  $$('[data-cfg="address"]').forEach((n) => (n.textContent = cfg.address));
  $$('[data-cfg="directions"]').forEach((a) => (a.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(cfg.mapsQuery)));
  $$('[data-cfg="whatsapp"]').forEach((a) => (a.href = C.whatsappUrl('')));
  $$('[data-cfg="whatsapp-hello"]').forEach((a) => (a.href = C.whatsappUrl('سڵاو، دەمەوێت پرسیارێک بکەم…')));
  [['instagram', cfg.instagram], ['facebook', cfg.facebook], ['telegram', cfg.telegram]].forEach(([k, url]) =>
    $$(`[data-cfg="${k}"]`).forEach((a) => { if (url) a.href = url; else (a.closest('li') || a).hidden = true; }));
  $$('[data-cfg="year"]').forEach((n) => (n.textContent = new Date().getFullYear()));
  $$('[data-cfg="google-review"]').forEach((a) => { if (cfg.googleReviewUrl) a.href = cfg.googleReviewUrl; else a.hidden = true; });

  /* ---------- nav behaviour ---------- */
  const toggle = $('#navToggle');
  const setNav = (o) => { header.classList.toggle('nav-open', o); toggle.setAttribute('aria-expanded', String(o)); };
  toggle.addEventListener('click', () => setNav(!header.classList.contains('nav-open')));
  $('#navLinks').addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  $('#themeToggle').addEventListener('click', () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(t); C.store.set('cafe-theme', t); });

  /* ---------- scroll effects ---------- */
  const topBtn = el('button', 'scroll-top', '↑'); topBtn.type = 'button'; topBtn.setAttribute('aria-label', 'بگەڕێوە بۆ سەرەوە'); document.body.append(topBtn);
  let tick = false;
  addEventListener('scroll', () => { if (tick) return; tick = true; requestAnimationFrame(() => { header.classList.toggle('scrolled', scrollY > 10); topBtn.classList.toggle('show', scrollY > 700); tick = false; }); }, { passive: true });
  topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- reveal on scroll ---------- */
  C.initReveal = function () {
    const nodes = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) return nodes.forEach((n) => n.classList.add('in'));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
    nodes.forEach((n) => io.observe(n));
  };
  C.initReveal();

  /* ---------- cart drawer ---------- */
  const drawer = el('aside', 'drawer'); drawer.id = 'cartDrawer'; drawer.hidden = true;
  drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-labelledby', 'cartTitle');
  drawer.innerHTML = `
    <div class="drawer-scrim" data-close></div>
    <div class="drawer-panel">
      <div class="drawer-head"><h2 id="cartTitle">داواکارییەکەت</h2><button class="icon-btn" type="button" data-close aria-label="داخستن">✕</button></div>
      <div class="drawer-body">
        <p id="cartEmpty" class="empty">سەبەتەکەت بەتاڵە. لە <a href="menu.html">مێنیو</a> شتێک زیاد بکە.</p>
        <ul id="cartLines" class="order"></ul>
        <p id="cartTotal" class="order-total" hidden><span>کۆی گشتی</span><strong></strong></p>
        <form id="pickupForm" class="form" novalidate hidden>
          <h3 class="mini">زانیاری وەرگرتن</h3>
          <div class="fields">
            <label class="field">ناو<input name="name" autocomplete="name" required maxlength="80"></label>
            <label class="field">ژمارەی مۆبایل<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required dir="ltr" placeholder="07XX XXX XXXX"></label>
            <label class="field">ڕۆژ<select name="date" id="pickupDate"></select></label>
            <label class="field">کاتی وەرگرتن<select name="time" id="pickupTime"></select></label>
            <label class="field full">تێبینی (ئارەزووی)<textarea name="notes" rows="2" maxlength="300"></textarea></label>
            <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          </div>
          <p class="note">نرخ تەنها ڕێنماییە و لە کاتی وەرگرتن دەدرێت.</p>
          <button class="btn btn-primary btn-block" type="submit">ناردنی داواکاری</button>
          <a id="cartWa" class="btn btn-ghost btn-block" target="_blank" rel="noopener">لە ڕێگەی واتسئەپەوە بنێرە</a>
          <p id="pickupMsg" class="form-msg" role="status" hidden></p>
        </form>
      </div>
    </div>`;
  document.body.append(drawer);

  const linesEl = $('#cartLines', drawer), form = $('#pickupForm', drawer), msg = $('#pickupMsg', drawer);
  const dateSel = $('#pickupDate', drawer), timeSel = $('#pickupTime', drawer);

  function fillDates() {
    const ds = C.time.days(cfg.booking.daysAhead, cfg.booking.pickupLeadMin);
    dateSel.replaceChildren(...ds.map((d) => { const o = el('option', null, d.label); o.value = d.date; return o; }));
    fillTimes();
  }
  function fillTimes() {
    const ts = C.time.slots(dateSel.value, { lead: cfg.booking.pickupLeadMin });
    timeSel.replaceChildren(...ts.map((t) => { const o = el('option', null, C.time.fmtShort(C.time.toMin(t))); o.value = t; return o; }));
  }
  dateSel.addEventListener('change', fillTimes);

  function renderCart() {
    const n = C.cart.count, badge = $('#cartBadge');
    badge.hidden = !n; badge.textContent = n;
    $('#cartEmpty', drawer).hidden = n > 0; form.hidden = n === 0; $('#cartTotal', drawer).hidden = n === 0;
    linesEl.replaceChildren(...C.cart.lines.map((l) => {
      const li = el('li');
      const info = el('div', 'order-info'); info.append(el('strong', null, l.name), el('small', null, money(l.price) + ' × ' + l.qty));
      const q = el('div', 'qty');
      const minus = el('button', null, '−'), plus = el('button', null, '+'), out = el('output', null, String(l.qty));
      minus.type = plus.type = 'button'; minus.setAttribute('aria-label', 'کەمکردنەوە'); plus.setAttribute('aria-label', 'زیادکردن');
      minus.onclick = () => C.cart.set(l.id, l.qty - 1); plus.onclick = () => C.cart.set(l.id, l.qty + 1);
      q.append(minus, out, plus);
      li.append(info, q, el('span', 'line-total', money(l.price * l.qty)));
      return li;
    }));
    $('#cartTotal strong', drawer).textContent = money(C.cart.total);
    updateWa();
  }
  function updateWa() { const f = new FormData(form); $('#cartWa', drawer).href = C.whatsappUrl(C.cart.message({ name: f.get('name'), time: f.get('time') && (dateSel.selectedOptions[0]?.text + ' ' + timeSel.selectedOptions[0]?.text), notes: f.get('notes') })); }
  form.addEventListener('input', updateWa);
  C.cart.onChange(renderCart);

  let lastFocus = null;
  C.openCart = function () { lastFocus = document.activeElement; fillDates(); renderCart(); drawer.hidden = false; document.body.classList.add('no-scroll'); requestAnimationFrame(() => drawer.classList.add('open')); $('.drawer-head button', drawer).focus(); };
  function closeCart() { drawer.classList.remove('open'); document.body.classList.remove('no-scroll'); setTimeout(() => (drawer.hidden = true), 250); if (lastFocus) lastFocus.focus(); }
  $('#cartOpen').addEventListener('click', C.openCart);
  drawer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeCart(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!drawer.hidden) closeCart(); setNav(false); } });
  renderCart();

  function show(kind, text, extra) { msg.hidden = false; msg.className = 'form-msg ' + kind; msg.textContent = text; if (extra) msg.append(extra); }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.name.trim()) return show('error', 'تکایە ناوەکەت بنووسە.');
    if (!/^[+\d][\d\s()-]{6,24}$/.test(f.phone.trim())) return show('error', 'تکایە ژمارەی مۆبایلێکی دروست بنووسە.');
    if (!f.time) return show('error', 'تکایە کاتێک هەڵبژێرە.');
    const btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'دەنێردرێت…';
    try {
      const r = await C.api('/api/reservations', { type: 'pickup', ...f, items: C.cart.lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price })) });
      show('success', r.message || 'داواکارییەکەت گەیشت. بەم زووانە پشتڕاستی دەکەینەوە.');
      C.cart.clear(); form.reset(); fillDates();
    } catch (err) {
      const a = el('a', 'btn btn-small btn-primary', 'بنێرە بە واتسئەپ'); a.href = $('#cartWa', drawer).href; a.target = '_blank'; a.rel = 'noopener';
      if (err.server && err.status && err.status < 500) show('error', err.message);
      else show('error', 'نەتوانرا بنێردرێت. دەتوانیت ڕاستەوخۆ بە واتسئەپ بینێریت: ', a);
    } finally { btn.disabled = false; btn.textContent = 'ناردنی داواکاری'; }
  });

  /* ---------- add-to-cart helper used by pages ---------- */
  C.addToCart = function (id) { C.cart.add(id); C.toast(C.byId[id].name + ' زیادکرا بۆ سەبەتە'); };

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  /* ---------- Google Analytics (ئارەزووی، لە config) ---------- */
  if (cfg.gaId) {
    const g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.gaId; document.head.append(g);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', cfg.gaId);
  }
  C.renderStatus && C.renderStatus();
})();
