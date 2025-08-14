'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { BarChart3, Download, Calendar, Filter } from 'lucide-react'
import { ReportType, DateRange } from '@/types/report'
import { getDateRangeFromPreset, formatDateRange } from '@/lib/dateRangeUtils'
import { ReportBuilder } from '@/components/reports/ReportBuilder'
import { ReportPreview } from '@/components/reports/ReportPreview'
import { DateRangePicker } from '@/components/reports/DateRangePicker'
import { RoomSearchFilter } from '@/components/reports/RoomSearchFilter'
import { ExportButtons } from '@/components/reports/ExportButtons'

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>('revenue')
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('this_month'))
  const [roomIds, setRoomIds] = useState<string[]>([])
  
  const reportTypes = [
    { value: 'revenue', label: 'Báo cáo Doanh thu', description: 'Thống kê doanh thu theo thời gian' },
    { value: 'occupancy', label: 'Báo cáo Lấp đầy', description: 'Tỷ lệ lấp đầy phòng' },
    { value: 'bills', label: 'Báo cáo Hóa đơn', description: 'Thống kê hóa đơn và thanh toán' },
  ]
  
  const filters = {
    dateRange,
    roomIds: roomIds.length > 0 ? roomIds : undefined
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo</h1>
          <p className="text-muted-foreground">
            Tạo và xuất báo cáo chi tiết về hoạt động kinh doanh
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDateRange(dateRange)}</span>
          </Badge>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Loại báo cáo</span>
          </CardTitle>
          <CardDescription>
            Chọn loại báo cáo bạn muốn tạo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTypes.map((type) => (
              <div
                key={type.value}
                className={`cursor-pointer transition-colors border rounded-lg p-4 ${
                  selectedType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedType(type.value as ReportType)}
              >
                <div className="pb-2">
                  <h3 className="text-sm font-semibold">{type.label}</h3>
                </div>
                <div className="pt-0">
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Bộ lọc</span>
          </CardTitle>
          <CardDescription>
            Tùy chỉnh khoảng thời gian và các bộ lọc khác
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Khoảng thời gian</label>
              <DateRangePicker 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phòng (tùy chọn)</label>
              <RoomSearchFilter
                selectedRoomIds={roomIds}
                onRoomIdsChange={setRoomIds}
                placeholder="Tìm kiếm phòng theo số phòng..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Builder and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Builder */}
        <div className="lg:col-span-1">
          <ReportBuilder 
            selectedType={selectedType}
            filters={filters}
            onTypeChange={setSelectedType}
            onFiltersChange={(newFilters) => {
              setDateRange(newFilters.dateRange)
              setRoomIds(newFilters.roomIds || [])
            }}
          />
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          <ReportPreview 
            type={selectedType}
            filters={filters}
          />
        </div>
      </div>

      {/* Export Actions */}
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Xuất báo cáo</h2>
          </div>
          <p className="text-sm text-gray-600">
            Tải xuống báo cáo dưới định dạng PDF hoặc Excel
          </p>
        </div>
        <div className="px-6 pb-6">
          <ExportButtons
            type={selectedType}
            filters={filters}
          />
        </div>
      </div>
    </div>
  )
}
