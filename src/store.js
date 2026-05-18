import { create } from 'zustand'

let logId = 0

export const useStore = create((set) => ({
  posiciones: {},
  especiales: {},
  apiLog: [],

  setPosicion: (id, x, y) =>
    set((s) => ({ posiciones: { ...s.posiciones, [id]: { x, y } } })),

  ensurePosicion: (id, fallback) =>
    set((s) =>
      s.posiciones[id] ? s : { posiciones: { ...s.posiciones, [id]: fallback() } }
    ),

  dropPosicion: (id) =>
    set((s) => {
      const { [id]: _omit, ...rest } = s.posiciones
      return { posiciones: rest }
    }),

  marcarEspecial: (id, special) =>
    set((s) => ({ especiales: { ...s.especiales, [id]: special } })),

  pushLog: (entry) => {
    const id = ++logId
    set((s) => ({
      apiLog: [{ id, ts: Date.now(), ...entry }, ...s.apiLog].slice(0, 10),
    }))
    setTimeout(() => {
      set((s) => ({ apiLog: s.apiLog.filter((e) => e.id !== id) }))
    }, 4500)
  },
}))
