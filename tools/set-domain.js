/* npm run domain -- https://yourdomain.com — دۆمەینەکەت لە هەموو پەڕەکان (canonical, og, JSON-LD) دەگۆڕێت */
const fs = require('fs'), path = require('path');
const url = (process.argv[2] || '').replace(/\/$/, '');
if (!/^https?:\/\/[^/]+/.test(url)) { console.log('بەکارهێنان: npm run domain -- https://yourdomain.com'); process.exit(1); }
const pub = path.join(__dirname, '..', 'public');
for (const f of fs.readdirSync(pub).filter((x) => x.endsWith('.html'))) {
  const p = path.join(pub, f); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll(/https?:\/\/www\.example\.com/g, url)); console.log('✓', f);
}
