# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas del Valle de Punilla (La Falda y alrededores) que buscan cambiar o comprar auto o moto, 0KM o usado, y casi siempre deciden por WhatsApp después de mirar el stock desde el celular. Segundo público: turistas o locales que necesitan alquilar un auto por días o semanas.

## Product Purpose

Sitio de Amelio Ortiz, concesionario familiar de autos y motos en Av. España 575, La Falda, Córdoba. Muestra el stock (cargado por los dueños desde el panel admin) y lleva al visitante a consultar por WhatsApp. Éxito: consultas por WhatsApp sobre unidades concretas, sobre financiación/permuta y sobre alquiler.

## Positioning

Empresa familiar con más de 46 años en La Falda, atendida por sus dueños. Además de compraventa ofrece alquiler de autos (por día o semana — no por mes —, seguro de todo riesgo incluido, silla y booster sin costo), algo que otras agencias de la zona no tienen.

## Operating Context

- El contacto es WhatsApp (5493548663333, "03548 66-3333"); línea fija 3548 426380 para alquiler, de 9 a 13 y de 17 a 20 hs. Instagram @amelioortiz.autosymotos.
- Las fotos de stock son de celular, sacadas por los dueños en la vereda del local (ver fiat-cronos-*.jpg): verticales, con texto sobreimpreso a veces, fondos de calle.
- Precio muchas veces "a consultar"; puede estar en ARS o USD.

## Capabilities and Constraints

- Static HTML + Tailwind CDN + vanilla JS, sin build. Deploy a Cloudflare Pages subiendo zip (amelioortiz.pages.dev).
- Catálogo, home y ficha (`vehiculo.html?id=`) se alimentan de Supabase (`vehiculos-repo.js`); si Supabase no devuelve nada, se muestran las cards de ejemplo estáticas. Hoy la tabla está vacía.
- Filtros del catálogo (marca, año, precio, combustible, transmisión, orden, búsqueda), lightbox de fotos, buscador en header que lleva al catálogo.
- Panel admin (`admin-*.html`) fuera de alcance del rediseño: debe seguir funcionando sin cambios.
- Datos de contacto centralizados en `data.js`.

## Brand Commitments

- Nombre "Amelio Ortiz", bajada "Autos y Motos". Logo: `logo-amelio.png` (wordmark manuscrito naranja + blanco sobre azul marino).
- Tagline vigente: "La experiencia nos respalda, tu confianza nos elige."
- Español rioplatense, voseo.

## Evidence on Hand

- Logo, 9 logos de marcas (`marcas/`), fotos de un Fiat Cronos 2023 real (`fiat-cronos-1..7.jpg`).
- Cuatro reseñas reales de Google ya publicadas en `nosotros.html` (Sara Mendoza Music, Sofía Anselmi, Claudio Ungefug, Alejandra Paglia), con respuestas del propietario.
- No hay fotos del local, del equipo ni históricas, ni cifras de ventas o premios: no inventar ninguno. Las fotos de paisaje son de stock (Unsplash) hasta tener propias.

## Product Principles

1. Cada camino termina en un WhatsApp con contexto (qué unidad, qué servicio).
2. La trayectoria familiar es la prueba principal; mostrarla con hechos, no con adjetivos.
3. El stock real (fotos de celular) tiene que verse digno dentro del diseño.
4. Alquiler es un diferencial, no un apéndice.
5. Mobile primero: la mayoría llega desde un link de WhatsApp o Instagram.
