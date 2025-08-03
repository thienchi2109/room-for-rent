import { Router, Request, Response } from 'express'
import { prisma } from '../lib/database'
import { authenticate } from '../middleware/auth'
import { validateRequest, createRoomSchema, updateRoomSchema } from '../lib/validation'
import { Prisma, RoomStatus } from '@prisma/client'

const router = Router()

/**
 * GET /api/rooms
 * Get all rooms with pagination and filtering
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      floor,
      type,
      search
    } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    // Build where clause for filtering
    const where: Prisma.RoomWhereInput = {}

    if (status && Object.values(RoomStatus).includes(status as RoomStatus)) {
      where.status = status as RoomStatus
    }

    if (floor) {
      where.floor = parseInt(floor as string, 10)
    }

    if (type) {
      where.type = {
        contains: type as string,
        mode: 'insensitive'
      }
    }

    if (search) {
      where.OR = [
        {
          number: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          type: {
            contains: search as string,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Get rooms with pagination
    const [rooms, totalCount] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { floor: 'asc' },
          { number: 'asc' }
        ],
        include: {
          contracts: {
            where: {
              status: 'ACTIVE'
            },
            include: {
              tenants: {
                include: {
                  tenant: {
                    select: {
                      id: true,
                      fullName: true,
                      phone: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              contracts: {
                where: {
                  status: 'ACTIVE'
                }
              },
              bills: {
                where: {
                  status: 'UNPAID'
                }
              }
            }
          }
        }
      }),
      prisma.room.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    res.json({
      data: rooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    })

  } catch (error) {
    console.error('Get rooms error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch rooms'
    })
  }
})

/**
 * GET /api/rooms/:id
 * Get a specific room by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        contracts: {
          include: {
            tenants: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true,
                    idCard: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        bills: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ],
          take: 12 // Last 12 months
        },
        meterReadings: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ],
          take: 12 // Last 12 months
        }
      }
    })

    if (!room) {
      res.status(404).json({
        error: 'Room not found',
        message: `Room with ID ${id} does not exist`
      })
      return
    }

    res.json({
      data: room
    })

  } catch (error) {
    console.error('Get room error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch room'
    })
  }
})

/**
 * POST /api/rooms
 * Create a new room
 */
router.post('/', authenticate, validateRequest(createRoomSchema), async (req: Request, res: Response) => {
  try {
    const { number, floor, area, type, basePrice, status = 'AVAILABLE' } = req.body

    // Check if room number already exists
    const existingRoom = await prisma.room.findUnique({
      where: { number }
    })

    if (existingRoom) {
      res.status(409).json({
        error: 'Room number already exists',
        message: `Room number ${number} is already in use`
      })
      return
    }

    // Create new room
    const room = await prisma.room.create({
      data: {
        number,
        floor,
        area,
        type,
        basePrice,
        status: status as RoomStatus
      }
    })

    console.log(`Room ${number} created by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.status(201).json({
      message: 'Room created successfully',
      data: room
    })

  } catch (error) {
    console.error('Create room error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create room'
    })
  }
})

/**
 * PUT /api/rooms/:id
 * Update an existing room
 */
router.put('/:id', authenticate, validateRequest(updateRoomSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { number, floor, area, type, basePrice, status } = req.body

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    })

    if (!existingRoom) {
      res.status(404).json({
        error: 'Room not found',
        message: `Room with ID ${id} does not exist`
      })
      return
    }

    // Check if new room number conflicts (if number is being updated)
    if (number && number !== existingRoom.number) {
      const conflictingRoom = await prisma.room.findUnique({
        where: { number }
      })

      if (conflictingRoom) {
        res.status(409).json({
          error: 'Room number already exists',
          message: `Room number ${number} is already in use`
        })
        return
      }
    }

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...(number && { number }),
        ...(floor !== undefined && { floor }),
        ...(area !== undefined && { area }),
        ...(type && { type }),
        ...(basePrice !== undefined && { basePrice }),
        ...(status && { status: status as RoomStatus })
      }
    })

    console.log(`Room ${updatedRoom.number} updated by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.json({
      message: 'Room updated successfully',
      data: updatedRoom
    })

  } catch (error) {
    console.error('Update room error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update room'
    })
  }
})

/**
 * DELETE /api/rooms/:id
 * Delete a room (with validation checks)
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        contracts: true,
        bills: true,
        meterReadings: true
      }
    })

    if (!existingRoom) {
      res.status(404).json({
        error: 'Room not found',
        message: `Room with ID ${id} does not exist`
      })
      return
    }

    // Check if room has active contracts
    const activeContracts = existingRoom.contracts.filter(contract => contract.status === 'ACTIVE')
    if (activeContracts.length > 0) {
      res.status(400).json({
        error: 'Cannot delete room',
        message: 'Room has active contracts. Please terminate contracts first.',
        details: {
          activeContracts: activeContracts.length
        }
      })
      return
    }

    // Check if room has unpaid bills
    const unpaidBills = existingRoom.bills.filter(bill => bill.status === 'UNPAID')
    if (unpaidBills.length > 0) {
      res.status(400).json({
        error: 'Cannot delete room',
        message: 'Room has unpaid bills. Please resolve bills first.',
        details: {
          unpaidBills: unpaidBills.length
        }
      })
      return
    }

    // Delete room and related data
    await prisma.$transaction(async (tx) => {
      // Delete meter readings
      await tx.meterReading.deleteMany({
        where: { roomId: id }
      })

      // Delete bills
      await tx.bill.deleteMany({
        where: { roomId: id }
      })

      // Delete contracts (should be empty or terminated at this point)
      await tx.contract.deleteMany({
        where: { roomId: id }
      })

      // Delete room
      await tx.room.delete({
        where: { id }
      })
    })

    console.log(`Room ${existingRoom.number} deleted by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.json({
      message: 'Room deleted successfully',
      data: {
        id: existingRoom.id,
        number: existingRoom.number
      }
    })

  } catch (error) {
    console.error('Delete room error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete room'
    })
  }
})

/**
 * PATCH /api/rooms/:id/status
 * Update room status
 */
router.patch('/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !Object.values(RoomStatus).includes(status)) {
      res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${Object.values(RoomStatus).join(', ')}`
      })
      return
    }

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    })

    if (!existingRoom) {
      res.status(404).json({
        error: 'Room not found',
        message: `Room with ID ${id} does not exist`
      })
      return
    }

    // Update room status
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: { status: status as RoomStatus }
    })

    console.log(`Room ${updatedRoom.number} status changed to ${status} by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.json({
      message: 'Room status updated successfully',
      data: updatedRoom
    })

  } catch (error) {
    console.error('Update room status error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update room status'
    })
  }
})

export default router
