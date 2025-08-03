import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Count total rooms (no userId filter since schema doesn't have it yet)
    const totalRooms = await prisma.room.count()

    // Count occupied rooms
    const occupiedRooms = await prisma.room.count({
      where: { 
        status: 'OCCUPIED' 
      }
    })

    // Count available rooms
    const availableRooms = await prisma.room.count({
      where: { 
        status: 'AVAILABLE' 
      }
    })

    // Count total tenants (this would need a tenants table)
    // For now, we'll use a placeholder since we haven't implemented tenants yet
    const totalTenants = 0

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    // Calculate monthly revenue (placeholder - would need rent payments table)
    const monthlyRevenue = await prisma.room.aggregate({
      where: { 
        status: 'OCCUPIED'
      },
      _sum: {
        basePrice: true
      }
    })

    res.json({
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalTenants,
      occupancyRate,
      monthlyRevenue: monthlyRevenue._sum.basePrice || 0
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' })
  }
})

export default router
