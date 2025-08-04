'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Nếu đã đăng nhập thì redirect về dashboard
    if (isAuthenticated) {
      router.replace('/dashboard')
    } else {
      // Nếu chưa đăng nhập thì redirect về login
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  // Hiển thị loading trong khi redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          🏠 Hệ thống Quản lý Phòng cho thuê
        </h2>
        <p className="text-gray-600">
          Đang chuyển hướng...
        </p>
      </div>
    </div>
  )
}