import api from './api'

export async function getDashboard() {
  const response = await api.get('/admin/dashboard')
  return response.data
}

export async function getUsers() {
  const response = await api.get('/admin/users')
  return response.data
}

export async function toggleUserActive(userId) {
  const response = await api.patch(`/admin/users/${userId}/toggle-active`)
  return response.data
}

export async function getAllOrders(status = null) {
  const response = await api.get('/admin/orders', { params: status ? { status } : {} })
  return response.data
}

export async function updateOrderStatus(orderId, newStatus) {
  const response = await api.patch(`/admin/orders/${orderId}/status`, null, {
    params: { new_status: newStatus },
  })
  return response.data
}

export async function createCategory(data) {
  const response = await api.post('/admin/categories', data)
  return response.data
}

export async function getCategories() {
  const response = await api.get('/admin/categories')
  return response.data
}

export async function createCoupon(data) {
  const response = await api.post('/admin/coupons', data)
  return response.data
}

export async function getCoupons() {
  const response = await api.get('/admin/coupons')
  return response.data
}

export async function createProduct(data) {
  const response = await api.post('/products/', data)
  return response.data
}

export async function deleteProduct(productId) {
  const response = await api.delete(`/products/${productId}`)
  return response.data
}
