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
}
  static async exportRevenueToPDF(
    data: RevenueReportData[],
    summary: ReportSummary,
    options: ExportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF()

    // Add professional header
    this.addPDFHeader(doc, options.title || 'BÁO CÁO DOANH THU', summary)

    let yPosition = 80

    // Add summary cards section
    yPosition = this.addSummarySection(doc, summary, yPosition)
    yPosition += 15

    // Add table with professional styling
    const headers = ['Tháng/Năm', 'Doanh thu đã thu', 'Doanh thu chưa thu', 'Tổng doanh thu']
    const columnWidths = [40, 50, 50, 50]
    const startX = 15

    // Table header with background
    doc.setFillColor(59, 130, 246) // Blue background
    doc.setTextColor(255, 255, 255) // White text
    doc.rect(startX, yPosition - 5, 190, 12, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    let xPosition = startX + 5
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition + 2)
      xPosition += columnWidths[index]
    })

    yPosition += 15
    doc.setTextColor(0, 0, 0) // Reset to black
    doc.setFont('helvetica', 'normal')

    // Add data rows with alternating colors
    data.forEach((row, index) => {
      if (yPosition > 250) {
        doc.addPage()
        this.addPDFHeader(doc, options.title || 'BÁO CÁO DOANH THU', summary)
        yPosition = 80
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252) // Light gray
        doc.rect(startX, yPosition - 5, 190, 10, 'F')
      }

      doc.setFontSize(9)
      xPosition = startX + 5

      // Period
      doc.text(row.period, xPosition, yPosition)
      xPosition += columnWidths[0]

      // Paid revenue
      doc.text(this.formatCurrency(row.paidRevenue), xPosition, yPosition)
      xPosition += columnWidths[1]

      // Pending revenue
      doc.text(this.formatCurrency(row.pendingRevenue), xPosition, yPosition)
      xPosition += columnWidths[2]

      // Total revenue
      doc.setFont('helvetica', 'bold')
      doc.text(this.formatCurrency(row.totalRevenue), xPosition, yPosition)
      doc.setFont('helvetica', 'normal')

      yPosition += 10
    })

    // Add footer
    this.addPDFFooter(doc)

    return Buffer.from(doc.output('arraybuffer'))
  }

  /**
   * Export Occupancy Report to PDF
   */
  static async exportOccupancyToPDF(
    data: OccupancyReportData[],
    summary: ReportSummary,
    options: ExportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF()

    // Add professional header
    this.addPDFHeader(doc, options.title || 'BÁO CÁO TỶ LỆ LẤP ĐẦY', summary)

    let yPosition = 80

    // Add summary cards section
    yPosition = this.addOccupancySummarySection(doc, summary, yPosition)
    yPosition += 15

    // Add table with professional styling
    const headers = ['Tháng/Năm', 'Tổng phòng', 'Phòng đã thuê', 'Phòng trống', 'Tỷ lệ lấp đầy']
    const columnWidths = [35, 30, 35, 30, 35]
    const startX = 15

    // Table header with background
    doc.setFillColor(168, 85, 247) // Purple background
    doc.setTextColor(255, 255, 255)
    doc.rect(startX, yPosition - 5, 165, 12, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    let xPosition = startX + 5
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition + 2)
      xPosition += columnWidths[index]
    })

    yPosition += 15
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    // Add data rows
    data.forEach((row, index) => {
      if (yPosition > 250) {
        doc.addPage()
        this.addPDFHeader(doc, options.title || 'BÁO CÁO TỶ LỆ LẤP ĐẦY', summary)
        yPosition = 80
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(startX, yPosition - 5, 165, 10, 'F')
      }

      doc.setFontSize(9)
      xPosition = startX + 5

      doc.text(row.period, xPosition, yPosition)
      xPosition += columnWidths[0]

      doc.text(row.totalRooms.toString(), xPosition, yPosition)
      xPosition += columnWidths[1]

      doc.text(row.occupiedRooms.toString(), xPosition, yPosition)
      xPosition += columnWidths[2]

      doc.text(row.availableRooms.toString(), xPosition, yPosition)
      xPosition += columnWidths[3]

      // Occupancy rate with color coding
      const occupancyRate = row.occupancyRate
      if (occupancyRate >= 80) {
        doc.setTextColor(34, 197, 94) // Green for high occupancy
      } else if (occupancyRate >= 60) {
        doc.setTextColor(245, 158, 11) // Yellow for medium occupancy
      } else {
        doc.setTextColor(239, 68, 68) // Red for low occupancy
      }

      doc.setFont('helvetica', 'bold')
      doc.text(`${occupancyRate}%`, xPosition, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)

      yPosition += 10
    })

    // Add footer
    this.addPDFFooter(doc)

    return Buffer.from(doc.output('arraybuffer'))
  }

  /**
   * Export Bills Report to PDF
   */
  static async exportBillsToPDF(
    data: BillReportData[],
    summary: ReportSummary,
    options: ExportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF()

    // Add professional header
    this.addPDFHeader(doc, options.title || 'BÁO CÁO HÓA ĐƠN', summary)

    let yPosition = 80

    // Add summary cards section
    yPosition = this.addBillsSummarySection(doc, summary, yPosition)
    yPosition += 15

    // Add table with professional styling
    const headers = ['Tháng/Năm', 'Tổng HĐ', 'Đã thanh toán', 'Chưa thanh toán', 'Quá hạn', 'Tổng tiền']
    const columnWidths = [25, 20, 30, 30, 20, 35]
    const startX = 10

    // Table header with background
    doc.setFillColor(245, 101, 101) // Red background
    doc.setTextColor(255, 255, 255)
    doc.rect(startX, yPosition - 5, 180, 12, 'F')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    let xPosition = startX + 3
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition + 2)
      xPosition += columnWidths[index]
    })

    yPosition += 15
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    // Add data rows
    data.forEach((row, index) => {
      if (yPosition > 250) {
        doc.addPage()
        this.addPDFHeader(doc, options.title || 'BÁO CÁO HÓA ĐƠN', summary)
        yPosition = 80
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(startX, yPosition - 5, 180, 10, 'F')
      }

      doc.setFontSize(8)
      xPosition = startX + 3

      doc.text(row.period, xPosition, yPosition)
      xPosition += columnWidths[0]

      doc.text(row.totalBills.toString(), xPosition, yPosition)
      xPosition += columnWidths[1]

      doc.text(row.paidBills.toString(), xPosition, yPosition)
      xPosition += columnWidths[2]

      doc.text(row.unpaidBills.toString(), xPosition, yPosition)
      xPosition += columnWidths[3]

      // Overdue bills with red color if > 0
      if (row.overdueBills > 0) {
        doc.setTextColor(239, 68, 68)
        doc.setFont('helvetica', 'bold')
      }
      doc.text(row.overdueBills.toString(), xPosition, yPosition)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      xPosition += columnWidths[4]

      doc.setFont('helvetica', 'bold')
      doc.text(this.formatCurrency(row.totalAmount), xPosition, yPosition)
      doc.setFont('helvetica', 'normal')

      yPosition += 10
    })

    // Add footer
    this.addPDFFooter(doc)

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

  /**
   * Add professional PDF header
   */
  private static addPDFHeader(doc: jsPDF, title: string, summary: ReportSummary) {
    // Header background
    doc.setFillColor(15, 23, 42) // Dark blue background
    doc.rect(0, 0, 210, 35, 'F')

    // Company name/logo area
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ROOM RENTAL MANAGEMENT', 15, 15)

    // Report title
    doc.setFontSize(18)
    doc.text(title, 15, 25)

    // Date range
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Từ ${summary.period.from} đến ${summary.period.to}`, 15, 32)

    // Generated date
    const now = new Date()
    const generatedDate = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN')
    doc.text(`Tạo lúc: ${generatedDate}`, 140, 32)

    // Reset text color
    doc.setTextColor(0, 0, 0)
  }

  /**
   * Add summary section with cards
   */
  private static addSummarySection(doc: jsPDF, summary: ReportSummary, yPosition: number): number {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TỔNG QUAN', 15, yPosition)
    yPosition += 15

    // Summary cards layout
    const cardWidth = 90
    const cardHeight = 25
    const cardSpacing = 10

    // Card 1: Total Revenue
    doc.setFillColor(34, 197, 94) // Green
    doc.rect(15, yPosition, cardWidth, cardHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text('TỔNG DOANH THU', 20, yPosition + 8)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(this.formatCurrency(summary.totalRevenue), 20, yPosition + 18)

    // Card 2: Total Bills
    doc.setFillColor(59, 130, 246) // Blue
    doc.rect(15 + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('TỔNG HÓA ĐƠN', 20 + cardWidth + cardSpacing, yPosition + 8)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(summary.totalBills.toString(), 20 + cardWidth + cardSpacing, yPosition + 18)

    yPosition += cardHeight + 10

    // Card 3: Occupancy Rate
    doc.setFillColor(168, 85, 247) // Purple
    doc.rect(15, yPosition, cardWidth, cardHeight, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('TỶ LỆ LẤP ĐẦY', 20, yPosition + 8)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${summary.averageOccupancy}%`, 20, yPosition + 18)

    // Card 4: Total Tenants
    doc.setFillColor(245, 101, 101) // Red
    doc.rect(15 + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('TỔNG KHÁCH THUÊ', 20 + cardWidth + cardSpacing, yPosition + 8)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(summary.totalTenants.toString(), 20 + cardWidth + cardSpacing, yPosition + 18)

    // Reset colors
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    return yPosition + cardHeight
  }

  /**
   * Add professional PDF footer
   */
  private static addPDFFooter(doc: jsPDF) {
    const pageCount = doc.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      // Footer line
      doc.setDrawColor(200, 200, 200)
      doc.line(15, 285, 195, 285)

      // Footer text
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('Room Rental Management System - Báo cáo được tạo tự động', 15, 290)
      doc.text(`Trang ${i} / ${pageCount}`, 180, 290)
    }
  }

  /**
   * Add occupancy summary section
   */
  private static addOccupancySummarySection(doc: jsPDF, summary: ReportSummary, yPosition: number): number {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TỔNG QUAN', 15, yPosition)
    yPosition += 15

    const cardWidth = 90
    const cardHeight = 25
    const cardSpacing = 10

    // Card 1: Average Occupancy
    doc.setFillColor(168, 85, 247) // Purple
    doc.rect(15, yPosition, cardWidth, cardHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text('TỶ LỆ LẤP ĐẦY TB', 20, yPosition + 8)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${summary.averageOccupancy}%`, 20, yPosition + 18)

    // Card 2: Total Tenants
    doc.setFillColor(34, 197, 94) // Green
    doc.rect(15 + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('TỔNG KHÁCH THUÊ', 20 + cardWidth + cardSpacing, yPosition + 8)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(summary.totalTenants.toString(), 20 + cardWidth + cardSpacing, yPosition + 18)

    // Reset colors
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    return yPosition + cardHeight
  }

  /**
   * Add bills summary section
   */
  private static addBillsSummarySection(doc: jsPDF, summary: ReportSummary, yPosition: number): number {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TỔNG QUAN', 15, yPosition)
    yPosition += 15

    const cardWidth = 90
    const cardHeight = 25
    const cardSpacing = 10

    // Card 1: Total Revenue
    doc.setFillColor(34, 197, 94) // Green
    doc.rect(15, yPosition, cardWidth, cardHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text('TỔNG DOANH THU', 20, yPosition + 8)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(this.formatCurrency(summary.totalRevenue), 20, yPosition + 18)

    // Card 2: Total Bills
    doc.setFillColor(245, 101, 101) // Red
    doc.rect(15 + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('TỔNG HÓA ĐƠN', 20 + cardWidth + cardSpacing, yPosition + 8)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(summary.totalBills.toString(), 20 + cardWidth + cardSpacing, yPosition + 18)

    // Reset colors
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    return yPosition + cardHeight
  }

  /**
   * Format currency for display
   */
  private static formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + ' VNĐ'
  }
}
