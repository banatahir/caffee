/* ==========================================================================
   داتای مێنیو — نرخ، وێنە و وەسف لێرە بگۆڕە. یەک دێڕ = یەک بەرهەم.
   img: ناوی وێنە لە /img (بێ پاشگر)
   mood: بۆ "هاوڕێی هەست" — energy | calm | fresh | sweet | cozy
   tags: Vegan / Milk / Gluten / Eggs — تکایە لەگەڵ ڕێسێپتی ڕاستەقینە بپشکنە!
   نرخەکان نموونەن — پێش بڵاوکردنەوە بیانگۆڕە.
   ========================================================================== */
window.Cafe = window.Cafe || {};

Cafe.cats = [
  { id: 'coffee',  label: 'قاوە',            icon: '☕' },
  { id: 'cold',    label: 'شەربەت و سمۆزی',  icon: '🥤' },
  { id: 'tea',     label: 'چا',              icon: '🍵' },
  { id: 'dessert', label: 'شیرینی',          icon: '🍰' },
  { id: 'bakery',  label: 'نانی بەیانی',     icon: '🥐' }
];

Cafe.menu = [
  // ---- قاوە
  { id: 'espresso',   cat: 'coffee', name: 'ئێسپریسۆ',        desc: 'قاوەیەکی بەهێز، تازە و پڕ لە بۆن.',                price: 2500, img: 'espresso',      mood: ['energy'],        tags: ['Vegan'], best: true },
  { id: 'cappuccino', cat: 'coffee', name: 'کاپوچینۆ',        desc: 'ئێسپریسۆ لەگەڵ شیری کفکراوی نەرم و ڕەسمی ئاڕتی.',   price: 3500, img: 'cappuccinos',   mood: ['cozy','energy'], tags: ['Milk'], best: true },
  { id: 'latte',      cat: 'coffee', name: 'لاتێ',            desc: 'ئێسپریسۆی نەرم لەگەڵ شیری گەرمکراو.',                price: 3500, img: 'latte-art',     mood: ['cozy','calm'],   tags: ['Milk'] },
  { id: 'mocha',      cat: 'coffee', name: 'مۆکا',            desc: 'تێکەڵەی ئێسپریسۆ، چۆکڵێت و شیر.',                     price: 4000, img: 'mocha',         mood: ['sweet','energy'],tags: ['Milk'] },
  { id: 'caramel',    cat: 'coffee', name: 'کاراملی ساردە',   desc: 'قاوەی سارد بە کارامێلی زێڕین و ئاوی سەهۆڵ.',         price: 4500, img: 'caramel-latte', mood: ['sweet','fresh'], tags: ['Milk'] },
  { id: 'iced',       cat: 'coffee', name: 'قاوەی سارد',      desc: 'قاوەی تازەی سارد، بۆ ڕۆژە گەرمەکان.',                 price: 3500, img: 'iced-coffee',   mood: ['fresh','energy'],tags: ['Vegan'] },
  { id: 'hotchoc',    cat: 'coffee', name: 'چۆکڵێتی گەرم',    desc: 'چۆکڵێتی گەرم بە مارشمەلۆ و دارچین.',                  price: 4000, img: 'hot-chocolate', mood: ['sweet','cozy'],  tags: ['Milk'] },

  // ---- شەربەت و سمۆزی
  { id: 'orange',     cat: 'cold', name: 'شەربەتی پرتەقاڵ',   desc: 'پرتەقاڵی تازە فشاردراو، بێ شەکری زیادە.',            price: 3000, img: 'orange-juice',     mood: ['fresh','energy'], tags: ['Vegan'], best: true },
  { id: 'apple',      cat: 'cold', name: 'شەربەتی سێو',       desc: 'شەربەتی سروشتی و تازەی سێو.',                         price: 3000, img: 'apple-juice',      mood: ['fresh'],          tags: ['Vegan'] },
  { id: 'carrot',     cat: 'cold', name: 'شەربەتی گێزەر',     desc: 'گێزەری تازە فشاردراو.',                               price: 3500, img: 'carrot-juice',     mood: ['fresh','calm'],   tags: ['Vegan'] },
  { id: 'strawberry', cat: 'cold', name: 'شەربەتی تووتفرەنگی', desc: 'تووتفرەنگیی شیرین و تازە لەگەڵ سەهۆڵی ورد.',          price: 4000, img: 'strawberry-juice', mood: ['fresh','sweet'],  tags: ['Vegan'] },
  { id: 'pink',       cat: 'cold', name: 'سمۆزی تووتە سوورەکان', desc: 'سمۆزیی تووتە تێکەڵەکان و ماست.',                  price: 5000, img: 'pink-smoothie',    mood: ['sweet','fresh'],  tags: ['Milk'], best: true },
  { id: 'berry',      cat: 'cold', name: 'سمۆزی بێری',        desc: 'تووتی ڕەش و تووتفرەنگ، نەرم و کرەمی.',                price: 5000, img: 'berry-smoothie',   mood: ['sweet','calm'],   tags: ['Milk'] },
  { id: 'mango',      cat: 'cold', name: 'سمۆزی مانگۆ',       desc: 'مانگۆی تازە بە کرێم و پارچە مانگۆ.',                  price: 5500, img: 'mango-smoothie',   mood: ['sweet','fresh'],  tags: ['Milk'] },
  { id: 'green',      cat: 'cold', name: 'سمۆزی سەوز',        desc: 'سپیناخ، کیوی و سێو — سووک و ئاسوودەکەر.',            price: 5000, img: 'green-smoothie',   mood: ['fresh','calm'],   tags: ['Vegan'] },
  { id: 'celery',     cat: 'cold', name: 'شەربەتی سەوزە',     desc: 'کەرەفس، لیمۆ و سپیناخ؛ سووک و پڕ ڤیتامین.',                   price: 4000, img: 'celery-juice',     mood: ['fresh','calm'],   tags: ['Vegan'] },

  // ---- چا
  { id: 'tea',        cat: 'tea', name: 'چای عێراقی',        desc: 'چای کلاسیکی عێراقی بە ئیستکان و گەرمی پێشکەش دەکرێت.', price: 500,  img: 'iraqi-tea',  mood: ['cozy','calm'], tags: ['Vegan'], best: true },
  { id: 'greentea',   cat: 'tea', name: 'چای سەوز',          desc: 'سووک و خۆش، بۆ ساتێکی ئارام.',                        price: 2000, img: 'green-tea',  mood: ['calm'],        tags: ['Vegan'] },
  { id: 'chamomile',  cat: 'tea', name: 'چای بابوونە',       desc: 'بابوونەی بۆنخۆش و ئارامکەرەوە.',                      price: 2500, img: 'chamomile',  mood: ['calm','cozy'], tags: ['Vegan'] },

  // ---- شیرینی
  { id: 'cake',       cat: 'dessert', name: 'کێکی چۆکڵێت',    desc: 'چەند چینی چۆکڵێتی دەوڵەمەند و شیرین.',                price: 4500, img: 'chocolate-cake', mood: ['sweet','cozy'],   tags: ['Gluten','Milk','Eggs'], best: true },
  { id: 'tart',       cat: 'dessert', name: 'تارتی میوە',      desc: 'تارتی ترد بە کرێمی ڤانیلا و میوەی تازە.',            price: 5000, img: 'fruit-tart',     mood: ['sweet','fresh'],  tags: ['Gluten','Milk','Eggs'] },

  // ---- نانی بەیانی
  { id: 'croissant',  cat: 'bakery', name: 'کرواسۆنی چۆکڵێت', desc: 'شیرینییەکی فەرەنسی نەرم و کرەدار، بە چۆکڵێت و فستق.', price: 3000, img: 'croissant',      mood: ['energy','sweet'], tags: ['Gluten','Milk','Eggs'], best: true },
  { id: 'cinnamon',   cat: 'bakery', name: 'ڕۆڵی دارچین',     desc: 'ڕۆڵێکی نەرم و گەرم بە دارچین و گلاسەی سپی.',          price: 3500, img: 'cinnamon-roll',  mood: ['sweet','cozy'],   tags: ['Gluten','Milk','Eggs'] }
];

// "هاوڕێی هەست" — mood finder
Cafe.moods = [
  { id: 'energy', label: 'پێویستم بە وزەیە',  emoji: '⚡', blurb: 'بۆ دەستپێکردنی ڕۆژێکی بەهێز:' },
  { id: 'calm',   label: 'دەمەوێت ئارام بم',   emoji: '🌿', blurb: 'بۆ ساتێکی ئارام و بێدەنگ:' },
  { id: 'fresh',  label: 'گەرمە، تازەگی دەوێت', emoji: '🧊', blurb: 'بۆ ڕۆژە گەرمەکان:' },
  { id: 'sweet',  label: 'تامی شیرین دەمەوێت', emoji: '🍯', blurb: 'بۆ دڵی شیرین:' },
  { id: 'cozy',   label: 'ساتێکی گەرم و خۆش',  emoji: '🧣', blurb: 'بۆ دانیشتنێکی گەرم:' }
];

// وێنەکانی گاڵەری
Cafe.gallery = [
  { img: 'juice-bar',      cat: 'drinks',  cap: 'شەربەتی پرتەقاڵ لە بارەکەمان', alt: 'Glass of orange juice on a wooden bar', tall: true },
  { img: 'latte-art',      cat: 'coffee',  cap: 'ئاڕتی لاتێ', alt: 'Latte art on a saucer with flowers', tall: true },
  { img: 'cappuccinos',    cat: 'coffee',  cap: 'کاپوچینۆ لە نێو ڕووەکەکان', alt: 'Three cappuccinos among plants' },
  { img: 'latte-barrel',   cat: 'coffee',  cap: 'ساتێکی گەرم', alt: 'Latte on a barrel table', wide: true },
  { img: 'pink-smoothie',  cat: 'drinks',  cap: 'سمۆزی تووتە', alt: 'Berry smoothies', tall: true },
  { img: 'tea-pour',       cat: 'tea',     cap: 'ڕشتنی چا', alt: 'Pouring tea from a brass kettle', tall: true },
  { img: 'green-smoothie', cat: 'drinks',  cap: 'سمۆزی سەوز', alt: 'Green smoothie with kiwi', tall: true },
  { img: 'iced-coffee',    cat: 'coffee',  cap: 'قاوەی سارد', alt: 'Iced coffee on a wooden table', tall: true },
  { img: 'iraqi-tea',      cat: 'tea',     cap: 'چای عێراقی', alt: 'Iraqi tea in an istikan glass' },
  { img: 'fruit-table',    cat: 'drinks',  cap: 'میوەی تازە', alt: 'Fresh fruit and juices' },
  { img: 'chocolate-cake', cat: 'sweets',  cap: 'کێکی چۆکڵێت', alt: 'Chocolate cake slice' },
  { img: 'fruit-tart',     cat: 'sweets',  cap: 'تارتی میوە', alt: 'Fruit tart' },
  { img: 'croissant',      cat: 'sweets',  cap: 'کرواسۆن', alt: 'Croissant with chocolate' },
  { img: 'cinnamon-roll',  cat: 'sweets',  cap: 'ڕۆڵی دارچین', alt: 'Cinnamon roll' },
  { img: 'hot-chocolate',  cat: 'drinks',  cap: 'چۆکڵێتی گەرم', alt: 'Hot chocolate with marshmallows', tall: true },
  { img: 'chamomile',      cat: 'tea',     cap: 'چای بابوونە', alt: 'Chamomile tea' },
  { img: 'apple-juice',    cat: 'drinks',  cap: 'شەربەتی سێو', alt: 'Apple juice', tall: true },
  { img: 'strawberry-juice', cat: 'drinks',cap: 'شەربەتی تووتفرەنگی', alt: 'Strawberry juice', tall: true }
];
