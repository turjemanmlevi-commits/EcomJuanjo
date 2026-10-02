const fs = require('fs');
const path = require('path');
const { applyItalianCopy } = require('./catalog-it');

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
  'the-foldie-sling-bag': [
    'assets/products/the-foldie-sling-bag/01-hero.png',
    'assets/products/the-foldie-sling-bag/02-milan.png',
    'assets/products/the-foldie-sling-bag/03-detail.png',
    'assets/products/the-foldie-sling-bag/04-cafe.png',
    'assets/products/the-foldie-sling-bag/05-station.png',
    'assets/products/the-foldie-sling-bag/06-lifestyle.png',
  ],
  'ciara-vintage': [
    'assets/products/ciara-vintage/01-hero.png',
    'assets/products/ciara-vintage/02-milan.png',
    'assets/products/ciara-vintage/03-detail.png',
    'assets/products/ciara-vintage/04-cafe.png',
    'assets/products/ciara-vintage/05-street.png',
    'assets/products/ciara-vintage/06-capacity.png',
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

const productColorImageSets = {
  'the-maya-tote': Object.fromEntries(['Black', 'Chocolate', 'Brown', 'Burgundy', 'Stone', 'Pink', 'Sky'].map(color => [color, [
    `assets/products/the-maya-tote/${color}/01-hero.png`,
    `assets/products/the-maya-tote/${color}/02-beige.png`,
    `assets/products/the-maya-tote/${color}/03-milan.png`,
    `assets/products/the-maya-tote/${color}/04-cafe.png`,
  ]])),
  'luxury-leather-hobo-anti-theft-handbag-2-0': {
    Black: [
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Black/01-hero.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Black/02-beige.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Black/03-milan.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Black/04-cafe.png',
    ],
    Brown: [
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Brown/01-hero.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Brown/02-beige.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Brown/03-milan.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Brown/04-cafe.png',
    ],
    Beige: [
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Beige/01-hero.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Beige/02-beige.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Beige/03-milan.png',
      'assets/products/luxury-leather-hobo-anti-theft-handbag-2-0/Beige/04-cafe.png',
    ],
  },
  'luxury-leather-hobo-anti-theft-handbag-pouch': {
    Brown: [
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Brown/01-hero.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Brown/02-milan.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Brown/03-detail.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Brown/04-cafe.png',
    ],
    Black: [
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Black/01-hero.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Black/02-milan.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Black/03-detail.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Black/04-cafe.png',
    ],
    Blue: [
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Blue/01-hero.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Blue/02-milan.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Blue/03-detail.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Blue/04-cafe.png',
    ],
    Grey: [
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Grey/01-hero.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Grey/02-milan.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Grey/03-detail.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Grey/04-cafe.png',
    ],
    Burgundy: [
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Burgundy/01-hero.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Burgundy/02-milan.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Burgundy/03-detail.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Burgundy/04-cafe.png',
    ],
    Red: [
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Red/01-hero.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Red/02-milan.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Red/03-detail.png',
      'assets/products/luxury-hobo-anti-theft-handbag-pouch/Red/04-cafe.png',
    ],
  },
};

// Our CSV has no price for these: competitor price in EUR (Storefront API, market IT) or
// converted from USD/GBP. Review them before importing.
const priceFallbacks = {
  'https://maisonginza.com/products/aryna-bag': 5495,
  'https://tryfemlush.com/products/anti-roll-shaper-shorts': 3695,
  'https://madepants.com/collections/womens-jumpsuits': 5499,
  'https://madepants.com/collections/womens-overalls': 3999,
  'https://belksale.com/products/womens-thick-soled-cushioned-casual-sandals': 2099,
  'https://belksale.com/products/orthopaedic-slip-on-shoes-for-women-uk': 2099,
  'https://belkmalls.com/products/womens-winter-thick-sole-warm-snow-boots-a': 2699,
  'https://belksale.com/products/womens-comfortable-open-toe-orthopaedic-sandals': 2099,
};

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = s => Math.round(parseFloat(String(s).replace(',', '.')) * 100) || 0;

const collections = Object.values(categoryMap).map(meta => ({ handle: meta.collection, group: meta.group, title: meta.title, description: meta.description }));
const products = rows.map((row, i) => {
  const meta = categoryMap[row.Categoria] || categoryMap.Ropa;
  const colorSets = productColorImageSets[slug(row.Producto)] || null;
  const ownImages = (colorSets ? Object.values(colorSets).flat() : productImageSets[slug(row.Producto)] || []).filter(file => fs.existsSync(path.join(root, 'theme', file)));
  const product = applyItalianCopy({
    id: i + 1,
    handle: slug(row.Producto),
    collection: meta.collection,
    category: row.Categoria,
    sourceUrl: row.Link,
    price: money(row.Precio) || priceFallbacks[row.Link] || 0,
    compare_at_price: money(row['Precio tachado']),
    createdAt: i,
  }, row, colorSets);
  // Generated category pictures stand in for missing photos in the preview only; they are not imported.
  product.ownImages = ownImages;
  product.images = ownImages.length ? ownImages : [categoryAssets[row.Categoria] || categoryAssets.Ropa];
  product.image = product.images[0];
  product.variants.forEach(v => { v.image = v.image || product.image; });
  product.tags = [meta.title, product.productType, 'Novità'].join(', ');
  product.priceToReview = !money(row.Precio);
  return product;
});

const js = `// Generated from winners_combinado_100.csv. Source URLs are kept for review only.\nwindow.CATALOG = ${JSON.stringify({ collections, products }, null, 2)};\n`;
fs.writeFileSync(path.join(root, 'preview', 'catalog.js'), js);

// Shopify product CSV: product fields on the first row of each handle, one row per variant,
// extra rows for images beyond the variant count. Sold-out source variants are imported as sold out.
const columns = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Image Alt Text', 'Variant Image', 'SEO Title', 'SEO Description', 'Status'];
const out = [columns.join(',')];
const skus = new Set();
for (const p of products) {
  const images = p.ownImages;
  const lines = Math.max(p.variants.length, images.length);
  for (let n = 0; n < lines; n++) {
    const v = p.variants[n];
    const row = { Handle: p.handle };
    if (n === 0) Object.assign(row, { Title: p.title, 'Body (HTML)': p.bodyHtml, Vendor: p.vendor, 'Product Category': p.taxonomy, Type: p.productType, Tags: p.tags, Published: p.verified ? 'TRUE' : 'FALSE', 'SEO Title': p.seoTitle, 'SEO Description': p.seoDescription, Status: p.verified ? 'active' : 'draft' });
    if (v) {
      let sku = `${p.handle}-${slug(v.options.join('-'))}`.slice(0, 120);
      for (let k = 2; skus.has(sku); k++) sku = `${p.handle}-${slug(v.options.join('-'))}`.slice(0, 115) + `-${k}`;
      skus.add(sku);
      p.options.forEach((o, k) => { if (n === 0) row[`Option${k + 1} Name`] = o.name; row[`Option${k + 1} Value`] = v.options[k]; });
      Object.assign(row, { 'Variant SKU': sku, 'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': '0', 'Variant Inventory Policy': v.available ? 'continue' : 'deny', 'Variant Fulfillment Service': 'manual', 'Variant Price': (v.price / 100).toFixed(2), 'Variant Compare At Price': v.compare_at_price ? (v.compare_at_price / 100).toFixed(2) : '', 'Variant Requires Shipping': 'TRUE', 'Variant Taxable': 'TRUE', 'Variant Image': images.includes(v.image) ? v.image : '' });
    }
    if (images[n]) Object.assign(row, { 'Image Src': images[n], 'Image Position': String(n + 1), 'Image Alt Text': `${p.title} · ${n + 1}` });
    out.push(columns.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(','));
  }
}
fs.writeFileSync(path.join(root, 'shopify_import_100_productos_it.csv'), out.join('\n') + '\n');
const plannedImageCount = products.reduce((n, p) => {
  const colors = p.options[0].name === 'Colore' ? p.options[0].values : ['unico'];
  return n + (colors.length === 1 ? 6 : colors.length * 4);
}, 0);
fs.writeFileSync(path.join(root, 'catalog_summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), products: products.length, variants: products.reduce((n, p) => n + p.variants.length, 0), collections, imagePlan: { planned: plannedImageCount, uniqueSetsReady: products.filter(p => p.ownImages.length > 1).length, generatedImagesReady: products.reduce((n, p) => n + p.ownImages.length, 0) } }, null, 2));
const imageRoles = {
  'Bolsos': ['producto solo sobre fondo beige editorial, vista frontal', 'producto solo sobre fondo beige editorial, vista tres cuartos', 'bolso llevado por una modelo italiana en un look elegante de ciudad', 'bolso en uso por una modelo italiana durante un plan cotidiano chic'],
  'Calzado': ['producto solo sobre fondo beige editorial, vista lateral', 'producto solo sobre fondo beige editorial, vista tres cuartos', 'calzado llevado por una modelo italiana en movimiento', 'look femenino completo con modelo italiana en un entorno urbano'],
  'Ropa': ['prenda sola sobre fondo beige editorial, vista frontal', 'prenda sola sobre fondo beige editorial, vista posterior o tres cuartos', 'look completo con modelo italiana en un entorno italiano', 'prenda en movimiento con una modelo italiana bajo luz natural'],
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
