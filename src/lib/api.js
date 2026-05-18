import { useStore } from '../store'

class ApiError extends Error {
  constructor(payload, status) {
    super(payload?.message || `Error ${status}`)
    this.payload = payload
    this.status = status
  }
}

async function request(method, path, body) {
  const started = performance.now()
  let status = 0
  let message
  try {
    const res = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    status = res.status
    const text = await res.text()
    const data = text ? JSON.parse(text) : null
    if (!res.ok) {
      message = data?.message
      throw new ApiError(data, status)
    }
    return data
  } catch (err) {
    if (err instanceof ApiError) throw err
    status = status || 0
    message = 'No se pudo hablar con la mesa'
    throw new ApiError({ code: 'NETWORK', message, status, path }, status)
  } finally {
    const ms = Math.round(performance.now() - started)
    useStore.getState().pushLog({ method, path, status, ms, message })
  }
}

export const api = {
  listarCarritos: () => request('GET', '/carritos'),
  crearCarrito: (special) => request('POST', '/carritos', { special }),
  borrarCarrito: (id) => request('DELETE', `/carritos/${id}`),
  agregarItem: (id, item) => request('POST', `/carritos/${id}/items`, item),
  quitarItem: (id, itemId) => request('DELETE', `/carritos/${id}/items/${itemId}`),
  checkout: (id, dni) => request('POST', `/carritos/${id}/checkout`, { dni }),

  listarCompras: (q = {}) => {
    const { dni, from, to, sort = 'fecha', direction = 'desc' } = q
    const qs = `?sort=${sort}&direction=${direction}`
    if (dni && from && to) return request('GET', `/compras/${dni}/periodo?from=${from}&to=${to}&sort=${sort}&direction=${direction}`)
    if (dni && from) return request('GET', `/compras/${dni}/from?from=${from}&sort=${sort}&direction=${direction}`)
    if (dni) return request('GET', `/compras/${dni}${qs}`)
    return request('GET', `/compras${qs}`)
  },
}

export { ApiError }
