import { Router, Request, Response } from 'express'
import { PrismaClient, BillStatus, ContractStatus } from '@prisma/client'
import { authenticate } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import Joi from 'joi'

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const overviewQuerySchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2020).max(2100).optional()
})

const revenueQuerySchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2100).optional(),
  months: Joi.number().integer().min(1).max(24).default(12)
})

const notificationsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20)
})

/**
 * GET /api/dashboard/overview
 * Get key metrics for dashboard overview
 */
router.get('/overview', authenticate, validateRequest(overviewQuerySchema), async (req: Request, res: Response) => {
  try {
    const currentDate = new Date()
    const month = parseInt(req.query.month as string) || (currentDate.getMonth() + 1)
    const year = parseInt(req.query.year as string) || currentDate.getFullYear()

    // Get room statistics
    const [totalRooms, occupiedRooms, availableRooms, maintenanceRooms] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { status: 'OCCUPIED' } }),
      prisma.room.count({ where: { status: 'AVAILABLE' } }),
      prisma.room.count({ where: { status: 'MAINTENANCE' } })
    ])

    // Get tenant count from active contracts
    const totalTenants = await prisma.contractTenant.count({
      where: {
        contract: {
          status: ContractStatus.ACTIVE
        }
      }
    })

    // Get active contracts count
    const activeContracts = await prisma.contract.count({
      where: { status: ContractStatus.ACTIVE }
    })

    // Calculate monthly revenue from paid bills
    const monthlyRevenue = await prisma.bill.aggregate({
      where: {
        month,
        year,
        status: BillStatus.PAID
      },
      _sum: {
        totalAmount: true
      }
    })

    // Calculate pending revenue from unpaid bills
    const pendingRevenue = await prisma.bill.aggregate({
      where: {
        month,
        year,
        status: BillStatus.UNPAID
      },
      _sum: {
        totalAmount: true
      }
    })

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    // Get overdue bills count
    const overdueBills = await prisma.bill.count({
      where: {
        status: BillStatus.UNPAID,
        dueDate: {
          lt: new Date()
        }
      }
    })

    res.json({
      success: true,
      data: {
        // Room statistics
        rooms: {
          total: totalRooms,
          occupied: occupiedRooms,
          available: availableRooms,
          maintenance: maintenanceRooms,
          occupancyRate
        },
        // Tenant and contract statistics
        tenants: {
          total: totalTenants,
          activeContracts
        },
        // Revenue statistics
        revenue: {
          monthly: monthlyRevenue._sum.totalAmount?.toNumber() || 0,
          pending: pendingRevenue._sum.totalAmount?.toNumber() || 0,
          period: { month, year }
        },
        // Alert statistics
        alerts: {
          overdueBills,
          maintenanceRooms
        }
      }
    })

  } catch (error) {
    console.error('Dashboard overview error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch dashboard overview'
    })
  }
})

/**
 * GET /api/dashboard/revenue
 * Get revenue chart data by month
 */
router.get('/revenue', authenticate, validateRequest(revenueQuerySchema), async (req: Request, res: Response) => {
  try {
    const currentDate = new Date()
    const year = parseInt(req.query.year as string) || currentDate.getFullYear()
    const months = parseInt(req.query.months as string) || 12

    // Calculate start month/year based on requested months
    let startYear = year
    let startMonth = 1

    if (months <= 12) {
      startMonth = Math.max(1, 13 - months)
    } else {
      // For more than 12 months, go back to previous year(s)
      const totalMonths = months - 1
      startYear = year - Math.floor(totalMonths / 12)
      startMonth = 12 - (totalMonths % 12)
    }

    // Get revenue data for each month
    const revenueData = []

    for (let i = 0; i < months; i++) {
      let currentMonth = startMonth + i
      let currentYear = startYear

      // Handle year overflow
      if (currentMonth > 12) {
        currentYear += Math.floor((currentMonth - 1) / 12)
        currentMonth = ((currentMonth - 1) % 12) + 1
      }

      // Get paid revenue for this month
      const paidRevenue = await prisma.bill.aggregate({
        where: {
          month: currentMonth,
          year: currentYear,
          status: BillStatus.PAID
        },
        _sum: {
          totalAmount: true
        }
      })

      // Get pending revenue for this month
      const pendingRevenue = await prisma.bill.aggregate({
        where: {
          month: currentMonth,
          year: currentYear,
          status: BillStatus.UNPAID
        },
        _sum: {
          totalAmount: true
        }
      })

      // Get bill counts
      const billCounts = await prisma.bill.groupBy({
        by: ['status'],
        where: {
          month: currentMonth,
          year: currentYear
        },
        _count: {
          id: true
        }
      })

      const paidCount = billCounts.find(b => b.status === BillStatus.PAID)?._count.id || 0
      const unpaidCount = billCounts.find(b => b.status === BillStatus.UNPAID)?._count.id || 0

      revenueData.push({
        month: currentMonth,
        year: currentYear,
        monthName: new Date(currentYear, currentMonth - 1).toLocaleDateString('vi-VN', { month: 'long' }),
        period: `${currentMonth}/${currentYear}`,
        paidRevenue: paidRevenue._sum.totalAmount?.toNumber() || 0,
        pendingRevenue: pendingRevenue._sum.totalAmount?.toNumber() || 0,
        totalRevenue: (paidRevenue._sum.totalAmount?.toNumber() || 0) + (pendingRevenue._sum.totalAmount?.toNumber() || 0),
        paidBills: paidCount,
        unpaidBills: unpaidCount,
        totalBills: paidCount + unpaidCount
      })
    }

    // Calculate summary statistics
    const totalPaidRevenue = revenueData.reduce((sum, item) => sum + item.paidRevenue, 0)
    const totalPendingRevenue = revenueData.reduce((sum, item) => sum + item.pendingRevenue, 0)
    const totalBills = revenueData.reduce((sum, item) => sum + item.totalBills, 0)

    res.json({
      success: true,
      data: {
        revenueData,
        summary: {
          totalPaidRevenue,
          totalPendingRevenue,
          totalRevenue: totalPaidRevenue + totalPendingRevenue,
          totalBills,
          period: {
            from: { month: startMonth, year: startYear },
            to: { month: revenueData[revenueData.length - 1]?.month || 12, year },
            months
          }
        }
      }
    })

  } catch (error) {
    console.error('Dashboard revenue error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch revenue data'
    })
  }
})

/**
 * GET /api/dashboard/notifications
 * Get dashboard notifications and alerts
 */
router.get('/notifications', authenticate, validateRequest(notificationsQuerySchema), async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const currentDate = new Date()

    interface Notification {
      id: string
      type: 'overdue_bill' | 'expiring_contract' | 'maintenance_room' | 'payment_received'
      priority: 'high' | 'medium' | 'low' | 'info'
      title: string
      message: string
      details: any
      createdAt: Date
      actionRequired: boolean
    }

    const notifications: Notification[] = []

    // 1. Overdue bills
    const overdueBills = await prisma.bill.findMany({
      where: {
        status: BillStatus.UNPAID,
        dueDate: {
          lt: currentDate
        }
      },
      include: {
        room: {
          select: {
            number: true,
            floor: true
          }
        },
        contract: {
          select: {
            contractNumber: true,
            tenants: {
              include: {
                tenant: {
                  select: {
                    fullName: true,
                    phone: true
                  }
                }
              },
              where: {
                isPrimary: true
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: Math.floor(limit * 0.4) // 40% of limit for overdue bills
    })

    overdueBills.forEach(bill => {
      const daysPastDue = Math.floor((currentDate.getTime() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      const primaryTenant = bill.contract.tenants[0]?.tenant

      notifications.push({
        id: `overdue-bill-${bill.id}`,
        type: 'overdue_bill',
        priority: daysPastDue > 30 ? 'high' : daysPastDue > 7 ? 'medium' : 'low',
        title: `Hóa đơn quá hạn - Phòng ${bill.room.number}`,
        message: `Hóa đơn tháng ${bill.month}/${bill.year} đã quá hạn ${daysPastDue} ngày`,
        details: {
          roomNumber: bill.room.number,
          floor: bill.room.floor,
          amount: bill.totalAmount.toNumber(),
          dueDate: bill.dueDate,
          daysPastDue,
          tenantName: primaryTenant?.fullName,
          tenantPhone: primaryTenant?.phone,
          contractNumber: bill.contract.contractNumber
        },
        createdAt: bill.dueDate,
        actionRequired: true
      })
    })

    // 2. Contracts expiring soon (within 30 days)
    const expiringContracts = await prisma.contract.findMany({
      where: {
        status: ContractStatus.ACTIVE,
        endDate: {
          gte: currentDate,
          lte: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      },
      include: {
        room: {
          select: {
            number: true,
            floor: true
          }
        },
        tenants: {
          include: {
            tenant: {
              select: {
                fullName: true,
                phone: true
              }
            }
          },
          where: {
            isPrimary: true
          },
          take: 1
        }
      },
      orderBy: {
        endDate: 'asc'
      },
      take: Math.floor(limit * 0.3) // 30% of limit for expiring contracts
    })

    expiringContracts.forEach(contract => {
      const daysUntilExpiry = Math.floor((new Date(contract.endDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      const primaryTenant = contract.tenants[0]?.tenant

      notifications.push({
        id: `expiring-contract-${contract.id}`,
        type: 'expiring_contract',
        priority: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 15 ? 'medium' : 'low',
        title: `Hợp đồng sắp hết hạn - Phòng ${contract.room.number}`,
        message: `Hợp đồng ${contract.contractNumber} sẽ hết hạn trong ${daysUntilExpiry} ngày`,
        details: {
          roomNumber: contract.room.number,
          floor: contract.room.floor,
          contractNumber: contract.contractNumber,
          endDate: contract.endDate,
          daysUntilExpiry,
          tenantName: primaryTenant?.fullName,
          tenantPhone: primaryTenant?.phone
        },
        createdAt: contract.endDate,
        actionRequired: true
      })
    })

    // 3. Rooms in maintenance
    const maintenanceRooms = await prisma.room.findMany({
      where: {
        status: 'MAINTENANCE'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: Math.floor(limit * 0.2) // 20% of limit for maintenance rooms
    })

    maintenanceRooms.forEach(room => {
      notifications.push({
        id: `maintenance-room-${room.id}`,
        type: 'maintenance_room',
        priority: 'medium',
        title: `Phòng đang bảo trì - Phòng ${room.number}`,
        message: `Phòng ${room.number} (Tầng ${room.floor}) đang trong trạng thái bảo trì`,
        details: {
          roomNumber: room.number,
          floor: room.floor,
          area: room.area,
          basePrice: room.basePrice.toNumber(),
          lastUpdated: room.updatedAt
        },
        createdAt: room.updatedAt,
        actionRequired: false
      })
    })

    // 4. Recent successful payments (positive notifications)
    const recentPayments = await prisma.bill.findMany({
      where: {
        status: BillStatus.PAID,
        paidDate: {
          gte: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        room: {
          select: {
            number: true
          }
        }
      },
      orderBy: {
        paidDate: 'desc'
      },
      take: Math.floor(limit * 0.1) // 10% of limit for recent payments
    })

    recentPayments.forEach(bill => {
      notifications.push({
        id: `payment-received-${bill.id}`,
        type: 'payment_received',
        priority: 'info',
        title: `Thanh toán thành công - Phòng ${bill.room.number}`,
        message: `Đã nhận thanh toán hóa đơn tháng ${bill.month}/${bill.year}`,
        details: {
          roomNumber: bill.room.number,
          amount: bill.totalAmount.toNumber(),
          paidDate: bill.paidDate,
          period: `${bill.month}/${bill.year}`
        },
        createdAt: bill.paidDate || bill.updatedAt,
        actionRequired: false
      })
    })

    // Sort notifications by priority and date
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1, info: 0 }
    notifications.sort((a, b) => {
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Limit results
    const limitedNotifications = notifications.slice(0, limit)

    // Calculate summary
    const summary = {
      total: limitedNotifications.length,
      byType: {
        overdue_bill: limitedNotifications.filter(n => n.type === 'overdue_bill').length,
        expiring_contract: limitedNotifications.filter(n => n.type === 'expiring_contract').length,
        maintenance_room: limitedNotifications.filter(n => n.type === 'maintenance_room').length,
        payment_received: limitedNotifications.filter(n => n.type === 'payment_received').length
      },
      byPriority: {
        high: limitedNotifications.filter(n => n.priority === 'high').length,
        medium: limitedNotifications.filter(n => n.priority === 'medium').length,
        low: limitedNotifications.filter(n => n.priority === 'low').length,
        info: limitedNotifications.filter(n => n.priority === 'info').length
      },
      actionRequired: limitedNotifications.filter(n => n.actionRequired).length
    }

    res.json({
      success: true,
      data: {
        notifications: limitedNotifications,
        summary
      }
    })

  } catch (error) {
    console.error('Dashboard notifications error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch notifications'
    })
  }
})

export default router
