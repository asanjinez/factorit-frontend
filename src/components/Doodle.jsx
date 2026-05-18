import { useMemo } from 'react'
import rough from 'roughjs'

const gen = rough.generator()

export default function Doodle({
  width,
  height,
  draw,
  memoKey,
  className = '',
  style,
  ink = true,
}) {
  const paths = useMemo(() => {
    const drawables = draw(gen)
    return drawables.flatMap((d) => gen.toPaths(d))
  }, [memoKey, width, height])

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`${ink ? 'ink' : 'no-ink'} ${className}`}
      style={{ overflow: 'visible', ...style }}
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          fill={p.fill || 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
