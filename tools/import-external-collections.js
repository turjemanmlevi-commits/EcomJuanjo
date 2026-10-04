const fs = require('fs');
const path = require('path');
const vm = require('vm');
const https = require('https');

const root = path.resolve(__dirname, '..');

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'EcommerceJuanjo catalog importer' } }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) return reject(new Error(`${url}: HTTP ${response.statusCode}`));
        try { resolve(JSON.parse(body)); } catch (error) { reject(new Error(`${url}: ${error.message}`)); }
      });
    }).on('error', reject);
  });
}

function readCatalog() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'preview', 'catalog.js'), 'utf8'), context);
  return context.window.CATALOG;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function cents(value) {
  const number = Number.parseFloat(String(value || '').replace(',', '.'));
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

function slug(value) {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sourceProduct(product, config, id, index) {
  const options = (product.options || [])
    .filter(option => option.values && option.values.length)
    .map(option => ({
      name: /^color$/i.test(option.name) ? 'Colore' : (/^size$/i.test(option.name) ? 'Taglia' : option.name),
      values: option.values,
    }));
  const primaryImage = product.images?.[0]?.src || config.fallbackImage;
  const images = (product.images || []).map(image => image.src).filter(Boolean);
  const variants = (product.variants || []).map((variant, variantIndex) => ({
    id: id * 10000 + variantIndex + 1,
    options: [variant.option1, variant.option2, variant.option3].filter(Boolean),
    price: cents(variant.price),
    compare_at_price: cents(variant.compare_at_price),
    available: variant.available !== false,
    image: variant.featured_image?.src || primaryImage,
  }));
  const firstVariant = variants[0] || { price: 0, compare_at_price: 0 };
  const title = product.title || 'Producto';
  const description = stripHtml(product.body_html) || `${title}. Descubre la colección ${config.title.toLowerCase()}.`;
  return {
    id,
    handle: `${config.prefix}-${slug(product.handle || title)}`,
    title,
    collection: config.collection,
    category: config.category,
    vendor: product.vendor || config.vendor,
    sourceUrl: `${config.domain}/products/${product.handle}`,
    image: primaryImage,
    images: images.length ? images : [primaryImage],
    imageAlt: title,
    description,
    bodyHtml: `<p>${description}</p>`,
    price: firstVariant.price,
    compare_at_price: firstVariant.compare_at_price,
    tags: `${config.title}, Novità, Selezione Juanjo`,
    options: options.length ? options : [{ name: 'Titolo', values: ['Default Title'] }],
    variants: variants.length ? variants : [{ id: id * 10000 + 1, options: ['Default Title'], price: 0, compare_at_price: 0, available: true, image: primaryImage }],
    rating: [4.6, 4.7, 4.8, 4.9][index % 4],
    reviews: 40 + ((index * 37) % 180),
    createdAt: id,
    available: variants.some(variant => variant.available),
  };
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

async function main() {
  const sources = [
    {
      url: 'https://almondmuse.com/collections/shoes-1/products.json?limit=250',
      collection: 'scarpe', group: 'Calzature', title: 'Scarpe', category: 'Calzado', prefix: 'almond', domain: 'https://almondmuse.com', vendor: 'Almond Muse', fallbackImage: 'assets/products/generated-shoe-beige.png',
      description: 'Scarpe eleganti e versatili per completare ogni look.',
    },
    {
      url: 'https://hazelthelabel.com/collections/coats-jackets/products.json?limit=250',
      collection: 'giacche', group: 'Abbigliamento', title: 'Giacche e cappotti', category: 'Ropa', prefix: 'hazel', domain: 'https://hazelthelabel.com', vendor: 'Hazel The Label', fallbackImage: 'assets/products/generated-clothing-camel.png',
      description: 'Giacche e cappotti femminili per la stagione.',
    },
    {
      url: 'https://almondmuse.com/collections/trending-dresses/products.json?limit=250',
      collection: 'vestiti', group: 'Abbigliamento', title: 'Vestiti', category: 'Ropa', prefix: 'almond', domain: 'https://almondmuse.com', vendor: 'Almond Muse', fallbackImage: 'assets/products/generated-clothing-camel.png',
      description: 'Vestiti femminili per ogni occasione.',
    },
  ];
  const catalog = readCatalog();
  const existing = catalog.products.filter(product => product.collection !== 'scarpe');
  const products = [...existing];
  let id = Math.max(0, ...products.map(product => product.id)) + 1;
  let index = 0;
  for (const config of sources) {
    const payload = await getJson(config.url);
    for (const product of payload.products || []) products.push(sourceProduct(product, config, id++, index++));
  }
  const collectionDefs = [
    { handle: 'borse', group: 'Accessori', title: 'Borse', description: 'Modelli pratici e raffinati per completare ogni look, ogni giorno.' },
    { handle: 'abbigliamento', group: 'Abbigliamento', title: 'Abbigliamento', description: 'Capi facili da indossare, abbinare e vivere per tutta la stagione.' },
    { handle: 'scarpe', group: 'Calzature', title: 'Scarpe', description: 'Scarpe eleganti e versatili per completare ogni look.' },
    { handle: 'giacche', group: 'Abbigliamento', title: 'Giacche e cappotti', description: 'Giacche e cappotti femminili per la stagione.' },
    { handle: 'vestiti', group: 'Abbigliamento', title: 'Vestiti', description: 'Vestiti femminili per ogni occasione.' },
  ];
  const output = `// Generated from the public Almond Muse and Hazel The Label collection feeds.\nwindow.CATALOG = ${JSON.stringify({ collections: collectionDefs, products }, null, 2)};\n`;
  fs.writeFileSync(path.join(root, 'preview', 'catalog.js'), output);

  const header = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Price', 'Variant Compare At Price', 'Variant Inventory Qty', 'Variant Inventory Policy', 'Image Src', 'Image Position', 'SEO Title', 'SEO Description'];
  const rows = [header.map(csvCell).join(',')];
  for (const product of products) {
    for (const variant of product.variants) {
      const values = [product.handle, product.title, product.bodyHtml || `<p>${product.description}</p>`, product.vendor, product.category, product.category, product.tags, 'TRUE', product.options[0].name, variant.options[0] || '', product.options[1]?.name || '', variant.options[1] || '', product.options[2]?.name || '', variant.options[2] || '', `${product.handle}-${slug(variant.options.join('-'))}`, (variant.price / 100).toFixed(2), variant.compare_at_price ? (variant.compare_at_price / 100).toFixed(2) : '', '0', 'continue', product.image, '1', product.title, product.description];
      rows.push(values.map(csvCell).join(','));
    }
  }
  fs.writeFileSync(path.join(root, 'shopify_import_external_collections.csv'), `${rows.join('\n')}\n`);
  fs.writeFileSync(path.join(root, 'catalog_summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), products: products.length, variants: products.reduce((sum, product) => sum + product.variants.length, 0), collections: collectionDefs, sources: sources.map(source => ({ url: source.url, collection: source.collection })) }, null, 2));
  console.log(JSON.stringify({ existingKept: existing.length, imported: products.length - existing.length, products: products.length, variants: products.reduce((sum, product) => sum + product.variants.length, 0) }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
