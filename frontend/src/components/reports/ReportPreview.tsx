'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Eye, TrendingUp, DollarSign, FileText } from 'lucide-react'
import { ReportType, ReportFilters } from '@/types/report'
import { useReport } from '@/hooks/useReports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ReportPreviewProps {
  type: ReportType
  filters: ReportFilters
}

export function ReportPreview({ type, filters }: ReportPreviewProps) {
  const { data: reportData, isLoading, error } = useReport(type, filters)

  const getReportTitle = () => {
    switch (type) {
      case 'revenue':
        return 'Báo cáo Doanh thu'
      case 'occupancy':
        return 'Báo cáo Tỷ lệ Lấp đầy'
      case 'bills':
        return 'Báo cáo Hóa đơn'
      default:
        return 'Báo cáo'
    }
  }

  const getReportIcon = () => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="w-5 h-5" />
      case 'occupancy':
        return <TrendingUp className="w-5 h-5" />
      case 'bills':
        return <FileText className="w-5 h-5" />
      default:
        return <Eye className="w-5 h-5" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getReportIcon()}
            <span>{getReportTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getReportIcon()}
            <span>{getReportTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            Lỗi khi tải dữ liệu báo cáo
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!reportData?.data?.reportData || reportData.data.reportData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getReportIcon()}
            <span>{getReportTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Không có dữ liệu cho khoảng thời gian đã chọn
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = reportData.data.reportData
  const summary = reportData.data.summary

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getReportIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{getReportTitle()}</h2>
              <p className="text-sm text-gray-600">
                Dữ liệu từ {summary.period.from} đến {summary.period.to}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {data.length} bản ghi
            </Badge>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {type === 'revenue' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-700">Tổng doanh thu</span>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {summary.totalRevenue.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">Tổng hóa đơn</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {summary.totalBills}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-700">Tỷ lệ lấp đầy</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {summary.averageOccupancy}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Biểu đồ xu hướng
          </CardTitle>
          <CardDescription className="text-gray-600">
            Phân tích dữ liệu theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {type === 'revenue' ? (
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString('vi-VN')} VNĐ`,
                      'Doanh thu'
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="totalRevenue"
                    fill="url(#revenueGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              ) : type === 'occupancy' ? (
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Tỷ lệ lấp đầy']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="occupancyRate"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="totalBills"
                    fill="url(#billsGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="billsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Chi tiết dữ liệu
          </CardTitle>
          <CardDescription className="text-gray-600">
            Bảng thống kê chi tiết theo từng kỳ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Kỳ</TableHead>
                  {type === 'revenue' && (
                    <>
                      <TableHead className="text-right font-semibold text-gray-700">Doanh thu đã thu</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Doanh thu chưa thu</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Tổng doanh thu</TableHead>
                    </>
                  )}
                  {type === 'occupancy' && (
                    <>
                      <TableHead className="text-right font-semibold text-gray-700">Tổng phòng</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Phòng đã thuê</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Tỷ lệ lấp đầy</TableHead>
                    </>
                  )}
                  {type === 'bills' && (
                    <>
                      <TableHead className="text-right font-semibold text-gray-700">Tổng HĐ</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Đã thanh toán</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Chưa thanh toán</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 10).map((row, index: number) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{row.period}</TableCell>
                    {type === 'revenue' && 'totalRevenue' in row && (
                      <>
                        <TableCell className="text-right text-gray-700">
                          <span className="font-mono">
                            {row.paidRevenue.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-700">
                          <span className="font-mono">
                            {row.pendingRevenue.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono font-semibold text-gray-900">
                            {row.totalRevenue.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </TableCell>
                      </>
                    )}
                    {type === 'occupancy' && 'occupancyRate' in row && (
                      <>
                        <TableCell className="text-right text-gray-700">
                          <span className="font-mono">{row.totalRooms}</span>
                        </TableCell>
                        <TableCell className="text-right text-gray-700">
                          <span className="font-mono">{row.occupiedRooms}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono font-semibold text-gray-900">
                            {row.occupancyRate}%
                          </span>
                        </TableCell>
                      </>
                    )}
                    {type === 'bills' && 'totalBills' in row && (
                      <>
                        <TableCell className="text-right text-gray-700">
                          <span className="font-mono">{row.totalBills}</span>
                        </TableCell>
                        <TableCell className="text-right text-gray-700">
                          <span className="font-mono">{row.paidBills}</span>
                        </TableCell>
                        <TableCell className="text-right text-gray-700">
                          <span className="font-mono">{row.unpaidBills}</span>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.length > 10 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Hiển thị 10 trong tổng số {data.length} bản ghi
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
