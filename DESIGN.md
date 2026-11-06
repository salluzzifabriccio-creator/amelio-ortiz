---
name: Amelio Ortiz
description: Agencia familiar de autos y motos en La Falda, contada con el sistema de las postales serranas sobre el azul del logo.
colors:
  azul: "#1d3059"
  azul-hondo: "#152446"
  azul-noche: "#0d1830"
  azul-claro: "#283e6d"
  azul-texto: "#c3cee6"
  azul-tenue: "#9fb1d6"
  naranja: "#f09428"
  naranja-vivo: "#f5a54a"
  naranja-tinta: "#a85e0b"
  reservado-tinta: "#8a4b00"
  papel: "#ffffff"
  dorso: "#f4f6fb"
  tinta: "#17203a"
  tinta-suave: "#4a5474"
  renglon: "#cdd5e6"
typography:
  bloque:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17.5cqw"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 125"
  titulo:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112"
  ficha:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 108"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.625
  rotulo:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 85"
  saludo:
    fontFamily: "Yellowtail, cursive"
    fontSize: "clamp(1.875rem, 8.4cqw, 3rem)"
    fontWeight: 400
    letterSpacing: "0"
  mano:
    fontFamily: "Caveat, cursive"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "0"
rounded:
  foto: "4px"
  estampa: "6px"
  campo: "8px"
  postal: "10px"
  postal-grande: "12px"
  marco: "14px"
  pill: "999px"
spacing:
  borde-postal: "10px"
  borde-hero: "12px"
  ficha: "0.95rem"
  seccion: "5rem"
  seccion-lg: "7rem"
components:
  button-sello:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.azul-noche}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.5rem"
  button-sello-hover:
    backgroundColor: "{colors.naranja-vivo}"
  button-linea:
    backgroundColor: "transparent"
    textColor: "{colors.papel}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.5rem"
  button-tinta:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.papel}"
    rounded: "{rounded.pill}"
    padding: "0.72rem 1.05rem"
  button-tinta-hover:
    backgroundColor: "{colors.azul-claro}"
  button-papel-linea:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    padding: "0.72rem 1.05rem"
  postal:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.postal}"
    padding: "{spacing.borde-postal}"
  dorso:
    backgroundColor: "{colors.dorso}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.campo}"
  estampa-0km:
    backgroundColor: "rgba(255, 255, 255, 0.92)"
    textColor: "{colors.azul}"
    rounded: "{rounded.estampa}"
    padding: "0.32rem 0.65rem"
  estampa-reservado:
    backgroundColor: "rgba(255, 255, 255, 0.92)"
    textColor: "{colors.reservado-tinta}"
    rounded: "{rounded.estampa}"
    padding: "0.32rem 0.65rem"
  campo:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    padding: "0.6rem 0.1rem"
  campo-caja:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.campo}"
    padding: "0.55rem 0.7rem"
---

# Design System: Amelio Ortiz

## Overview

**Creative North Star: "Saludos desde La Falda"**

> Cambio pedido por el cliente (2026-10-25): sin letras manuscritas — Yellowtail y Caveat quedan fuera del sitio; todo en Archivo.
>
> Otro cambio pedido por el cliente (2026-10-25): el sitio alterna bandas azules con bandas claras de papel (`.zona-clara`, #eef2f8, y `.zona-blanca`, #fff) para no ser todo azul. La regla "Blue Field" queda reemplazada por esta alternancia: hero, destacados, reseñas del inicio, cierre y footer en azul; marcas, alquiler, familia, catálogo, contacto y reseñas de páginas internas en claro. La tira de marcas volvió a su versión original (logos sueltos sobre blanco, sin sellos).

El sitio es una mesa de postales serranas apoyada sobre el azul del logo. Cada pieza de contenido que se lee de cerca (un auto del stock, una reseña, un horario, un formulario) es un objeto de papel: postal blanca con borde, dorso rayado, sello dentado, matasellos. El campo azul es el correo, el fondo sobre el que llegan las cosas; nunca se interrumpe con franjas claras.

La densidad es de vidriera de pueblo, no de portal: grillas de tres postales, secciones amplias, una sola acción naranja a la vista. El carácter viene del oficio postal (perforado, tinta de goma, ribete por avión, letras en bloque con foto adentro), no de efectos. El movimiento tiene peso: las postales caen y suben al pasar, y la del hero se da vuelta sobre su eje. Nada va girado: por pedido del cliente (2026-10-25), todo el sitio va derecho.

Rechazo confirmado por el contrato de dirección: el hero oscuro con auto recortado y la grilla genérica de tarjetas que publica cualquier concesionaria.

**Key Characteristics:**
- Campo azul del logo a página completa; el papel vive solo dentro de postales y sobres con borde.
- Naranja del logo gastado una vez por pantalla: la acción principal o un sello.
- Postales, sellos y matasellos siempre derechos (sin rotación).
- Estados del stock estampados sobre la foto, como matasellos.
- Archivo en tres anchos para todo; dos manos (Yellowtail, Caveat) con un único trabajo cada una.

## Colors

Dos colores tomados por píxel del logo, azul y naranja, más papel y tinta: una paleta de correo, no de catálogo.

### Primary
- **Naranja Amelio** (naranja): el trazo "Amelio" del logo. Botón de acción principal, estrellas de reseñas, foco, selección, pulgar del slider, borde inferior del campo en foco. Su rareza es la regla.
- **Naranja Vivo** (naranja-vivo): solo el hover del botón naranja.
- **Naranja Tinta** (naranja-tinta): el naranja cuando tiene que leerse como texto sobre papel (marca "Financiación" en la ficha).

### Neutral
- **Azul Logo** (azul): el suelo de todas las páginas, el header y el botón de consulta sobre papel. También tinta de la estampa 0KM.
- **Azul Hondo** (azul-hondo): fondo de la foto mientras carga, buscador del header, sombra intermedia de las letras en bloque.
- **Azul Noche** (azul-noche): footer, texto sobre el botón naranja, pista de scrollbar, base de la extrusión de letras.
- **Azul Claro** (azul-claro): hover del botón de tinta, franja azul del marco por avión, pulgar de scrollbar.
- **Azul Texto** (azul-texto): bajadas y navegación en reposo sobre el campo azul.
- **Azul Tenue** (azul-tenue): placeholders e íconos secundarios sobre azul.
- **Papel** (papel): la postal y su borde blanco.
- **Dorso** (dorso): blanco frío del reverso de la postal; superficies de formulario, contacto, horarios.
- **Tinta / Tinta Suave** (tinta, tinta-suave): texto principal y secundario sobre papel.
- **Renglón** (renglon): las líneas del dorso, divisores de ficha, borde de campos.
- **Tinta Reservado** (reservado-tinta): solo la estampa "Reservado".

`navy-900` (azul-hondo) puede alternar como banda de sección sobre el campo; sigue siendo azul.

### Named Rules
**The One Stamp Rule.** El naranja aparece una vez por pantalla: la acción principal o un sello. Si dos elementos naranjas comparten el viewport, uno de los dos pasa a contorno, a tinta azul o a blanco.

**The Blue Field Rule.** El fondo de la página es siempre el azul del logo (o su banda hondo/noche). El papel y el dorso solo existen dentro de una postal o sobre con borde y sombra; nunca como banda clara a ancho completo.

## Typography

**Display Font:** Archivo, extendido (con ui-sans-serif, system-ui)
**Body Font:** Archivo (con ui-sans-serif, system-ui)
**Label Font:** Archivo condensado
**Manos:** Yellowtail (saludo) y Caveat (escritura del dorso)

**Character:** Una sola familia variable que cambia de ancho según el trabajo, como el cuerpo de una imprenta de pueblo: ancha y negra para las letras de postal, apenas extendida para titulares, condensada para rótulos de correo. Las dos manos ponen la voz de quien escribe la postal.

### Hierarchy
- **Bloque** (900, ancho 125%, mayúsculas): reservado; el frente del hero hoy es el logo, no letras en bloque.
- **Título** (800, ancho 112%, -0.025em, 1.04, `text-wrap: balance`): h1 y h2 de sección sobre azul o dentro del dorso. 2.35rem en celular hasta 3.5rem en desktop ancho.
- **Ficha** (800, ancho 108%, 1.15rem): nombre del vehículo y precio en la postal del stock; el año en 600 tabular, tinta suave.
- **Body** (400, ~1.05–1.125rem, 1.6): bajadas en azul texto con `text-wrap: pretty`, máximo ~28–32rem de ancho.
- **Rótulo** (700, ancho 85%, 0.08–0.14em, mayúsculas): etiquetas de campo, encabezados de columna del footer, leyendas de postal, texto de estampas y matasellos.

### Named Rules
**The Two Hands Rule.** Yellowtail es la mano del saludo: las líneas "Saludos desde". Caveat es la mano del dueño: lo escrito a mano en el dorso de una postal (mensaje del dorso, respuesta del dueño a una reseña, la nota "¿Buscás un modelo?"). Ninguna de las dos se usa para titulares, botones ni datos.

**The Tabular Figures Rule.** Kilómetros, años, precios, teléfonos y horarios van en cifras tabulares.

## Layout

Contenedor de 80rem (max-w-7xl) con márgenes de 1rem / 1.5rem / 2rem. Las secciones respiran 5rem en celular y 7rem desde 640px. El hero usa una grilla de 12: titular 5/12 a la izquierda, postal 7/12 a la derecha; en celular la postal va arriba a ancho completo y el titular y las dos acciones debajo, ambos visibles en 812px de alto.

El stock es una grilla de 1, 2 y 3 columnas con gutter generoso (2rem horizontal, 3rem vertical) para que las postales respiren. Dentro de la postal, los datos se ordenan en renglones: tres celdas divididas por líneas de renglón, nunca etiquetas sueltas.

**The Hero Ratio Rule.** La postal del hero es 5:4 por debajo de 640px y 3:2 desde 640px. Su contenido interno escala con unidades de contenedor (`cqw`), así la postal se lee igual en cualquier ancho.

Breakpoints: 640px (sm), 1024px (lg), 1280px (xl, aparece el buscador del header).

## Elevation & Depth

La profundidad es física: papel apoyado sobre una mesa azul. Hay una sola sombra de postal, de tres capas, y todo objeto de papel la comparte; el plano azul no tiene sombra propia. El hover de la postal del stock levanta la misma sombra más lejos. El header gana una línea y una sombra suave solo al hacer scroll.

### Shadow Vocabulary
- **Postal** (`0 1px 1px rgba(5,10,25,.18), 0 10px 24px -6px rgba(5,10,25,.45), 0 30px 60px -20px rgba(5,10,25,.55)`): postales, caras del hero, marco por avión, panel de filtros.
- **Postal levantada** (`0 1px 1px rgba(5,10,25,.18), 0 18px 34px -8px rgba(5,10,25,.55), 0 44px 80px -24px rgba(5,10,25,.6)`): hover y foco de la postal del stock.
- **Sello** (`drop-shadow(0 2px 3px rgba(5,10,25,.3))`): sigue el contorno dentado del sello.
- **Botón naranja** (brillo inset de 1px más sombra corta): el único botón con relieve.

### Named Rules
**The One Paper Rule.** Todo lo que es papel usa la sombra de postal; nada sobre el azul inventa otra elevación.

**The Block Letter Exception.** La extrusión escalonada (sombras de texto en capas azul → hondo → noche) es propia de las letras en bloque de la postal y de los saludos impresos sobre la foto. No se traslada a cajas, botones ni tarjetas.

## Shapes

Esquinas suaves de papel cortado: 10px la postal, 12px la postal del hero, 14px el marco por avión, 8px el dorso interior y las cajas de campo, 4px la foto dentro del borde blanco. Botones y buscador son píldoras completas. La estampa de estado tiene 6px y doble trazo; el sello de goma 2px con contorno doble y tinta despareja (máscara de ruido). El sello postal es dentado: perforado con gradiente radial, nunca un rectángulo liso.

Nada se gira. Postales, reseñas, sellos, matasellos y estampas van derechos; el cliente pidió explícitamente que no haya elementos cruzados.

## Components

### Buttons
Píldoras firmes, sin adornos; el color dice qué tan importante es.
- **Shape:** píldora completa (999px), 700, 0.95rem; `btn-sm` 0.86rem.
- **Sello (primario):** fondo naranja, texto azul noche, relieve corto. Una por pantalla.
- **Hover / Focus:** el naranja sube 2px y se aclara; todos bajan 1px y escalan 0.98 al presionar. Foco: anillo naranja de 2px a 3px de distancia.
- **Línea (sobre azul):** contorno de 1.5px azul texto al 55%, texto blanco. Es el tratamiento del WhatsApp del header y de la segunda acción del hero.
- **Tinta (sobre papel):** fondo azul logo, texto blanco; "Consultar" por WhatsApp dentro de la postal del stock.
- **Papel línea (sobre papel):** papel con contorno renglón; acciones secundarias como "Ver fotos".
- **Deshabilitado:** gris papel, sin sombra ("Vendido").

### Text Links
- **Style:** blanco, 700, subrayado de 1px en azul texto al 40% con offset 0.3em, flecha en azul tenue. Hover: subrayado blanco y la flecha se separa.
- **Sobre papel:** tinta con subrayado renglón.

### Cards / Containers (la postal)
- **Corner Style:** 10px; foto interior 4px.
- **Background:** papel con borde blanco de 10px alrededor de la foto; dorso para reversos y formularios.
- **Shadow Strategy:** sombra de postal (ver Elevation & Depth).
- **Border:** el propio borde blanco; los dorsos grandes van dentro del marco por avión (ribete diagonal naranja/papel/azul).
- **Internal Padding:** ficha 0.95rem arriba, 0.35rem a los lados.
- **Postal del stock:** foto 4:3, nombre + año, renglones de tres datos, precio tabular, dos acciones. Derecha en reposo; al pasar o enfocar sube 6px (0.55s) y la foto escala 1.04.

### Estampas de estado
Los estados del stock se estampan sobre la foto: rectángulo de 6px con trazo de 2px en el color de la tinta, papel al 92%, rótulo condensado 0.72rem, derecho, esquina superior izquierda. 0KM y Seminuevo en azul, Reservado en tinta reservado. Vendido es un matasellos grande al centro (blanco, trazo de 3px, derecho) y la foto pasa a escala de grises.

### Inputs / Fields
- **Style:** sobre papel, el campo es un renglón: sin caja, solo línea inferior de 1.5px renglón. En el panel de filtros, caja de 8px con borde renglón.
- **Focus:** la línea o el borde pasan a naranja; cursor naranja.
- **Etiqueta:** rótulo condensado 0.72rem, 0.1em, tinta suave, arriba del campo.

### Navigation
- **Style:** header en azul logo, fijo; links Archivo 600 0.9rem en azul texto, blanco al pasar. La página actual va en blanco con una línea blanca de 2px debajo.
- **Mobile:** botón circular de contorno; el menú despliega una lista con renglones blancos al 10% y el WhatsApp como botón sello a ancho completo.

### Sellos, matasellos y sellos de goma
- **Sello postal:** borde dentado de papel con el logo o una marca adentro y contorno interior fino; la tira de marcas es una fila de sellos que corre y alterna -3° / +2.5°.
- **Matasellos:** SVG de doble círculo con texto en arco y ondas, siempre en una sola tinta (blanco o azul) con `currentColor`.
- **Sello de goma:** datos cortos de la oferta ("0KM y usados", "Cuotas propias") en blanco, contorno doble, tinta despareja, derechos.

### Postal del hero (firma)
Postal de dos caras con perspectiva de 1800px. Frente: el logo de Amelio Ortiz (img/logo-wordmark-lg.webp) centrado sobre el azul del logo, con el botón "Dala vuelta". Dorso: mensaje en Caveat, renglones con WhatsApp y dirección, ribete por avión. Se da vuelta con `rotateY(180deg)` en 1s con curva de peso; con movimiento reducido cambia de cara sin girar.

## Do's and Don'ts

### Do:
- **Do** dejar el azul logo como suelo de cada página y alternar bandas solo con azul hondo o noche.
- **Do** gastar el naranja una vez por pantalla, en la acción principal o en un sello.
- **Do** poner el WhatsApp del header como botón de contorno, nunca naranja.
- **Do** dar a los links de texto blanco con subrayado y flecha.
- **Don't** girar postales, sellos ni matasellos: todo va derecho.
- **Do** estampar los estados (0KM, Seminuevo, Reservado, Vendido) sobre la foto.
- **Do** mostrar los datos del vehículo en renglones del dorso, con cifras tabulares.
- **Do** respetar `prefers-reduced-motion`: sin giros, paneos, caídas ni scroll suave.

### Don't:
- **Don't** usar papel o dorso como banda clara a ancho completo; el papel siempre tiene borde, esquina y sombra.
- **Don't** marcar estados con pastillas de color ni badges redondeados.
- **Don't** usar Yellowtail fuera de las líneas "Saludos desde" ni Caveat fuera de lo escrito a mano en una postal.
- **Don't** pintar links de texto en naranja.
- **Don't** trasladar la extrusión de las letras en bloque a cajas o botones.
- **Don't** volver al hero oscuro con auto recortado ni a la grilla de tarjetas sin papel.
