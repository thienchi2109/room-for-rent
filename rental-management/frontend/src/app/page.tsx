'use client'

import { useEffect, useState } from 'react'
import apiClient from '@/lib/api'

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<{
    status?: string
    timestamp?: string
    environment?: string
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.healthCheck() as {
          status?: string
          timestamp?: string
          environment?: string
        }
        setHealthStatus(response)
      } catch (error) {
        console.error('Health check failed:', error)
        setHealthStatus({ error: 'Backend connection failed' })
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏠 Hệ thống Quản lý Phòng cho thuê
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Hệ thống quản lý phòng cho thuê toàn diện với Next.js và Express.js
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🚀 Trạng thái hệ thống
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang kiểm tra...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Frontend (Next.js):</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✅ Hoạt động
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Backend (Express.js):</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    healthStatus?.error 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {healthStatus?.error ? '❌ Lỗi kết nối' : '✅ Hoạt động'}
                  </span>
                </div>
                
                {healthStatus?.status && (
                  <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-sm text-blue-700">
                      <strong>Môi trường:</strong> {healthStatus.environment}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Thời gian:</strong> {healthStatus.timestamp ? new Date(healthStatus.timestamp).toLocaleString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🎯 Tính năng chính</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Quản lý phòng ốc</li>
                <li>• Quản lý khách thuê</li>
                <li>• Quản lý hợp đồng</li>
                <li>• Tính hóa đơn tự động</li>
                <li>• Dashboard & báo cáo</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">⚡ Tech Stack</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Next.js 14 + TypeScript</li>
                <li>• Express.js + Prisma ORM</li>
                <li>• Neon PostgreSQL</li>
                <li>• TanStack Query + Zustand</li>
                <li>• Tailwind CSS + Shadcn/ui</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Hệ thống đã được khởi tạo thành công! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}