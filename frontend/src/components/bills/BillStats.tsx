'use client'

import { useMemo } from 'react'
import React from 'react'
import { useBills } from '../../hooks/useBills'
import { BillStatus } from '../../../../shared/src/types/models'
import { Card, CardContent } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

interface BillStatsProps {
  className?: string
  month?: number
  year?: number
}

function BillStats({ className, month, year }: BillStatsProps) {
  // Get current month/year if not provided - memoize to avoid re-creating Date object
  const { currentMonth, currentYear } = useMemo(() => {
    const currentDate = new Date()
    return {
      currentMonth: month || currentDate.getMonth() + 1,
      currentYear: year || currentDate.getFullYear()
    }
  }, [month, year])

  // Create stable filter object to prevent unnecessary re-fetching
  const statsFilters = useMemo(() => ({
    month: currentMonth,
    year: currentYear,
    limit: 1000 // Get all bills for stats
  }), [currentMonth, currentYear])

  // Fetch bills for the specified period
  const { data: billsData, isLoading } = useBills(statsFilters)

  // Calculate statistics
  const stats = useMemo(() => {
    if (!billsData?.data) {
      return {
        totalBills: 0,
        paidBills: 0,
        unpaidBills: 0,
        overdueBills: 0,
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
        overdueRevenue: 0
      }
    }

    const bills = billsData.data
    const today = new Date()

    const totalBills = bills.length
    const paidBills = bills.filter(bill => bill.status === BillStatus.PAID).length
    const unpaidBills = bills.filter(bill => bill.status === BillStatus.UNPAID).length
    const overdueBills = bills.filter(bill => 
      bill.status === BillStatus.UNPAID && new Date(bill.dueDate) < today
    ).length

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
    const paidRevenue = bills
      .filter(bill => bill.status === BillStatus.PAID)
      .reduce((sum, bill) => sum + bill.totalAmount, 0)
    const pendingRevenue = bills
      .filter(bill => bill.status === BillStatus.UNPAID)
      .reduce((sum, bill) => sum + bill.totalAmount, 0)
    const overdueRevenue = bills
      .filter(bill => bill.status === BillStatus.UNPAID && new Date(bill.dueDate) < today)
      .reduce((sum, bill) => sum + bill.totalAmount, 0)

    return {
      totalBills,
      paidBills,
      unpaidBills,
      overdueBills,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      overdueRevenue
    }
  }, [billsData])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <LoadingSpinner size="sm" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Tổng hóa đơn',
      value: stats.totalBills.toString(),
      subtitle: `Tháng ${currentMonth}/${currentYear}`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Đã thanh toán',
      value: stats.paidBills.toString(),
      subtitle: `${formatPercentage(stats.paidBills, stats.totalBills)} tổng số`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Chưa thanh toán',
      value: stats.unpaidBills.toString(),
      subtitle: `${formatPercentage(stats.unpaidBills, stats.totalBills)} tổng số`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Quá hạn',
      value: stats.overdueBills.toString(),
      subtitle: `${formatPercentage(stats.overdueBills, stats.totalBills)} tổng số`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  const revenueCards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      subtitle: `Tháng ${currentMonth}/${currentYear}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Đã thu',
      value: formatCurrency(stats.paidRevenue),
      subtitle: `${formatPercentage(stats.paidRevenue, stats.totalRevenue)} tổng số`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Chưa thu',
      value: formatCurrency(stats.pendingRevenue),
      subtitle: `${formatPercentage(stats.pendingRevenue, stats.totalRevenue)} tổng số`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Quá hạn',
      value: formatCurrency(stats.overdueRevenue),
      subtitle: `${formatPercentage(stats.overdueRevenue, stats.totalRevenue)} tổng số`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Bill Count Statistics */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thống kê Hóa đơn
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Revenue Statistics */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Thống kê Doanh thu
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {revenueCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-900 mb-1 truncate">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.bgColor} flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Export both default and named for compatibility
const MemoizedBillStats = React.memo(BillStats)
export default MemoizedBillStats
export { MemoizedBillStats as BillStats }