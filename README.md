# Factorit Frontend

Frontend minimo para probar el flujo del backend de carrito, checkout y compras.

## Tecnologias

- React
- Vite
- Tailwind CSS
- TanStack Query
- Zustand
- dnd-kit
- Framer Motion
- canvas-confetti

## Ejecucion

El backend debe estar levantado en:

```text
http://localhost:8080
```

Instalar dependencias y levantar Vite:

```bash
npm install
npm run dev
```

La app queda disponible normalmente en:

```text
http://localhost:5173
```

Vite usa proxy para enviar `/api/*` al backend en `localhost:8080`.

## Uso

- Los carritos se crean desde el sector superior izquierdo.
- Se puede crear un carrito comun o especial.
- Los productos disponibles estan en el sector superior derecho.
- Para agregar un producto, se arrastra sobre un carrito.
- Cada producto permite ajustar cantidad antes de agregarlo.
- Los items dentro de un carrito se pueden mover a otro carrito.
- Para eliminar un item, se arrastra fuera del carrito.
- Para eliminar un carrito completo, se usa la accion de cierre del carrito.
- Para hacer checkout, se arrastra el carrito al sector inferior de finalizacion y se ingresa un DNI.
- Las compras se consultan desde el panel lateral izquierdo.
- El panel de compras permite filtrar por DNI, fechas y ordenar por fecha o monto.
- El bloque inferior derecho muestra las ultimas llamadas realizadas al backend.

## Aclaraciones

El frontend no guarda datos propios.
Toda la informacion se obtiene del backend (H2 en memoria).
Al recargar la pantalla, la app vuelve a consultar carritos y compras disponibles.
