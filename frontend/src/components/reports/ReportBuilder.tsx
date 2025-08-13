'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, RefreshCw } from 'lucide-react'
import { ReportType, ReportFilters } from '@/types/report'
import { useReportSummary } from '@/hooks/useReports'
import { formatDateRange } from '@/lib/dateRangeUtils'

interface ReportBuilderProps {
  selectedType: ReportType
  filters: ReportFilters
  onTypeChange: (type: ReportType) => void
  onFiltersChange?: (filters: ReportFilters) => void
}

export function ReportBuilder({ 
  selectedType, 
  filters, 
  onTypeChange, 
  onFiltersChange 
}: ReportBuilderProps) {
  const { data: summary, isLoading: summaryLoading, refetch } = useReportSummary(filters)

  const reportTypeLabels: Record<ReportType, string> = {
    revenue: 'Doanh thu',
    occupancy: 'Lấp đầy',
    tenants: 'Khách thuê',
    bills: 'Hóa đơn',
    contracts: 'Hợp đồng',
    custom: 'Tùy chỉnh'
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Cấu hình báo cáo</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={summaryLoading}
          >
            <RefreshCw className={`w-4 h-4 ${summaryLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Tùy chỉnh thông số báo cáo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Loại báo cáo hiện tại</h4>
          <Badge variant="secondary" className="text-sm">
            {reportTypeLabels[selectedType]}
          </Badge>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Khoảng thời gian</h4>
          <div className="text-sm text-muted-foreground">
            {formatDateRange(filters.dateRange)}
          </div>
        </div>

        {/* Filters Applied */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Bộ lọc áp dụng</h4>
          <div className="space-y-1">
            {filters.roomIds && filters.roomIds.length > 0 ? (
              <Badge variant="outline" className="text-xs">
                {filters.roomIds.length} phòng được chọn
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Tất cả phòng</span>
            )}
          </div>
        </div>

        {/* Summary Preview */}
        {summary && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Tổng quan</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng doanh thu:</span>
                <span className="font-medium">
                  {summary.totalRevenue.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng hóa đơn:</span>
                <span className="font-medium">{summary.totalBills}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tỷ lệ lấp đầy:</span>
                <span className="font-medium">{summary.averageOccupancy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng khách thuê:</span>
                <span className="font-medium">{summary.totalTenants}</span>
              </div>
            </div>
          </div>
        )}

        {summaryLoading && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Tổng quan</h4>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium">Thao tác nhanh</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTypeChange('revenue')}
              className={selectedType === 'revenue' ? 'bg-blue-50 border-blue-200' : ''}
            >
              Báo cáo Doanh thu
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTypeChange('occupancy')}
              className={selectedType === 'occupancy' ? 'bg-blue-50 border-blue-200' : ''}
            >
              Báo cáo Lấp đầy
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTypeChange('bills')}
              className={selectedType === 'bills' ? 'bg-blue-50 border-blue-200' : ''}
            >
              Báo cáo Hóa đơn
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
