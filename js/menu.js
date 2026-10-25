/* menu.js — فلتەر، گەڕان، دڵخوازەکان، پێشنیاری ڕۆژ */
(function () {
  const C = Cafe, { $, el, money } = C;
  const grid = $('#menuGrid'); if (!grid) return;
  const tabs = $('#menuTabs'), search = $('#menuSearch'), empty = $('#menuEmpty'), count = $('#menuResultCount');
  const favBtn = $('#favoritesToggle');
  const params = new URLSearchParams(location.search);
  let active = C.cats.some((c) => c.id === params.get('cat')) ? params.get('cat') : 'all';
  let query = '', favOnly = false, moodFilter = params.get('mood') || null;

  function list() {
    const q = query.trim().toLowerCase();
    return C.menu.filter((m) => (active === 'all' || m.cat === active) && (!favOnly || C.favs.has(m.id)) && (!moodFilter || m.mood.includes(moodFilter)) && (!q || (m.name + ' ' + m.desc).toLowerCase().includes(q)));
  }
  function render() {
    const l = list();
    grid.replaceChildren(...l.map((m) => C.card(m, render)));
    empty.hidden = l.length > 0;
    const mood = moodFilter && C.moods.find((x) => x.id === moodFilter);
    count.textContent = `${l.length} بژاردە${favOnly ? ' لە دڵخوازەکانت' : ''}${mood ? ' · ' + mood.emoji + ' ' + mood.label : ''}`;
    favBtn.innerHTML = `${favOnly ? '♥' : '♡'} دڵخوازەکانم <span>${C.favs.size}</span>`;
    $('#clearMood').hidden = !moodFilter;
    C.initReveal();
  }
  [{ id: 'all', label: 'هەمووی' }, ...C.cats].forEach((c) => {
    const b = el('button', 'chip', (c.icon ? c.icon + ' ' : '') + c.label); b.type = 'button'; b.dataset.cat = c.id;
    b.setAttribute('aria-pressed', String(c.id === active));
    b.onclick = () => { active = c.id; moodFilter = null; tabs.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); render(); };
    tabs.append(b);
  });
  search.addEventListener('input', () => { query = search.value; render(); });
  favBtn.addEventListener('click', () => { favOnly = !favOnly; favBtn.setAttribute('aria-pressed', String(favOnly)); favBtn.classList.toggle('is-active', favOnly); render(); });
  $('#clearMood')?.addEventListener('click', () => { moodFilter = null; render(); });

  /* پێشنیاری ڕۆژ + پێشنیاری کات */
  const pick = C.dailyPick(), g = C.greeting();
  $('#dailyPick').textContent = `${pick.name} · ${money(pick.price)}`;
  $('#dailyPickText').textContent = pick.desc;
  $('#dailyPickAdd').onclick = () => C.addToCart(pick.id);
  $('#greetTitle').textContent = g.text; $('#greetSub').textContent = g.sub;
  $('#greetBtn').onclick = () => { active = g.hint; moodFilter = null; tabs.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cat === active))); render(); grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  $('#surprise').onclick = () => { const n = C.menu[Math.floor(Math.random() * C.menu.length)]; active = 'all'; query = ''; search.value = ''; favOnly = false; moodFilter = null; tabs.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cat === 'all'))); render(); const c = [...grid.children].find((n2) => n2.querySelector('.card-title').textContent === n.name); if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 1800); } C.toast('پێشنیارمان: ' + n.name); };

  /* پۆلی هاوشێوە لە لینکی پەڕەی سەرەکی: menu.html#menuGrid */
  render();
})();
