const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const csv = fs.readFileSync(path.join(root, 'winners_combinado_100.csv'), 'utf8').replace(/^\uFEFF/, '').trim();
const lines = csv.split(/\r?\n/);
const headers = lines.shift().split(';');
const parsedRows = lines.filter(Boolean).map(line => {
  const values = line.split(';');
  return Object.fromEntries(headers.map((h, i) => [h, (values[i] || '').trim()]));
});
const rows = [...new Map(parsedRows.map(row => [`${row.Producto.toLowerCase()}|${row.Link.toLowerCase()}`, row])).values()];

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
    'assets/products/premium-leather-shoulder-bag/02-product.png',
    'assets/products/premium-leather-shoulder-bag/01-in-use.png',
    'assets/products/premium-leather-shoulder-bag/03-detail.png',
    'assets/products/premium-leather-shoulder-bag/04-lifestyle.png',
  ],
  'the-brooklyn-bag': [
    'assets/products/the-brooklyn-bag/01-hero.png',
    'assets/products/the-brooklyn-bag/02-milan.png',
    'assets/products/the-brooklyn-bag/03-detail.png',
    'assets/products/the-brooklyn-bag/04-cafe.png',
  ],
  'ciara-vintage': [
    'assets/products/ciara-vintage/01-hero.png',
    'assets/products/ciara-vintage/02-milan.png',
    'assets/products/ciara-vintage/03-detail.png',
    'assets/products/ciara-vintage/04-cafe.png',
    'assets/products/ciara-vintage/05-street.png',
    'assets/products/ciara-vintage/06-capacity.png',
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

const sourceOverrides = {
  'the-maya-tote': {
    title: 'The Maya',
    vendor: 'OOOMAY',
    description: 'La bolsa que hace que llevarlo todo siga viéndose elegante. The Maya está confeccionada en piel vegana premium de tacto suave, incorpora bolsillos bien pensados y espacio para un portátil de 15 pulgadas, libros y tus esenciales diarios. Elige cierre magnético o cremallera y llévala del trabajo al fin de semana.',
    price: 4400,
    compare_at_price: 8900,
  },
  'luxury-leather-hobo-anti-theft-handbag-2-0': {
    title: 'Luxury Leather Hobo Anti-Theft Handbag 2.0 + FREE Pouch Wallet (6-Layer Security Edition)',
    vendor: 'Libra Cases',
    description: 'Eleganza quotidiana, protezione intelligente. La Luxury Hobo Anti-Theft Handbag 2.0 combina fodera RFID, cerniere bloccabili, tracolla anti-taglio, tasche nascoste e uno scomparto imbottito per laptop fino a 15 pollici. Una compagna femminile e raffinata per città, lavoro e viaggi.',
    price: 5495,
    compare_at_price: 10990,
  },
  'luxury-leather-hobo-anti-theft-handbag-pouch': {
    title: 'Luxury Hobo Anti-Theft Handbag + FREE Pouch Wallet',
    vendor: 'Libra Cases',
    description: 'Una hobo ligera, espaciosa y pensata per sentirti sicura ogni giorno. La Luxury Hobo Anti-Theft Handbag organizza tutto ciò che ti serve con più tasche e un design elegante, mentre il pouch wallet incluso completa il set. Scegli il tuo colore e porta con te stile e praticità.',
    price: 5250,
    compare_at_price: 10500,
  },
  'ciara-vintage': {
    title: 'Ciara Vintage',
    vendor: 'VOVIA',
    description: 'Una borsa con anima vintage e spazio per la vita di ogni giorno. Ciara Vintage è realizzata in pelle vegana premium, può essere portata a mano o a spalla e accoglie anche un laptop da 13 pollici, con tracolla regolabile e un raffinato charm removibile. Elegante, pratica e pensata per accompagnarti dal lavoro al weekend.',
    price: 8700,
    compare_at_price: 13000,
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
  if (/the maya \(tote\)/i.test(row.Producto)) return [{ name: 'Colore', values: ['Black', 'Chocolate', 'Brown', 'Burgundy', 'Stone', 'Pink', 'Sky'] }, { name: 'Stile', values: ['Magnet', 'Zipper'] }];
  if (/luxury leather hobo anti-theft handbag 2\.0/i.test(row.Producto)) return [{ name: 'Colore', values: ['Black', 'Brown', 'Beige'] }];
  if (/luxury leather hobo anti-theft handbag \+ pouch/i.test(row.Producto)) return [{ name: 'Colore', values: ['Brown', 'Black', 'Blue', 'Grey', 'Burgundy', 'Red'] }];
  if (/ciara vintage$/i.test(row.Producto)) return [{ name: 'Colore', values: ['Coffee'] }];
  return [{ name: 'Colore', values: fallback.colors }, { name: 'Talla', values: fallback.sizes }];
}

const collections = Object.values(categoryMap).map(meta => ({ handle: meta.collection, group: meta.group, title: meta.title, description: meta.description }));
let vid = 1000;
const products = rows.map((row, i) => {
  const meta = categoryMap[row.Categoria] || categoryMap.Ropa;
  const v = variants(row);
  const optionConfig = optionsFor(row, v);
  const override = sourceOverrides[slug(row.Producto)] || {};
  const colorSets = productColorImageSets[slug(row.Producto)] || null;
  const baseImages = productImageSets[slug(row.Producto)] || [categoryAssets[row.Categoria] || categoryAssets.Ropa];
  const product = {
    id: i + 1,
    handle: slug(row.Producto),
    title: override.title || row.Producto,
    collection: meta.collection,
    category: row.Categoria,
    vendor: override.vendor || row.Tienda,
    sourceUrl: row.Link,
    image: colorSets ? Object.values(colorSets)[0][0] : baseImages[0],
    images: colorSets ? Object.values(colorSets).flat() : baseImages,
    imageAlt: `${row.Producto} · immagine catalogo`,
    description: override.description || description(row, meta),
    price: override.price || money(row.Precio),
    compare_at_price: override.compare_at_price || money(row['Precio tachado']),
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
    const variantImage = colorSets?.[first]?.[0] || product.image;
    product.variants.push({ id: ++vid, options: variantOptions, price: offer?.price || product.price, compare_at_price: offer?.compare_at_price || product.compare_at_price, available: true, image: variantImage });
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
