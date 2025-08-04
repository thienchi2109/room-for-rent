import { Router, Request, Response } from 'express'
import { prisma } from '../lib/database'
import { authenticate } from '../middleware/auth'
import { validateRequest, createContractSchema, updateContractSchema } from '../lib/validation'
import { Prisma, ContractStatus } from '@prisma/client'

const router = Router()

/**
 * GET /api/contracts
 * Get all contracts with pagination and filtering
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      roomId,
      tenantId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    // Build where clause for filtering
    const where: Prisma.ContractWhereInput = {}

    if (status && Object.values(ContractStatus).includes(status as ContractStatus)) {
      where.status = status as ContractStatus
    }

    if (roomId) {
      where.roomId = roomId as string
    }

    if (tenantId) {
      where.tenants = {
        some: {
          tenantId: tenantId as string
        }
      }
    }

    if (search) {
      where.OR = [
        {
          contractNumber: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          room: {
            number: {
              contains: search as string,
              mode: 'insensitive'
            }
          }
        },
        {
          tenants: {
            some: {
              tenant: {
                fullName: {
                  contains: search as string,
                  mode: 'insensitive'
                }
              }
            }
          }
        }
      ]
    }

    // Build orderBy clause
    const orderBy: Prisma.ContractOrderByWithRelationInput = {}
    if (sortBy === 'contractNumber') {
      orderBy.contractNumber = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'startDate') {
      orderBy.startDate = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'endDate') {
      orderBy.endDate = sortOrder as 'asc' | 'desc'
    } else {
      orderBy.createdAt = sortOrder as 'asc' | 'desc'
    }

    // Get contracts with pagination
    const [contracts, totalCount] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          room: {
            select: {
              id: true,
              number: true,
              floor: true,
              type: true,
              basePrice: true,
              status: true
            }
          },
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
            },
            orderBy: {
              isPrimary: 'desc'
            }
          },
          bills: {
            select: {
              id: true,
              month: true,
              year: true,
              status: true,
              totalAmount: true
            },
            orderBy: [
              { year: 'desc' },
              { month: 'desc' }
            ],
            take: 3 // Last 3 bills for preview
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.contract.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    res.json({
      data: contracts,
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
    console.error('Get contracts error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve contracts'
    })
  }
})

/**
 * GET /api/contracts/:id
 * Get a specific contract by ID with detailed information
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
            area: true,
            type: true,
            basePrice: true,
            status: true
          }
        },
        tenants: {
          include: {
            tenant: {
              select: {
                id: true,
                fullName: true,
                dateOfBirth: true,
                idCard: true,
                hometown: true,
                phone: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            isPrimary: 'desc'
          }
        },
        bills: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ]
        }
      }
    })

    if (!contract) {
      res.status(404).json({
        error: 'Contract not found',
        message: `Contract with ID ${id} does not exist`
      })
      return
    }

    res.json({
      data: contract
    })

  } catch (error) {
    console.error('Get contract error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve contract'
    })
  }
})

/**
 * Helper function to generate contract number
 */
async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `HD${year}`
  
  // Find the latest contract number for this year
  const latestContract = await prisma.contract.findFirst({
    where: {
      contractNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      contractNumber: 'desc'
    }
  })

  let nextNumber = 1
  if (latestContract) {
    const currentNumber = parseInt(latestContract.contractNumber.replace(prefix, ''))
    nextNumber = currentNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

/**
 * Helper function to validate room availability
 */
async function validateRoomAvailability(roomId: string, startDate: Date, endDate: Date, excludeContractId?: string): Promise<boolean> {
  const conflictingContracts = await prisma.contract.findMany({
    where: {
      roomId,
      status: 'ACTIVE',
      ...(excludeContractId && { id: { not: excludeContractId } }),
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } }
          ]
        },
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: endDate } }
          ]
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } }
          ]
        }
      ]
    }
  })

  return conflictingContracts.length === 0
}

/**
 * GET /api/contracts/generate-number
 * Generate a new contract number
 */
router.get('/generate-number', authenticate, async (req: Request, res: Response) => {
  try {
    const contractNumber = await generateContractNumber()

    res.json({
      data: {
        contractNumber
      }
    })

  } catch (error) {
    console.error('Generate contract number error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate contract number'
    })
  }
})

/**
 * POST /api/contracts
 * Create a new contract
 */
router.post('/', authenticate, validateRequest(createContractSchema), async (req: Request, res: Response) => {
  try {
    let { contractNumber, roomId, startDate, endDate, deposit, status = 'ACTIVE', tenantIds, primaryTenantId } = req.body

    // Auto-generate contract number if not provided
    if (!contractNumber) {
      contractNumber = await generateContractNumber()
    } else {
      // Check if provided contract number already exists
      const existingContract = await prisma.contract.findUnique({
        where: { contractNumber }
      })

      if (existingContract) {
        res.status(409).json({
          error: 'Contract number already exists',
          message: `Contract number ${contractNumber} is already in use`
        })
        return
      }
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      res.status(404).json({
        error: 'Room not found',
        message: `Room with ID ${roomId} does not exist`
      })
      return
    }

    // Validate room availability for the contract period
    const isRoomAvailable = await validateRoomAvailability(roomId, new Date(startDate), new Date(endDate))
    if (!isRoomAvailable) {
      res.status(409).json({
        error: 'Room not available',
        message: 'Room is already occupied during the specified period'
      })
      return
    }

    // Validate that all tenant IDs exist
    const tenants = await prisma.tenant.findMany({
      where: {
        id: { in: tenantIds }
      }
    })

    if (tenants.length !== tenantIds.length) {
      res.status(404).json({
        error: 'One or more tenants not found',
        message: 'Some tenant IDs do not exist'
      })
      return
    }

    // Validate that primary tenant is in the tenant list
    if (!tenantIds.includes(primaryTenantId)) {
      res.status(400).json({
        error: 'Invalid primary tenant',
        message: 'Primary tenant must be included in the tenant list'
      })
      return
    }

    // Create contract with tenants in a transaction
    const contract = await prisma.$transaction(async (tx) => {
      // Create the contract
      const newContract = await tx.contract.create({
        data: {
          contractNumber,
          roomId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          deposit,
          status: status as ContractStatus
        }
      })

      // Create contract-tenant relationships
      const contractTenants = tenantIds.map((tenantId: string) => ({
        contractId: newContract.id,
        tenantId,
        isPrimary: tenantId === primaryTenantId
      }))

      await tx.contractTenant.createMany({
        data: contractTenants
      })

      // Update room status to OCCUPIED if contract is ACTIVE
      if (status === 'ACTIVE') {
        await tx.room.update({
          where: { id: roomId },
          data: { status: 'OCCUPIED' }
        })
      }

      return newContract
    })

    // Fetch the complete contract with relations
    const completeContract = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: {
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
            type: true,
            basePrice: true
          }
        },
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
          },
          orderBy: {
            isPrimary: 'desc'
          }
        }
      }
    })

    console.log(`Contract ${contractNumber} created by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.status(201).json({
      message: 'Contract created successfully',
      data: completeContract
    })

  } catch (error) {
    console.error('Create contract error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create contract'
    })
  }
})

/**
 * PUT /api/contracts/:id
 * Update an existing contract
 */
router.put('/:id', authenticate, validateRequest(updateContractSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { contractNumber, roomId, startDate, endDate, deposit, status, tenantIds, primaryTenantId } = req.body

    // Check if contract exists
    const existingContract = await prisma.contract.findUnique({
      where: { id },
      include: {
        tenants: true
      }
    })

    if (!existingContract) {
      res.status(404).json({
        error: 'Contract not found',
        message: `Contract with ID ${id} does not exist`
      })
      return
    }

    // Check if new contract number conflicts (if contract number is being updated)
    if (contractNumber && contractNumber !== existingContract.contractNumber) {
      const conflictingContract = await prisma.contract.findUnique({
        where: { contractNumber }
      })

      if (conflictingContract) {
        res.status(409).json({
          error: 'Contract number already exists',
          message: `Contract number ${contractNumber} is already in use`
        })
        return
      }
    }

    // Check if room exists (if room is being updated)
    if (roomId && roomId !== existingContract.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: roomId }
      })

      if (!room) {
        res.status(404).json({
          error: 'Room not found',
          message: `Room with ID ${roomId} does not exist`
        })
        return
      }

      // Validate room availability for the contract period
      const contractStartDate = startDate ? new Date(startDate) : existingContract.startDate
      const contractEndDate = endDate ? new Date(endDate) : existingContract.endDate

      const isRoomAvailable = await validateRoomAvailability(roomId, contractStartDate, contractEndDate, id)
      if (!isRoomAvailable) {
        res.status(409).json({
          error: 'Room not available',
          message: 'Room is already occupied during the specified period'
        })
        return
      }
    }

    // Validate date consistency if dates are being updated
    if (startDate || endDate) {
      const contractStartDate = startDate ? new Date(startDate) : existingContract.startDate
      const contractEndDate = endDate ? new Date(endDate) : existingContract.endDate

      if (contractEndDate <= contractStartDate) {
        res.status(400).json({
          error: 'Invalid dates',
          message: 'End date must be after start date'
        })
        return
      }
    }

    // Validate tenants if being updated
    if (tenantIds) {
      const tenants = await prisma.tenant.findMany({
        where: {
          id: { in: tenantIds }
        }
      })

      if (tenants.length !== tenantIds.length) {
        res.status(404).json({
          error: 'One or more tenants not found',
          message: 'Some tenant IDs do not exist'
        })
        return
      }

      if (primaryTenantId && !tenantIds.includes(primaryTenantId)) {
        res.status(400).json({
          error: 'Invalid primary tenant',
          message: 'Primary tenant must be included in the tenant list'
        })
        return
      }
    }

    // Update contract in a transaction
    const updatedContract = await prisma.$transaction(async (tx) => {
      // Update the contract
      const contract = await tx.contract.update({
        where: { id },
        data: {
          ...(contractNumber && { contractNumber }),
          ...(roomId && { roomId }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          ...(deposit !== undefined && { deposit }),
          ...(status && { status: status as ContractStatus })
        }
      })

      // Update tenants if provided
      if (tenantIds) {
        // Remove existing tenant relationships
        await tx.contractTenant.deleteMany({
          where: { contractId: id }
        })

        // Create new tenant relationships
        const contractTenants = tenantIds.map((tenantId: string) => ({
          contractId: id,
          tenantId,
          isPrimary: tenantId === (primaryTenantId || tenantIds[0])
        }))

        await tx.contractTenant.createMany({
          data: contractTenants
        })
      }

      // Update room status if contract status changed
      const finalRoomId = roomId || existingContract.roomId
      const finalStatus = status || existingContract.status

      if (status && status !== existingContract.status) {
        if (finalStatus === 'ACTIVE') {
          await tx.room.update({
            where: { id: finalRoomId },
            data: { status: 'OCCUPIED' }
          })
        } else if (existingContract.status === 'ACTIVE' && finalStatus !== 'ACTIVE') {
          // Check if there are other active contracts for this room
          const otherActiveContracts = await tx.contract.count({
            where: {
              roomId: finalRoomId,
              status: 'ACTIVE',
              id: { not: id }
            }
          })

          if (otherActiveContracts === 0) {
            await tx.room.update({
              where: { id: finalRoomId },
              data: { status: 'AVAILABLE' }
            })
          }
        }
      }

      return contract
    })

    // Fetch the complete updated contract with relations
    const completeContract = await prisma.contract.findUnique({
      where: { id: updatedContract.id },
      include: {
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
            type: true,
            basePrice: true
          }
        },
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
          },
          orderBy: {
            isPrimary: 'desc'
          }
        }
      }
    })

    console.log(`Contract ${updatedContract.contractNumber} updated by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.json({
      message: 'Contract updated successfully',
      data: completeContract
    })

  } catch (error) {
    console.error('Update contract error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update contract'
    })
  }
})

/**
 * DELETE /api/contracts/:id
 * Delete a contract with validation checks
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if contract exists
    const existingContract = await prisma.contract.findUnique({
      where: { id },
      include: {
        bills: {
          where: {
            status: { in: ['UNPAID', 'OVERDUE'] }
          }
        },
        room: {
          select: {
            id: true,
            number: true
          }
        }
      }
    })

    if (!existingContract) {
      res.status(404).json({
        error: 'Contract not found',
        message: `Contract with ID ${id} does not exist`
      })
      return
    }

    // Check if contract has unpaid bills
    if (existingContract.bills.length > 0) {
      res.status(409).json({
        error: 'Cannot delete contract',
        message: 'Contract has unpaid bills. Please settle all bills before deleting the contract.',
        details: {
          unpaidBills: existingContract.bills.length
        }
      })
      return
    }

    // Check if contract is currently active
    if (existingContract.status === 'ACTIVE') {
      res.status(409).json({
        error: 'Cannot delete active contract',
        message: 'Active contracts cannot be deleted. Please terminate the contract first.',
        details: {
          contractStatus: existingContract.status
        }
      })
      return
    }

    // Delete contract and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete contract-tenant relationships
      await tx.contractTenant.deleteMany({
        where: { contractId: id }
      })

      // Delete all bills for this contract
      await tx.bill.deleteMany({
        where: { contractId: id }
      })

      // Delete the contract
      await tx.contract.delete({
        where: { id }
      })

      // Update room status to AVAILABLE if no other active contracts exist
      const otherActiveContracts = await tx.contract.count({
        where: {
          roomId: existingContract.roomId,
          status: 'ACTIVE'
        }
      })

      if (otherActiveContracts === 0) {
        await tx.room.update({
          where: { id: existingContract.roomId },
          data: { status: 'AVAILABLE' }
        })
      }
    })

    console.log(`Contract ${existingContract.contractNumber} deleted by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.json({
      message: 'Contract deleted successfully',
      data: {
        id: existingContract.id,
        contractNumber: existingContract.contractNumber,
        roomNumber: existingContract.room.number
      }
    })

  } catch (error) {
    console.error('Delete contract error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete contract'
    })
  }
})

export default router
