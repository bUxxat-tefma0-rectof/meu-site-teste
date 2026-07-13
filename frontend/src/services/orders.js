import api from './api'

export async function checkout(data) {
  const response = await api.post('/orders/checkout', data)
  return response.data
}

export async function getMyOrders() {
  const response = await api.get('/orders/my-orders')
  return response.data
}
