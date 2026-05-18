import { useState, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Poof, PencilLoader } from './effects'
import { useCheckout } from '../hooks/queries'

export default function Bolsa({ carritoId, resaltar, onClear }) {
  const [dni, setDni] = useState('')
  const [fase, setFase] = useState('idle')
  const [ticket, setTicket] = useState(null)
  const checkout = useCheckout()

  const { setNodeRef, isOver } = useDroppable({ id: 'bolsa', data: { type: 'bolsa' } })

  useEffect(() => {
    if (carritoId) {
      setFase('armada')
      setDni('')
    }
  }, [carritoId])

  const cerrar = () => {
    setFase('idle')
    onClear()
  }

  const confirmar = () => {
    setFase('confirmando')
    checkout.mutate(
      { carritoId, dni },
      {
        onSuccess: (compra) => {
          setFase('exito')
          confetti({
            particleCount: 110,
            spread: 80,
            startVelocity: 45,
            origin: { x: 0.5, y: 0.9 },
            colors: ['#D4AF37', '#B5651D', '#1E6F5C', '#2B2522'],
          })
          setTicket(compra)
          setTimeout(() => {
            setFase('idle')
            setTicket(null)
            onClear()
          }, 1700)
        },
        onError: () => {
          setFase('idle')
          onClear()
        },
      }
    )
  }

  const armada = fase === 'armada' || fase === 'confirmando'
  const hot = isOver || resaltar
  const vip = ticket?.descuentos?.some((d) => d.tipo === 'COMPRA_VIP')

  return (
    <>
      <div
        ref={setNodeRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-36 items-start justify-center pt-3 transition-colors"
        style={{
          borderTop: `3px dashed ${hot ? '#1E6F5C' : 'rgba(43,37,34,.4)'}`,
          background: hot
            ? 'linear-gradient(to top, rgba(30,111,92,.14), transparent)'
            : 'transparent',
        }}
      >
        <span
          className="font-mano text-[20px] tracking-wide"
          style={{ color: hot ? '#1E6F5C' : 'rgba(181,101,29,.75)' }}
        >
          {hot ? 'solta el carrito aca para finalizar' : '— finalización —'}
        </span>
        <AnimatePresence>
          {fase === 'exito' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <Poof size={180} />
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {armada && (
          <motion.div
            initial={{ y: 20, opacity: 0, rotate: -3 }}
            animate={{ y: 0, opacity: 1, rotate: -1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-auto absolute bottom-28 left-1/2 z-40 w-64 -translate-x-1/2 rounded-[14px] border-2 border-tinta bg-papel px-3 py-2 shadow-mesa"
          >
            <div className="flex items-center justify-between">
              <span className="font-mano text-[18px] text-tinta">DNI</span>
              <button
                onClick={cerrar}
                className="font-mano text-[15px] text-tinta/50 active:scale-90"
                title="cancelar"
              >
                ✕
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <input
                autoFocus
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fase !== 'confirmando' && confirmar()}
                placeholder="________"
                className="w-full border-b-2 border-dashed border-tinta bg-transparent font-mano text-[20px] tracking-[4px] text-tinta outline-none placeholder:text-tinta/30"
              />
              <motion.button
                whileTap={{ scale: 0.88 }}
                disabled={fase === 'confirmando'}
                onClick={confirmar}
                className="rounded-full border-2 border-confirmar px-3 py-1 font-mano text-[16px] text-confirmar disabled:opacity-40"
              >
                {fase === 'confirmando' ? '…' : '✓'}
              </motion.button>
            </div>
            {fase === 'confirmando' && (
              <div className="absolute -right-3 -top-3">
                <PencilLoader />
              </div>
            )}
            <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-tinta bg-papel" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ticket && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              scale: [0.4, 1.1, 0.5],
              opacity: [0, 1, 0],
              x: [0, -180, -window.innerWidth / 2 + 180],
              y: [0, -160, -window.innerHeight / 3],
              rotate: [0, -10, -22],
            }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-28 left-1/2 z-50 w-44 -translate-x-1/2 rounded-md border-2 border-tinta bg-papel px-3 py-2 text-center font-mano shadow-mesa"
          >
            <div className="text-[14px] text-tinta/60">ticket #{ticket.id}</div>
            <div className="text-[26px] leading-tight text-tinta">
              ${Number(ticket.total).toLocaleString('es-AR')}
            </div>
            {vip && (
              <div className="mx-auto mt-1 w-fit -rotate-12 rounded-full border-2 border-oro px-2 font-mano text-[14px] text-oro">
                ★ VIP
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
