// API client configuration

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If explicitly set via environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // For production builds, try to detect Render environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname

    // If running on Render (*.onrender.com), assume backend is also on Render
    if (hostname.includes('onrender.com')) {
      // Backend service URL on Render
      return 'https://happyhome-isdm.onrender.com'
    }
  }

  // Default to localhost for development
  return 'http://localhost:3001'
}

const API_BASE_URL = getApiBaseUrl()

// Log the API URL for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL)
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { responseType?: 'json' | 'blob' } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const { responseType = 'json', ...fetchOptions } = options

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`

        // Log detailed error info for debugging
        console.error('API Error Details:', {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        })

        throw new Error(errorMessage)
      }

      if (responseType === 'blob') {
        return response.blob() as Promise<T>
      }

      return await response.json()
    } catch (error) {
      // Enhanced error logging for production debugging
      console.error('API request failed:', {
        url,
        error: error instanceof Error ? error.message : error,
        config: {
          method: config.method,
          headers: config.headers
        }
      })
      throw error
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: { responseType?: 'json' | 'blob' }): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Health check
  async healthCheck() {
    return this.get('/health')
  }

  // Dashboard API
  async getDashboardOverview(month?: number, year?: number) {
    const params = new URLSearchParams()
    if (month) params.append('month', month.toString())
    if (year) params.append('year', year.toString())
    
    return this.get(`/api/dashboard/overview${params.toString() ? '?' + params.toString() : ''}`)
  }

  async getDashboardRevenue(year?: number, months?: number) {
    const params = new URLSearchParams()
    if (year) params.append('year', year.toString())
    if (months) params.append('months', months.toString())
    
    return this.get(`/api/dashboard/revenue${params.toString() ? '?' + params.toString() : ''}`)
  }

  async getDashboardNotifications(limit?: number) {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    
    return this.get(`/api/dashboard/notifications${params.toString() ? '?' + params.toString() : ''}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export const api = apiClient // Export as 'api' for convenience
export default apiClient