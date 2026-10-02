# Paquete de importación

El catálogo generado contiene 100 productos, 1.160 variantes y las opciones `Colore` y `Talla`.

Archivos principales:

- `shopify_import_100_productos_it.csv`: CSV de Shopify con productos, variantes, precios, descuentos, SKU e imagen de referencia.
- `catalog_summary.json`: resumen verificable del catálogo.
- `image_generation_manifest_it.json`: planificación de imágenes por producto y color.
- `theme/assets/products/`: assets generados incluidos en la preview.

Estado de imágenes: el primer producto conserva sus 4 imágenes originales y `The Brooklyn Bag` ya tiene 4 imágenes propias (hero, uso en Milán, detalle y lifestyle). El manifiesto ya contiene los 1.600 slots exactos y rota 10 modelos; los otros 98 productos siguen usando una imagen de referencia de categoría en la preview hasta completar su generación individual.

Las rutas de `Image Src` del CSV son rutas locales de staging (`assets/products/...`). Shopify requiere una URL pública para importar imágenes desde CSV; antes de importar hay que subir estos assets al CDN de la tienda y reemplazar esas rutas por sus URLs públicas. No se ha ejecutado una importación remota porque este proyecto no contiene una conexión ni credenciales de administración de Shopify.
