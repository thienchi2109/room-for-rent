import { api } from '@/lib/api'
import { 
  ReportType, 
  ReportFilters, 
  ReportResponse, 
  RevenueReportData, 
  OccupancyReportData, 
  BillReportData,
  ReportSummary 
} from '@/types/report'

export class ReportService {
  
  /**
   * Generate Revenue Report
   */
  static async generateRevenueReport(filters: ReportFilters): Promise<ReportResponse<RevenueReportData>> {
    const params = new URLSearchParams({
      type: 'revenue',
      startDate: filters.dateRange.startDate.toISOString(),
      endDate: filters.dateRange.endDate.toISOString(),
    })
    
    if (filters.roomIds?.length) {
      filters.roomIds.forEach(id => params.append('roomIds', id))
    }
    
    const response = await api.get<ReportResponse<RevenueReportData>>(`/reports/revenue?${params.toString()}`)
    return response
  }
  
  /**
   * Generate Occupancy Report
   */
  static async generateOccupancyReport(filters: ReportFilters): Promise<ReportResponse<OccupancyReportData>> {
    const params = new URLSearchParams({
      type: 'occupancy',
      startDate: filters.dateRange.startDate.toISOString(),
      endDate: filters.dateRange.endDate.toISOString(),
    })
    
    if (filters.roomIds?.length) {
      filters.roomIds.forEach(id => params.append('roomIds', id))
    }
    
    const response = await api.get<ReportResponse<OccupancyReportData>>(`/reports/occupancy?${params.toString()}`)
    return response
  }
  
  /**
   * Generate Bill Report
   */
  static async generateBillReport(filters: ReportFilters): Promise<ReportResponse<BillReportData>> {
    const params = new URLSearchParams({
      type: 'bills',
      startDate: filters.dateRange.startDate.toISOString(),
      endDate: filters.dateRange.endDate.toISOString(),
    })
    
    if (filters.roomIds?.length) {
      filters.roomIds.forEach(id => params.append('roomIds', id))
    }
    
    const response = await api.get<ReportResponse<BillReportData>>(`/reports/bills?${params.toString()}`)
    return response
  }
  
  /**
   * Get Report Summary
   */
  static async getReportSummary(filters: ReportFilters): Promise<ReportSummary> {
    const params = new URLSearchParams({
      type: 'summary',
      startDate: filters.dateRange.startDate.toISOString(),
      endDate: filters.dateRange.endDate.toISOString(),
    })
    
    if (filters.roomIds?.length) {
      filters.roomIds.forEach(id => params.append('roomIds', id))
    }
    
    const response = await api.get<{ success: boolean; data: ReportSummary }>(`/reports/summary?${params.toString()}`)
    return response.data
  }
  
  /**
   * Export Report
   */
  static async exportReport(
    type: ReportType,
    format: 'pdf' | 'excel',
    filters: ReportFilters,
    options?: {
      filename?: string
      title?: string
    }
  ): Promise<Blob> {
    const params = new URLSearchParams({
      type,
      format,
      startDate: filters.dateRange.startDate.toISOString(),
      endDate: filters.dateRange.endDate.toISOString(),
    })
    
    if (filters.roomIds?.length) {
      filters.roomIds.forEach(id => params.append('roomIds', id))
    }
    
    if (options?.filename) {
      params.append('filename', options.filename)
    }
    
    if (options?.title) {
      params.append('title', options.title)
    }
    
    const response = await api.get<Blob>(`/reports/export?${params.toString()}`, {
      responseType: 'blob'
    })

    return response
  }
  
  /**
   * Download exported report
   */
  static downloadReport(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}
