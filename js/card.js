/* card.js — کارتی بەرهەم (بۆ پەڕەی سەرەکی و مێنیو) */
(function () {
  const C = Cafe, { el, money } = C;
  const TAG = { milk: 'شیر', gluten: 'گلوتین', eggs: 'هێلکە' };
  C.card = function (item, onChange) {
    const li = el('li', 'card'); li.dataset.cat = item.cat;
    const fig = el('div', 'card-media');
    const pic = document.createElement('picture');
    const src = document.createElement('source'); src.type = 'image/webp'; src.srcset = `img/${item.img}.webp`;
    const img = document.createElement('img'); img.src = `img/${item.img}.jpg`; img.alt = item.name; img.width = 640; img.height = 800; img.loading = 'lazy'; img.decoding = 'async';
    pic.append(src, img); fig.append(pic);
    if (item.best) fig.append(el('span', 'ribbon', 'زۆرترین داواکراو'));
    const fav = el('button', 'fav' + (C.favs.has(item.id) ? ' on' : ''), C.favs.has(item.id) ? '♥' : '♡');
    fav.type = 'button'; fav.setAttribute('aria-pressed', String(C.favs.has(item.id)));
    fav.setAttribute('aria-label', (C.favs.has(item.id) ? 'لابردنی ' : 'زیادکردنی ') + item.name + ' لە دڵخوازەکان');
    fav.onclick = () => { const on = C.favs.toggle(item.id); C.toast(item.name + (on ? ' پاشەکەوت کرا ♥' : ' لە دڵخوازەکان لابرا')); onChange ? onChange() : (fav.textContent = on ? '♥' : '♡', fav.classList.toggle('on', on), fav.setAttribute('aria-pressed', String(on))); };
    fig.append(fav);

    const body = el('div', 'card-body');
    body.append(el('h3', 'card-title', item.name), el('p', 'card-desc', item.desc));
    if (item.tags && item.tags.length) {
      const tags = el('ul', 'tags'); tags.setAttribute('aria-label', 'هەستیاربوون و جۆری خواردن');
      item.tags.forEach((t) => { const v = t === 'Vegan'; tags.append(el('li', 'tag ' + (v ? 'tag-diet' : 'tag-warn'), v ? '🌱 بێ ڕەگەزی ئاژەڵی' : 'لەخۆدەگرێت: ' + (TAG[t.toLowerCase()] || t))); });
      body.append(tags);
    }
    const foot = el('div', 'card-foot');
    foot.append(el('span', 'price', money(item.price)));
    const add = el('button', 'btn btn-small btn-primary', '+ زیادکردن'); add.type = 'button';
    add.setAttribute('aria-label', item.name + ' زیاد بکە بۆ سەبەتە');
    add.onclick = () => C.addToCart(item.id);
    foot.append(add); body.append(foot);
    li.append(fig, body); return li;
  };
})();
