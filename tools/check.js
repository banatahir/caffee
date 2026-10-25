/* npm run check — پشکنینی ئۆتۆماتیک پێش بڵاوکردنەوە:
   هەموو وێنە و بەستەرە ناوخۆییەکان هەن؟ هیچ "REPLACE" ماوە؟ */
const fs = require('fs'), path = require('path');
const pub = path.join(__dirname, '..', 'public');
let problems = 0; const warn = (m) => { problems++; console.log('⚠ ', m); };
const read = (p) => fs.readFileSync(p, 'utf8');
const pages = fs.readdirSync(pub).filter((f) => f.endsWith('.html'));
for (const p of pages) {
  const html = read(path.join(pub, p));
  for (const m of html.matchAll(/(?:src|href|srcset)="([^"#?]+)(?:[#?][^"]*)?"/g)) {
    const u = m[1]; if (/^(https?:|mailto:|tel:|data:)/.test(u) || u.startsWith('#') || u === '#') continue;
    if (!fs.existsSync(path.join(pub, u))) warn(`${p}: فایل نییە → ${u}`);
  }
}
const data = read(path.join(pub, 'js', 'menu-data.js'));
for (const m of data.matchAll(/img: '([^']+)'/g)) for (const ext of ['webp', 'jpg']) if (!fs.existsSync(path.join(pub, 'img', `${m[1]}.${ext}`))) warn(`menu-data: img/${m[1]}.${ext} نییە`);
for (const f of [...pages.map((p) => p), 'js/config.js']) if (/REPLACE|XXXXXX|example\.com/.test(read(path.join(pub, f)))) console.log(`ℹ  ${f}: هێشتا نموونەیە (REPLACE/example.com) — پێش بڵاوکردنەوە بیگۆڕە`);
console.log(problems ? `\n${problems} کێشە دۆزرایەوە` : '\n✓ هیچ بەستەر یان وێنەیەکی شکاو نییە');
process.exit(problems ? 1 : 0);
