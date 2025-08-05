import { Router, Request, Response } from 'express'
import { prisma } from '../lib/database'
import { authenticate } from '../middleware/auth'
import { validateRequest, createTenantSchema, updateTenantSchema } from '../lib/validation'
import { Prisma } from '@prisma/client'

const router = Router()

/**
 * GET /api/tenants
 * Get all tenants with search and pagination
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      roomNumber = '',
      floor = ''
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)))
    const skip = (pageNum - 1) * limitNum

    // Build search conditions
    const where: Prisma.TenantWhereInput = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
        { idCard: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    // Build room-based filters
    const roomFilters: any[] = []
    
    if (roomNumber) {
      roomFilters.push({
        room: {
          number: {
            contains: roomNumber as string,
            mode: 'insensitive',
          },
        },
      })
    }

    if (floor) {
      const floorNum = parseInt(floor as string)
      if (!isNaN(floorNum)) {
        roomFilters.push({
          room: {
            floor: floorNum,
          },
        })
      }
    }

    // Apply room filters if any exist
    if (roomFilters.length > 0) {
      where.contracts = {
        some: {
          contract: {
            AND: roomFilters
          }
        }
      }
    }

    // Build sort conditions
    const orderBy = {
      [sortBy as string]: sortOrder as 'asc' | 'desc'
    }

    // Get tenants with pagination
    const [tenants, totalCount] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          contracts: {
            include: {
              contract: {
                include: {
                  room: {
                    select: {
                      id: true,
                      number: true,
                      floor: true,
                      capacity: true
                    }
                  }
                }
              }
            },
            orderBy: {
              contract: {
                createdAt: 'desc'
              }
            }
          },
          _count: {
            select: {
              contracts: true,
              residencyRecords: true
            }
          }
        }
      }),
      prisma.tenant.count({
        where
      })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    res.json({
      data: tenants,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tenants'
    })
  }
})

/**
 * GET /api/tenants/:id
 * Get a specific tenant by ID with detailed information
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        contracts: {
          include: {
            contract: {
              include: {
                room: {
                  select: {
                    id: true,
                    number: true,
                    floor: true,
                    capacity: true,
                    basePrice: true
                  }
                },
                bills: {
                  orderBy: [
                    { year: 'desc' },
                    { month: 'desc' }
                  ],
                  take: 12
                }
              }
            }
          },
          orderBy: {
            contract: {
              createdAt: 'desc'
            }
          }
        },
        residencyRecords: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        }
      }
    })

    if (!tenant) {
      res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant with ID ${id} does not exist`
      })
      return
    }

    res.json({
      data: tenant
    })
  } catch (error) {
    console.error('Error fetching tenant:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tenant details'
    })
  }
})

/**
 * POST /api/tenants
 * Create a new tenant
 */
router.post('/', authenticate, validateRequest(createTenantSchema), async (req: Request, res: Response) => {
  try {
    const { fullName, dateOfBirth, idCard, hometown, phone } = req.body

    // Check if ID card already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { idCard }
    })

    if (existingTenant) {
      res.status(409).json({
        error: 'ID card already exists',
        message: `A tenant with ID card ${idCard} already exists`
      })
      return
    }

    // Create new tenant
    const tenant = await prisma.tenant.create({
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        idCard,
        hometown,
        phone
      }
    })

    console.log(`✅ Created new tenant: ${tenant.fullName} (ID: ${tenant.id})`)

    res.status(201).json({
      data: tenant,
      message: 'Tenant created successfully'
    })
  } catch (error) {
    console.error('Error creating tenant:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create tenant'
    })
  }
})

/**
 * PUT /api/tenants/:id
 * Update tenant information
 */
router.put('/:id', authenticate, validateRequest(updateTenantSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id }
    })

    if (!existingTenant) {
      res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant with ID ${id} does not exist`
      })
      return
    }

    // If updating ID card, check for conflicts
    if (updateData.idCard && updateData.idCard !== existingTenant.idCard) {
      const conflictingTenant = await prisma.tenant.findUnique({
        where: { idCard: updateData.idCard }
      })

      if (conflictingTenant) {
        res.status(409).json({
          error: 'ID card already exists',
          message: `A tenant with ID card ${updateData.idCard} already exists`
        })
        return
      }
    }

    // Convert dateOfBirth to Date if provided
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth)
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData
    })

    console.log(`✅ Updated tenant: ${updatedTenant.fullName} (ID: ${id})`)

    res.json({
      data: updatedTenant,
      message: 'Tenant updated successfully'
    })
  } catch (error) {
    console.error('Error updating tenant:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update tenant'
    })
  }
})

/**
 * DELETE /api/tenants/:id
 * Delete a tenant (with validation checks)
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        contracts: {
          include: {
            contract: {
              select: {
                id: true,
                status: true,
                room: {
                  select: {
                    number: true
                  }
                }
              }
            }
          }
        },
        residencyRecords: true
      }
    })

    if (!existingTenant) {
      res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant with ID ${id} does not exist`
      })
      return
    }

    // Check for active contracts
    const activeContracts = existingTenant.contracts.filter(
      ct => ct.contract.status === 'ACTIVE'
    )

    if (activeContracts.length > 0) {
      const roomNumbers = activeContracts.map(ct => ct.contract.room.number).join(', ')
      res.status(400).json({
        error: 'Cannot delete tenant with active contracts',
        message: `Tenant has active contracts in rooms: ${roomNumbers}. Please terminate contracts first.`
      })
      return
    }

    // Delete tenant (this will cascade delete contract_tenants and residency_records)
    await prisma.tenant.delete({
      where: { id }
    })

    console.log(`✅ Deleted tenant: ${existingTenant.fullName} (ID: ${id})`)

    res.json({
      message: 'Tenant deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete tenant'
    })
  }
})

/**
 * GET /api/tenants/:id/history
 * Get tenant rental history
 */
router.get('/:id/history', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      page = '1',
      limit = '10'
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)))
    const skip = (pageNum - 1) * limitNum

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true, fullName: true }
    })

    if (!tenant) {
      res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant with ID ${id} does not exist`
      })
      return
    }

    // Get rental history with pagination
    const [contractHistory, totalCount] = await Promise.all([
      prisma.contractTenant.findMany({
        where: { tenantId: id },
        include: {
          contract: {
            include: {
              room: {
                select: {
                  id: true,
                  number: true,
                  floor: true,
                  capacity: true,
                  basePrice: true
                }
              },
              bills: {
                select: {
                  id: true,
                  month: true,
                  year: true,
                  totalAmount: true,
                  status: true,
                  paidDate: true
                },
                orderBy: [
                  { year: 'desc' },
                  { month: 'desc' }
                ]
              }
            }
          }
        },
        orderBy: {
          contract: {
            createdAt: 'desc'
          }
        },
        skip,
        take: limitNum
      }),
      prisma.contractTenant.count({
        where: { tenantId: id }
      })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    res.json({
      data: {
        tenant,
        history: contractHistory
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Error fetching tenant history:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tenant history'
    })
  }
})

export default router
