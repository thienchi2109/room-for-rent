import ExcelJS from 'exceljs'
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
    
    // Set worksheet properties
    worksheet.properties.defaultRowHeight = 20
    
    // Add professional header with company branding
    worksheet.mergeCells('A1:H1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = options.title || 'BÁO CÁO DOANH THU'
    titleCell.font = { size: 18, bold: true, color: { argb: 'FF1E40AF' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    }
    titleCell.border = {
      top: { style: 'thick', color: { argb: 'FF1E40AF' } },
      bottom: { style: 'thick', color: { argb: 'FF1E40AF' } }
    }
    
    // Add period info with styling
    worksheet.mergeCells('A2:H2')
    const periodCell = worksheet.getCell('A2')
    periodCell.value = `Từ ${summary.period.from} đến ${summary.period.to}`
    periodCell.font = { size: 12, italic: true }
    periodCell.alignment = { horizontal: 'center', vertical: 'middle' }
    
    // Add generated date
    worksheet.mergeCells('A3:H3')
    const dateCell = worksheet.getCell('A3')
    const now = new Date()
    dateCell.value = `Tạo lúc: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`
    dateCell.font = { size: 10, color: { argb: 'FF64748B' } }
    dateCell.alignment = { horizontal: 'center' }

    // Add summary cards section
    let currentRow = 5
    worksheet.addRow([]) // Empty row
    
    // Summary section
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`)
    const summaryTitleCell = worksheet.getCell(`A${currentRow}`)
    summaryTitleCell.value = 'TỔNG QUAN'
    summaryTitleCell.font = { size: 14, bold: true, color: { argb: 'FF1E40AF' } }
    summaryTitleCell.alignment = { horizontal: 'left' }
    currentRow++
    
    // Summary data in cards layout
    const summaryData = [
      ['Tổng doanh thu:', `${summary.totalRevenue.toLocaleString('vi-VN')} VNĐ`, 'Tổng hóa đơn:', summary.totalBills],
      ['Tỷ lệ lấp đầy:', `${summary.averageOccupancy}%`, 'Tổng khách thuê:', summary.totalTenants]
    ]
    
    summaryData.forEach(rowData => {
      const row = worksheet.getRow(currentRow)
      rowData.forEach((value, index) => {
        const cell = row.getCell(index * 2 + 1) // A, C, E, G columns
        cell.value = value
        if (index % 2 === 0) {
          cell.font = { bold: true, color: { argb: 'FF374151' } }
        } else {
          cell.font = { bold: true, color: { argb: 'FF059669' } }
        }
      })
      currentRow++
    })
    
    currentRow += 2 // Add space
    
    // Add data table headers
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
    
    const headerRow = worksheet.getRow(currentRow)
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1)
      cell.value = header
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' }
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    currentRow++

    // Add data rows with professional styling
    data.forEach((row, index) => {
      const dataRow = worksheet.getRow(currentRow)
      const rowData = [
        row.period,
        row.paidRevenue,
        row.pendingRevenue,
        row.totalRevenue,
        row.paidBills,
        row.unpaidBills,
        row.totalBills,
        row.overdueBills
      ]
      
      rowData.forEach((value, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1)
        cell.value = value
        
        // Alternating row colors
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          }
        }
        
        // Add borders
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        
        // Center align numbers
        if (typeof value === 'number') {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        }
        
        // Highlight overdue bills in red
        if (colIndex === 7 && value > 0) {
          cell.font = { bold: true, color: { argb: 'FFDC2626' } }
        }
      })
      currentRow++
    })
    
    // Format currency columns
    const currencyColumns = ['B', 'C', 'D']
    currencyColumns.forEach(col => {
      worksheet.getColumn(col).numFmt = '#,##0" VNĐ"'
    })
    
    // Set column widths for better readability
    const columnWidths = [15, 18, 18, 18, 15, 15, 12, 12]
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width
    })
    
    // Add footer with generation info
    currentRow += 2
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`)
    const footerCell = worksheet.getCell(`A${currentRow}`)
    footerCell.value = 'Room Rental Management System - Báo cáo được tạo tự động'
    footerCell.font = { size: 10, italic: true, color: { argb: 'FF64748B' } }
    footerCell.alignment = { horizontal: 'center' }
    
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

    // Set worksheet properties
    worksheet.properties.defaultRowHeight = 20

    // Add professional header
    worksheet.mergeCells('A1:G1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = options.title || 'BÁO CÁO TỶ LỆ LẤP ĐẦY'
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFA855F7' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3E8FF' }
    }
    titleCell.border = {
      top: { style: 'thick', color: { argb: 'FFA855F7' } },
      bottom: { style: 'thick', color: { argb: 'FFA855F7' } }
    }

    // Add period info
    worksheet.mergeCells('A2:G2')
    const periodCell = worksheet.getCell('A2')
    periodCell.value = `Từ ${summary.period.from} đến ${summary.period.to}`
    periodCell.font = { size: 12, italic: true }
    periodCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // Add summary section
    let currentRow = 4
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`)
    const summaryTitleCell = worksheet.getCell(`A${currentRow}`)
    summaryTitleCell.value = 'TỔNG QUAN'
    summaryTitleCell.font = { size: 14, bold: true, color: { argb: 'FFA855F7' } }
    summaryTitleCell.alignment = { horizontal: 'left' }
    currentRow++

    // Summary data
    const summaryRow = worksheet.getRow(currentRow)
    summaryRow.getCell(1).value = 'Tỷ lệ lấp đầy trung bình:'
    summaryRow.getCell(1).font = { bold: true, color: { argb: 'FF374151' } }
    summaryRow.getCell(2).value = `${summary.averageOccupancy}%`
    summaryRow.getCell(2).font = { bold: true, color: { argb: 'FFA855F7' } }
    summaryRow.getCell(4).value = 'Tổng khách thuê:'
    summaryRow.getCell(4).font = { bold: true, color: { argb: 'FF374151' } }
    summaryRow.getCell(5).value = summary.totalTenants
    summaryRow.getCell(5).font = { bold: true, color: { argb: 'FFA855F7' } }
    currentRow += 3

    // Add table headers
    const headers = [
      'Tháng/Năm',
      'Tổng phòng',
      'Phòng đã thuê',
      'Phòng trống',
      'Phòng bảo trì',
      'Phòng đặt trước',
      'Tỷ lệ lấp đầy (%)'
    ]

    const headerRow = worksheet.getRow(currentRow)
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1)
      cell.value = header
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFA855F7' }
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    currentRow++

    // Add data rows with conditional formatting
    data.forEach((row, index) => {
      const dataRow = worksheet.getRow(currentRow)
      const rowData = [
        row.period,
        row.totalRooms,
        row.occupiedRooms,
        row.availableRooms,
        row.maintenanceRooms,
        row.reservedRooms,
        row.occupancyRate
      ]

      rowData.forEach((value, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1)
        cell.value = value

        // Alternating row colors
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          }
        }

        // Add borders
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

        // Center align numbers
        if (typeof value === 'number') {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        }

        // Color code occupancy rate
        if (colIndex === 6) {
          if (value >= 80) {
            cell.font = { bold: true, color: { argb: 'FF059669' } } // Green
          } else if (value >= 60) {
            cell.font = { bold: true, color: { argb: 'FFD97706' } } // Orange
          } else {
            cell.font = { bold: true, color: { argb: 'FFDC2626' } } // Red
          }
        }
      })
      currentRow++
    })

    // Set column widths
    const columnWidths = [15, 12, 15, 12, 15, 15, 18]
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width
    })

    return await workbook.xlsx.writeBuffer() as Buffer
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
