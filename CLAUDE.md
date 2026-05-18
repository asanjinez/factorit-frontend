# factorit · front

Una sola pantalla = una mesa de trabajo cenital dibujada a mano. El brief completo está en `context.md` (leerlo). Esto es solo el contrato visual para que los componentes sean consistentes entre sí.

## Stack

React + Vite + Tailwind + Framer Motion + dnd-kit + rough.js + Zustand + TanStack Query. Sin comentarios en el código. KISS.

## Tokens de diseño (usar SIEMPRE estos, no improvisar)

- Papel / fondo mesa: `#F4ECD8`. Trazo tinta: `#2B2522`. Rojo error: `#C0392B`. Acento confirmar: `#1E6F5C`. Sello descuento: `#B5651D`. Sello VIP / dorado: `#D4AF37`.
- Tipografía mundo: `"Patrick Hand"` (títulos/etiquetas manuscritas). Mono SOLO para la nota de API: `"DM Mono"`.
- Sombra de objeto sobre la mesa: `0 6px 0 rgba(43,37,34,.12)` (proyectada, no blur suave).

## rough.js

- **Seed fijo por tipo de objeto** para que no se redibuje distinto en cada render: carrito `seed: 1`, bolsa `seed: 2`, cajón `seed: 3`, etiqueta de precio `seed: 4`. Mismo objeto = mismo seed siempre.
- Defaults compartidos: `roughness: 1.8`, `bowing: 1.5`, `strokeWidth: 2.2`, `stroke: '#2B2522'`. Relleno cuando aplique: `fillStyle: 'hachure'`, `hachureGap: 6`.
- Filtro SVG `feTurbulence` + `feDisplacementMap` global sutil para el "ink boil" (baseFrequency ~`0.012`, scale ~`2`). Un solo `<filter>` reutilizado.

## Animación (Framer Motion)

- **squash & stretch** (carrito recibe item, "GULP"): `scale` a `[1, .85, 1.05, 1]`, `duration: .35`, `ease: 'easeOut'`.
- **poof** (etiqueta desaparece / carrito se elimina): `scale 1→1.3→0` + `opacity 1→0`, `duration: .4`.
- **caída con rebote** (carrito nuevo / al recargar): `type: 'spring', stiffness: 260, damping: 14`, posiciones dispersas random.
- **arco de salto** (item a otro carrito): bezier en `x`/`y`, `duration: .5`.
- **ticket volando al cajón**: `duration: .7`, `ease: [.4,0,.2,1]`.
- Loader doodle = lápiz garabateando mientras la mutation está pendiente (estado optimista).

## Arrastre (dual, no mezclar)

- **dnd-kit**: todo gesto con drop target (sticker→carrito, item→carrito, carrito→bolsa, item→papelera). Usar sus sensores y collision detection, no hit-testing manual.
- **Framer Motion**: arrastre libre de carritos por el lienzo + todas las animaciones visuales. Nunca FM `drag` para drop targets; nunca dnd-kit para animaciones.

## Store Zustand (solo memoria de sesión)

```
carritos: { id: string; x: number; y: number; isSpecial?: boolean }[]
apiLog:   { method: string; path: string; status: number; ms: number; ts: number }[]
```

- Posición de carrito y flag común/especial viven solo acá (no se persisten; tras recargar la posición se re-randomiza y el rótulo común/especial se pierde — no mostrarlo si se desconoce).
- Todos los fetches por TanStack Query; mutations con `onMutate`/`onError`/`onSettled` para el flujo optimista. Backend = fuente de verdad de items/totales/descuentos.

## Backend

El front no valida nada y no inventa el contrato: ver `context.md` (endpoints, `CarritoResponse`, `CompraResponse`, `Descuento`, errores). Vite proxya `/api/...` → `http://localhost:8080`.
