/* ==========================================================================
   UI behaviour: mobile nav, scroll effects, config → page wiring, lazy map.
   ========================================================================== */
(function () {
  const cfg = Cafe.config;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Fill contact details from config ---------- */
  $$('[data-cfg="phone"]').forEach((el) => { el.textContent = cfg.phone; const a = el.closest('a'); if (a) a.href = 'tel:' + cfg.phone.replace(/\s/g, ''); });
  $$('[data-cfg="email"]').forEach((el) => { el.textContent = cfg.email; const a = el.closest('a'); if (a) a.href = 'mailto:' + cfg.email; });
  $$('[data-cfg="address"]').forEach((n) => (n.textContent = cfg.address));
  $$('[data-cfg="whatsapp"]').forEach((a) => (a.href = `https://wa.me/${cfg.whatsapp.replace(/\D/g, '')}`));
  $$('[data-cfg="directions"]').forEach((a) => (a.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(cfg.mapsQuery)));
  [['instagram', cfg.instagram], ['facebook', cfg.facebook]].forEach(([k, url]) =>
    $$(`[data-cfg="${k}"]`).forEach((a) => { if (url) a.href = url; else a.hidden = true; }));
  $$('[data-cfg="year"]').forEach((n) => (n.textContent = new Date().getFullYear()));

  /* ---------- Mobile nav ---------- */
  const header = $('.site-header');
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  function setNav(open) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', () => setNav(!header.classList.contains('nav-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* ---------- Header shadow + scroll-to-top ---------- */
  const top = $('#scrollTop');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 10);
      top.classList.toggle('show', window.scrollY > 700);
      ticking = false;
    });
  }, { passive: true });
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Highlight current section in nav ---------- */
  const navLinks = $$('#navLinks a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s) spy.observe(s); });

    /* ---------- Reveal on scroll ---------- */
    const rev = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((n) => rev.observe(n));

    /* ---------- Lazy-load the map only when it scrolls into view ---------- */
    const map = $('#mapFrame');
    if (map) {
      const mo = new IntersectionObserver((en) => {
        if (en[0].isIntersecting) {
          map.src = 'https://www.google.com/maps?q=' + encodeURIComponent(cfg.mapsQuery) + '&output=embed';
          mo.disconnect();
        }
      }, { rootMargin: '300px' });
      mo.observe(map);
    }
  } else {
    $$('.reveal').forEach((n) => n.classList.add('in'));
  }
})();
