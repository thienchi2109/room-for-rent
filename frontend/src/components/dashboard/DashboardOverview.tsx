'use client'


import { Card, CardContent } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { 
  Building2, 
  Users, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Home,
  UserCheck,
  Wrench,
  CheckCircle
} from 'lucide-react'
import { useDashboardOverview } from '../../hooks/useDashboard'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  className?: string
}

function MetricCard({ title, value, subtitle, icon, trend, color, className = '' }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700 border-blue-200',
    green: 'from-green-500 to-green-600 bg-green-50 text-green-700 border-green-200',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-700 border-purple-200',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-700 border-orange-200',
    red: 'from-red-500 to-red-600 bg-red-50 text-red-700 border-red-200',
    yellow: 'from-yellow-500 to-yellow-600 bg-yellow-50 text-yellow-700 border-yellow-200'
  }

  return (
    <Card className={`relative overflow-hidden border-2 ${colorClasses[color].split(' ').slice(2).join(' ')} hover:shadow-lg transition-all duration-300 hover:scale-105 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 bg-gradient-to-r ${colorClasses[color].split(' ').slice(0, 2).join(' ')} rounded-xl shadow-lg`}>
                <div className="text-white">
                  {icon}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {title}
                </p>
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
              </div>
              
              {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  trend.isPositive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} opacity-10 rounded-full -translate-y-10 translate-x-10`}></div>
      </CardContent>
    </Card>
  )
}

export function DashboardOverview() {
  const { data: overview, isLoading, error } = useDashboardOverview()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">
          Không thể tải dữ liệu tổng quan
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </p>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    )
  }

  const { rooms, tenants, revenue, alerts } = overview

  // Calculate occupancy rate
  const occupancyRate = rooms.total > 0 ? Math.round((rooms.occupied / rooms.total) * 100) : 0

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tổng Phòng"
          value={rooms.total}
          subtitle="Tất cả phòng trong hệ thống"
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
        />
        
        <MetricCard
          title="Phòng Đã Thuê"
          value={rooms.occupied}
          subtitle={`${occupancyRate}% tỷ lệ lấp đầy`}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
          trend={{
            value: 5.2,
            isPositive: true
          }}
        />
        
        <MetricCard
          title="Tổng Khách Thuê"
          value={tenants.total}
          subtitle={`${tenants.activeContracts} hợp đồng hoạt động`}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        
        <MetricCard
          title="Doanh Thu Tháng"
          value={formatCurrency(revenue.monthly)}
          subtitle={`${revenue.period.month}/${revenue.period.year}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          trend={{
            value: 12.5,
            isPositive: true
          }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Phòng Trống"
          value={rooms.available}
          subtitle="Sẵn sàng cho thuê"
          icon={<Home className="w-6 h-6" />}
          color="blue"
        />
        
        <MetricCard
          title="Phòng Bảo Trì"
          value={rooms.maintenance}
          subtitle="Đang sửa chữa"
          icon={<Wrench className="w-6 h-6" />}
          color="orange"
        />
        
        <MetricCard
          title="Doanh Thu Chờ Thu"
          value={formatCurrency(revenue.pending)}
          subtitle="Hóa đơn chưa thanh toán"
          icon={<DollarSign className="w-6 h-6" />}
          color="yellow"
        />
        
        <MetricCard
          title="Cảnh Báo"
          value={alerts.overdueBills + alerts.maintenanceRooms}
          subtitle={`${alerts.overdueBills} hóa đơn quá hạn`}
          icon={<AlertTriangle className="w-6 h-6" />}
          color={alerts.overdueBills > 0 ? "red" : "green"}
        />
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tóm tắt Hoạt động
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <span className="text-gray-600">Tỷ lệ lấp đầy:</span>
            <span className="font-semibold text-blue-600">{occupancyRate}%</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <span className="text-gray-600">Tổng doanh thu:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(revenue.monthly + revenue.pending)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <span className="text-gray-600">Trạng thái hệ thống:</span>
            <span className={`font-semibold ${alerts.overdueBills > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {alerts.overdueBills > 0 ? 'Cần chú ý' : 'Hoạt động tốt'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
