'use client'

import { useState } from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { LoadingSpinner } from '../ui/loading-spinner'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  AreaChart as AreaChartIcon,
  AlertTriangle
} from 'lucide-react'
import { useRevenueChartData } from '../../hooks/useDashboard'

type ChartType = 'area' | 'bar'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      'Đã thu': number
      'Chờ thu': number
      'Tổng cộng': number
      bills: number
    }
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-white/20">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Đã thu:</span>
            </div>
            <span className="font-semibold text-emerald-600">
              {formatCurrency(data['Đã thu'])}
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Chờ thu:</span>
            </div>
            <span className="font-semibold text-yellow-600">
              {formatCurrency(data['Chờ thu'])}
            </span>
          </div>
          
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-gray-700">Tổng cộng:</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(data['Tổng cộng'])}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            {data.bills} hóa đơn trong tháng
          </div>
        </div>
      </div>
    )
  }

  return null
}

export function RevenueChart() {
  const [chartType, setChartType] = useState<ChartType>('area')
  const [months, setMonths] = useState(12)
  
  const { data: chartData, summary, isLoading, error } = useRevenueChartData(months)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

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
          Không thể tải dữ liệu doanh thu
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </p>
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không có dữ liệu doanh thu</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Khoảng thời gian:</span>
          </div>
          <div className="flex gap-2">
            {[6, 12, 18, 24].map((monthOption) => (
              <Button
                key={monthOption}
                variant={months === monthOption ? "default" : "outline"}
                size="sm"
                onClick={() => setMonths(monthOption)}
                className="text-xs"
              >
                {monthOption} tháng
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'area' ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType('area')}
            className="flex items-center gap-2"
          >
            <AreaChartIcon className="w-4 h-4" />
            Area
          </Button>
          <Button
            variant={chartType === 'bar' ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType('bar')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Bar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Đã thu</p>
                  <p className="text-lg font-bold text-emerald-800">
                    {formatCurrency(summary.totalPaidRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Chờ thu</p>
                  <p className="text-lg font-bold text-yellow-800">
                    {formatCurrency(summary.totalPendingRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Tổng cộng</p>
                  <p className="text-lg font-bold text-blue-800">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/20">
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Đã thu"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#paidGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Chờ thu"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="url(#pendingGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Đã thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Chờ thu" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
