import PriceTag from './PriceTag'
import { PRODUCTOS } from '../lib/products'

export default function TagsPile() {
  return (
    <div className="absolute right-5 top-5 z-20 w-[190px]">
      <div className="mb-1 rotate-2 text-right font-mano text-[20px] text-tinta/70">
        productos
      </div>
      <div className="flex flex-col gap-[6px]">
        {PRODUCTOS.map((p, i) => (
          <div
            key={p.nombre}
            style={{ marginLeft: ((i % 4) - 1.5) * 9, zIndex: PRODUCTOS.length - i }}
          >
            <PriceTag producto={p} index={i} />
          </div>
        ))}
      </div>
    </div>
  )
}
