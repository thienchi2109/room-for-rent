'use client'

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { Card, CardContent } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { 
  Building2, 
  Users, 
  Home, 
  Wrench,
  AlertTriangle,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react'
import { useRoomOccupancyData } from '../../hooks/useDashboard'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      name: string
      value: number
      total?: number
    }
  }>
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-white/20">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{data.value}</span> phòng
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {((data.value / (data.total || 1)) * 100).toFixed(1)}% tổng số phòng
        </p>
      </div>
    )
  }
  return null
}

export function RoomOccupancyChart() {
  const { data: occupancyData, total, occupancyRate, isLoading, error } = useRoomOccupancyData()

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
          Không thể tải dữ liệu phòng
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </p>
      </div>
    )
  }

  if (!occupancyData || occupancyData.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không có dữ liệu phòng</p>
      </div>
    )
  }

  // Prepare data for bar chart
  const barData = occupancyData.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Tổng số phòng</p>
                <p className="text-2xl font-bold text-blue-800">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Tỷ lệ lấp đầy</p>
                <p className="text-2xl font-bold text-green-800">{occupancyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Phân bố Phòng</h3>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {occupancyData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Tỷ lệ Phòng</h3>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} phòng (${((value / total) * 100).toFixed(1)}%)`,
                      'Số lượng'
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    fill="#8884d8"
                  >
                    {barData.map((entry: { color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {occupancyData.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
          
          const getIcon = (name: string) => {
            switch (name) {
              case 'Đã thuê':
                return <Users className="w-5 h-5" />
              case 'Trống':
                return <Home className="w-5 h-5" />
              case 'Bảo trì':
                return <Wrench className="w-5 h-5" />
              default:
                return <Building2 className="w-5 h-5" />
            }
          }

          return (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-xl shadow-lg text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {getIcon(item.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {item.name}
                    </p>
                    <div className="flex items-end justify-between mt-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {item.value}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Occupancy Status */}
      <Card className={`border-2 ${
        occupancyRate >= 90 
          ? 'bg-red-50 border-red-200' 
          : occupancyRate >= 70 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              occupancyRate >= 90 
                ? 'bg-red-500' 
                : occupancyRate >= 70 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-semibold ${
                occupancyRate >= 90 
                  ? 'text-red-800' 
                  : occupancyRate >= 70 
                  ? 'text-yellow-800' 
                  : 'text-green-800'
              }`}>
                {occupancyRate >= 90 
                  ? 'Tỷ lệ lấp đầy cao' 
                  : occupancyRate >= 70 
                  ? 'Tỷ lệ lấp đầy tốt' 
                  : 'Còn nhiều phòng trống'
                }
              </p>
              <p className={`text-sm mt-1 ${
                occupancyRate >= 90 
                  ? 'text-red-600' 
                  : occupancyRate >= 70 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              }`}>
                {occupancyRate >= 90 
                  ? 'Cần chuẩn bị thêm phòng hoặc tăng giá thuê' 
                  : occupancyRate >= 70 
                  ? 'Tình hình kinh doanh ổn định' 
                  : 'Có thể tăng cường marketing để thu hút khách thuê'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
