import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '@/lib/api'

interface User {
  id: string
  username: string
  fullName: string
  role: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post('/api/auth/login', {
            username,
            password
          }) as { user: User; token: string }
          
          const { user, token } = response
          
          apiClient.setToken(token)
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        apiClient.setToken(null)
        set({ 
          user: null, 
          isAuthenticated: false 
        })
      },

      checkAuth: async () => {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('auth_token') 
          : null
          
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        try {
          apiClient.setToken(token)
          const response = await apiClient.get('/api/auth/me') as { user: User }
          set({ 
            user: response.user, 
            isAuthenticated: true 
          })
        } catch {
          // Token is invalid
          apiClient.setToken(null)
          set({ 
            user: null, 
            isAuthenticated: false 
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)