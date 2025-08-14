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
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('excel')
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
    const extension = exportFormat === 'excel' ? 'xlsx' : 'pdf'
    return `bao-cao-${type}-${timestamp}.${extension}`
  }

  const handleExport = async (format: 'pdf' | 'excel') => {
    const options = {
      filename: customFilename || getDefaultFilename(),
      title: customTitle || getDefaultTitle()
    }

    try {
      await exportMutation.mutateAsync({
        type,
        format,
        filters,
        options
      })
      setIsExportDialogOpen(false)
      setCustomFilename('')
      setCustomTitle('')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleQuickExport = (format: 'pdf' | 'excel') => {
    handleExport(format)
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
        {/* Quick Export Buttons */}
        <Button
          onClick={() => handleQuickExport('excel')}
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

        <Button
          variant="outline"
          onClick={() => handleQuickExport('pdf')}
          disabled={exportMutation.isPending}
          className="flex items-center space-x-2 border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span className="font-medium">Xuất PDF</span>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xuất báo cáo</DialogTitle>
            <DialogDescription>
              Tùy chỉnh tên file và tiêu đề báo cáo trước khi xuất
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Định dạng</Label>
              <div className="flex space-x-2">
                <div
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 cursor-pointer ${
                    exportFormat === 'excel'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setExportFormat('excel')}
                >
                  Excel (.xlsx)
                </div>
                <div
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 cursor-pointer ${
                    exportFormat === 'pdf'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setExportFormat('pdf')}
                >
                  PDF (.pdf)
                </div>
              </div>
            </div>

            {/* Custom Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề báo cáo</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={getDefaultTitle()}
              />
            </div>

            {/* Custom Filename */}
            <div className="space-y-2">
              <Label htmlFor="filename">Tên file</Label>
              <Input
                id="filename"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={getDefaultFilename()}
              />
              <p className="text-xs text-muted-foreground">
                Không cần thêm phần mở rộng file
              </p>
            </div>

            {/* Report Info */}
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium">Thông tin báo cáo</h4>
              <div className="text-xs space-y-1">
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

          <DialogFooter>
            <div
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Hủy
            </div>
            <div
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer ${
                exportMutation.isPending ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => !exportMutation.isPending && handleExport(exportFormat)}
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Xuất báo cáo
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
