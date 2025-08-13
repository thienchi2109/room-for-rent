'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Download, Calendar, Filter } from 'lucide-react'
import { ReportType, DateRange } from '@/types/report'
import { getDateRangeFromPreset, formatDateRange } from '@/lib/dateRangeUtils'
import { ReportBuilder } from '@/components/reports/ReportBuilder'
import { ReportPreview } from '@/components/reports/ReportPreview'
import { DateRangePicker } from '@/components/reports/DateRangePicker'
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
              <Card 
                key={type.value}
                className={`cursor-pointer transition-colors ${
                  selectedType === type.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedType(type.value as ReportType)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{type.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng</SelectItem>
                  {/* Room options will be loaded dynamically */}
                </SelectContent>
              </Select>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Xuất báo cáo</span>
          </CardTitle>
          <CardDescription>
            Tải xuống báo cáo dưới định dạng PDF hoặc Excel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButtons 
            type={selectedType}
            filters={filters}
          />
        </CardContent>
      </Card>
    </div>
  )
}
