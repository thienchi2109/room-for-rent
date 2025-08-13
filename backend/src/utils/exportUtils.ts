import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import {
  RevenueReportData,
  OccupancyReportData,
  BillReportData,
  ExportOptions,
  ReportSummary
} from '../types/reports'

export class ExportUtils {
  
  /**
   * Export Revenue Report to Excel
   */
  static async exportRevenueToExcel(
    data: RevenueReportData[], 
    summary: ReportSummary,
    options: ExportOptions
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Báo cáo Doanh thu')
    
    // Add title
    worksheet.mergeCells('A1:H1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = options.title || 'BÁO CÁO DOANH THU'
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: 'center' }
    
    // Add period info
    worksheet.mergeCells('A2:H2')
    const periodCell = worksheet.getCell('A2')
    periodCell.value = `Từ ${summary.period.from} đến ${summary.period.to}`
    periodCell.font = { size: 12 }
    periodCell.alignment = { horizontal: 'center' }
    
    // Add headers
    const headers = [
      'Tháng/Năm',
      'Doanh thu đã thu',
      'Doanh thu chưa thu', 
      'Tổng doanh thu',
      'HĐ đã thanh toán',
      'HĐ chưa thanh toán',
      'Tổng hóa đơn',
      'HĐ quá hạn'
    ]
    
    worksheet.addRow([]) // Empty row
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    
    // Add data rows
    data.forEach(row => {
      worksheet.addRow([
        row.period,
        row.paidRevenue,
        row.pendingRevenue,
        row.totalRevenue,
        row.paidBills,
        row.unpaidBills,
        row.totalBills,
        row.overdueBills
      ])
    })
    
    // Format currency columns
    const currencyColumns = ['B', 'C', 'D']
    currencyColumns.forEach(col => {
      worksheet.getColumn(col).numFmt = '#,##0" VNĐ"'
    })
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15
    })
    
    // Add summary section
    const summaryStartRow = worksheet.rowCount + 2
    worksheet.addRow([])
    worksheet.addRow(['TỔNG KẾT'])
    worksheet.addRow(['Tổng doanh thu:', summary.totalRevenue])
    worksheet.addRow(['Tổng hóa đơn:', summary.totalBills])
    worksheet.addRow(['Tỷ lệ lấp đầy:', `${summary.averageOccupancy}%`])
    
    return await workbook.xlsx.writeBuffer() as Buffer
  }
  
  /**
   * Export Occupancy Report to Excel
   */
  static async exportOccupancyToExcel(
    data: OccupancyReportData[], 
    summary: ReportSummary,
    options: ExportOptions
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Báo cáo Lấp đầy')
    
    // Add title
    worksheet.mergeCells('A1:G1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = options.title || 'BÁO CÁO TỶ LỆ LẤP ĐẦY'
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: 'center' }
    
    // Add headers
    const headers = [
      'Tháng/Năm',
      'Tổng phòng',
      'Phòng đã thuê',
      'Phòng trống',
      'Phòng bảo trì',
      'Phòng đặt trước',
      'Tỷ lệ lấp đầy (%)'
    ]
    
    worksheet.addRow([]) // Empty row
    worksheet.addRow([]) // Empty row
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    
    // Add data rows
    data.forEach(row => {
      worksheet.addRow([
        row.period,
        row.totalRooms,
        row.occupiedRooms,
        row.availableRooms,
        row.maintenanceRooms,
        row.reservedRooms,
        row.occupancyRate
      ])
    })
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15
    })
    
    return await workbook.xlsx.writeBuffer() as Buffer
  }
  
  /**
   * Export Revenue Report to PDF
   */
  static async exportRevenueToPDF(
    data: RevenueReportData[], 
    summary: ReportSummary,
    options: ExportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text(options.title || 'BÁO CÁO DOANH THU', 105, 20, { align: 'center' })
    
    // Add period
    doc.setFontSize(12)
    doc.text(`Từ ${summary.period.from} đến ${summary.period.to}`, 105, 30, { align: 'center' })
    
    // Add table headers
    const headers = ['Tháng/Năm', 'Doanh thu đã thu', 'Doanh thu chưa thu', 'Tổng doanh thu']
    let yPosition = 50
    
    doc.setFontSize(10)
    doc.text('Tháng/Năm', 20, yPosition)
    doc.text('Doanh thu đã thu', 60, yPosition)
    doc.text('Doanh thu chưa thu', 110, yPosition)
    doc.text('Tổng doanh thu', 160, yPosition)
    
    yPosition += 10
    
    // Add data rows
    data.forEach(row => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.text(row.period, 20, yPosition)
      doc.text(row.paidRevenue.toLocaleString('vi-VN'), 60, yPosition)
      doc.text(row.pendingRevenue.toLocaleString('vi-VN'), 110, yPosition)
      doc.text(row.totalRevenue.toLocaleString('vi-VN'), 160, yPosition)
      
      yPosition += 8
    })
    
    // Add summary
    yPosition += 10
    doc.setFontSize(12)
    doc.text('TỔNG KẾT:', 20, yPosition)
    yPosition += 10
    doc.setFontSize(10)
    doc.text(`Tổng doanh thu: ${summary.totalRevenue.toLocaleString('vi-VN')} VNĐ`, 20, yPosition)
    yPosition += 8
    doc.text(`Tổng hóa đơn: ${summary.totalBills}`, 20, yPosition)
    yPosition += 8
    doc.text(`Tỷ lệ lấp đầy: ${summary.averageOccupancy}%`, 20, yPosition)
    
    return Buffer.from(doc.output('arraybuffer'))
  }
  
  /**
   * Export Bill Report to Excel
   */
  static async exportBillToExcel(
    data: BillReportData[], 
    summary: ReportSummary,
    options: ExportOptions
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Báo cáo Hóa đơn')
    
    // Add title
    worksheet.mergeCells('A1:I1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = options.title || 'BÁO CÁO HÓA ĐƠN'
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: 'center' }
    
    // Add headers
    const headers = [
      'Tháng/Năm',
      'Tổng HĐ',
      'HĐ đã thanh toán',
      'HĐ chưa thanh toán',
      'HĐ quá hạn',
      'Tổng tiền',
      'Đã thu',
      'Chưa thu',
      'Quá hạn'
    ]
    
    worksheet.addRow([]) // Empty row
    worksheet.addRow([]) // Empty row
    const headerRow = worksheet.addRow(headers)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    
    // Add data rows
    data.forEach(row => {
      worksheet.addRow([
        row.period,
        row.totalBills,
        row.paidBills,
        row.unpaidBills,
        row.overdueBills,
        row.totalAmount,
        row.paidAmount,
        row.pendingAmount,
        row.overdueAmount
      ])
    })
    
    // Format currency columns
    const currencyColumns = ['F', 'G', 'H', 'I']
    currencyColumns.forEach(col => {
      worksheet.getColumn(col).numFmt = '#,##0" VNĐ"'
    })
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 12
    })
    
    return await workbook.xlsx.writeBuffer() as Buffer
  }
}
