import api from './api'

export async function getSiteContent() {
  const response = await api.get('/site-content/')
  return response.data
}

export async function updateSiteContent(data) {
  const response = await api.put('/site-content/', data)
  return response.data
}
