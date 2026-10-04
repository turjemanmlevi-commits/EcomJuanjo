const fs = require('fs');
const path = require('path');
const vm = require('vm');
const https = require('https');

const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'preview', 'catalog.js');
const imageRoot = path.join(root, 'preview', 'img', 'products');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(catalogPath, 'utf8'), context);
const catalog = context.window.CATALOG;

function download(url, target) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 EcommerceJuanjo image importer',
        Referer: new URL(url).origin,
      },
    }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        return download(new URL(response.headers.location, url).href, target).then(resolve, reject);
      }
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`${response.statusCode} ${url}`));
      }
      const stream = fs.createWriteStream(target);
      response.pipe(stream);
      stream.on('finish', () => stream.close(resolve));
      stream.on('error', error => { stream.destroy(); reject(error); });
    });
    request.setTimeout(30000, () => request.destroy(new Error(`Timeout ${url}`)));
    request.on('error', reject);
  });
}

function optimizedUrl(url) {
  return `${url}${url.includes('?') ? '&' : '?'}width=640`;
}

async function main() {
  // Keep the product card and the first three gallery views local. This covers the
  // storefront experience without pulling every redundant colour image into Vercel.
  const urls = [...new Set(catalog.products.flatMap(product => (product.images || []).slice(0, 4)).filter(url => /^https?:\/\//i.test(url)))];
  const urlToLocal = new Map();
  const failures = [];
  let cursor = 0;
  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      const index = cursor;
      const hash = Buffer.from(url).toString('base64url').slice(-24);
      const extension = (path.extname(new URL(url).pathname).toLowerCase() || '.jpg').replace(/[^.a-z0-9]/g, '') || '.jpg';
      const relative = `img/products/_external/${String(index).padStart(4, '0')}-${hash}${extension}`;
      const target = path.join(root, 'preview', relative.replaceAll('/', path.sep));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      try {
        await download(optimizedUrl(url), target);
        urlToLocal.set(url, relative);
      } catch (error) {
        failures.push({ url, error: error.message });
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));

  for (const product of catalog.products) {
    const primary = urlToLocal.get(product.image) || product.image;
    product.image = primary;
    product.images = (product.images || []).map(image => urlToLocal.get(image) || primary);
    product.variants = (product.variants || []).map(variant => ({ ...variant, image: urlToLocal.get(variant.image) || primary }));
  }
  fs.writeFileSync(catalogPath, `// Generated catalog with local product images.\nwindow.CATALOG = ${JSON.stringify(catalog, null, 2)};\n`);
  fs.writeFileSync(path.join(root, 'data', 'external-image-failures.json'), JSON.stringify(failures, null, 2));
  console.log(JSON.stringify({ requested: urls.length, downloaded: urlToLocal.size, failures: failures.length, products: catalog.products.length }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
