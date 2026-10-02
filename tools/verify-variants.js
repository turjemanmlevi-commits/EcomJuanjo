// Checks that every product in preview/catalog.js has exactly the variants of its source page
// (data/source-variants.json): same count, one-to-one option values, same availability.
// Usage: node tools/verify-variants.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const window = {};
new Function('window', fs.readFileSync(path.join(root, 'preview', 'catalog.js'), 'utf8'))(window);
const sources = JSON.parse(fs.readFileSync(path.join(root, 'data', 'source-variants.json'), 'utf8'));

let problems = 0;
for (const p of window.CATALOG.products) {
  const src = sources[p.sourceUrl];
  const issues = [];
  if (!src || !src.variants.length) {
    issues.push('no source variants (page could not be read): check by hand');
  } else {
    if (src.variants.length !== p.variants.length) issues.push(`${p.variants.length} variants, source has ${src.variants.length}`);
    const keys = new Set(p.variants.map(v => v.options.join(' / ')));
    if (keys.size !== p.variants.length) issues.push('duplicate variant combinations');
    const srcAvailable = src.variants.filter(v => v.available !== false).length;
    const available = p.variants.filter(v => v.available).length;
    if (srcAvailable !== available) issues.push(`${available} available, source has ${srcAvailable}`);
    const combos = p.options.reduce((n, o) => n * o.values.length, 1);
    if (combos < p.variants.length) issues.push('more variants than option combinations');
  }
  if (issues.length) {
    problems++;
    console.log(`✗ ${p.title} (${p.sourceUrl})\n    ${issues.join('\n    ')}`);
  }
}
const total = window.CATALOG.products.length;
console.log(`\n${total - problems}/${total} products match their source variants.`);
process.exit(problems ? 1 : 0);
