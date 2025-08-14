'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Download, Loader2 } from 'lucide-react'
import { ReportType, ReportFilters } from '@/types/report'
import { useExportReport } from '@/hooks/useReports'
import { formatDateRange } from '@/lib/dateRangeUtils'

interface ExportButtonsProps {
  type: ReportType
  filters: ReportFilters
}

export function ExportButtons({ type, filters }: ExportButtonsProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  // Always use Excel format
  const exportFormat = 'excel'
  const [customFilename, setCustomFilename] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  
  const exportMutation = useExportReport()

  const getReportTypeLabel = () => {
    switch (type) {
      case 'revenue':
        return 'Doanh thu'
      case 'occupancy':
        return 'Lấp đầy'
      case 'bills':
        return 'Hóa đơn'
      default:
        return 'Báo cáo'
    }
  }

  const getDefaultTitle = () => {
    const typeLabel = getReportTypeLabel()
    const dateRange = formatDateRange(filters.dateRange)
    return `Báo cáo ${typeLabel} - ${dateRange}`
  }

  const getDefaultFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    return `bao-cao-${type}-${timestamp}.xlsx`
  }

  const handleExport = async () => {
    const options = {
      filename: customFilename || getDefaultFilename(),
      title: customTitle || getDefaultTitle()
    }

    try {
      console.log('Starting export with:', { type, format: 'excel', filters, options })
      await exportMutation.mutateAsync({
        type,
        format: 'excel',
        filters,
        options
      })
      setIsExportDialogOpen(false)
      setCustomFilename('')
      setCustomTitle('')
    } catch (error) {
      console.error('Export failed:', error)
      // Show user-friendly error message
      alert(`Xuất báo cáo thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`)
    }
  }

  const handleQuickExport = () => {
    handleExport()
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Xuất báo cáo</h3>
          <p className="text-sm text-gray-600">Tải xuống báo cáo dưới nhiều định dạng khác nhau</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Quick Export Button */}
        <Button
          onClick={handleQuickExport}
          disabled={exportMutation.isPending}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
          <span className="font-medium">Xuất Excel</span>
        </Button>

        {/* Advanced Export Button */}
        <button
          onClick={() => setIsExportDialogOpen(true)}
          className="flex items-center space-x-2 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-2 rounded-md font-medium text-sm"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">Tùy chỉnh xuất</span>
        </button>

        {/* Advanced Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">Xuất báo cáo</DialogTitle>
            <DialogDescription className="text-gray-600">
              Tùy chỉnh tên file và tiêu đề báo cáo trước khi xuất
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Format Info */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Định dạng</Label>
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Excel (.xlsx)</span>
              </div>
            </div>

            {/* Custom Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">Tiêu đề báo cáo</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={getDefaultTitle()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Custom Filename */}
            <div className="space-y-3">
              <Label htmlFor="filename" className="text-sm font-medium text-gray-700">Tên file</Label>
              <Input
                id="filename"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={getDefaultFilename()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Không cần thêm phần mở rộng file
              </p>
            </div>

            {/* Report Info */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-800">Thông tin báo cáo</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Loại:</span>
                  <span>{getReportTypeLabel()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Khoảng thời gian:</span>
                  <span>{formatDateRange(filters.dateRange)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phòng:</span>
                  <span>
                    {filters.roomIds?.length 
                      ? `${filters.roomIds.length} phòng được chọn`
                      : 'Tất cả phòng'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 flex flex-row justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              className="px-6 py-2"
            >
              Hủy
            </Button>
            <Button
              onClick={() => !exportMutation.isPending && handleExport()}
              disabled={exportMutation.isPending}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Xuất Excel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
