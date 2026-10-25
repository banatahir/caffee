/* npm run images — هەموو وێنەکانی public/img دەکات بە webp + jpg ی بچووک.
   وێنەی نوێ بخە ناو public/img (jpg/png) و ئەم فەرمانە جێبەجێ بکە. */
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const dir = path.join(__dirname, '..', 'public', 'img');
const MAX = 1200;
(async () => {
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png)$/i.test(f) || /^icon-/.test(f)) continue;
    const base = f.replace(/\.[^.]+$/, ''), src = path.join(dir, f);
    const img = sharp(src, { failOn: 'none' }).rotate().resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true });
    await img.clone().webp({ quality: 80 }).toFile(path.join(dir, base + '.webp'));
    if (!/\.jpe?g$/i.test(f)) await img.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(dir, base + '.jpg'));
    else { const buf = await img.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer(); fs.writeFileSync(src, buf); }
    console.log('✓', f);
  }
})();
