import api from './api'

export async function register(data) {
  const response = await api.post('/auth/register', data)
  return response.data
}

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', response.data.access_token)
  return response.data
}

export async function verifyEmail(email, code) {
  const response = await api.post('/auth/verify-email', { email, code })
  return response.data
}

export async function resendCode(email) {
  const response = await api.post('/auth/resend-code', { email })
  return response.data
}

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword(token, newPassword) {
  const response = await api.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  })
  return response.data
}

export function logout() {
  localStorage.removeItem('token')
}

export function isAuthenticated() {
  return !!localStorage.getItem('token')
}
