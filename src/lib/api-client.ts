import axios from 'axios'
import { getSession } from 'next-auth/react'
import { sanitize } from '@/lib/log-sanitizer'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, sanitize({
    data: config.data,
    timestamp: new Date().toISOString(),
  }))
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.status} ${response.config.url}`, sanitize({
      data: response.data,
      timestamp: new Date().toISOString(),
    }))
    return response
  },
  async (error) => {
    console.error(`[API] ✗ ${error.response?.status || 'ERROR'} ${error.config?.url}`, sanitize({
      error: error.response?.data || error.message,
      timestamp: new Date().toISOString(),
    }))
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
