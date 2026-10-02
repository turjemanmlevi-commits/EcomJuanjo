// Applies the Italian copy (data/copy/*.json) and the real source variants
// (data/source-variants.json) to a product built by generate-catalog.js.
// Both are keyed by the competitor link of winners_combinado_100.csv.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const copyDir = path.join(root, 'data', 'copy');
const copy = Object.assign({}, ...fs.readdirSync(copyDir).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(fs.readFileSync(path.join(copyDir, f), 'utf8'))));
const sources = JSON.parse(fs.readFileSync(path.join(root, 'data', 'source-variants.json'), 'utf8'));

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cents = s => Math.round(parseFloat(s) * 100) || 0;

// Scales a price by ratio while keeping the cents ending of the base price (44.90 -> 34.90, 53.00 -> 58.00).
function scale(base, ratio) {
  if (!base || ratio === 1) return base;
  const ending = base % 100;
  return Math.max(ending, Math.round((base * ratio - ending) / 100) * 100 + ending);
}

// One "Taglia" option across the catalogue: "Taglia (UK)" + "6" becomes "Taglia" + "UK 6".
function normaliseSize(option) {
  const m = option.name.match(/^Taglia\s*\(([^)]+)\)$/);
  if (!m) return option;
  const system = m[1].trim().split(/\s+/)[0].toUpperCase();
  const label = v => (/^\d/.test(v) ? `${system} ${v}` : v);
  return { ...option, name: 'Taglia', values: option.values.map(label), lookup: new Map([...option.lookup].map(([src, it]) => [src, label(it)])) };
}

function applyItalianCopy(product, row, colorSets) {
  const it = copy[row.Link];
  const src = sources[row.Link];
  if (!it || !src) throw new Error(`Missing Italian copy or source variants for ${row.Producto}`);

  product.imageKey = product.handle;
  product.handle = slug(it.title);
  product.title = it.title;
  product.vendor = 'ORIONA';
  product.productType = it.productType;
  product.taxonomy = it.category;
  product.imageAlt = it.title;
  product.description = it.seoDescription;
  product.seoTitle = it.seoTitle;
  product.seoDescription = it.seoDescription;
  product.bodyHtml = it.descriptionHtml;
  product.verified = src.verified !== 'none';

  // Translate every source option; options left with a single value are dropped, colour goes first.
  const sourceOptions = src.options.map((o, i) => ({ ...o, i })).filter(o => o.name !== 'Title');
  const mapped = sourceOptions.map(o => {
    const m = it.options.find(x => x.source_name === o.name);
    if (!m) throw new Error(`No translation for option "${o.name}" of ${row.Producto}`);
    const lookup = new Map(m.values.map(v => [v.src, v.it]));
    return normaliseSize({ i: o.i, name: m.name, lookup, values: [...new Set(o.values.map(v => lookup.get(v)))] });
  });
  const kept = mapped.filter(o => o.values.length > 1 || o.name === 'Colore');
  kept.sort((a, b) => (b.name === 'Colore') - (a.name === 'Colore'));
  const colour = mapped.find(o => o.name === 'Colore');
  product.colorSources = {};

  const sourceVariants = src.variants.length ? src.variants : [{ values: [], price: '', compare: '', available: true }];
  const firstPrice = cents(sourceVariants[0].price);
  const basePrice = product.price || firstPrice;
  const variants = new Map();
  for (const v of sourceVariants) {
    const options = kept.map(o => o.lookup.get(v.values[o.i]));
    if (options.some(x => !x)) throw new Error(`Untranslated value in ${row.Producto}: ${v.values.join(' / ')}`);
    const key = options.join(' / ');
    if (variants.has(key)) throw new Error(`Two source variants collapse into "${key}" in ${row.Producto}`);
    const ratio = firstPrice && cents(v.price) ? cents(v.price) / firstPrice : 1;
    const price = scale(basePrice, ratio);
    // Compare-at prices only come from our own CSV, never from the competitor page.
    let compare = product.compare_at_price ? scale(product.compare_at_price, ratio) : 0;
    if (compare <= price) compare = 0;
    const colourSrc = colour ? v.values[colour.i] : null;
    if (colourSrc) product.colorSources[colour.lookup.get(colourSrc)] = colourSrc;
    const image = (colorSets && colourSrc && colorSets[colourSrc] && colorSets[colourSrc][0]) || null;
    variants.set(key, { options, price, compare_at_price: compare, available: v.available !== false, image });
  }

  product.options = kept.length ? kept.map(o => ({ name: o.name, values: o.values })) : [{ name: 'Title', values: ['Default Title'] }];
  // Own id range per product: real variant counts differ from product to product.
  product.variants = [...variants.values()].map((v, i) => ({ id: product.id * 10000 + i + 1, ...v, options: kept.length ? v.options : ['Default Title'] }));
  product.price = product.variants[0].price;
  product.compare_at_price = product.variants[0].compare_at_price;
  product.available = product.variants.some(v => v.available);
  return product;
}

module.exports = { applyItalianCopy };
