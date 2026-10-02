// Static preview only: fake catalog standing in for Shopify collections/products.
// Edit freely — prices are in cents, like Shopify.
window.CATALOG = (function () {
  const collections = [
    { handle: 'abiti', title: 'Abiti', group: 'Abbigliamento', description: 'Abiti per ogni occasione, dal giorno alla sera.' },
    { handle: 'tute', title: 'Tute', group: 'Abbigliamento', description: 'Un solo capo, look completo.' },
    { handle: 'bluse-e-top', title: 'Bluse e top', group: 'Abbigliamento', description: 'Bluse leggere e top da abbinare a tutto.' },
    { handle: 'cardigan', title: 'Cardigan', group: 'Abbigliamento', description: 'Morbidi strati per le mezze stagioni.' },
    { handle: 'pantaloni', title: 'Pantaloni', group: 'Abbigliamento', description: 'Comodi, eleganti, facili da abbinare.' },
    { handle: 'gonne', title: 'Gonne', group: 'Abbigliamento', description: 'Gonne midi e lunghe dal taglio femminile.' },
    { handle: 'costumi', title: 'Costumi', group: 'Abbigliamento', description: 'Costumi interi e coprispalle per l’estate.' },
    { handle: 'borse', title: 'Borse', group: 'Accessori', description: 'Borse capienti per tutti i giorni.' },
    { handle: 'scarpe', title: 'Scarpe', group: 'Accessori', description: 'Comfort e stile a ogni passo.' },
    { handle: 'occhiali-da-sole', title: 'Occhiali da sole', group: 'Accessori', description: 'Il tocco finale per ogni look.' },
  ];

  const clothingSizes = ['S', 'M', 'L', 'XL', '2XL'];
  const shoeSizes = ['36', '37', '38', '39', '40', '41'];
  const oneSize = ['Taglia unica'];

  // [title, collection, price, compare_at_price, colours, sold-out sizes]
  const rows = [
    ['Abito midi a fiori con maniche a sbuffo', 'abiti', 8995, 17990, ['Blu', 'Rosa'], ['2XL']],
    ['Abito lungo in lino con cintura', 'abiti', 7995, 15990, ['Sabbia', 'Bianco'], []],
    ['Abito a portafoglio con scollo a V', 'abiti', 6995, 13990, ['Nero', 'Verde'], ['S']],
    ['Abito chemisier a righe', 'abiti', 5995, 11990, ['Azzurro'], []],
    ['Tuta con scollo annodato e gamba ampia', 'tute', 8995, 17990, ['Cammello', 'Nero'], ['2XL']],
    ['Tuta leopardata con cintura in vita', 'tute', 8995, 17990, ['Leopardo'], []],
    ['Tuta in lino senza maniche', 'tute', 7495, 14990, ['Oliva', 'Sabbia'], []],
    ['Blusa in seta con fiocco', 'bluse-e-top', 4995, 9990, ['Avorio', 'Nero'], []],
    ['Top in maglia a coste', 'bluse-e-top', 2995, 5990, ['Bianco', 'Beige', 'Nero'], ['XL']],
    ['Camicia oversize in cotone', 'bluse-e-top', 3995, 7990, ['Bianco', 'Azzurro'], []],
    ['Cardigan in maglia con bottoni gioiello', 'cardigan', 5995, 11990, ['Crema', 'Grigio'], []],
    ['Cardigan lungo con tasche', 'cardigan', 6495, 12990, ['Cammello'], ['S', 'M']],
    ['Pantaloni palazzo a vita alta', 'pantaloni', 5495, 10990, ['Nero', 'Beige'], []],
    ['Pantaloni in lino con coulisse', 'pantaloni', 4495, 8990, ['Bianco', 'Sabbia'], []],
    ['Gonna midi plissettata', 'gonne', 4995, 9990, ['Verde', 'Bordeaux'], []],
    ['Gonna lunga a fiori', 'gonne', 4495, 8990, ['Blu'], []],
    ['Costume intero con scollo incrociato', 'costumi', 4995, 9990, ['Nero', 'Rosso'], []],
    ['Kimono copricostume leggero', 'costumi', 3495, 6990, ['Bianco'], []],
    ['Borsa a spalla in pelle intrecciata', 'borse', 6995, 13990, ['Cuoio', 'Nero'], []],
    ['Borsa in paglia con manici', 'borse', 3995, 7990, ['Naturale'], []],
    ['Sandali con zeppa in corda', 'scarpe', 4995, 9990, ['Beige', 'Nero'], ['36']],
    ['Mocassini morbidi in pelle', 'scarpe', 5995, 11990, ['Cuoio'], []],
    ['Occhiali da sole cat-eye', 'occhiali-da-sole', 2495, 4990, ['Tartaruga', 'Nero'], []],
    ['Occhiali da sole oversize', 'occhiali-da-sole', 2495, 4990, ['Nero'], []],
  ];

  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  let vid = 1000;
  const products = rows.map(([title, collection, price, compare, colours, soldOut], i) => {
    const sizes = collection === 'scarpe' ? shoeSizes : ['borse', 'occhiali-da-sole'].includes(collection) ? oneSize : clothingSizes;
    const variants = [];
    colours.forEach((c) => sizes.forEach((s) => variants.push({ id: ++vid, options: [c, s], price, compare_at_price: compare, available: !soldOut.includes(s) })));
    return {
      id: i + 1,
      handle: slug(title),
      title,
      collection,
      price,
      compare_at_price: compare,
      options: [{ name: 'Colore', values: colours }, { name: 'Taglia', values: sizes }],
      variants,
      available: variants.some((v) => v.available),
      rating: [4.6, 4.7, 4.8, 4.9][i % 4],
      reviews: 40 + ((i * 37) % 180),
      createdAt: i,
    };
  });

  return { collections, products };
})();
