import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import InkFilter from './components/InkFilter'
import CrearCarrito from './components/CrearCarrito'
import TagsPile from './components/TagsPile'
import Carrito from './components/Carrito'
import Bolsa from './components/Bolsa'
import Cajon from './components/Cajon'
import ApiLog from './components/ApiLog'
import { useStore } from './store'
import {
  useCarritos,
  useAgregarItem,
  useQuitarItem,
  useMoverItem,
} from './hooks/queries'

const isTmp = (id) => typeof id === 'string' && id.startsWith('tmp-')

function scatter() {
  const w = window.innerWidth
  const h = window.innerHeight
  return {
    x: 390 + Math.random() * Math.max(120, w - 770),
    y: 150 + Math.random() * Math.max(120, h - 460),
  }
}

export default function App() {
  const { data: carritos = [] } = useCarritos()
  const posiciones = useStore((s) => s.posiciones)
  const ensurePosicion = useStore((s) => s.ensurePosicion)
  const posCache = useRef({})

  const getPos = (id) => {
    if (posiciones[id]) return posiciones[id]
    if (!posCache.current[id]) posCache.current[id] = scatter()
    return posCache.current[id]
  }

  const agregar = useAgregarItem()
  const quitar = useQuitarItem()
  const mover = useMoverItem()

  const [activo, setActivo] = useState(null)
  const [checkoutId, setCheckoutId] = useState(null)
  const [finalHot, setFinalHot] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  useEffect(() => {
    carritos.forEach((c) => {
      if (!isTmp(c.id)) ensurePosicion(c.id, () => getPos(c.id))
    })
  }, [carritos, ensurePosicion])

  const handleDragEnd = ({ active, over }) => {
    setActivo(null)
    const a = active.data.current
    if (!a) return
    const overType = over?.data?.current?.type

    if (a.type === 'tag') {
      if (overType === 'carrito') {
        const carritoId = over.data.current.carritoId
        if (isTmp(carritoId)) return
        agregar.mutate({
          carritoId,
          item: {
            nombre: a.producto.nombre,
            precio: a.producto.precio,
            cantidad: a.cantidad,
          },
        })
      }
      return
    }

    if (a.type === 'item') {
      if (overType === 'carrito' && over.data.current.carritoId !== a.carritoId) {
        const destinoId = over.data.current.carritoId
        if (isTmp(destinoId) || isTmp(a.carritoId) || isTmp(a.itemId)) return
        mover.mutate({
          origenId: a.carritoId,
          itemId: a.itemId,
          destinoId,
          item: a.item,
        })
      } else if (overType !== 'carrito') {
        if (isTmp(a.carritoId) || isTmp(a.itemId)) return
        quitar.mutate({ carritoId: a.carritoId, itemId: a.itemId })
      }
      return
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active }) => setActivo(active.data.current)}
      onDragCancel={() => setActivo(null)}
      onDragEnd={handleDragEnd}
    >
      <InkFilter />
      <div className="mesa-bg absolute inset-0 overflow-hidden">
        <img
          src="/logo.svg"
          alt="factorit"
          className="pointer-events-none absolute left-1/2 top-4 z-0 h-12 -translate-x-1/2 opacity-70"
        />

        <CrearCarrito />
        <TagsPile />

        {carritos.map((c) => {
          const pos = isTmp(c.id)
            ? { x: window.innerWidth / 2 - 75, y: 120 }
            : getPos(c.id)
          return (
            <Carrito
              key={c.id}
              carrito={c}
              pos={pos}
              onFinalizar={(id) => setCheckoutId(id)}
              onSobreFinalizacion={setFinalHot}
            />
          )
        })}

        <Bolsa
          carritoId={checkoutId}
          resaltar={finalHot}
          onClear={() => setCheckoutId(null)}
        />
        <Cajon />
        <ApiLog />
      </div>

      <DragOverlay dropAnimation={null}>
        {activo?.type === 'tag' && (
          <div className="rotate-3 rounded-md border-2 border-tinta bg-papel px-3 py-1 font-mano text-[15px] shadow-mesa">
            {activo.producto.nombre} x{activo.cantidad}
          </div>
        )}
        {activo?.type === 'item' && (
          <div className="-rotate-3 rounded-md border-2 border-tinta bg-papel/90 px-2 py-[2px] font-mano text-[14px] shadow-mesa">
            {activo.item.nombre} x{activo.item.cantidad}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
