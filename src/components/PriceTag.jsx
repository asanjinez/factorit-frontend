import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import Doodle from './Doodle'
import { drawEtiqueta } from '../lib/shapes'
import { COLOR } from '../lib/tokens'

const W = 168
const H = 66

export default function PriceTag({ producto, index }) {
  const [cant, setCant] = useState(1)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tag-${index}`,
    data: { type: 'tag', producto, cantidad: cant },
  })

  const step = (e, d) => {
    e.stopPropagation()
    setCant((c) => Math.max(1, c + d))
  }

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="relative cursor-grab"
      style={{ width: W, height: H + 16, opacity: isDragging ? 0.25 : 1, touchAction: 'none' }}
      whileHover={{ rotate: -2, scale: 1.04 }}
      initial={{ rotate: (index % 3) - 1 }}
    >
      <div
        className="absolute left-7 top-0 h-4 w-[2px] bg-tinta"
        style={{ transform: 'rotate(8deg)' }}
      />
      <div className="absolute left-0 top-3" style={{ width: W, height: H }}>
        <Doodle
          width={W}
          height={H}
          memoKey={`tag-${index}`}
          draw={(g) => drawEtiqueta(g, W, H, COLOR.tinta)}
          style={{ position: 'absolute', inset: 0 }}
        />
        <div className="absolute inset-0 flex flex-col justify-center pl-9 pr-3">
          <div className="font-mano text-[19px] leading-none text-tinta">
            {producto.nombre}
          </div>
          <div className="font-mano text-[15px] leading-tight text-sello">
            ${producto.precio.toLocaleString('es-AR')}
          </div>
        </div>
        <div
          className="absolute -right-1 -bottom-2 flex items-center gap-1 rounded-full border-2 border-tinta bg-papel px-1 font-mano text-[15px]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            className="h-5 w-5 leading-none text-tinta active:scale-90"
            onClick={(e) => step(e, -1)}
            aria-label="menos"
          >
            –
          </button>
          <span className="min-w-[22px] text-center">x{cant}</span>
          <button
            className="h-5 w-5 leading-none text-tinta active:scale-90"
            onClick={(e) => step(e, 1)}
            aria-label="más"
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  )
}
