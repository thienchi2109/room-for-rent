'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface LoginFormData {
  username: string
  password: string
  rememberMe: boolean
}

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập')
      return
    }

    try {
      await login(formData.username, formData.password)
      router.push('/dashboard') // Redirect to dashboard after successful login
    } catch (err: unknown) {
      console.error('Login failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-slate-200">
      {/* Login Form Container with Glassmorphism Effect */}
      <div className="glassmorphism-light w-full max-w-lg p-10 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          {/* App Icon/Logo */}
          <div className="mx-auto h-16 w-16 bg-black/5 rounded-2xl flex items-center justify-center mb-4 border border-white/60">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-slate-700" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">NHÀ TRỌ HAPPY HOUSE</h1>
          <p className="text-slate-600 mt-2">Đăng nhập vào Hệ thống quản lý nhà trọ</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50/80">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700 font-medium">
              
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-slate-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="pl-12 pr-4 py-3 bg-white/40 text-slate-900 rounded-xl border border-slate-300/50 placeholder-slate-500 focus:ring-0 focus:border-slate-400 transition duration-300"
                placeholder="Tên đăng nhập hoặc Email"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-slate-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 0118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="pl-12 pr-12 py-3 bg-white/40 text-slate-900 rounded-xl border border-slate-300/50 placeholder-slate-500 focus:ring-0 focus:border-slate-400 transition duration-300"
                placeholder="Mật khẩu"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Options: Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                }
                disabled={isLoading}
                className="h-4 w-4 bg-slate-200 border-slate-300 text-slate-700 focus:ring-slate-600 rounded"
              />
              <Label htmlFor="rememberMe" className="text-sm text-slate-700 cursor-pointer">
                Ghi nhớ đăng nhập
              </Label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-slate-700 hover:text-slate-900 transition duration-300"
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-slate-500 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng Nhập'
              )}
            </Button>
          </div>
        </form>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">Phát triển bởi Chris Nguyễn</p>
        </div>

      </div>
    </div>
  )
}
