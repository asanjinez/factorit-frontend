import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

const colorStatus = (s) => {
  if (s === 0 || s >= 500) return '#C0392B'
  if (s >= 400) return '#B5651D'
  return '#1E6F5C'
}

export default function ApiLog() {
  const log = useStore((s) => s.apiLog)
  const visible = log.slice(0, 6)

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-30 w-64">
      <div className="mb-1 -rotate-1 text-right font-mano text-[15px] text-tinta/50">
        bloc de API
      </div>
      <div className="flex flex-col-reverse gap-[6px]">
        <AnimatePresence initial={false}>
          {visible.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ y: 40, opacity: 0, rotate: 4 }}
              animate={{ y: 0, opacity: 1, rotate: (e.id % 3) - 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="rounded-md border-2 border-tinta bg-[#fffdf3] px-2 py-1 font-mono text-[12px] leading-tight shadow-mesa"
            >
              <span className="font-semibold text-tinta">{e.method}</span>{' '}
              <span className="text-tinta/70">{e.path}</span>
              <div className="flex justify-between">
                <span style={{ color: colorStatus(e.status) }}>
                  {e.status || 'ERR'}
                </span>
                <span className="text-tinta/50">{e.ms}ms</span>
              </div>
              {e.message && (
                <div
                  className="mt-[2px] border-t border-tinta/15 pt-[2px] leading-tight"
                  style={{ color: colorStatus(e.status) }}
                >
                  {e.message}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
