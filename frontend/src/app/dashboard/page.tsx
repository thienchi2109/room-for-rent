'use client'

import { Suspense } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardOverview } from '../../components/dashboard/DashboardOverview'
import { RevenueChart } from '../../components/dashboard/RevenueChart'
import { NotificationsPanel } from '../../components/dashboard/NotificationsPanel'
import { RoomOccupancyChart } from '../../components/dashboard/RoomOccupancyChart'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  Building2,
  Sparkles
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Tổng quan hệ thống quản lý phòng trọ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-md">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Live Data</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column - Overview Cards & Revenue Chart */}
          <div className="lg:col-span-8 space-y-6">

              {/* Overview Cards */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Tổng quan Hệ thống
                  </h2>
                </div>

                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <DashboardOverview />
                </Suspense>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Biểu đồ Doanh thu
                  </h2>
                </div>

                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <RevenueChart />
                </Suspense>
              </div>

              {/* Room Occupancy Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Tình trạng Phòng
                  </h2>
                </div>

                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <RoomOccupancyChart />
                </Suspense>
              </div>
            </div>

            {/* Right Column - Notifications */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Thông báo & Cảnh báo
                  </h2>
                </div>

                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <NotificationsPanel />
                </Suspense>
              </div>
            </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
