import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCompras } from '../hooks/queries'

function Ficha({ c }) {
  const vip = c.descuentos?.some((d) => d.tipo === 'COMPRA_VIP')
  const descItem = (n) =>
    (c.descuentos || []).filter((d) => d.nivel === 'ITEM' && d.productoNombre === n)
  const descTotal = (c.descuentos || []).filter((d) => d.nivel === 'TOTAL')
  return (
    <motion.div
      initial={{ x: -20, opacity: 0, rotate: -1 }}
      animate={{ x: 0, opacity: 1, rotate: (c.id % 3) - 1 }}
      className="relative"
    >
      <div
        className="rounded-md border-2 border-tinta bg-papel px-3 py-2 font-mano shadow-mesa"
        style={{ clipPath: 'polygon(0 2%, 100% 0, 99% 100%, 1% 98%)' }}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-[17px] text-tinta">DNI {c.dni}</span>
          <span className="text-[13px] text-tinta/60">
            {new Date(c.fecha).toLocaleDateString('es-AR')}
          </span>
        </div>
        <div className="my-1 border-t border-dashed border-tinta/40" />
        {c.items.map((it, i) => (
          <div key={i}>
            <div className="flex justify-between text-[14px] text-tinta/80">
              <span>
                {it.nombre} x{it.cantidad}
              </span>
              <span>
                ${Number(it.precioUnitario * it.cantidad).toLocaleString('es-AR')}
              </span>
            </div>
            {descItem(it.nombre).map((d, j) => (
              <div
                key={j}
                className="pl-2 text-[12px] leading-tight text-confirmar"
              >
                ✓ {d.descripcion} –${Number(d.monto).toLocaleString('es-AR')}
              </div>
            ))}
          </div>
        ))}
        {descTotal.length > 0 && (
          <div className="mt-1 border-t border-dashed border-tinta/40 pt-1">
            {descTotal.map((d, i) => (
              <div
                key={i}
                className="flex justify-between text-[12px] text-confirmar"
              >
                <span>{d.descripcion}</span>
                <span>–${Number(d.monto).toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-tinta/40 pt-1">
          <span className="text-[15px]">
            total{' '}
            {Number(c.descuentoTotal) > 0 && (
              <span className="text-confirmar">
                (ahorró –${Number(c.descuentoTotal).toLocaleString('es-AR')})
              </span>
            )}
          </span>
          <span className="text-[20px] text-tinta">
            ${Number(c.total).toLocaleString('es-AR')}
          </span>
        </div>
      </div>
      {vip && (
        <div className="absolute -right-2 -top-3 z-10 -rotate-12 rounded-full border-2 border-oro bg-papel px-2 font-mano text-[13px] text-oro shadow-mesa">
          ★ VIP
        </div>
      )}
    </motion.div>
  )
}

export default function Cajon() {
  const [dni, setDni] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('fecha')
  const [direction, setDirection] = useState('desc')

  const [busqueda, setBusqueda] = useState({ dni: '', from: '', to: '' })
  useEffect(() => {
    const t = setTimeout(() => setBusqueda({ dni, from, to }), 450)
    return () => clearTimeout(t)
  }, [dni, from, to])

  const filtros = {
    dni: busqueda.dni || undefined,
    from: busqueda.from || undefined,
    to: busqueda.to || undefined,
    sort,
    direction,
  }
  const { data: compras = [], isFetching, error } = useCompras(filtros, true)

  const Toggle = ({ val, set, opts }) => (
    <span className="inline-flex overflow-hidden rounded-full border-2 border-tinta">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => set(o)}
          className={`px-2 py-[1px] font-mano text-[14px] ${
            val === o ? 'bg-tinta text-papel' : 'text-tinta'
          }`}
        >
          {o}
        </button>
      ))}
    </span>
  )

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className="absolute left-0 top-0 z-20 flex h-full w-[360px] flex-col border-r-[3px] border-tinta bg-[#efe6cf] shadow-[8px_0_18px_rgba(43,37,34,.18)]"
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="font-mano text-[24px] text-tinta">compras</div>
      </div>

      <div className="space-y-2 px-4 py-3 font-mano text-[15px] text-tinta">
        <div className="flex items-center">
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="dni (todas)"
            className="w-28 border-b-2 border-dashed border-tinta bg-transparent outline-none placeholder:text-tinta/40"
          />
        </div>
        <div className="flex flex-nowrap items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-[138px] shrink-0 border-b-2 border-dashed border-tinta bg-transparent text-[13px] outline-none"
          />
          <span className="shrink-0 text-tinta/50">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-[138px] shrink-0 border-b-2 border-dashed border-tinta bg-transparent text-[13px] outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-tinta/60">orden</span>
          <Toggle val={sort} set={setSort} opts={['fecha', 'monto']} />
          <Toggle val={direction} set={setDirection} opts={['asc', 'desc']} />
        </div>
        {dni === '' && (from || to) && (
          <div className="text-[13px] text-rojo/80">
            el filtro por fecha necesita un dni
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        {isFetching && (
          <div className="font-mano text-[15px] text-tinta/50">buscando…</div>
        )}
        {error && (
          <div className="rounded-md border-2 border-rojo bg-[#fbe6e2] px-3 py-2 font-mano text-[14px] text-rojo">
            {error.payload?.message || 'No se pudieron leer las compras'}
          </div>
        )}
        {!isFetching && !error && compras.length === 0 && (
          <div className="mt-6 text-center font-mano text-[16px] text-tinta/50">
            todavía no hay compras
          </div>
        )}
        {compras.map((c) => (
          <Ficha key={c.id} c={c} />
        ))}
      </div>
    </motion.div>
  )
}
