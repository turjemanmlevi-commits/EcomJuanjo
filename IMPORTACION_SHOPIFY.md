# Paquete de importación

Catálogo: **100 productos** (50 borse, 30 abbigliamento, 20 scarpe) y **3.942 variantes**, generado desde `winners_combinado_100.csv`.

## Cómo se genera

```
node tools/generate-catalog.js   # escribe el CSV de Shopify, preview/catalog.js y los resúmenes
node tools/verify-variants.js    # comprueba que cada producto tiene exactamente las variantes de su web
```

- `data/source-variants.json`: opciones y variantes reales de cada producto, leídas de su página (JSON de Shopify; 4 productos leídos desde la página porque la web bloquea el JSON). Incluye qué variantes están agotadas en origen.
- `data/copy/*.json`: textos en italiano por producto (título, descripción HTML, SEO, tipo, categoría de Shopify y traducción de cada opción y valor). Para cambiar un texto, edita aquí y vuelve a generar.
- `shopify_import_100_productos_it.csv`: CSV listo para Shopify (hasta 3 opciones, categoría de la taxonomía oficial de Shopify, tipo, etiquetas, SEO, estado).

## Reglas aplicadas

- Variantes 1:1 con la web de origen: mismas opciones y valores (colores traducidos; tallas con sus números y sistema UK/US/EU sin convertir). Las opciones con un único valor (p. ej. "One size") se omiten, salvo el color.
- Variantes agotadas en origen → `deny` (salen como "Esaurito"); el resto → `continue` con inventario 0.
- Precio: el de `winners_combinado_100.csv`; las variantes que en origen cuestan más o menos mantienen esa proporción. El precio tachado solo sale de tu CSV, nunca de la web del competidor.
- Nombres propios para cada producto (sin marcas de otras tiendas) y vendor `ORIONA`.
- Descripciones solo con datos de la web de origen; sin afirmaciones médicas, sin urgencia, sin reseñas.

## Revisar antes de importar

- **Precio estimado** (tu CSV no tenía precio; se usó el de la web en EUR o convertido de USD/GBP): Borsa Ottavia 54,95 €, Shorts modellanti Silvia 36,95 €, Tuta in denim Teresa 54,99 €, Salopette a quadri Nadia 39,99 €, Sandalo multifascia Raffaella 20,99 €, Mocassino traforato Sandra 20,99 €, Stivale da neve Marina 26,99 €, Sandalo imbottito Donatella 20,99 €.
- **Stivale al ginocchio Renata**: la web (brillantshoes.com) no muestra variantes ni precio; va como borrador (`draft`) sin variantes. Completar a mano.
- **Kit da viaggio Marta** y **Sacca sottovuoto da viaggio Alba** son el mismo producto (bolsa de compresión con bomba) de dos tiendas: conviene dejar solo uno.
- **Sistema de tallas no indicado en origen** (solo números): Mule traforata Tina, Pantofola effetto pelliccia Bettina, Sneaker in tela Ines, Slip-on in maglia Letizia, Stivaletto western Brigida. Confirmar con el proveedor y añadir una guía de tallas.
- **Material dudoso en origen**: Borsa a spalla Vittoria ("leather" sin decir si es piel auténtica → se describe como "effetto pelle"), Borsa Ottavia (la web dice PU y "genuine" a la vez → "similpelle").
- **Precios distintos de la versión anterior**: Borsa hobo antifurto Clelia y Borsa Aurora Vintage usan ahora los precios de tu CSV (39,95/79,90 y 76/113).

## Imágenes

Solo 7 productos tienen fotos propias en `theme/assets/products/`. Al resto no se le asigna imagen en el CSV (la preview usa una foto genérica por categoría). Las rutas de `Image Src` son locales: Shopify necesita URLs públicas, así que hay que subir las fotos (Archivos de Shopify o CDN) y sustituir esas rutas, o subirlas directamente a cada producto después de importar.
