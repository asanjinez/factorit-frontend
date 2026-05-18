import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from '../lib/api'
import { useStore } from '../store'

const KEY = ['carritos']
let tmpSeq = 0
const tmpId = (p) => `tmp-${p}-${++tmpSeq}`

export function useCarritos() {
  return useQuery({
    queryKey: KEY,
    queryFn: api.listarCarritos,
    initialData: [],
  })
}

export function useCompras(filtros, enabled) {
  return useQuery({
    queryKey: ['compras', filtros],
    queryFn: () => api.listarCompras(filtros),
    enabled,
  })
}

function patchCarritos(qc, fn) {
  const prev = qc.getQueryData(KEY) || []
  qc.setQueryData(KEY, fn(prev))
  return prev
}

export function useCrearCarrito() {
  const qc = useQueryClient()
  const marcarEspecial = useStore((s) => s.marcarEspecial)
  return useMutation({
    mutationFn: ({ special }) => api.crearCarrito(special),
    onMutate: ({ special }) => {
      const id = tmpId('carrito')
      const prev = patchCarritos(qc, (cs) => [
        ...cs,
        { id, _pending: true, cantidadProductos: 0, subtotal: 0, descuentoTotal: 0, total: 0, descuentos: [], items: [] },
      ])
      return { prev, id, special }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx.prev),
    onSuccess: (real, _v, ctx) => {
      marcarEspecial(real.id, ctx.special)
      patchCarritos(qc, (cs) => cs.map((c) => (c.id === ctx.id ? real : c)))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useAgregarItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ carritoId, item }) => api.agregarItem(carritoId, item),
    onMutate: ({ carritoId, item }) => {
      const prev = patchCarritos(qc, (cs) =>
        cs.map((c) =>
          c.id === carritoId
            ? {
                ...c,
                _pending: true,
                cantidadProductos: (c.cantidadProductos || 0) + item.cantidad,
              }
            : c
        )
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx.prev),
    onSuccess: (real) =>
      patchCarritos(qc, (cs) => cs.map((c) => (c.id === real.id ? real : c))),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useQuitarItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ carritoId, itemId }) => api.quitarItem(carritoId, itemId),
    onMutate: ({ carritoId, itemId }) => {
      const prev = patchCarritos(qc, (cs) =>
        cs.map((c) => {
          if (c.id !== carritoId) return c
          const it = c.items.find((i) => i.id === itemId)
          return {
            ...c,
            _pending: true,
            cantidadProductos: Math.max(0, (c.cantidadProductos || 0) - (it?.cantidad || 0)),
            items: c.items.filter((i) => i.id !== itemId),
          }
        })
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useMoverItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ origenId, itemId, destinoId, item }) => {
      await api.quitarItem(origenId, itemId)
      return api.agregarItem(destinoId, item)
    },
    onMutate: ({ origenId, itemId, destinoId, item }) => {
      const prev = patchCarritos(qc, (cs) =>
        cs.map((c) => {
          if (c.id === origenId) {
            const it = c.items.find((i) => i.id === itemId)
            return {
              ...c,
              _pending: true,
              cantidadProductos: Math.max(0, (c.cantidadProductos || 0) - (it?.cantidad || 0)),
              items: c.items.filter((i) => i.id !== itemId),
            }
          }
          if (c.id === destinoId)
            return {
              ...c,
              _pending: true,
              cantidadProductos: (c.cantidadProductos || 0) + item.cantidad,
            }
          return c
        })
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx.prev),
    onSuccess: (real) =>
      patchCarritos(qc, (cs) => cs.map((c) => (c.id === real.id ? real : c))),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useBorrarCarrito() {
  const qc = useQueryClient()
  const dropPosicion = useStore((s) => s.dropPosicion)
  return useMutation({
    mutationFn: ({ carritoId }) => api.borrarCarrito(carritoId),
    onMutate: ({ carritoId }) => {
      const prev = patchCarritos(qc, (cs) => cs.filter((c) => c.id !== carritoId))
      dropPosicion(carritoId)
      return { prev }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useCheckout() {
  const qc = useQueryClient()
  const dropPosicion = useStore((s) => s.dropPosicion)
  return useMutation({
    mutationFn: ({ carritoId, dni }) => api.checkout(carritoId, dni),
    onSuccess: (_compra, { carritoId }) => {
      patchCarritos(qc, (cs) => cs.filter((c) => c.id !== carritoId))
      dropPosicion(carritoId)
      qc.invalidateQueries({ queryKey: ['compras'] })
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
