---

Construí el frontend del proyecto factorit. NO es un dashboard: es una sola pantalla = una MESA DE TRABAJO vista de arriba, dibujada a mano (doodle), con objetos tirados que se manipulan con la mano. Nada de paneles con header, grillas de tarjetas, tablas de columnas ni transiciones sobrias.

## Vibra y mundo
- Estética: mesa/papel cenital, todo trazo a mano, cálido y táctil.
- Tipografía manuscrita de carácter (ej: "Shantell Sans" o "Patrick Hand") para el mundo; un mono legible (ej: "DM Mono") SOLO para la nota de API.
- Formas dibujadas a mano de verdad: usar rough.js para carrito, bolsa y cajón; un filtro SVG feTurbulence/feDisplacementMap sutil para que las líneas "hiervan" (ink boil). Squash & stretch en todo lo interactivo.

## Arrastre — arquitectura dual (IMPORTANTE)
- **dnd-kit** es la base para todos los gestos con semántica de "soltar sobre algo": sticker→carrito, item→otro carrito, carrito→bolsa, item→papelera. Usar sus sensores y collision detection built-in; NO reinventar hit-testing manual.
- **Framer Motion** para el arrastre libre de carritos por el lienzo (posición en memoria, inercia, rebote) y para TODAS las animaciones visuales (squash & stretch, poof, caída, arco de salto, etc.).
- Nunca usar Framer Motion `drag` para gestos que necesiten drop targets; nunca usar dnd-kit para animaciones puras.

## Objetos y zonas (todo posicionado libre en el lienzo)
- CARRITOS: dibujos rough.js reconocibles con canasta y rueditas, arrastrables a cualquier lado con inercia. Al recargar caen del tope y rebotan en posiciones dispersas (sin persistir posición).
- PRODUCTOS: etiquetas de precio de cartón con hilo (como las que cuelgan de ropa/góndola), tiradas en una esquina. Cada etiqueta tiene su cantidad ajustable para poder disparar el 4x3. Son hardcodeadas en el front.
- LA BOLSA: una bolsa/caja de cartón dibujada en rough.js. Soltás un carrito encima → aparece sobre la bolsa una etiqueta manuscrita "DNI ____" (sin validar nada en el front) → confirmar = la bolsa se infla, confetti, *crunch* + poof grande, y sale un ticket volando hacia el cajón con el total escrito grande. El carrito desaparece (el backend lo borró).
- EL CAJÓN: una gaveta en un borde de la mesa; se abre y adentro SÍ hay una lista de compras estilo recibos/fichas, con filtros manuscritos: todas / por dni + from-to, orden fecha|monto, dir asc|desc. Es el único lugar tipo "lista" permitido.
- NOTA DE API: cada request real dispara una nota manuscrita que sube desde abajo (MÉTODO path · status · ms); historial apilable en un bloc.

## Flujos (cada gesto = 1 request real al backend)
- Crear carrito (común/especial): el carrito se "garabatea" en el aire y cae con rebote. → POST /carritos {special}
- Soltar etiqueta en un carrito: la etiqueta se encoge y *poof* (nube cartoon); el carrito hace GULP/squash. → POST /carritos/{id}/items
- Mover item a otro carrito: salta en arco, poof en destino. → DELETE item en origen + POST item en destino
- Quitar item: lo arrastrás fuera del carrito y se cae de la mesa (*fffp*). → DELETE /carritos/{id}/items/{itemId}
- Carrito → bolsa + DNI: crunch + poof + confetti + ticket con total volando al cajón; si hay VIP, sello dorado "VIP" estampado con chispas. → POST /carritos/{id}/checkout {dni}
- Eliminar carrito: lo arrugás y poof. → DELETE /carritos/{id}
- Cajón: hidrata y filtra. → GET /compras (y variantes por dni/from/periodo)

## Contenido del carrito (NO tabla)
Items como mini-etiquetas colgando del carrito con su "x{cant}". Total como etiqueta manuscrita con clip.

Descuentos — cada tipo tiene su representación física distinta:
- **PROMO_4X3** (nivel ITEM): un sticker "GRATIS" rotado encima del item que se regala, matcheado por productoNombre.
- **DESCUENTO_CANTIDAD** (nivel TOTAL): sello de goma torcido cerca del total que dice "$100 OFF" o "$150 OFF" según corresponda.
- **COMPRA_VIP** (nivel TOTAL): sello dorado con estrella, solo aparece tras el checkout en el ticket.

Aparecen/desaparecen solos según los manda el backend, animados.

## Tiempo real, sin cortes, recarga
Optimista: al soltar algo queda un placeholder con un lápiz garabateando (loader doodle), sin saltos de layout; cuando llega el CarritoResponse real se "entinta" definitivo; si falla, se borra con goma y cae un papelito rojo arrugado con el error. Al recargar se rehidrata del backend (estado en H2, front stateless): GET /carritos + GET /compras.

## Estado global
- **Zustand** para estado en memoria: carritos (posiciones en lienzo, flag común/especial de sesión), historial del API log.
- **TanStack Query** para todos los fetches: mutations con `onMutate`/`onError`/`onSettled` para el flujo optimista.

## Contrato del backend (NO inventar; el front no valida nada)
Proxy de Vite: el front llama /api/... y Vite lo reescribe a http://localhost:8080 (sin tocar el backend, sin CORS).

- POST /carritos body {special:boolean} → CarritoResponse
- DELETE /carritos/{id} → 200 vacío
- POST /carritos/{id}/items body {nombre, precio>100, cantidad>0} → CarritoResponse
- DELETE /carritos/{id}/items/{itemId} → 200 vacío
- GET /carritos → CarritoResponse[]
- GET /carritos/{id} → CarritoResponse
- POST /carritos/{id}/checkout body {dni} → CompraResponse (borra el carrito)
- GET /compras?sort=fecha|monto&direction=asc|desc → CompraResponse[]
- GET /compras/{dni}?sort&direction
- GET /compras/{dni}/from?from=YYYY-MM-DD&sort&direction
- GET /compras/{dni}/periodo?from=YYYY-MM-DD&to=YYYY-MM-DD&sort&direction

CarritoResponse: { id, cantidadProductos, subtotal, descuentoTotal, total, descuentos: Descuento[], items: {id, nombre, precioUnitario, cantidad}[] }
CompraResponse: { id, dni, fecha (ISO), subtotal, descuentoTotal, total, descuentos: Descuento[], items: {nombre, precioUnitario, cantidad}[] }
Descuento: { tipo:'PROMO_4X3'|'DESCUENTO_CANTIDAD'|'COMPRA_VIP', nivel:'ITEM'|'TOTAL', descripcion, monto, productoNombre|null }
- PROMO_4X3: nivel ITEM, productoNombre = a qué producto pertenece.
- DESCUENTO_CANTIDAD: nivel TOTAL, $100 común / $150 especial.
- COMPRA_VIP: nivel TOTAL, $500, SOLO aparece en el checkout.

Error (cualquier fallo): { code, message, status, path, timestamp }
- precio ≤ 100 → error; checkout con carrito vacío → error.
- DNI: el backend valida DNI numérico de 8 dígitos (DniInvalidException), en checkout y en consultas por dni. El front manda tal cual y muestra el error como papelito rojo arrugado.
- CarritoResponse NO trae isSpecial: común/especial se sabe solo al crear; recordarlo en memoria para el rótulo; si se desconoce (tras recargar), no mostrar el rótulo.

## Stack y reglas
- React + Vite + Tailwind + Framer Motion + dnd-kit + rough.js + Zustand + TanStack Query.
- KISS, sin sobre-ingeniería, SIN comentarios en el código (que se explique solo). El doodle es intencional, no un look genérico.
- Una sola pantalla. Doc en español, frontend = scope mínimo.

## Lo que NO quiero
Paneles con borde y header, grilla de tarjetas, columnas/tabla (salvo dentro del cajón), selects/formularios "de admin" sueltos, transiciones sobrias, look corporativo. La pantalla por defecto es la mesa con cosas tiradas; lo único "lista" es el cajón.

---

Asumí 3 cosas:
- El DNI se pide como etiqueta manuscrita sobre la bolsa al soltar el carrito (no antes).
- Las etiquetas de producto traen un mini-ajuste de cantidad (necesario para demostrar el 4x3).
- Común/especial solo se rotula en la sesión; tras recargar no se muestra (sin localStorage).

---

**Sobre skills de Claude Code** — para este proyecto específico lo más útil sería:

Una skill de **UI component design** que le dé contexto de rough.js, las convenciones de animación con Framer Motion, y la paleta/tipografía de la mesa. Básicamente un `CLAUDE.md` en el proyecto con:

- Los tokens de diseño (colores de papel, tipografías, seed de rough.js para que los objetos sean consistentes)
- Ejemplos de cómo se dibuja un carrito vs una bolsa en rough.js
- Las convenciones de animación (duración, easing, qué es squash vs poof)
- El contrato de la store de Zustand

Eso evita que Claude Code reinvente la rueda en cada componente. Sin ese contexto va a generar componentes inconsistentes entre sí visualmente.