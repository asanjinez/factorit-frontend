import { useEffect, useRef, useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useDragControls,
  animate,
} from 'framer-motion'
import Doodle from './Doodle'
import { drawCarrito } from '../lib/shapes'
import { Poof, PencilLoader } from './effects'
import { useStore } from '../store'
import { useBorrarCarrito } from '../hooks/queries'

const CW = 150
const CH = 120
const BAND_H = 144

function shield(listeners) {
  return {
    ...listeners,
    onPointerDown: (e) => {
      e.stopPropagation()
      listeners?.onPointerDown?.(e)
    },
  }
}

const ETIQUETA = {
  PROMO_4X3: '4×3',
  DESCUENTO_CANTIDAD: '%',
  COMPRA_VIP: '★',
}

function MarcaDescuento({ d, className = '' }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0, rotate: -25 }}
      animate={{ scale: 1, rotate: -8 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      className={`group relative ${className}`}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-confirmar bg-papel font-mano text-[12px] leading-none text-confirmar shadow-mesa">
        {ETIQUETA[d.tipo] || '%'}
      </div>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-confirmar bg-papel px-2 py-[2px] font-mano text-[12px] leading-tight text-confirmar shadow-mesa group-hover:block">
        {d.descripcion} · –${Number(d.monto).toLocaleString('es-AR')}
      </div>
    </motion.div>
  )
}

function DescuentoCadena({ d }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.4, opacity: 0, y: -8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="group relative flex flex-col items-center"
    >
      <div className="h-3 w-[2px] bg-tinta/70" />
      <div className="-mt-[1px] rounded-md border-2 border-confirmar bg-confirmar/10 px-2 py-[2px] font-mano text-[14px] leading-tight text-confirmar">
        {ETIQUETA[d.tipo] || '%'}{' '}
        <span className="font-semibold">
          –${Number(d.monto).toLocaleString('es-AR')}
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-confirmar bg-papel px-2 py-[2px] font-mano text-[12px] leading-tight text-confirmar shadow-mesa group-hover:block">
        {d.descripcion} · –${Number(d.monto).toLocaleString('es-AR')}
      </div>
    </motion.div>
  )
}

function ItemColgante({ carrito, item, descuentos }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `item-${carrito.id}-${item.id}`,
    data: {
      type: 'item',
      carritoId: carrito.id,
      itemId: item.id,
      item: { nombre: item.nombre, precio: Number(item.precioUnitario), cantidad: item.cantidad },
    },
    disabled: !!item._pending,
  })
  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...shield(listeners)}
      layout
      initial={{ scale: 0.4, opacity: 0, y: -8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative flex flex-col items-center"
      style={{ opacity: isDragging ? 0.2 : 1, touchAction: 'none' }}
    >
      <div className="h-3 w-[2px] bg-tinta/70" />
      <motion.div
        whileHover={{ y: -3, rotate: -3 }}
        className="relative -mt-[1px] cursor-grab rounded-md border-2 border-tinta bg-papel/90 px-2 py-[2px] font-mano text-[14px] leading-tight"
      >
        {item.nombre} <span className="text-sello">x{item.cantidad}</span>
        {item._pending && (
          <span className="absolute -left-2 -top-3">
            <PencilLoader size={16} />
          </span>
        )}
        <div className="absolute -right-2 -top-3 flex gap-1">
          <AnimatePresence>
            {descuentos.map((d) => (
              <MarcaDescuento key={d.tipo + (d.productoNombre || '')} d={d} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Carrito({ carrito, pos, onFinalizar, onSobreFinalizacion }) {
  const especiales = useStore((s) => s.especiales)
  const setPosicion = useStore((s) => s.setPosicion)
  const borrar = useBorrarCarrito()
  const [dying, setDying] = useState(false)
  const [poof, setPoof] = useState(false)
  const especial = especiales[carrito.id]
  const dragging = useRef(false)
  const sobreRef = useRef(false)
  const rootRef = useRef(null)
  const dragControls = useDragControls()
  const x = useMotionValue(pos.x)
  const y = useMotionValue(pos.y - 260)

  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: `cart-${carrito.id}`,
    data: { type: 'carrito', carritoId: carrito.id },
  })

  useEffect(() => {
    const c = animate(y, pos.y, { type: 'spring', stiffness: 260, damping: 14 })
    return () => c.stop()
  }, [])

  useEffect(() => {
    if (dragging.current) return
    if (x.get() !== pos.x) animate(x, pos.x, { duration: 0.25 })
    if (y.get() !== pos.y) animate(y, pos.y, { duration: 0.25 })
  }, [pos.x, pos.y])

  const cantRef = useRef(carrito.cantidadProductos)
  const [squash, setSquash] = useState(false)
  useEffect(() => {
    if (carrito.cantidadProductos !== cantRef.current) {
      cantRef.current = carrito.cantidadProductos
      setSquash(true)
      const t = setTimeout(() => setSquash(false), 360)
      return () => clearTimeout(t)
    }
  }, [carrito.cantidadProductos])

  const sobreFinalizacion = () => {
    const r = rootRef.current?.getBoundingClientRect()
    return !!r && r.bottom >= window.innerHeight - BAND_H
  }

  const descTotal = (carrito.descuentos || []).filter((d) => d.nivel === 'TOTAL')
  const descItemDe = (nombre) =>
    (carrito.descuentos || []).filter((d) => d.nivel === 'ITEM' && d.productoNombre === nombre)

  return (
    <motion.div
      ref={rootRef}
      drag={!dying}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ cursor: 'grabbing' }}
      onDragStart={() => {
        dragging.current = true
      }}
      onDrag={() => {
        const o = sobreFinalizacion()
        if (o !== sobreRef.current) {
          sobreRef.current = o
          onSobreFinalizacion?.(o)
        }
      }}
      onDragEnd={() => {
        dragging.current = false
        setPosicion(carrito.id, x.get(), y.get())
        const o = sobreFinalizacion()
        sobreRef.current = false
        onSobreFinalizacion?.(false)
        if (o && !carrito._pending) onFinalizar?.(carrito.id)
      }}
      initial={{ opacity: 0, rotate: -8 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute left-0 top-0 select-none"
      style={{ x, y, width: CW, touchAction: 'none', zIndex: isOver ? 30 : 10 }}
    >
      <div ref={dropRef} className="relative">
        <AnimatePresence>{poof && <Poof size={160} />}</AnimatePresence>

        <motion.div
          animate={dying ? { scale: 0.14, rotate: 64, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeIn' }}
          onAnimationComplete={() => {
            if (dying && !poof) {
              setPoof(true)
              setTimeout(() => borrar.mutate({ carritoId: carrito.id }), 650)
            }
          }}
        >
          <motion.div
            onPointerDown={(e) => {
              if (!dying) dragControls.start(e)
            }}
            animate={squash ? { scale: [1, 0.85, 1.06, 1] } : { scale: isOver ? 1.05 : 1 }}
            transition={squash ? { duration: 0.35, ease: 'easeOut' } : { duration: 0.2 }}
            className="cursor-grab"
            style={{ width: CW, height: CH }}
          >
            <Doodle
              width={CW}
              height={CH}
              memoKey={`cart-${especial ? 's' : 'n'}`}
              draw={(g) => drawCarrito(g, especial)}
            />
            {isOver && (
              <div className="absolute inset-x-0 -top-5 text-center font-mano text-[14px] text-confirmar">
                soltá acá ✦
              </div>
            )}
          </motion.div>

          {especial !== undefined && (
            <div className="absolute -left-1 top-1 -rotate-12 font-mano text-[13px] text-sello">
              {especial ? '★ especial' : 'común'}
            </div>
          )}

          <button
            onClick={() => !dying && setDying(true)}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-tinta bg-papel font-mano text-[15px] leading-none text-tinta active:scale-90"
            title="arrugar carrito"
          >
            ✕
          </button>

          {carrito._pending && (
            <div className="absolute left-1/2 top-2 -translate-x-1/2">
              <PencilLoader />
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-start justify-center gap-x-2 gap-y-1 px-1">
            <AnimatePresence mode="popLayout">
              {carrito.items.map((it) => (
                <ItemColgante
                  key={it.id}
                  carrito={carrito}
                  item={it}
                  descuentos={descItemDe(it.nombre)}
                />
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {descTotal.map((d) => (
                <DescuentoCadena key={d.tipo} d={d} />
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-2 flex items-end justify-center gap-2">
            <div className="relative">
              <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-2 border-tinta bg-papel" />
              <div className="rounded-md border-2 border-tinta bg-papel px-3 py-1 text-center font-mano leading-tight shadow-mesa">
                <div className="text-[13px] text-tinta/70">total</div>
                <div className="text-[20px] text-tinta">
                  ${Number(carrito.total).toLocaleString('es-AR')}
                </div>
                {Number(carrito.descuentoTotal) > 0 && (
                  <div className="text-[12px] text-confirmar">
                    ahorrás –${Number(carrito.descuentoTotal).toLocaleString('es-AR')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {!carrito._pending && carrito.items.length > 0 && (
            <div className="mx-auto mt-2 w-fit rounded-full border-2 border-dashed border-confirmar/70 px-3 py-[2px] font-mano text-[13px] text-confirmar/80">
              arrastrame a finalización ↓
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
