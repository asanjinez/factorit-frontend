import { motion } from 'framer-motion'
import { useCrearCarrito } from '../hooks/queries'

function Boton({ children, onClick, accent }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ rotate: -1.5, scale: 1.04 }}
      whileTap={{ scale: 0.92, rotate: 2 }}
      className="relative block w-full rounded-[14px] border-[2.5px] border-tinta bg-papel px-4 py-2 text-left font-mano text-[18px] text-tinta shadow-mesa"
      style={{ color: accent }}
    >
      ✎ {children}
    </motion.button>
  )
}

export default function CrearCarrito() {
  const crear = useCrearCarrito()
  return (
    <div className="absolute left-1/2 top-[78px] z-20 flex w-[420px] -translate-x-1/2 flex-col items-center gap-3">
      <div className="flex w-full justify-center gap-3">
        <Boton onClick={() => crear.mutate({ special: false })}>carrito común</Boton>
        <Boton accent="#B5651D" onClick={() => crear.mutate({ special: true })}>
          carrito especial ★
        </Boton>
      </div>
    </div>
  )
}
