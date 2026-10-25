/* home.js — پەڕەی سەرەکی: سڵاوی کات، هاوڕێی هەست، پڕفرۆشەکان */
(function () {
  const C = Cafe, { $, el, money } = C;
  if (document.body.dataset.page !== 'home') return;

  const g = C.greeting();
  $('#heroGreeting').textContent = g.text; $('#heroSub').textContent = g.sub;

  // خولی ڕۆژانە
  const pick = C.dailyPick();
  $('#pickImg').src = `img/${pick.img}.jpg`; $('#pickImg').alt = pick.name;
  $('#pickName').textContent = pick.name; $('#pickDesc').textContent = pick.desc; $('#pickPrice').textContent = money(pick.price);
  $('#pickAdd').onclick = () => C.addToCart(pick.id);

  // جۆرەکان
  const cover = { coffee: 'latte-art', cold: 'orange-juice', tea: 'iraqi-tea', dessert: 'chocolate-cake', bakery: 'croissant' };
  $('#catGrid').replaceChildren(...C.cats.map((c) => {
    const a = el('a', 'cat-tile'); a.href = `menu.html?cat=${c.id}`;
    const n = C.menu.filter((m) => m.cat === c.id).length;
    a.innerHTML = `<img src="img/${cover[c.id]}.webp" alt="" loading="lazy" width="480" height="600"><span class="cat-info"><strong>${c.label}</strong><small>${n} بژاردە</small></span>`;
    return a;
  }));

  // هاوڕێی هەست
  const moods = $('#moodChips'), out = $('#moodResult');
  C.moods.forEach((m) => {
    const b = el('button', 'chip chip-lg', `${m.emoji} ${m.label}`); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
    b.onclick = () => {
      moods.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const hits = C.menu.filter((x) => x.mood.includes(m.id));
      const day = Math.floor(Date.now() / 3600000); // دەگۆڕێت لە هەر کاتژمێرێکدا
      const three = [0, 1, 2].map((i) => hits[(day + i * 3) % hits.length]).filter((v, i, a) => a.indexOf(v) === i);
      out.replaceChildren(el('p', 'mood-blurb', m.blurb));
      const ul = el('ul', 'grid mood-grid'); three.forEach((it) => ul.append(C.card(it)));
      const more = el('a', 'btn btn-ghost', 'هەموو پێشنیارەکان ببینە'); more.href = `menu.html?mood=${m.id}#menuGrid`;
      out.append(ul, more); out.hidden = false;
    };
    moods.append(b);
  });

  // پڕفرۆشەکان
  const best = C.menu.filter((m) => m.best).slice(0, 4);
  $('#bestGrid').replaceChildren(...best.map((m) => C.card(m)));

  // گاڵەریی بچووک
  $('#miniGallery').replaceChildren(...['latte-art', 'cappuccinos', 'pink-smoothie', 'tea-pour', 'iced-coffee', 'green-smoothie'].map((n) => {
    const f = el('a', 'mini-photo'); f.href = 'gallery.html'; f.innerHTML = `<img src="img/${n}.webp" alt="" loading="lazy" width="400" height="500">`; return f;
  }));

  // ژمارە و ئاماری زیندوو
  $('#statItems').textContent = C.menu.length;
  $('#statCats').textContent = C.cats.length;
  C.initReveal();
})();
