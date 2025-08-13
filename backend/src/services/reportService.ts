import { PrismaClient, BillStatus, ContractStatus, RoomStatus } from '@prisma/client'
import {
  ReportFilters,
  RevenueReportData,
  OccupancyReportData,
  TenantReportData,
  BillReportData,
  ContractReportData,
  ReportSummary,
  DateRange
} from '../types/reports'

const prisma = new PrismaClient()

export class ReportService {
  
  /**
   * Generate Revenue Report
   */
  static async generateRevenueReport(filters: ReportFilters): Promise<RevenueReportData[]> {
    const { startDate, endDate } = filters.dateRange
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth() + 1
    const endYear = endDate.getFullYear()
    const endMonth = endDate.getMonth() + 1
    
    const revenueData: RevenueReportData[] = []
    
    // Generate data for each month in the range
    let currentYear = startYear
    let currentMonth = startMonth
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      // Get paid revenue for this month
      const paidRevenue = await prisma.bill.aggregate({
        where: {
          month: currentMonth,
          year: currentYear,
          status: BillStatus.PAID,
          ...(filters.roomIds && { roomId: { in: filters.roomIds } })
        },
        _sum: { totalAmount: true }
      })
      
      // Get pending revenue for this month
      const pendingRevenue = await prisma.bill.aggregate({
        where: {
          month: currentMonth,
          year: currentYear,
          status: BillStatus.UNPAID,
          ...(filters.roomIds && { roomId: { in: filters.roomIds } })
        },
        _sum: { totalAmount: true }
      })
      
      // Get bill counts
      const billCounts = await prisma.bill.groupBy({
        by: ['status'],
        where: {
          month: currentMonth,
          year: currentYear,
          ...(filters.roomIds && { roomId: { in: filters.roomIds } })
        },
        _count: { id: true }
      })
      
      // Get overdue bills count
      const overdueBills = await prisma.bill.count({
        where: {
          month: currentMonth,
          year: currentYear,
          status: BillStatus.UNPAID,
          dueDate: { lt: new Date() },
          ...(filters.roomIds && { roomId: { in: filters.roomIds } })
        }
      })
      
      const paidCount = billCounts.find(b => b.status === BillStatus.PAID)?._count.id || 0
      const unpaidCount = billCounts.find(b => b.status === BillStatus.UNPAID)?._count.id || 0
      
      revenueData.push({
        period: `${currentMonth}/${currentYear}`,
        month: currentMonth,
        year: currentYear,
        monthName: new Date(currentYear, currentMonth - 1).toLocaleDateString('vi-VN', { month: 'long' }),
        paidRevenue: paidRevenue._sum.totalAmount?.toNumber() || 0,
        pendingRevenue: pendingRevenue._sum.totalAmount?.toNumber() || 0,
        totalRevenue: (paidRevenue._sum.totalAmount?.toNumber() || 0) + (pendingRevenue._sum.totalAmount?.toNumber() || 0),
        paidBills: paidCount,
        unpaidBills: unpaidCount,
        totalBills: paidCount + unpaidCount,
        overdueBills
      })
      
      // Move to next month
      currentMonth++
      if (currentMonth > 12) {
        currentMonth = 1
        currentYear++
      }
    }
    
    return revenueData
  }
  
  /**
   * Generate Occupancy Report
   */
  static async generateOccupancyReport(filters: ReportFilters): Promise<OccupancyReportData[]> {
    const { startDate, endDate } = filters.dateRange
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth() + 1
    const endYear = endDate.getFullYear()
    const endMonth = endDate.getMonth() + 1
    
    const occupancyData: OccupancyReportData[] = []
    
    let currentYear = startYear
    let currentMonth = startMonth
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      // Get room counts by status
      const roomCounts = await prisma.room.groupBy({
        by: ['status'],
        where: {
          ...(filters.roomIds && { id: { in: filters.roomIds } })
        },
        _count: { id: true }
      })
      
      const totalRooms = roomCounts.reduce((sum, item) => sum + item._count.id, 0)
      const occupiedRooms = roomCounts.find(r => r.status === RoomStatus.OCCUPIED)?._count.id || 0
      const availableRooms = roomCounts.find(r => r.status === RoomStatus.AVAILABLE)?._count.id || 0
      const maintenanceRooms = roomCounts.find(r => r.status === RoomStatus.MAINTENANCE)?._count.id || 0
      const reservedRooms = roomCounts.find(r => r.status === RoomStatus.RESERVED)?._count.id || 0
      
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
      
      occupancyData.push({
        period: `${currentMonth}/${currentYear}`,
        month: currentMonth,
        year: currentYear,
        totalRooms,
        occupiedRooms,
        availableRooms,
        maintenanceRooms,
        reservedRooms,
        occupancyRate
      })
      
      // Move to next month
      currentMonth++
      if (currentMonth > 12) {
        currentMonth = 1
        currentYear++
      }
    }
    
    return occupancyData
  }
  
  /**
   * Generate Bill Report
   */
  static async generateBillReport(filters: ReportFilters): Promise<BillReportData[]> {
    const { startDate, endDate } = filters.dateRange
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth() + 1
    const endYear = endDate.getFullYear()
    const endMonth = endDate.getMonth() + 1
    
    const billData: BillReportData[] = []
    
    let currentYear = startYear
    let currentMonth = startMonth
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      // Get bill statistics for this month
      const bills = await prisma.bill.findMany({
        where: {
          month: currentMonth,
          year: currentYear,
          ...(filters.roomIds && { roomId: { in: filters.roomIds } })
        }
      })
      
      const totalBills = bills.length
      const paidBills = bills.filter(b => b.status === BillStatus.PAID).length
      const unpaidBills = bills.filter(b => b.status === BillStatus.UNPAID).length
      const overdueBills = bills.filter(b => b.status === BillStatus.UNPAID && b.dueDate < new Date()).length
      
      const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount.toNumber(), 0)
      const paidAmount = bills.filter(b => b.status === BillStatus.PAID).reduce((sum, bill) => sum + bill.totalAmount.toNumber(), 0)
      const pendingAmount = bills.filter(b => b.status === BillStatus.UNPAID).reduce((sum, bill) => sum + bill.totalAmount.toNumber(), 0)
      const overdueAmount = bills.filter(b => b.status === BillStatus.UNPAID && b.dueDate < new Date()).reduce((sum, bill) => sum + bill.totalAmount.toNumber(), 0)
      
      const averageBillAmount = totalBills > 0 ? totalAmount / totalBills : 0
      
      billData.push({
        period: `${currentMonth}/${currentYear}`,
        month: currentMonth,
        year: currentYear,
        totalBills,
        paidBills,
        unpaidBills,
        overdueBills,
        totalAmount,
        paidAmount,
        pendingAmount: pendingAmount,
        overdueAmount,
        averageBillAmount
      })
      
      // Move to next month
      currentMonth++
      if (currentMonth > 12) {
        currentMonth = 1
        currentYear++
      }
    }
    
    return billData
  }
  
  /**
   * Generate Report Summary
   */
  static async generateReportSummary(filters: ReportFilters): Promise<ReportSummary> {
    const { startDate, endDate } = filters.dateRange
    
    // Calculate total revenue
    const totalRevenue = await prisma.bill.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: BillStatus.PAID,
        ...(filters.roomIds && { roomId: { in: filters.roomIds } })
      },
      _sum: { totalAmount: true }
    })
    
    // Calculate total bills
    const totalBills = await prisma.bill.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(filters.roomIds && { roomId: { in: filters.roomIds } })
      }
    })
    
    // Calculate average occupancy
    const roomCounts = await prisma.room.groupBy({
      by: ['status'],
      where: {
        ...(filters.roomIds && { id: { in: filters.roomIds } })
      },
      _count: { id: true }
    })
    
    const totalRooms = roomCounts.reduce((sum, item) => sum + item._count.id, 0)
    const occupiedRooms = roomCounts.find(r => r.status === RoomStatus.OCCUPIED)?._count.id || 0
    const averageOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
    
    // Calculate total tenants
    const totalTenants = await prisma.contractTenant.count({
      where: {
        contract: {
          status: ContractStatus.ACTIVE,
          ...(filters.roomIds && { roomId: { in: filters.roomIds } })
        }
      }
    })
    
    // Calculate total contracts
    const totalContracts = await prisma.contract.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(filters.roomIds && { roomId: { in: filters.roomIds } })
      }
    })
    
    const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    
    return {
      totalRevenue: totalRevenue._sum.totalAmount?.toNumber() || 0,
      totalBills,
      averageOccupancy,
      totalTenants,
      totalContracts,
      period: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        months
      }
    }
  }
}
