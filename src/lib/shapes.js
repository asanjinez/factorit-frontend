import { SEED, ROUGH, ROUGH_FILL, COLOR } from './tokens'

const fill = (color) => ({ ...ROUGH_FILL, fill: color, seed: undefined })

export function drawCarrito(g, special) {
  const s = { ...ROUGH, seed: SEED.carrito }
  const tinte = special ? COLOR.sello : COLOR.tinta
  const canasta = g.polygon(
    [
      [26, 40],
      [126, 40],
      [108, 88],
      [44, 88],
    ],
    { ...s, stroke: tinte, fill: special ? 'rgba(181,101,29,.12)' : 'rgba(43,37,34,.06)', fillStyle: 'hachure', hachureGap: 7, seed: SEED.carrito }
  )
  const reja1 = g.line(52, 40, 58, 88, { ...s, strokeWidth: 1.4, stroke: tinte, seed: SEED.carrito })
  const reja2 = g.line(78, 40, 76, 88, { ...s, strokeWidth: 1.4, stroke: tinte, seed: SEED.carrito })
  const reja3 = g.line(104, 40, 94, 88, { ...s, strokeWidth: 1.4, stroke: tinte, seed: SEED.carrito })
  const banda = g.line(30, 56, 122, 56, { ...s, strokeWidth: 1.4, stroke: tinte, seed: SEED.carrito })
  const manija = g.linearPath(
    [
      [26, 40],
      [14, 16],
      [4, 16],
    ],
    { ...s, stroke: tinte, seed: SEED.carrito }
  )
  const eje = g.line(52, 88, 100, 88, { ...s, strokeWidth: 1.4, stroke: tinte, seed: SEED.carrito })
  const r1 = g.circle(54, 100, 17, { ...s, stroke: tinte, fill: tinte, fillStyle: 'solid', seed: SEED.carrito })
  const r2 = g.circle(98, 100, 17, { ...s, stroke: tinte, fill: tinte, fillStyle: 'solid', seed: SEED.carrito })
  return [canasta, banda, reja1, reja2, reja3, manija, eje, r1, r2]
}

export function drawBolsa(g) {
  const s = { ...ROUGH, seed: SEED.bolsa }
  const cuerpo = g.polygon(
    [
      [30, 56],
      [150, 56],
      [142, 168],
      [38, 168],
    ],
    { ...s, fill: 'rgba(181,101,29,.10)', fillStyle: 'hachure', hachureGap: 8, seed: SEED.bolsa }
  )
  const solapa = g.polygon(
    [
      [30, 56],
      [150, 56],
      [132, 32],
      [48, 32],
    ],
    { ...s, fill: 'rgba(181,101,29,.16)', fillStyle: 'hachure', hachureGap: 7, seed: SEED.bolsa }
  )
  const pliegueL = g.line(64, 56, 66, 168, { ...s, strokeWidth: 1.3, seed: SEED.bolsa })
  const pliegueR = g.line(116, 56, 114, 168, { ...s, strokeWidth: 1.3, seed: SEED.bolsa })
  const asa = g.path('M70 40 C 80 18, 104 18, 114 40', { ...s, seed: SEED.bolsa })
  return [cuerpo, solapa, pliegueL, pliegueR, asa]
}

export function drawCajon(g, w, h) {
  const s = { ...ROUGH, seed: SEED.cajon }
  const frente = g.rectangle(4, 4, w - 8, h - 8, {
    ...s,
    fill: 'rgba(43,37,34,.05)',
    fillStyle: 'hachure',
    hachureGap: 9,
    seed: SEED.cajon,
  })
  const tirador = g.path(
    `M ${w / 2 - 26} ${h - 16} q 26 16 52 0`,
    { ...s, strokeWidth: 3, seed: SEED.cajon }
  )
  return [frente, tirador]
}

export function drawEtiqueta(g, w, h, color) {
  const s = { ...ROUGH, seed: SEED.etiqueta, strokeWidth: 1.8 }
  const c = color || COLOR.tinta
  const cuerpo = g.polygon(
    [
      [16, 6],
      [w - 6, 6],
      [w - 6, h - 6],
      [16, h - 6],
      [6, h / 2],
    ],
    { ...s, stroke: c, fill: 'rgba(244,236,216,.65)', fillStyle: 'solid', seed: SEED.etiqueta }
  )
  const hueco = g.circle(20, h / 2, 8, { ...s, stroke: c, seed: SEED.etiqueta })
  return [cuerpo, hueco]
}

export function drawSello(g, w, h, color) {
  const s = { ...ROUGH, seed: 11, strokeWidth: 2.4, stroke: color, roughness: 2.6 }
  const borde = g.rectangle(3, 3, w - 6, h - 6, { ...s, seed: 11 })
  return [borde]
}
