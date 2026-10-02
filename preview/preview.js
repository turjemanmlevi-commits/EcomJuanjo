// Static preview only: mirrors the markup the Liquid sections output so the
// theme CSS/JS can be checked in a browser without a Shopify store.
(function () {
  const ph = (label) =>
    `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style="background:#e9e6e1"><text x="50" y="53" font-size="6" text-anchor="middle" fill="#a8a29a" font-family="sans-serif">${label}</text></svg>`;
  const icon = {
    search: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><circle cx="27" cy="27" r="16"/><path d="M38.5 38.5 54 54"/></svg>',
    user: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><circle cx="32" cy="22" r="10"/><path d="M14 52c0-9 8-14 18-14s18 5 18 14z"/></svg>',
    cart: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><path d="M14 22h36v30H14z"/><path d="M24 22v-4a8 8 0 0 1 16 0v4"/></svg>',
    menu: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><path d="M10 20h44M10 32h44M10 44h44"/></svg>',
    close: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><path d="m16 16 32 32M48 16 16 48"/></svg>',
    down: '<svg viewBox="0 0 28 16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m1.5 1.5 12.5 12.5 12.5-12.5"/></svg>',
    up: '<svg viewBox="0 0 28 16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1.5 14.5 14 2l12.5 12.5"/></svg>',
    left: '<svg viewBox="0 0 50 21" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M50 10.5H2M11 1.5l-9 9 9 9"/></svg>',
    right: '<svg viewBox="0 0 50 21" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M0 10.5h48M39 1.5l9 9-9 9"/></svg>',
    truck: '<svg viewBox="0 0 42 42" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M3 10h22v18H3zM25 16h8l6 6v6H25z"/><circle cx="11" cy="31" r="3.5" fill="#fff"/><circle cx="31" cy="31" r="3.5" fill="#fff"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5.5v13M15 5.5v13"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 5.5v13l10-6.5z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1z"/></svg>',
    gift: '<svg viewBox="0 0 42 42" fill="currentColor"><path d="M6 13h30v8H6zM8 23h11.5v13H8zM22.5 23H34v13H22.5z"/><path d="M21 12c-2-6-10-8-11-3s6 5 11 3zm0 0c2-6 10-8 11-3s-6 5-11 3z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>',
    refresh: '<svg viewBox="0 0 42 42" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M33 21a12 12 0 0 1-20 9M9 21a12 12 0 0 1 20-9"/><path d="M29 5v7h-7M13 37v-7h7"/></svg>',
    lock: '<svg viewBox="0 0 42 42" fill="currentColor"><path d="M9 18h24v19H9z"/><path d="M14 18v-5a7 7 0 0 1 14 0v5" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="21" cy="27" r="2.5" fill="#fff"/></svg>',
  };
  window.previewIcon = icon;
  window.previewPlaceholder = ph;

  const { collections, products } = window.CATALOG;
  const params = new URLSearchParams(location.search);
  const money = (cents) => (cents / 100).toFixed(2).replace('.', ',') + ' €';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const collectionUrl = (handle) => `collection.html?c=${handle}`;
  const productUrl = (p) => `product.html?p=${p.handle}`;

  // Menu items: [title, href] or [title, href, [children]] for a dropdown; children are collections.
  const kidsOf = (group) => collections.filter((c) => c.group === group).map((c) => [c.title, collectionUrl(c.handle)]);
  const sub = (kids) => (kids ? `<ul class="site-nav__dropdown">${kids.map(([k, h]) => `<li><a href="${h}">${k}</a></li>`).join('')}</ul>` : '');
  const menu = (items) => `<ul class="site-nav site-navigation">${items.map(([t, href, kids]) => `<li class="site-nav__item${kids ? ' site-nav__item--has-dropdown' : ''}"><a href="${href}" class="site-nav__link">${t}</a>${sub(kids)}</li>`).join('')}</ul>`;
  const drawerMenu = (items) => items.map(([t, href, kids]) => `<li><a href="${href}">${t}</a>${kids ? `<ul>${kids.map(([k, h]) => `<li><a href="${h}">${k}</a></li>`).join('')}</ul>` : ''}</li>`).join('');
  const left = [['Home', 'index.html'], ['Abbigliamento', 'collections.html', kidsOf('Abbigliamento')], ['Accessori', 'collections.html', kidsOf('Accessori')], ['Calzature', 'collections.html', kidsOf('Calzature')]];
  const right = [['Tutti i prodotti', collectionUrl('all')], ['Chi siamo', 'page.html?h=chi-siamo'], ['Traccia il tuo ordine', 'page.html?h=traccia-ordine']];

  // Local cart kept in this browser only: [{ id: variantId, qty }].
  const cartKey = 'preview-cart';
  const getItems = () => { try { return JSON.parse(localStorage.getItem(cartKey)) || []; } catch (e) { return []; } };
  const setItems = (items) => { try { localStorage.setItem(cartKey, JSON.stringify(items.filter((i) => i.qty > 0))); } catch (e) {} };
  const readCart = () => getItems().reduce((n, i) => n + i.qty, 0);
  const addToCart = (id, qty = 1) => {
    const items = getItems();
    const line = items.find((i) => i.id === id);
    if (line) line.qty += qty; else items.push({ id, qty });
    setItems(items);
    refreshBadges();
  };
  const variantIndex = new Map();
  products.forEach((p) => p.variants.forEach((v) => variantIndex.set(v.id, { product: p, variant: v })));
  const cartBadge = () => { const n = readCart(); return n ? `<span class="cart-count" data-cart-count>${n}</span>` : '<span class="cart-count" data-cart-count hidden></span>'; };
  const refreshBadges = () => { const n = readCart(); document.querySelectorAll('[data-cart-count]').forEach((b) => { b.hidden = !n; b.textContent = n; }); };

  // ---- Shopify stand-ins for theme.js: window.theme config and the AJAX endpoints it calls ----
  window.theme = {
    routes: { root: 'index.html', cart: 'cart.html', cartAdd: '/cart/add', cartChange: '/cart/change', search: 'search.html', predictiveSearch: '/search/suggest' },
    moneyFormat: '{{amount_with_comma_separator}} €',
    cartType: 'drawer',
    predictiveSearch: true,
    strings: {
      cartError: 'Non è stato possibile aggiornare il carrello. Riprova.',
      searchProducts: 'Prodotti',
      searchViewAll: 'Vedi tutti i risultati per “[terms]”',
      searchNoResults: 'Nessun risultato per “[terms]”.',
    },
  };

  const minusSvg = '<svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10"/></svg>';
  const plusSvg = '<svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M8 3v10"/></svg>';
  // Mirrors snippets/quantity-input.liquid.
  const qtyInput = (name, value, min, line, label) => `<div class="qty" data-qty><button type="button" class="qty__btn" data-qty-step="-1" aria-label="Diminuisci la quantità">${minusSvg}</button><input class="qty__input" type="number" inputmode="numeric" name="${name}" value="${value}" min="${min}"${line ? ` data-cart-line="${line}"` : ''} aria-label="${esc(label)}"><button type="button" class="qty__btn" data-qty-step="1" aria-label="Aumenta la quantità">${plusSvg}</button></div>`;

  const cartLines = () => getItems().map((i) => ({ ...i, ...variantIndex.get(i.id) })).filter((l) => l.product);
  // Mirrors snippets/cart-line.liquid.
  const cartLine = (l, index) => {
    const original = (l.variant.compare_at_price || 0) > l.variant.price ? l.variant.compare_at_price * l.qty : 0;
    return `<li class="cart-line"><a href="${productUrl(l.product)}" class="cart-line__image" tabindex="-1" aria-hidden="true">${ph(esc(l.product.title.split(' ').slice(0, 2).join(' ')))}</a><div class="cart-line__info"><a href="${productUrl(l.product)}" class="cart-line__title">${esc(l.product.title)}</a><div class="cart-line__meta">${l.variant.options.map(esc).join(' / ')}</div><div class="cart-line__actions">${qtyInput('updates[]', l.qty, 0, index, `Quantità: ${l.product.title}`)}<a href="cart.html" class="cart-line__remove" data-cart-remove="${index}" aria-label="Rimuovi ${esc(l.product.title)}">Rimuovi</a></div></div><div class="cart-line__price">${original ? `<s class="cart-line__price-original"><span class="visually-hidden">Prezzo di listino</span>${money(original)}</s>` : ''}<span${original ? ' class="cart-line__price-sale"' : ''}>${money(l.variant.price * l.qty)}</span></div></li>`;
  };
  const cartSummary = (lines, page) => {
    const total = lines.reduce((n, l) => n + l.variant.price * l.qty, 0);
    return `<p class="cart-error" data-cart-error role="alert" hidden></p><div class="cart-summary__row cart-summary__row--total"><span>Subtotale</span><span>${money(total)}</span></div><p class="cart-summary__note">Imposte e spese di spedizione vengono calcolate al momento del pagamento.</p>${page ? '<button type="submit" name="update" class="btn btn--outline btn--full no-js-only">Aggiorna</button>' : ''}<button type="button" class="btn btn--buy btn--full" data-preview-checkout>Procedi al pagamento</button>${page ? '' : '<a href="cart.html" class="cart-drawer__view">Vedi il carrello</a>'}`;
  };
  const cartEmpty = `<div class="cart-empty"><p>Il tuo carrello è vuoto.</p><a href="${collectionUrl('all')}" class="btn">Continua lo shopping</a></div>`;
  // Mirrors sections/cart-drawer.liquid and sections/main-cart.liquid.
  const sectionHtml = {
    'cart-drawer': () => {
      const lines = cartLines();
      const count = readCart();
      const contents = lines.length ? `<form action="cart.html" class="cart-drawer__form" novalidate><ul class="cart-lines" role="list">${lines.map((l, i) => cartLine(l, i + 1)).join('')}</ul><div class="side-drawer__footer">${cartSummary(lines, false)}</div></form>` : cartEmpty;
      return `<div class="drawer-overlay drawer-overlay--cart" data-cart-drawer-overlay></div><aside class="side-drawer side-drawer--right" id="CartDrawer" data-cart-drawer data-cart-section="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="CartDrawer-Title" tabindex="-1" inert><div class="side-drawer__header"><h2 class="side-drawer__title" id="CartDrawer-Title">Carrello <span class="side-drawer__count" data-cart-replace="count">${count ? `(${count})` : ''}</span></h2><button type="button" class="side-drawer__close" data-cart-drawer-close aria-label="Chiudi">${icon.close}</button></div><div class="side-drawer__content" data-cart-replace="contents" data-cart-item-count="${count}">${contents}</div></aside>`;
    },
    'main-cart': () => {
      const lines = cartLines();
      const contents = lines.length ? `<form action="cart.html" class="cart-page" novalidate><ul class="cart-lines cart-lines--page" role="list">${lines.map((l, i) => cartLine(l, i + 1)).join('')}</ul><div class="cart-page__summary">${cartSummary(lines, true)}<p class="form-status form-status--success" data-checkout-note hidden>Anteprima locale: nel negozio reale questo pulsante apre il checkout sicuro di Shopify.</p></div></form>` : cartEmpty;
      return `<div class="page-content"><div class="page-width page-width--narrow" data-cart-section="main-cart"><header class="section-header"><h1 class="section-header__title">Carrello</h1></header><div data-cart-replace="contents" data-cart-item-count="${readCart()}">${contents}</div></div></div>`;
    },
  };

  const searchProducts = (q) => {
    const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const terms = norm(q).split(/\s+/).filter(Boolean);
    return terms.length ? products.filter((p) => { const hay = norm(`${p.title} ${p.collection} ${p.options.map((o) => o.values.join(' ')).join(' ')}`); return terms.every((t) => hay.includes(t)); }) : [];
  };

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
    const sections = (ids) => Object.fromEntries(String(ids || '').split(',').filter((id) => sectionHtml[id]).map((id) => [id, sectionHtml[id]()]));
    await new Promise((r) => setTimeout(r, 250)); // feel of a real network round trip
    if (url.pathname === '/cart/add.js') {
      const id = Number(init.body.get('id'));
      const entry = variantIndex.get(id);
      if (!entry || !entry.variant.available) return json({ status: 422, message: 'Cart Error', description: 'Questa variante è esaurita.' }, 422);
      addToCart(id, Math.max(1, parseInt(init.body.get('quantity'), 10) || 1));
      return json({ id, sections: sections(init.body.get('sections')) });
    }
    if (url.pathname === '/cart/change.js') {
      const body = JSON.parse(init.body);
      const items = getItems();
      if (items[body.line - 1]) items[body.line - 1].qty = body.quantity;
      setItems(items);
      refreshBadges();
      return json({ item_count: readCart(), sections: sections((body.sections || []).join(',')) });
    }
    if (url.pathname === '/search/suggest.json') {
      const found = searchProducts(url.searchParams.get('q') || '').slice(0, 6).map((p) => ({ title: p.title, url: productUrl(p), price: (p.price / 100).toFixed(2), compare_at_price_max: (p.compare_at_price / 100).toFixed(2), image: null }));
      return json({ resources: { results: { products: found } } });
    }
    return realFetch(input, init);
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-preview-checkout]')) {
      const note = document.querySelector('[data-checkout-note]');
      if (note) note.hidden = false; else alert('Anteprima locale: nel negozio reale questo pulsante apre il checkout sicuro di Shopify.');
    }
    if (e.target.closest('[data-preview-express]')) alert('Anteprima locale: nel negozio reale qui compare il pagamento rapido (Shop Pay, Apple Pay, PayPal…).');
  });

  const chunk = `<span class="marquee__chunk"><span class="marquee__label">Saldi di stagione</span><span class="marquee__sep" data-countdown-part>•</span><span class="marquee__sep" data-countdown-part>Termina tra:</span><span class="marquee__time" data-countdown-part data-countdown-time></span></span>`;
  const inner = `<div class="marquee__inner">${chunk.repeat(8)}</div>`;
  const end = new Date(Date.now() + 7.1 * 36e5).toISOString();

  const starSvg = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.02 4.23 L14.01 10.40 L20.50 10.40 L15.25 14.23 L17.23 20.37 L12.02 16.54 L6.77 20.37 L8.75 14.23 L3.50 10.40 L9.99 10.40Z M15.25 14.23 L15.93 16.35 L12.02 16.54Z"/></svg>';
  const starsHtml = (rating, label, compact) => `<div class="product-rating${compact ? ' product-rating--compact' : ''}" role="img" aria-label="${rating} / 5">${[1, 2, 3, 4, 5].map((i) => `<span class="product-rating__star" style="--fill: ${Math.round(Math.min(1, Math.max(0, rating - i + 1)) * 100)}%">${starSvg}</span>`).join('')}<span class="product-rating__text">${label}</span></div>`;
  const localImageSets = {
    'premium-leather-shoulder-bag': ['01-in-use.png', '02-product.png', '03-detail.png', '04-lifestyle.png'],
  };
  const productImage = (p) => {
    if (p.images && p.images.length) return p.images.map((path) => `../theme/${path}`);
    const images = localImageSets[p.handle];
    if (images) return images.map((name) => `../theme/assets/products/${p.handle}/${name}`);
    return p.image ? [`../theme/${p.image}`] : [];
  };

  // Mirrors snippets/product-card.liquid.
  const card = (p) => {
    const onSale = p.compare_at_price > p.price;
    const tag = !p.available ? '<div class="grid-product__tag grid-product__tag--soldout">Esaurito</div>' : onSale ? `<div class="grid-product__tag">-${Math.floor(((p.compare_at_price - p.price) * 100) / p.compare_at_price)}%</div>` : '';
    const images = productImage(p);
    const visual = images.length ? `<img src="${images[0]}" alt="${esc(p.imageAlt || p.title)}">` : ph(esc(p.title.split(' ').slice(0, 2).join(' ')));
    return `<div class="grid-product">${tag}<a href="${productUrl(p)}" class="grid-product__link"><div class="grid-product__image-mask"><div class="grid__image-ratio">${visual}</div></div><div class="grid-product__meta"><div class="grid-product__title">${esc(p.title)}</div>${starsHtml(p.rating, `(${p.reviews})`, true)}<div class="grid-product__price${onSale ? ' grid-product__price--sale' : ''}"><span>${money(p.price)}</span>${onSale ? `<span class="grid-product__price--original">${money(p.compare_at_price)}</span>` : ''}</div></div></a></div>`;
  };
  const currentProduct = products.find((p) => p.handle === params.get('p')) || products[4];
  const featured = document.body.classList.contains('template-product')
    ? products.filter((p) => p.collection === currentProduct.collection && p.id !== currentProduct.id).concat(products.filter((p) => p.collection !== currentProduct.collection)).slice(0, 5)
    : products.slice(0, 5);

  // Sample reviews to preview the design only. In Shopify, use real customer reviews.
  const sampleReviews = [
    ['Tessuto morbidissimo e vestibilità perfetta. Mi hanno fatto i complimenti tutto il giorno.', 'Giulia', 'Milano'],
    ['Arrivato in tre giorni, impacchettato con cura. La taglia corrisponde alla guida.', 'Francesca', 'Torino'],
    ['Avevo dubbi sul colore e invece dal vivo è ancora più bello. Lo rifarei subito.', 'Elena', 'Bologna'],
    ['Qualità ottima per il prezzo. Si lava bene e non ha perso forma.', 'Chiara', 'Roma'],
    ['Comodo anche dopo una giornata intera. Ne ho preso un secondo in un altro colore.', 'Sara', 'Firenze'],
    ['Ho dovuto cambiare taglia e il reso è stato semplicissimo.', 'Martina', 'Napoli'],
    ['Elegante ma senza esagerare: perfetto per il lavoro e per la sera.', 'Valentina', 'Verona'],
    ['Le cuciture sono curate e il tessuto non è trasparente. Molto soddisfatta.', 'Alessia', 'Genova'],
    ['Mi sta benissimo, cade morbido. Ottimo rapporto qualità-prezzo.', 'Federica', 'Padova'],
    ['Regalo per mia madre: le è piaciuto tantissimo.', 'Silvia', 'Bari'],
    ['Esattamente come in foto. Spedizione veloce e tracciata.', 'Laura', 'Palermo'],
    ['Il colore è caldo e luminoso, si abbina con tutto.', 'Roberta', 'Bergamo'],
    ['Taglia giusta al primo colpo grazie alle misure indicate.', 'Paola', 'Trieste'],
    ['Il mio capo preferito di questa stagione. Grazie!', 'Anna', 'Cagliari'],
  ];
  const testimonial = (i) => `<div class="testimonials__slide" role="group" aria-roledescription="slide" aria-label="${i} / ${sampleReviews.length}"><div class="testimonials__card"><div class="testimonials__media"><img src="img/review-${i}.webp" alt="" loading="lazy" draggable="false"></div><div class="testimonials__content"><div class="testimonials__stars" role="img" aria-label="5 / 5">${[1, 2, 3, 4, 5].map(() => `<span class="product-rating__star">${starSvg}</span>`).join('')}</div><blockquote class="testimonials__text"><p>${sampleReviews[i - 1][0]}</p></blockquote><div class="testimonials__author"><strong>${sampleReviews[i - 1][1]}</strong> <span>${sampleReviews[i - 1][2]}</span></div></div></div></div>`;

  const faq = [
    ['Perché acquistare da Oriona?', 'Scegliere Oriona significa trovare capi pensati per donne reali, con stile, vestibilità curata e assistenza dedicata.'],
    ['Quanto tempo richiede la spedizione?', 'La spedizione tracciata è gratuita su ogni ordine in Italia, senza minimo di spesa. Riceverai il tracking via email.'],
    ['Dov’è il mio ordine?', 'Quando il tuo ordine parte, ti inviamo il numero di tracking per seguire la consegna fino alla porta.'],
    ['Come funzionano i resi?', 'Hai 30 giorni dalla consegna per richiedere un reso. Scrivici e ti guideremo in modo semplice e veloce.'],
    ['Quali metodi di pagamento accettate?', 'Puoi pagare in modo sicuro con Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay e Klarna.'],
  ]
    .map(([q, answer], i) => `<div class="faq__item"><button type="button" class="collapsible-trigger collapsible-trigger--inline" aria-controls="FAQ-${i}" aria-expanded="false"><span class="collapsible-trigger__icon collapsible-trigger__icon--circle">${icon.down}</span><span>${q}</span></button><div id="FAQ-${i}" class="collapsible-content"><div><div class="collapsible-content__inner--faq rte"><p>${answer}</p></div></div></div></div>`)
    .join('');

  const policies = { 'politica-di-rimborso': 'Politica di rimborso', 'informativa-sulla-privacy': 'Informativa sulla privacy', 'termini-di-servizio': 'Termini di servizio', 'politica-di-spedizione': 'Politica di spedizione', 'informazioni-di-contatto': 'Informazioni di contatto' };

  const feature = (ic, title, text) => `<div class="features__box"><div class="features__icon">${icon[ic]}</div><div><div class="features__title">${title}</div><div class="features__description"><p>${text}</p></div></div></div>`;

  const parts = {
    header: `
<div class="announcement-bar" data-announcement data-speed="5"><div class="page-width"><div class="announcement-bar__slider">
  <div class="announcement-bar__slide is-active"><span class="announcement-bar__text">Spedizione gratuita su tutti gli ordini</span></div>
  <div class="announcement-bar__slide"><span class="announcement-bar__text">Resi entro 30 giorni</span></div>
</div></div></div>
<div class="section-header-sticky"><header class="site-header"><div class="page-width"><div class="header-layout">
  <div class="header-item header-item--left"><div class="site-nav site-nav--icons-left">
    <button type="button" class="site-nav__link site-nav__link--icon medium-up--hide" data-drawer-open aria-controls="NavDrawer" aria-expanded="false" aria-label="Menu">${icon.menu}</button>
    <a href="search.html" class="site-nav__link site-nav__link--icon small--hide" data-search-open aria-label="Cerca">${icon.search}</a></div></div>
  <div class="header-item header-item--logo-split">
    <div class="header-item header-item--logo"><div class="h1 site-header__logo"><a href="index.html"><img src="../theme/assets/logo.png" alt="Oriona" width="1014" height="196"></a></div></div>
  </div>
  <div class="header-item header-item--icons"><div class="site-nav site-nav--icons-right">
    <a href="page.html?h=account" class="site-nav__link site-nav__link--icon small--hide" aria-label="Account">${icon.user}</a>
    <a href="search.html" class="site-nav__link site-nav__link--icon medium-up--hide" data-search-open aria-label="Cerca">${icon.search}</a>
    <a href="cart.html" class="site-nav__link site-nav__link--icon" data-cart-open aria-controls="CartDrawer" aria-label="Carrello">${icon.cart}${cartBadge()}</a></div></div>
</div><nav class="header-nav small--hide">${menu(left)}${menu(right)}</nav></div></header></div>
<div class="drawer-overlay" data-drawer-overlay data-drawer-close></div>
<nav class="nav-drawer" id="NavDrawer" data-nav-drawer aria-label="Menu" tabindex="-1" inert><div class="nav-drawer__header"><button type="button" class="nav-drawer__close" data-drawer-close aria-label="Chiudi">${icon.close}</button></div><ul>${drawerMenu(left.concat(right))}</ul></nav>
<div class="search-modal" id="SearchModal" data-search-modal role="dialog" aria-modal="true" aria-label="Cerca" inert><div class="search-modal__panel"><div class="page-width"><form action="search.html" method="get" role="search" class="search-modal__form"><span class="search-modal__icon">${icon.search}</span><input type="search" name="q" class="search-modal__input" placeholder="Cerca nel negozio" aria-label="Cerca" autocomplete="off" autocorrect="off" spellcheck="false" data-search-input aria-controls="SearchResults"><button type="button" class="search-modal__close" data-search-close aria-label="Chiudi">${icon.close}</button></form><div class="search-results" id="SearchResults" data-search-results aria-live="polite"></div></div></div><div class="search-modal__overlay" data-search-close></div></div>
${document.body.classList.contains("template-cart") ? "" : sectionHtml["cart-drawer"]()}`,

    "qty-product": qtyInput("quantity", 1, 1, 0, "Quantità"),

    "collection-list": `<div class="index-section collection-list"><div class="page-width"><div class="section-header"><h2 class="section-header__title">Acquista per categoria</h2></div><div class="collection-list__grid" style="--columns: 3">${["abbigliamento", "borse", "scarpe"].map((h) => collections.find((c) => c.handle === h)).map((c) => `<a href="${collectionUrl(c.handle)}" class="collection-tile"><div class="collection-tile__image">${ph(c.title)}</div><span class="collection-tile__title">${c.title}</span></a>`).join("")}</div></div></div>`,

    marquee: `<div class="marquee" data-countdown="${end}"><div class="marquee__track">${inner}<div aria-hidden="true" style="display:contents">${inner}</div></div></div>`,

    'featured-collection': `<div class="index-section"><div class="page-width"><div class="section-header"><h2 class="section-header__title">${document.body.classList.contains('template-product') ? 'Completa il tuo look' : 'I nostri più venduti'}</h2></div></div><div class="page-width"><div class="grid" style="--columns:5">${featured.map(card).join('')}</div></div></div>`,

    testimonials: `<div class="testimonials" data-testimonials data-autoplay="5" role="region" aria-roledescription="carousel" aria-labelledby="TestimonialsPreview"><div class="testimonials__inner"><div class="testimonials__header"><h2 class="testimonials__heading" id="TestimonialsPreview">Cosa dicono le nostre clienti</h2><div class="testimonials__subheading">Recensioni di esempio · anteprima del design</div></div><div class="testimonials__controls"><div class="testimonials__progress" data-progress aria-hidden="true"><span></span></div><button type="button" class="testimonials__toggle" data-autoplay-toggle aria-label="Metti in pausa" data-label-pause="Metti in pausa" data-label-play="Riprendi"><span class="testimonials__icon-pause">${icon.pause}</span><span class="testimonials__icon-play">${icon.play}</span></button><div class="testimonials__nav"><button type="button" data-prev aria-label="Precedente">${icon.left}</button><button type="button" data-next aria-label="Successivo">${icon.right}</button></div></div><div class="testimonials__slider" tabindex="0">${Array.from({ length: 14 }, (_, i) => i + 1).map(testimonial).join('')}</div></div></div>`,
    'closure-message': `<section class="closure-message" aria-labelledby="ClosureMessagePreview"><div class="page-width page-width--narrow text-center"><h2 id="ClosureMessagePreview">Ultima occasione</h2><div class="closure-message__text rte"><p>Quattordici anni fa abbiamo deciso di costruire questo sogno. Oggi, a causa dell'aumento dei costi, è arrivato il momento di chiudere.</p><p>Tutto è scontato fino al <strong>50%</strong> e questi sono gli ultimi pezzi: non ci saranno riassortimenti.</p><p>Grazie per questi quattordici anni meravigliosi.</p></div></div></section>`,

    faq: `<div class="index-section"><div class="page-width page-width--narrow"><header class="section-header"><h2 class="section-header__title">Domande frequenti</h2></header><div class="faq__list">${faq}</div></div></div>`,

    features: `<div class="features"><div class="features__inner"><div class="features__grid">${feature('truck', 'Spedizione gratuita', 'Spedizione tracciata gratuita su ogni ordine in Italia, senza minimo di spesa.')}${feature('refresh', 'Resi entro 30 giorni', 'Hai 30 giorni dalla consegna per cambiare idea.')}${feature('lock', 'Pagamento sicuro', 'Pagamenti crittografati e protetti ad ogni acquisto.')}</div></div></div>`,

    newsletter: `<div class="newsletter-section"><div class="page-width text-center"><div class="theme-block"><p class="h3">Iscriviti e partecipa per vincere un buono da 150 €</p></div><div class="theme-block"><div class="rte"><p>Lascia la tua email per ricevere le ultime novità e partecipare all'estrazione.</p></div></div><div class="theme-block"><form onsubmit="return false"><div class="newsletter__input-group"><input type="email" class="newsletter__input" placeholder="Inserisci la tua email"><button type="submit" class="btn">Partecipa</button></div></form></div></div></div>`,
    'business-accordion': `<section class="business-accordion" aria-label="Informazioni sul nostro negozio"><div class="page-width page-width--narrow"><div class="business-accordion__item"><button class="collapsible-trigger collapsible-trigger--inline" type="button" aria-controls="BusinessStoryPreview" aria-expanded="false"><span>La nostra storia</span><span class="collapsible-trigger__icon"><span data-icon="down"></span></span></button><div id="BusinessStoryPreview" class="collapsible-content"><div><div class="collapsible-content__inner rte"><p>Siamo Tati e il nostro piccolo negozio nasce dalla passione per capi belli, facili da indossare e scelti con cura.</p></div></div></div></div><div class="business-accordion__item"><button class="collapsible-trigger collapsible-trigger--inline" type="button" aria-controls="BusinessContactPreview" aria-expanded="false"><span>Contatti e assistenza</span><span class="collapsible-trigger__icon"><span data-icon="down"></span></span></button><div id="BusinessContactPreview" class="collapsible-content"><div><div class="collapsible-content__inner rte"><p>Scrivici dal lunedì al venerdì, dalle 9:00 alle 17:00. Ti risponderemo il prima possibile.</p></div></div></div></div><div class="business-accordion__item"><button class="collapsible-trigger collapsible-trigger--inline" type="button" aria-controls="BusinessShippingPreview" aria-expanded="false"><span>Spedizioni e resi</span><span class="collapsible-trigger__icon"><span data-icon="down"></span></span></button><div id="BusinessShippingPreview" class="collapsible-content"><div><div class="collapsible-content__inner rte"><p>Spedizione tracciata e resi facili entro 30 giorni su tutti gli ordini.</p></div></div></div></div></div></section>`,

    'back-to-top': `<div class="index-section"><div class="page-width"><div class="btt-row"><div class="btt-wrapper"><button type="button" class="btt-btn" data-back-to-top>Torna su ${icon.up}</button></div></div></div></div>`,

    footer: `<footer class="site-footer"><div class="page-width"><div class="grid">
  <div class="grid__item"><div class="footer__item-padding"><p class="h4 footer__title">Il nostro negozio</p><div class="footer__text rte"><p>Spedizione <strong>tracciata</strong> e <strong>resi entro 30 giorni</strong> su tutti gli ordini.</p></div></div></div>
  <div class="grid__item"><div class="footer__item-padding"><p class="h4 footer__title">Contatti</p><div class="footer__text rte"><p><strong>Orari del servizio clienti:</strong></p><p>Dal lunedì al venerdì, 9:00-17:00</p><p><strong>Hai una domanda?</strong></p><p>Scrivici: trovi la nostra email qui sotto.</p></div></div></div>
  <div class="grid__item"><ul class="site-footer__linklist">${[['Chi siamo', 'chi-siamo'], ['Traccia il tuo ordine', 'traccia-ordine'], ['Contatti', 'contatti']].map(([t, h]) => `<li><a href="page.html?h=${h}">${t}</a></li>`).join('')}</ul></div>
</div>

<ul class="footer__policies">${Object.entries(policies).map(([h, t]) => `<li><a href="page.html?h=${h}">${t}</a></li>`).join('')}</ul>
<div class="footer__legal"><p>&copy; 2026 Ragione sociale<span>P.IVA IT00000000000</span><span>Indirizzo della sede</span><span><a href="page.html?h=contatti">email@negozio.it</a></span></p></div></div></footer>`,
  };

  // ---- Collection landing (mirrors sections/main-collection.liquid) ----
  const sorters = {
    manual: () => 0,
    'price-ascending': (a, b) => a.price - b.price,
    'price-descending': (a, b) => b.price - a.price,
    'title-ascending': (a, b) => a.title.localeCompare(b.title),
    'created-descending': (a, b) => b.createdAt - a.createdAt,
  };
  const sortLabels = { manual: 'In evidenza', 'price-ascending': 'Prezzo crescente', 'price-descending': 'Prezzo decrescente', 'title-ascending': 'Alfabetico, A-Z', 'created-descending': 'Più recenti' };

  function renderCollection(el) {
    const handle = params.get('c') || 'all';
    const col = handle === 'all' ? { handle: 'all', title: 'Tutti i prodotti', description: 'Tutta la collezione, scontata fino al 50%.' } : collections.find((c) => c.handle === handle);
    if (!col) {
      el.innerHTML = '<div class="page-content"><div class="page-width text-center"><h1>Collezione non trovata</h1><p><a href="collections.html">Vedi tutte le collezioni</a></p></div></div>';
      return;
    }
    document.title = col.title + ' · Anteprima';
    const sort = sorters[params.get('sort_by')] ? params.get('sort_by') : 'manual';
    const inCollection = products.filter((p) => handle === 'all' || p.collection === handle);

    // Storefront filtering stand-in: same URL parameters Shopify uses (filter.v.*).
    const optionFilter = (name, param) => {
      const active = params.getAll(param);
      const values = [...new Set(inCollection.flatMap((p) => (p.options.find((o) => o.name === name) || { values: [] }).values))];
      return { type: 'list', label: name, param, active, values: values.map((v) => ({ value: v, label: v, active: active.includes(v), count: inCollection.filter((p) => (p.options.find((o) => o.name === name) || { values: [] }).values.includes(v)).length })) };
    };
    const availActive = params.getAll('filter.v.availability');
    const filters = [
      { type: 'list', label: 'Disponibilità', param: 'filter.v.availability', active: availActive, values: [{ value: '1', label: 'Disponibile', active: availActive.includes('1'), count: inCollection.filter((p) => p.available).length }, { value: '0', label: 'Esaurito', active: availActive.includes('0'), count: inCollection.filter((p) => !p.available).length }] },
      { type: 'price_range', label: 'Prezzo', min: params.get('filter.v.price.gte') || '', max: params.get('filter.v.price.lte') || '', rangeMax: Math.ceil(Math.max(...inCollection.map((p) => p.price)) / 100) },
      optionFilter('Taglia', 'filter.v.option.taglia'),
      optionFilter('Colore', 'filter.v.option.colore'),
    ].filter((f) => f.type === 'price_range' || f.values.length);
    const hasOption = (p, name, wanted) => !wanted.length || wanted.some((v) => (p.options.find((o) => o.name === name) || { values: [] }).values.includes(v));
    const filtered = inCollection.filter((p) =>
      (!availActive.length || availActive.includes(p.available ? '1' : '0')) &&
      (!params.get('filter.v.price.gte') || p.price >= Number(params.get('filter.v.price.gte')) * 100) &&
      (!params.get('filter.v.price.lte') || p.price <= Number(params.get('filter.v.price.lte')) * 100) &&
      hasOption(p, 'Taglia', params.getAll('filter.v.option.taglia')) &&
      hasOption(p, 'Colore', params.getAll('filter.v.option.colore'))
    ).sort(sorters[sort]);

    const perPage = 12;
    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    const page = Math.min(pages, Math.max(1, parseInt(params.get('page'), 10) || 1));
    const items = filtered.slice((page - 1) * perPage, page * perPage);
    const urlWith = (mutate) => { const u = new URL(location.href); mutate(u.searchParams); return u.pathname.split('/').pop() + '?' + u.searchParams; };

    // Mirrors snippets/facets.liquid.
    const chipLinks = filters.flatMap((f) => {
      if (f.type === 'price_range') return f.min || f.max ? [[`${money((Number(f.min) || 0) * 100)}–${money((Number(f.max) || f.rangeMax) * 100)}`, urlWith((p) => { p.delete('filter.v.price.gte'); p.delete('filter.v.price.lte'); p.delete('page'); })]] : [];
      return f.values.filter((v) => v.active).map((v) => [v.label, urlWith((p) => { const keep = p.getAll(f.param).filter((x) => x !== v.value); p.delete(f.param); keep.forEach((x) => p.append(f.param, x)); p.delete('page'); })]);
    });
    const clearUrl = `${collectionUrl(handle)}${sort !== 'manual' ? `&sort_by=${sort}` : ''}`;
    const facetBody = filters.map((f, i) => {
      const open = i < 2 || (f.type === 'price_range' ? f.min || f.max : f.active.length);
      const inner = f.type === 'price_range'
        ? `<div class="facet__price"><label class="facet__price-field"><span>Da (€)</span><input type="number" inputmode="numeric" name="filter.v.price.gte" value="${esc(f.min)}" placeholder="0" min="0" max="${f.rangeMax}" step="1"></label><label class="facet__price-field"><span>A (€)</span><input type="number" inputmode="numeric" name="filter.v.price.lte" value="${esc(f.max)}" placeholder="${f.rangeMax}" min="0" max="${f.rangeMax}" step="1"></label></div>`
        : `<ul class="facet__values" role="list">${f.values.map((v, j) => `<li><input type="checkbox" class="facet__checkbox" id="F-${i}-${j}" name="${f.param}" value="${esc(v.value)}"${v.active ? ' checked' : ''}${!v.count && !v.active ? ' disabled' : ''}><label for="F-${i}-${j}" class="facet__label"><span>${esc(v.label)}</span><span class="facet__count">${v.count}</span></label></li>`).join('')}</ul>`;
      return `<details class="facet"${open ? ' open' : ''}><summary class="facet__summary"><span>${f.label}</span>${icon.down}</summary>${inner}</details>`;
    }).join('');
    const filterIcon = '<svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 5h10M16 5h2M2 15h2M8 15h10"/><circle cx="14" cy="5" r="2"/><circle cx="6" cy="15" r="2"/></svg>';
    const facets = `
    <div class="facets" data-facets>
      <form action="collection.html" method="get" class="facets__form" id="FacetsForm" data-facets-form>
        <input type="hidden" name="c" value="${esc(handle)}">
        <div class="collection-toolbar">
          <div class="collection-toolbar__start">
            <button type="button" class="collection-toolbar__filter" data-facets-open aria-controls="FacetsDrawer" aria-expanded="false">${filterIcon}<span>Filtri</span>${chipLinks.length ? `<span class="facets__badge">${chipLinks.length}</span>` : ''}</button>
            <span class="collection-toolbar__count">${filtered.length} prodott${filtered.length === 1 ? 'o' : 'i'}</span>
          </div>
          <label class="collection-toolbar__sort"><span>Ordina per</span>
            <select name="sort_by" data-facets-autosubmit>${Object.keys(sortLabels).map((k) => `<option value="${k}"${k === sort ? ' selected' : ''}>${sortLabels[k]}</option>`).join('')}</select>
          </label>
        </div>
        ${chipLinks.length ? `<div class="facets__active">${chipLinks.map(([label, href]) => `<a href="${href}" class="facets__chip" aria-label="Rimuovi filtro: ${esc(label)}">${esc(label)} ${icon.close}</a>`).join('')}<a href="${clearUrl}" class="facets__clear">Rimuovi tutti</a></div>` : ''}
        <div class="drawer-overlay" data-facets-overlay></div>
        <div class="side-drawer side-drawer--left facets-drawer" id="FacetsDrawer" data-facets-drawer role="dialog" aria-modal="true" aria-labelledby="FacetsDrawer-Title" tabindex="-1">
          <div class="side-drawer__header"><h2 class="side-drawer__title" id="FacetsDrawer-Title">Filtri</h2><button type="button" class="side-drawer__close" data-facets-close aria-label="Chiudi">${icon.close}</button></div>
          <div class="side-drawer__content facets__list">${facetBody}</div>
          <div class="side-drawer__footer facets__footer"><a href="${clearUrl}" class="btn btn--outline">Rimuovi tutti</a><button type="submit" class="btn btn--buy">Mostra i risultati</button></div>
        </div>
      </form>
    </div>`;

    // Mirrors snippets/pagination.liquid.
    const pageUrl = (n) => urlWith((p) => (n > 1 ? p.set('page', n) : p.delete('page')));
    const arrow = (n, dir, label) => n ? `<a href="${pageUrl(n)}" class="pagination__item pagination__arrow" aria-label="${label}">${dir}</a>` : `<span class="pagination__item pagination__arrow is-disabled" aria-hidden="true">${dir}</span>`;
    const pagination = pages > 1 ? `<nav class="pagination" aria-label="Pagina ${page}">${arrow(page > 1 && page - 1, icon.left, 'Precedente')}${Array.from({ length: pages }, (_, i) => i + 1).map((n) => n === page ? `<span class="pagination__item is-current" aria-current="page">${n}</span>` : `<a href="${pageUrl(n)}" class="pagination__item" aria-label="Pagina ${n}">${n}</a>`).join('')}${arrow(page < pages && page + 1, icon.right, 'Successivo')}</nav>` : '';
    const chips = [['Tutti', 'all']].concat(collections.map((c) => [c.title, c.handle]))
      .map(([t, h]) => `<a href="${collectionUrl(h)}" class="collection-nav__link${h === handle ? ' is-active' : ''}">${t}</a>`).join('');

    el.innerHTML = `
<div class="page-content page-content--collection">
  <div class="page-width">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span>${col.group ? `<a href="collections.html">${col.group}</a><span>/</span>` : ''}<span aria-current="page">${col.title}</span></nav>
    <header class="section-header collection-header">
      <h1 class="section-header__title">${col.title}</h1>
      ${col.description ? `<div class="rte collection-header__description"><p>${col.description}</p></div>` : ''}
    </header>
    <nav class="collection-nav" aria-label="Collezioni">${chips}</nav>
    ${facets}
    ${items.length ? `<div class="grid collection-grid">${items.map(card).join('')}</div>` : '<p class="text-center">Nessun prodotto in questa collezione.</p>'}
    ${pagination}
  </div>
</div>`;
  }

  // ---- All collections (mirrors sections/main-list-collections.liquid) ----
  function renderCollectionsList(el) {
    el.innerHTML = `<div class="page-content"><div class="page-width"><nav class="breadcrumbs"><a href="index.html">Home</a><span>/</span><span aria-current="page">Collezioni</span></nav><header class="section-header"><h1 class="section-header__title">Collezioni</h1></header><div class="grid collection-grid">${collections
      .map((c) => `<a href="${collectionUrl(c.handle)}"><div class="grid__image-ratio">${ph(c.title)}</div><div class="list-collections__title">${c.title}</div></a>`)
      .join('')}</div></div></div>`;
  }

  // ---- Product page: swap the sample product for the one in ?p= ----
  function renderProduct() {
    const p = currentProduct;
    const section = document.querySelector('[data-product]');
    if (!section) return;
    const col = collections.find((c) => c.handle === p.collection);
    document.title = p.title + ' · Anteprima';
    const variant = p.variants.find((v) => v.available) || p.variants[0];

    section.querySelector('.product-single__title').textContent = p.title;
    section.querySelector('.product-block--header').insertAdjacentHTML('beforebegin', `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="${collectionUrl(col.handle)}">${col.title}</a></nav>`);
    const descriptionBlock = [...section.querySelectorAll('.product-single__meta .product-block .rte')].find((el) => !el.closest('.product-block--tab'));
    if (descriptionBlock) {
      const highlights = p.category === 'Bolsos'
        ? ['Spazio per i tuoi indispensabili', 'Design versatile da giorno e da sera', 'Pensata per accompagnarti ogni giorno']
        : p.category === 'Calzado'
          ? ['Comfort pensato per tutto il giorno', 'Facile da abbinare ai tuoi look', 'Design curato e piacevole da indossare']
          : ['Vestibilità facile da valorizzare', 'Un capo versatile per più occasioni', 'Stile essenziale, senza complicazioni'];
      descriptionBlock.innerHTML = `<p>${esc(p.description)}</p><p><strong>Perché sceglierlo</strong></p><ul>${highlights.map(h => `<li>${h}</li>`).join('')}</ul>`;
    }
    section.querySelectorAll('.product-image-main').forEach((el, i) => { el.dataset.ph = `${p.title} · Immagine ${i + 1}`; });
    const localImages = productImage(p);
    if (localImages.length) {
      section.querySelectorAll('.product-main-slide').forEach((slide, i) => {
        const file = localImages[i] || localImages[0];
        if (file) {
          const image = slide.querySelector('.product-image-main');
          image.removeAttribute('data-ph');
          image.innerHTML = `<img src="${file}" alt="${esc(p.imageAlt || p.title)} · Immagine ${i + 1}">`;
        }
      });
      section.querySelectorAll('.product__thumb').forEach((thumb, i) => {
        const file = localImages[i] || localImages[0];
        if (file) {
          thumb.removeAttribute('data-ph');
          thumb.innerHTML = `<img src="${file}" alt="${esc(p.imageAlt || p.title)} · Miniatura ${i + 1}">`;
        }
      });
    }

    const full = Math.floor(p.rating);
    section.querySelector('.product-rating').outerHTML = starsHtml(p.rating, `${p.rating} (${p.reviews} recensioni)`, false);
    const ratingEl = section.querySelector('.product-rating');
    ratingEl.parentElement.classList.add('product-rating-row');
    ratingEl.insertAdjacentHTML('afterend', '<a class="product-rating__source" href="https://it.trustpilot.com" target="_blank" rel="noopener"><img src="../theme/assets/trustpilot-logo.webp" alt="Recensioni su Trustpilot" width="400" height="98"></a>');

    const onSale = variant.compare_at_price > variant.price;
    const priceBlock = section.querySelector('.product-single__meta [data-price-block]');
    priceBlock.classList.toggle('price-block--sale', onSale);
    priceBlock.querySelector('[data-compare-price]').textContent = onSale ? money(variant.compare_at_price) : '';
    priceBlock.querySelector('[data-compare-price]').hidden = !onSale;
    priceBlock.querySelector('[data-price]').textContent = money(variant.price);
    const badge = priceBlock.querySelector('[data-save-badge]');
    badge.hidden = !onSale;
    if (onSale) badge.textContent = badge.dataset.template.replace('[percent]', Math.round(((variant.compare_at_price - variant.price) * 100) / variant.compare_at_price));

    const variantBlock = section.querySelector('.variant-wrapper').parentElement;
    variantBlock.innerHTML = p.options
      .filter((o) => o.values.length > 1 || o.name === 'Colore')
      .map((o) => {
        const idx = p.options.indexOf(o);
        const isColour = o.name === 'Colore';
        return `<div class="variant-wrapper"><span class="variant__label">${o.name}${isColour ? `: <span data-option-current>${variant.options[idx]}</span>` : ''}</span><fieldset class="variant-input-wrap" data-option-index="${idx}">${o.values
          .map((v, j) => `<div class="variant-input"><input type="radio" id="o-${idx}-${j}" name="o-${idx}" value="${esc(v)}"${v === variant.options[idx] ? ' checked' : ''}><label for="o-${idx}-${j}" class="variant__button-label${isColour ? ' has-swatch' : ''}"${isColour ? ` data-ph="${esc(v)}"` : ''}>${isColour ? '' : esc(v)}</label></div>`)
          .join('')}</fieldset></div>`;
      })
      .join('');
    // Single-value options (e.g. "Taglia unica") have no picker but still need a checked input for theme.js.
    p.options.forEach((o, idx) => {
      if (o.values.length === 1 && o.name !== 'Colore') variantBlock.insertAdjacentHTML('beforeend', `<div class="variant-wrapper" hidden><fieldset data-option-index="${idx}"><input type="radio" name="o-${idx}" value="${esc(o.values[0])}" checked></fieldset></div>`);
    });

    section.querySelector('[name="id"]').value = variant.id;
    section.querySelector('[data-variants]').textContent = JSON.stringify(p.variants);
    const stickyTitle = section.querySelector('.sticky-atc__title');
    if (stickyTitle) stickyTitle.textContent = p.title;
  }

  // ---- Cart (mirrors sections/main-cart.liquid) ----
  function renderCart(el) {
    el.outerHTML = sectionHtml['main-cart']();
  }

  // ---- Search (mirrors sections/main-search.liquid) ----
  function renderSearch(el) {
    const q = (params.get('q') || '').trim();
    const results = searchProducts(q);
    document.title = (q ? `Risultati per “${q}”` : 'Cerca') + ' · Anteprima';
    el.innerHTML = `
<div class="page-content"><div class="page-width">
  <header class="section-header"><h1 class="section-header__title">${q ? `Risultati per “${esc(q)}”` : 'Cerca'}</h1></header>
  <form action="search.html" method="get" role="search" class="search-form">
    <input type="search" name="q" value="${esc(q)}" placeholder="Cerca nel negozio" aria-label="Cerca">
    <button type="submit" class="btn">Cerca</button>
  </form>
  ${q ? (results.length ? `<div class="grid collection-grid">${results.map(card).join('')}</div>` : `<p class="text-center">Nessun risultato trovato per “${esc(q)}”.</p>`) : ''}
</div></div>`;
  }

  // ---- Content pages (mirrors sections/main-page.liquid and main-contact.liquid) ----
  const policyNote = (title) => `<p>Qui comparirà la tua <strong>${title.toLowerCase()}</strong> completa.</p><p>Nel negozio reale questo testo arriva da Shopify, in <em>Impostazioni &gt; Politiche</em>: compilalo lì e il tema lo mostra in automatico, con il link nel piè di pagina.</p>`;
  const pages = {
    'chi-siamo': {
      title: 'Chi siamo',
      body: `<figure class="page-figure"><img src="../theme/assets/story-1.webp" alt=""></figure>
        <p>Mi chiamo Caterina. Nel 2012 io e mia sorella Bianca abbiamo aperto questo negozio. È nato tutto da lei: Bianca amava la moda, e questo posto era il suo sogno. Io ho avuto la fortuna di condividerlo con lei.</p>
        <p>Per quattordici anni l’abbiamo portato avanti insieme, fianco a fianco.</p>
        <p><a href="${collectionUrl('all')}">Scopri la collezione</a></p>`,
    },
    'traccia-ordine': {
      title: 'Traccia il tuo ordine',
      body: `<p>Inserisci il numero d’ordine e l’email usata per l’acquisto: li trovi nell’email di conferma.</p>
        <form class="contact-form" data-demo-form="Anteprima locale: nel negozio reale qui compare lo stato della spedizione (serve un’app di tracciamento o l’account cliente di Shopify).">
          <div class="form-row">
            <div class="form-field"><label for="OrderNumber">Numero d’ordine</label><input id="OrderNumber" name="order" placeholder="#1001" required></div>
            <div class="form-field"><label for="OrderEmail">Email</label><input id="OrderEmail" type="email" name="email" autocomplete="email" required></div>
          </div>
          <button type="submit" class="btn">Traccia</button>
        </form>`,
    },
    contatti: {
      title: 'Contatti',
      body: `<p>Dal lunedì al venerdì, 9:00-17:00. Scrivici e ti risponderemo il prima possibile.</p>
        <form class="contact-form" data-demo-form="Grazie per averci scritto. Ti risponderemo il prima possibile. (Anteprima locale: nessun messaggio è stato inviato.)">
          <div class="form-row">
            <div class="form-field"><label for="ContactName">Nome</label><input id="ContactName" name="name" autocomplete="name"></div>
            <div class="form-field"><label for="ContactEmail">Email <span aria-hidden="true">*</span></label><input id="ContactEmail" type="email" name="email" autocomplete="email" required></div>
          </div>
          <div class="form-field"><label for="ContactPhone">Telefono</label><input id="ContactPhone" type="tel" name="phone" autocomplete="tel"></div>
          <div class="form-field"><label for="ContactBody">Messaggio <span aria-hidden="true">*</span></label><textarea id="ContactBody" name="body" rows="6" required></textarea></div>
          <button type="submit" class="btn">Invia</button>
        </form>`,
    },
    account: {
      title: 'Account',
      body: `<p>Accedi per vedere i tuoi ordini e lo stato delle spedizioni.</p><p>Nel negozio reale questa pagina è gestita da Shopify (accesso con codice via email): non serve configurare nulla nel tema.</p><p><a href="index.html" class="btn">Torna alla home</a></p>`,
    },
  };
  Object.entries(policies).forEach(([h, t]) => { pages[h] = { title: t, body: policyNote(t) }; });

  function renderPage(el) {
    const page = pages[params.get('h')];
    if (!page) { location.replace('404.html'); return; }
    document.title = page.title + ' · Anteprima';
    el.innerHTML = `<div class="page-content"><div class="page-width page-width--narrow"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span aria-current="page">${page.title}</span></nav><header class="section-header"><h1 class="section-header__title">${page.title}</h1></header><div class="rte">${page.body}</div></div></div>`;
    el.querySelectorAll('[data-demo-form]').forEach((form) => form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.querySelector('.form-status')?.remove();
      form.insertAdjacentHTML('afterbegin', `<p class="form-status form-status--success" role="status">${form.dataset.demoForm}</p>`);
      form.reset();
    }));
  }

  document.querySelectorAll('[data-collection-page]').forEach(renderCollection);
  document.querySelectorAll('[data-collections-list]').forEach(renderCollectionsList);
  document.querySelectorAll('[data-cart-page]').forEach(renderCart);
  document.querySelectorAll('[data-search-page]').forEach(renderSearch);
  document.querySelectorAll('[data-content-page]').forEach(renderPage);
  if (document.body.classList.contains('template-product')) renderProduct();

  document.querySelectorAll('[data-include]').forEach((el) => {
    el.outerHTML = parts[el.dataset.include] || '';
  });
  document.querySelectorAll('[data-ph]').forEach((el) => {
    el.innerHTML = ph(el.dataset.ph);
  });
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.outerHTML = icon[el.dataset.icon] || '';
  });
})();
