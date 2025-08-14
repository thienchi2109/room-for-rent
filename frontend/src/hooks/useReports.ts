import { useQuery, useMutation } from '@tanstack/react-query'
import { ReportService } from '@/services/reportService'
import {
  ReportType,
  ReportFilters
} from '@/types/report'
import { toast } from 'sonner'

/**
 * Hook for revenue reports
 */
export function useRevenueReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'revenue', filters],
    queryFn: () => ReportService.generateRevenueReport(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for occupancy reports
 */
export function useOccupancyReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'occupancy', filters],
    queryFn: () => ReportService.generateOccupancyReport(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for bill reports
 */
export function useBillReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'bills', filters],
    queryFn: () => ReportService.generateBillReport(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for report summary
 */
export function useReportSummary(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => ReportService.getReportSummary(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for exporting reports
 */
export function useExportReport() {
  return useMutation({
    mutationFn: async ({
      type,
      format,
      filters,
      options
    }: {
      type: ReportType
      format: 'excel'
      filters: ReportFilters
      options?: {
        filename?: string
        title?: string
      }
    }) => {
      const blob = await ReportService.exportReport(type, format, filters, options)

      // Generate filename if not provided
      const timestamp = new Date().toISOString().split('T')[0]
      const defaultFilename = `${type}-report-${timestamp}.xlsx`
      const filename = options?.filename || defaultFilename

      // Download the file
      ReportService.downloadReport(blob, filename)

      return { filename, format, type }
    },
    onSuccess: (data) => {
      toast.success(`Báo cáo ${data.type} đã được xuất thành công!`, {
        description: `File: ${data.filename}`
      })
    },
    onError: (error) => {
      console.error('Export error:', error)
      toast.error('Lỗi khi xuất báo cáo', {
        description: 'Vui lòng thử lại sau'
      })
    }
  })
}

/**
 * Generic hook for any report type
 */
export function useReport(type: ReportType, filters: ReportFilters, enabled = true) {
  const revenueQuery = useRevenueReport(filters, enabled && type === 'revenue')
  const occupancyQuery = useOccupancyReport(filters, enabled && type === 'occupancy')
  const billQuery = useBillReport(filters, enabled && type === 'bills')

  switch (type) {
    case 'revenue':
      return revenueQuery
    case 'occupancy':
      return occupancyQuery
    case 'bills':
      return billQuery
    default:
      throw new Error(`Unsupported report type: ${type}`)
  }
}
