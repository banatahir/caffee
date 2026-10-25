/* sw.js — کاشکردنی سادە: ماڵپەڕ بێ ئینتەرنێتیش دەکرێتەوە */
const V = 'cafe-v1';
const CORE = ['./', 'index.html', 'menu.html', 'gallery.html', 'about.html', 'reserve.html', 'contact.html', 'css/styles.css', 'js/config.js', 'js/menu-data.js', 'js/core.js', 'js/layout.js', 'js/card.js', 'js/menu.js', 'js/home.js', 'js/gallery.js', 'js/forms.js', 'manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).pathname.startsWith('/api/')) return;
  if (new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then((res) => { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); return res; }).catch(() => caches.match(r).then((m) => m || caches.match('index.html'))));
});
