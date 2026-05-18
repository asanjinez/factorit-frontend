import { motion } from 'framer-motion'

export function Poof({ size = 90 }) {
  const blobs = [
    { cx: 32, cy: 34, r: 18, d: 0 },
    { cx: 58, cy: 28, r: 15, d: 0.04 },
    { cx: 64, cy: 52, r: 17, d: 0.08 },
    { cx: 38, cy: 58, r: 16, d: 0.06 },
    { cx: 48, cy: 42, r: 20, d: 0.02 },
  ]
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 90 90"
      style={{ position: 'absolute', inset: 0, margin: 'auto', pointerEvents: 'none' }}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: [0.3, 1.15, 1.3], opacity: [0, 0.95, 0] }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {blobs.map((b, i) => (
        <motion.circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill="#F4ECD8"
          stroke="#2B2522"
          strokeWidth="2"
          className="ink"
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.1, 0.9] }}
          transition={{ duration: 0.45, delay: b.d, ease: 'easeOut' }}
        />
      ))}
    </motion.svg>
  )
}

export function PencilLoader({ size = 22 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ overflow: 'visible' }}
      animate={{ rotate: [-8, 8, -8], x: [-1, 1, -1] }}
      transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path
        d="M4 19 L15 8 L18 11 L7 22 Z"
        fill="#D4AF37"
        stroke="#2B2522"
        strokeWidth="1.6"
        strokeLinejoin="round"
        className="ink"
      />
      <path d="M15 8 L18 5 L21 8 L18 11 Z" fill="#2B2522" className="ink" />
      <motion.path
        d="M2 24 q4 -3 8 -1"
        fill="none"
        stroke="#2B2522"
        strokeWidth="1.4"
        strokeLinecap="round"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </motion.svg>
  )
}
