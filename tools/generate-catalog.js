const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const csv = fs.readFileSync(path.join(root, 'winners_combinado_100.csv'), 'utf8').replace(/^\uFEFF/, '').trim();
const lines = csv.split(/\r?\n/);
const headers = lines.shift().split(';');
const rows = lines.filter(Boolean).map(line => {
  const values = line.split(';');
  return Object.fromEntries(headers.map((h, i) => [h, (values[i] || '').trim()]));
});

const categoryMap = {
  'Bolsos': { group: 'Accessori', collection: 'borse', title: 'Borse', description: 'Modelli pratici e raffinati per completare ogni look, ogni giorno.' },
  'Calzado': { group: 'Calzature', collection: 'scarpe', title: 'Scarpe', description: 'Comfort e stile per accompagnarti con sicurezza in ogni occasione.' },
  'Ropa': { group: 'Abbigliamento', collection: 'abbigliamento', title: 'Abbigliamento', description: 'Capi facili da indossare, abbinare e vivere per tutta la stagione.' },
};

const categoryAssets = {
  Bolsos: 'assets/products/generated-bag-brown.png',
  Calzado: 'assets/products/generated-shoe-beige.png',
  Ropa: 'assets/products/generated-clothing-camel.png',
};

const productImageSets = {
  'premium-leather-shoulder-bag': [
    'assets/products/premium-leather-shoulder-bag/01-in-use.png',
    'assets/products/premium-leather-shoulder-bag/02-product.png',
    'assets/products/premium-leather-shoulder-bag/03-detail.png',
    'assets/products/premium-leather-shoulder-bag/04-lifestyle.png',
  ],
  'the-brooklyn-bag': [
    'assets/products/the-brooklyn-bag/01-hero.png',
    'assets/products/the-brooklyn-bag/02-milan.png',
    'assets/products/the-brooklyn-bag/03-detail.png',
    'assets/products/the-brooklyn-bag/04-cafe.png',
  ],
  '2packbag-travel-kit-mochila-compresion': [
    'assets/products/2packbag-travel-kit/01-hero.png',
    'assets/products/2packbag-travel-kit/02-packing.png',
    'assets/products/2packbag-travel-kit/03-airport.png',
    'assets/products/2packbag-travel-kit/04-detail.png',
    'assets/products/2packbag-travel-kit/05-station.png',
    'assets/products/2packbag-travel-kit/06-lifestyle.png',
  ],
};

const sourceOverrides = {
  'the-foldie-sling-bag': {
    title: 'The Foldie® Sling bag',
    vendor: 'The Foldie',
    description: 'Il tuo alleato elegante per muoverti a mani libere. The Foldie® Sling bag protegge i tuoi indispensabili con chiusure sicure, tracolla anti-taglio, tasca RFID e scomparto posteriore nascosto, restando leggerissima: pesa meno di 200 g. Compatta, regolabile e pronta per ogni passeggiata, viaggio o giornata in città.',
  },
  '2packbag-travel-kit-mochila-compresion': {
    title: '2PackBag™ Travel Kit',
    vendor: '2PackBag',
    description: 'Viaggia più leggero e porta con te tutto quello che ami. 2PackBag™ comprime i tuoi vestiti in pochi secondi grazie alla chiusura ermetica e alla pompa elettrica USB-C, così hai più spazio nel bagaglio a mano e meno stress prima di partire. Misura 45 × 30 × 20 cm ed è pensata per accompagnarti viaggio dopo viaggio.',
    offers: {
      'Buy 1 GET 1 FREE': { price: 4999, compare_at_price: 19998 },
      'Buy 2 GET 2 FREE + Free Shipping': { price: 9998, compare_at_price: 39996 },
    },
  },
};

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
const money = s => Math.round(parseFloat(String(s).replace(',', '.')) * 100) || 0;

function description(row, meta) {
  const name = row.Producto;
  if (row.Categoria === 'Bolsos') return `La borsa che segue il tuo ritmo senza rinunciare allo stile. ${name} unisce una silhouette versatile e tutto lo spazio che serve per i tuoi indispensabili, dal lavoro al weekend.`;
  if (row.Categoria === 'Calzado') return `Fai ogni passo con più comfort e stile. ${name} è pensato per accompagnarti ogni giorno, con un design versatile facile da abbinare ai tuoi look preferiti.`;
  return `Il tuo nuovo capo essenziale, semplice da indossare e facile da valorizzare. ${name} aggiunge un tocco speciale al look e ti fa sentire sempre a tuo agio, in ogni occasione.`;
}

function variants(row) {
  const name = row.Producto.toLowerCase();
  if (row.Categoria === 'Calzado') return { colors: ['Nero', 'Beige', 'Marrone', 'Bianco'], sizes: ['36', '37', '38', '39', '40', '41'] };
  if (row.Categoria === 'Bolsos') return { colors: ['Nero', 'Marrone', 'Beige', 'Crema'], sizes: ['Taglia unica'] };
  if (/set|pack|kit|one piece|swimsuit|bikini/i.test(name)) return { colors: ['Nero', 'Beige', 'Blu', 'Verde'], sizes: ['S', 'M', 'L', 'XL'] };
  return { colors: ['Nero', 'Beige', 'Bianco', 'Verde'], sizes: ['S', 'M', 'L', 'XL'] };
}

function optionsFor(row, fallback) {
  if (/foldie sling/i.test(row.Producto)) return [{ name: 'Colore', values: ['Black'] }];
  if (/2packbag travel kit/i.test(row.Producto)) return [{ name: 'Offerta', values: ['Buy 1 GET 1 FREE', 'Buy 2 GET 2 FREE + Free Shipping'] }];
  return [{ name: 'Colore', values: fallback.colors }, { name: 'Talla', values: fallback.sizes }];
}

const collections = Object.values(categoryMap).map(meta => ({ handle: meta.collection, group: meta.group, title: meta.title, description: meta.description }));
let vid = 1000;
const products = rows.map((row, i) => {
  const meta = categoryMap[row.Categoria] || categoryMap.Ropa;
  const v = variants(row);
  const optionConfig = optionsFor(row, v);
  const override = sourceOverrides[slug(row.Producto)] || {};
  const product = {
    id: i + 1,
    handle: slug(row.Producto),
    title: override.title || row.Producto,
    collection: meta.collection,
    category: row.Categoria,
    vendor: override.vendor || row.Tienda,
    sourceUrl: row.Link,
    image: (productImageSets[slug(row.Producto)] || [categoryAssets[row.Categoria] || categoryAssets.Ropa])[0],
    images: productImageSets[slug(row.Producto)] || [categoryAssets[row.Categoria] || categoryAssets.Ropa],
    imageAlt: `${row.Producto} · immagine catalogo`,
    description: override.description || description(row, meta),
    price: money(row.Precio),
    compare_at_price: money(row['Precio tachado']),
    tags: [meta.title, 'Novità', 'Selezione Juanjo'].join(', '),
    options: optionConfig,
    variants: [],
    rating: [4.6, 4.7, 4.8, 4.9][i % 4],
    reviews: 40 + ((i * 37) % 180),
    createdAt: i,
  };
  const primaryValues = product.options[0].values;
  const secondaryValues = product.options[1] ? product.options[1].values : [''];
  primaryValues.forEach(first => secondaryValues.forEach(second => {
    const variantOptions = product.options[1] ? [first, second] : [first];
    const offer = override.offers?.[first];
    product.variants.push({ id: ++vid, options: variantOptions, price: offer?.price || product.price, compare_at_price: offer?.compare_at_price || product.compare_at_price, available: true, image: product.image });
  }));
  product.available = true;
  return product;
});

const js = `// Generated from winners_combinado_100.csv. Source URLs are kept for review only.\nwindow.CATALOG = ${JSON.stringify({ collections, products }, null, 2)};\n`;
fs.writeFileSync(path.join(root, 'preview', 'catalog.js'), js);

const out = ['Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Variant SKU,Variant Price,Variant Compare At Price,Variant Inventory Qty,Variant Inventory Policy,Image Src,Image Position,SEO Title,SEO Description'];
for (const p of products) {
  for (const v of p.variants) {
    const values = [p.handle, p.title, `<p>${p.description}</p>`, p.vendor, p.category, p.category, p.tags, 'TRUE', p.options[0].name, v.options[0], p.options[1]?.name || '', p.options[1] ? (v.options[1] || '') : '', `${p.handle}-${slug(v.options.join('-'))}`, (v.price / 100).toFixed(2), p.compare_at_price ? (p.compare_at_price / 100).toFixed(2) : '', '0', 'continue', p.image, '1', p.title, p.description];
    out.push(values.map(x => `"${String(x).replace(/"/g, '""')}"`).join(','));
  }
}
fs.writeFileSync(path.join(root, 'shopify_import_100_productos_it.csv'), out.join('\n') + '\n');
const plannedImageCount = products.reduce((n, p) => {
  const colors = p.options[0].name === 'Colore' ? p.options[0].values : ['unico'];
  return n + (colors.length === 1 ? 6 : colors.length * 4);
}, 0);
fs.writeFileSync(path.join(root, 'catalog_summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), products: products.length, variants: products.reduce((n, p) => n + p.variants.length, 0), collections, imagePlan: { planned: plannedImageCount, uniqueSetsReady: products.filter(p => p.images.length > 1).length, generatedImagesReady: products.reduce((n, p) => n + p.images.length, 0) } }, null, 2));
const imageRoles = {
  'Bolsos': ['foto de producto sobre fondo limpio', 'bolso llevado al hombro en un look urbano', 'detalle cercano de textura y cierres', 'bolso en uso durante un plan cotidiano'],
  'Calzado': ['foto de producto sobre fondo limpio', 'calzado puesto en movimiento', 'detalle cercano de material y suela', 'look completo en un entorno urbano'],
  'Ropa': ['prenda en modelo sobre fondo limpio', 'look completo en un entorno italiano', 'detalle cercano de tejido y acabado', 'prenda en movimiento con luz natural'],
};
const modelSet = [
  'modella italiana mediterranea, capelli castani mossi',
  'modella italiana dai capelli scuri raccolti, look minimal',
  'modella italiana bionda, stile milanese contemporaneo',
  'modella italiana con capelli ramati, styling editoriale',
  'modella italiana con caschetto nero, estetica sofisticata',
  'modella italiana dai capelli ricci, look naturale',
  'modella italiana mora, silhouette elegante e rilassata',
  'modella italiana con capelli castano chiaro, stile quotidiano premium',
  'modella italiana dai capelli lunghi, mood mediterraneo',
  'modella italiana con capelli corti, look urbano raffinato',
];
const imagePlan = products.map(p => ({
  handle: p.handle,
  title: p.title,
  category: p.category,
  sourceUrl: p.sourceUrl,
  colors: p.options[0].name === 'Colore' ? p.options[0].values : ['unico'],
  imagesPerColor: (p.options[0].name === 'Colore' ? p.options[0].values : ['unico']).length === 1 ? 6 : 4,
  roles: imageRoles[p.category] || imageRoles.Ropa,
    asset: p.images[0],
    assets: p.images,
  models: modelSet,
  imageSlots: (p.options[0].name === 'Colore' ? p.options[0].values : ['unico']).flatMap((color, colorIndex) => {
    const imageColors = p.options[0].name === 'Colore' ? p.options[0].values : ['unico'];
    const count = imageColors.length === 1 ? 6 : 4;
    return Array.from({ length: count }, (_, viewIndex) => ({
      filename: `${p.handle}/${slug(color)}/${String(viewIndex + 1).padStart(2, '0')}-${slug((imageRoles[p.category] || imageRoles.Ropa)[viewIndex % (imageRoles[p.category] || imageRoles.Ropa).length])}.png`,
      color,
      role: (imageRoles[p.category] || imageRoles.Ropa)[viewIndex % (imageRoles[p.category] || imageRoles.Ropa).length],
      model: modelSet[(p.id + colorIndex + viewIndex) % modelSet.length],
      status: 'pending-generation',
    }));
  }),
  locale: 'it-IT',
  status: 'reference-asset-ready',
}));
fs.writeFileSync(path.join(root, 'image_generation_manifest_it.json'), JSON.stringify({ locale: 'it-IT', products: imagePlan.length, totalPlannedImages: imagePlan.reduce((n, p) => n + p.colors.length * p.imagesPerColor, 0), imagePlan }, null, 2));
console.log(`Generated ${products.length} products and ${products.reduce((n, p) => n + p.variants.length, 0)} variants.`);
