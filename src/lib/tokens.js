export const COLOR = {
  papel: '#F4ECD8',
  tinta: '#2B2522',
  rojo: '#C0392B',
  confirmar: '#1E6F5C',
  sello: '#B5651D',
  oro: '#D4AF37',
}

export const SEED = {
  carrito: 1,
  bolsa: 2,
  cajon: 3,
  etiqueta: 4,
}

export const ROUGH = {
  roughness: 1.8,
  bowing: 1.5,
  strokeWidth: 2.2,
  stroke: COLOR.tinta,
}

export const ROUGH_FILL = {
  ...ROUGH,
  fillStyle: 'hachure',
  hachureGap: 6,
}

export const ANIM = {
  squash: { scale: [1, 0.85, 1.05, 1], transition: { duration: 0.35, ease: 'easeOut' } },
  poof: { duration: 0.4 },
  rebote: { type: 'spring', stiffness: 260, damping: 14 },
  arco: { duration: 0.5 },
  ticket: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
}
