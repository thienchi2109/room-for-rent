import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { ReportService } from '../services/reportService'
import { ExportUtils } from '../utils/exportUtils'
import { ReportFilters, ReportType, ExportOptions } from '../types/reports'
import Joi from 'joi'

const router = Router()

// Validation schemas
const reportQuerySchema = Joi.object({
  type: Joi.string().valid('revenue', 'occupancy', 'tenants', 'bills', 'contracts').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  roomIds: Joi.array().items(Joi.string()).optional(),
  tenantIds: Joi.array().items(Joi.string()).optional(),
  contractIds: Joi.array().items(Joi.string()).optional(),
  status: Joi.array().items(Joi.string()).optional()
})

const exportQuerySchema = Joi.object({
  type: Joi.string().valid('revenue', 'occupancy', 'bills').required(),
  format: Joi.string().valid('pdf', 'excel').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  roomIds: Joi.array().items(Joi.string()).optional(),
  filename: Joi.string().optional(),
  title: Joi.string().optional()
})

/**
 * GET /api/reports/revenue
 * Generate revenue report
 */
router.get('/revenue', authenticate, validateRequest(reportQuerySchema), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, roomIds } = req.query
    
    const filters: ReportFilters = {
      dateRange: {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      },
      ...(roomIds && { roomIds: Array.isArray(roomIds) ? roomIds as string[] : [roomIds as string] })
    }
    
    const [reportData, summary] = await Promise.all([
      ReportService.generateRevenueReport(filters),
      ReportService.generateReportSummary(filters)
    ])
    
    res.json({
      success: true,
      data: {
        type: 'revenue',
        filters,
        summary,
        reportData,
        generatedAt: new Date(),
        totalRecords: reportData.length
      }
    })
    
  } catch (error) {
    console.error('Revenue report error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate revenue report'
    })
  }
})

/**
 * GET /api/reports/occupancy
 * Generate occupancy report
 */
router.get('/occupancy', authenticate, validateRequest(reportQuerySchema), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, roomIds } = req.query
    
    const filters: ReportFilters = {
      dateRange: {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      },
      ...(roomIds && { roomIds: Array.isArray(roomIds) ? roomIds as string[] : [roomIds as string] })
    }
    
    const [reportData, summary] = await Promise.all([
      ReportService.generateOccupancyReport(filters),
      ReportService.generateReportSummary(filters)
    ])
    
    res.json({
      success: true,
      data: {
        type: 'occupancy',
        filters,
        summary,
        reportData,
        generatedAt: new Date(),
        totalRecords: reportData.length
      }
    })
    
  } catch (error) {
    console.error('Occupancy report error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate occupancy report'
    })
  }
})

/**
 * GET /api/reports/bills
 * Generate bill report
 */
router.get('/bills', authenticate, validateRequest(reportQuerySchema), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, roomIds } = req.query
    
    const filters: ReportFilters = {
      dateRange: {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      },
      ...(roomIds && { roomIds: Array.isArray(roomIds) ? roomIds as string[] : [roomIds as string] })
    }
    
    const [reportData, summary] = await Promise.all([
      ReportService.generateBillReport(filters),
      ReportService.generateReportSummary(filters)
    ])
    
    res.json({
      success: true,
      data: {
        type: 'bills',
        filters,
        summary,
        reportData,
        generatedAt: new Date(),
        totalRecords: reportData.length
      }
    })
    
  } catch (error) {
    console.error('Bill report error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate bill report'
    })
  }
})

/**
 * GET /api/reports/export
 * Export report to PDF or Excel
 */
router.get('/export', authenticate, validateRequest(exportQuerySchema), async (req: Request, res: Response) => {
  try {
    const { type, format, startDate, endDate, roomIds, filename, title } = req.query
    
    const filters: ReportFilters = {
      dateRange: {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      },
      ...(roomIds && { roomIds: Array.isArray(roomIds) ? roomIds as string[] : [roomIds as string] })
    }
    
    const exportOptions: ExportOptions = {
      format: format as 'pdf' | 'excel',
      filename: filename as string,
      title: title as string
    }
    
    let buffer: Buffer
    let contentType: string
    let defaultFilename: string
    
    const summary = await ReportService.generateReportSummary(filters)
    
    switch (type) {
      case 'revenue':
        const revenueData = await ReportService.generateRevenueReport(filters)
        if (format === 'excel') {
          buffer = await ExportUtils.exportRevenueToExcel(revenueData, summary, exportOptions)
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          defaultFilename = `revenue-report-${Date.now()}.xlsx`
        } else {
          buffer = await ExportUtils.exportRevenueToPDF(revenueData, summary, exportOptions)
          contentType = 'application/pdf'
          defaultFilename = `revenue-report-${Date.now()}.pdf`
        }
        break
        
      case 'occupancy':
        const occupancyData = await ReportService.generateOccupancyReport(filters)
        if (format === 'excel') {
          buffer = await ExportUtils.exportOccupancyToExcel(occupancyData, summary, exportOptions)
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          defaultFilename = `occupancy-report-${Date.now()}.xlsx`
        } else {
          // PDF export for occupancy (would need to implement)
          throw new Error('PDF export for occupancy report not implemented yet')
        }
        break
        
      case 'bills':
        const billData = await ReportService.generateBillReport(filters)
        if (format === 'excel') {
          buffer = await ExportUtils.exportBillToExcel(billData, summary, exportOptions)
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          defaultFilename = `bill-report-${Date.now()}.xlsx`
        } else {
          // PDF export for bills (would need to implement)
          throw new Error('PDF export for bill report not implemented yet')
        }
        break
        
      default:
        throw new Error(`Unsupported report type: ${type}`)
    }
    
    const finalFilename = filename || defaultFilename
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`)
    res.setHeader('Content-Length', buffer.length)
    
    res.send(buffer)
    
  } catch (error) {
    console.error('Export report error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to export report'
    })
  }
})

/**
 * GET /api/reports/summary
 * Get report summary for given filters
 */
router.get('/summary', authenticate, validateRequest(reportQuerySchema), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, roomIds } = req.query
    
    const filters: ReportFilters = {
      dateRange: {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      },
      ...(roomIds && { roomIds: Array.isArray(roomIds) ? roomIds as string[] : [roomIds as string] })
    }
    
    const summary = await ReportService.generateReportSummary(filters)
    
    res.json({
      success: true,
      data: summary
    })
    
  } catch (error) {
    console.error('Report summary error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate report summary'
    })
  }
})

export default router
