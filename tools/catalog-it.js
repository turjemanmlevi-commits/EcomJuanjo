// Applies the Italian copy (data/catalogo-it.json) and the real source variants
// (data/source-variants.json) to a product built by generate-catalog.js.
// Both files are keyed by the competitor link of winners_combinado_100.csv.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readData = file => JSON.parse(fs.readFileSync(path.join(root, 'data', file), 'utf8'));
const copy = readData('catalogo-it.json');
const sources = readData('source-variants.json');

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cents = s => Math.round(parseFloat(s) * 100) || 0;

// Scales a price by ratio while keeping the cents ending of the base price (44.90 -> 34.90, 53.00 -> 58.00).
function scale(base, ratio) {
  if (!base || ratio === 1) return base;
  const ending = base % 100;
  return Math.max(ending, Math.round((base * ratio - ending) / 100) * 100 + ending);
}

function applyItalianCopy(product, row, colorSets) {
  const it = copy[row.Link];
  const src = sources[row.Link];
  if (!it || !src) return product;

  product.imageKey = product.handle;
  product.handle = slug(it.title);
  product.title = it.title;
  product.vendor = 'ORIONA';
  product.imageAlt = it.title;
  product.description = it.seoDescription;
  product.seoDescription = it.seoDescription;
  product.bodyHtml = it.descriptionHtml;

  // Translate every source option; options left with a single value are dropped, colour goes first.
  const mapped = src.options.map(o => {
    const m = it.options.find(x => x.source_name === o.name);
    const lookup = new Map((m ? m.values : []).map(v => [v.src, v.it]));
    const values = [...new Set(o.values.map(v => (m ? lookup.get(v) : v)).filter(Boolean))];
    return { name: m ? m.name : o.name, lookup: m ? lookup : null, values };
  });
  const kept = mapped.map((o, i) => ({ ...o, i })).filter(o => o.values.length > 1 || o.name === 'Colore');
  kept.sort((a, b) => (b.name === 'Colore') - (a.name === 'Colore'));
  const colourIndex = mapped.findIndex(o => o.name === 'Colore');
  product.colorSources = {};

  const firstPrice = cents(src.variants[0].price);
  const basePrice = product.price || firstPrice;
  const variants = new Map();
  for (const v of src.variants) {
    const translated = v.values.map((value, i) => (mapped[i].lookup ? mapped[i].lookup.get(value) : value));
    if (translated.some(t => !t)) continue;
    const options = kept.map(o => translated[o.i]);
    const key = options.join(' / ');
    if (variants.has(key)) continue;
    const ratio = firstPrice ? cents(v.price) / firstPrice : 1;
    const price = scale(basePrice, ratio);
    let compare = product.compare_at_price ? scale(product.compare_at_price, ratio) : Math.round(cents(v.compare) * (basePrice / (firstPrice || basePrice)));
    if (compare <= price) compare = 0;
    const colourSrc = colourIndex >= 0 ? v.values[colourIndex] : null;
    if (colourSrc) product.colorSources[translated[colourIndex]] = colourSrc;
    const image = (colorSets && colourSrc && colorSets[colourSrc] && colorSets[colourSrc][0]) || product.image;
    variants.set(key, { options, price, compare_at_price: compare, available: true, image });
  }

  product.options = kept.length ? kept.map(o => ({ name: o.name, values: o.values })) : [{ name: 'Title', values: ['Default Title'] }];
  // Own id range per product: real variant counts differ from the placeholder ones.
  product.variants = [...variants.values()].map((v, i) => ({ id: product.id * 10000 + i + 1, ...v, options: kept.length ? v.options : ['Default Title'] }));
  if (!product.variants.length) throw new Error(`No variants left for ${row.Producto}`);
  product.price = product.variants[0].price;
  product.compare_at_price = product.variants[0].compare_at_price;
  return product;
}

module.exports = { applyItalianCopy };
