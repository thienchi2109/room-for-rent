'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Building, Users, FileText, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { DashboardStats } from '@/types/dashboard'

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats() as Promise<DashboardStats>,
  })

  const displayStats = stats || {
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalTenants: 0
  }
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            CHÀO MỪNG ĐẾN VỚI HỆ THỐNG QUẢN LÝ NHÀ TRỌ CHUYÊN NGHIỆP!
          </h1>
          <p className="text-gray-600 mb-8">
            Quản lý phòng, khách thuê và hợp đồng một cách hiệu quả
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/rooms">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quản lý phòng</h3>
                  <p className="text-sm text-gray-600">Thêm, sửa, xóa phòng</p>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-sm border opacity-50">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Khách thuê</h3>
                <p className="text-sm text-gray-600">Sắp ra mắt</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border opacity-50">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hợp đồng</h3>
                <p className="text-sm text-gray-600">Sắp ra mắt</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border opacity-50">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Thanh toán</h3>
                <p className="text-sm text-gray-600">Sắp ra mắt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tổng quan hệ thống
          </h2>
          {isLoading ? (
            <div className="text-center text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="text-center text-red-500">
              Lỗi: {error instanceof Error ? error.message : 'Không thể tải dữ liệu'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{displayStats.totalRooms}</div>
                <div className="text-sm text-gray-600">Tổng số phòng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{displayStats.occupiedRooms}</div>
                <div className="text-sm text-gray-600">Phòng đã cho thuê</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{displayStats.availableRooms}</div>
                <div className="text-sm text-gray-600">Phòng có sẵn</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{displayStats.totalTenants}</div>
                <div className="text-sm text-gray-600">Tổng khách thuê</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
