import { Router, Request, Response } from 'express'
import { prisma } from '../lib/database'
import { authenticate } from '../middleware/auth'
import { validateRequest, createBillSchema, updateBillSchema, payBillSchema } from '../lib/validation'
import { Prisma, BillStatus } from '@prisma/client'

const router = Router()

/**
 * GET /api/bills
 * Get all bills with pagination and filtering
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      contractId,
      roomId,
      month,
      year,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    // Build where clause for filtering
    const where: Prisma.BillWhereInput = {}

    if (status && Object.values(BillStatus).includes(status as BillStatus)) {
      where.status = status as BillStatus
    }

    if (contractId) {
      where.contractId = contractId as string
    }

    if (roomId) {
      where.roomId = roomId as string
    }

    if (month) {
      where.month = parseInt(month as string, 10)
    }

    if (year) {
      where.year = parseInt(year as string, 10)
    }

    if (search) {
      where.OR = [
        {
          contract: {
            contractNumber: {
              contains: search as string,
              mode: 'insensitive'
            }
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
          contract: {
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
        }
      ]
    }

    // Build orderBy clause
    const orderBy: Prisma.BillOrderByWithRelationInput = {}
    if (sortBy === 'month') {
      orderBy.month = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'year') {
      orderBy.year = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'totalAmount') {
      orderBy.totalAmount = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'dueDate') {
      orderBy.dueDate = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'paidDate') {
      orderBy.paidDate = sortOrder as 'asc' | 'desc'
    } else {
      orderBy.createdAt = sortOrder as 'asc' | 'desc'
    }

    // Get bills with pagination
    const [bills, totalCount] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          contract: {
            select: {
              id: true,
              contractNumber: true,
              tenants: {
                include: {
                  tenant: {
                    select: {
                      id: true,
                      fullName: true,
                      phone: true
                    }
                  }
                },
                orderBy: {
                  isPrimary: 'desc'
                },
                take: 1 // Only get primary tenant for list view
              }
            }
          },
          room: {
            select: {
              id: true,
              number: true,
              floor: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.bill.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    res.json({
      data: bills,
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
    console.error('Get bills error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve bills'
    })
  }
})

/**
 * GET /api/bills/:id
 * Get a specific bill by ID with detailed information
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            startDate: true,
            endDate: true,
            deposit: true,
            status: true,
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
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true,
            area: true,
            capacity: true,
            basePrice: true
          }
        }
      }
    })

    if (!bill) {
      res.status(404).json({
        error: 'Bill not found',
        message: `Bill with ID ${id} does not exist`
      })
      return
    }

    res.json({
      data: bill
    })

  } catch (error) {
    console.error('Get bill error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve bill'
    })
  }
})

/**
 * POST /api/bills
 * Create a new bill manually
 */
router.post('/', authenticate, validateRequest(createBillSchema), async (req: Request, res: Response) => {
  try {
    const {
      contractId,
      roomId,
      month,
      year,
      rentAmount,
      electricAmount,
      waterAmount,
      serviceAmount = 0,
      totalAmount,
      dueDate,
      status = 'UNPAID'
    } = req.body

    // Check if contract exists and is active
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        room: {
          select: {
            id: true,
            number: true
          }
        }
      }
    })

    if (!contract) {
      res.status(404).json({
        error: 'Contract not found',
        message: `Contract with ID ${contractId} does not exist`
      })
      return
    }

    if (contract.status !== 'ACTIVE') {
      res.status(400).json({
        error: 'Invalid contract status',
        message: 'Bills can only be created for active contracts'
      })
      return
    }

    // Verify room ID matches contract
    if (contract.roomId !== roomId) {
      res.status(400).json({
        error: 'Room mismatch',
        message: 'Room ID does not match the contract room'
      })
      return
    }

    // Check if bill already exists for this contract/month/year
    const existingBill = await prisma.bill.findUnique({
      where: {
        contractId_month_year: {
          contractId,
          month,
          year
        }
      }
    })

    if (existingBill) {
      res.status(409).json({
        error: 'Bill already exists',
        message: `Bill for ${month}/${year} already exists for this contract`
      })
      return
    }

    // Validate total amount calculation
    const calculatedTotal = rentAmount + electricAmount + waterAmount + serviceAmount
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      res.status(400).json({
        error: 'Invalid total amount',
        message: 'Total amount does not match the sum of individual amounts'
      })
      return
    }

    // Create the bill
    const bill = await prisma.bill.create({
      data: {
        contractId,
        roomId,
        month,
        year,
        rentAmount,
        electricAmount,
        waterAmount,
        serviceAmount,
        totalAmount,
        dueDate: new Date(dueDate),
        status: status as BillStatus
      },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            tenants: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true
                  }
                }
              },
              orderBy: {
                isPrimary: 'desc'
              }
            }
          }
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true
          }
        }
      }
    })

    console.log(`Bill created for contract ${contract.room.number} (${month}/${year}) by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.status(201).json({
      message: 'Bill created successfully',
      data: bill
    })

  } catch (error) {
    console.error('Create bill error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create bill'
    })
  }
})

/**
 * PUT /api/bills/:id
 * Update an existing bill
 */
router.put('/:id', authenticate, validateRequest(updateBillSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      rentAmount,
      electricAmount,
      waterAmount,
      serviceAmount,
      totalAmount,
      dueDate,
      status
    } = req.body

    // Check if bill exists
    const existingBill = await prisma.bill.findUnique({
      where: { id },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            status: true
          }
        }
      }
    })

    if (!existingBill) {
      res.status(404).json({
        error: 'Bill not found',
        message: `Bill with ID ${id} does not exist`
      })
      return
    }

    // Don't allow updating paid bills unless changing status
    if (existingBill.status === 'PAID' && status !== 'PAID') {
      const hasAmountChanges = rentAmount !== undefined || 
                              electricAmount !== undefined || 
                              waterAmount !== undefined || 
                              serviceAmount !== undefined || 
                              totalAmount !== undefined

      if (hasAmountChanges) {
        res.status(400).json({
          error: 'Cannot modify paid bill',
          message: 'Paid bills cannot have their amounts modified'
        })
        return
      }
    }

    // Calculate new total if amounts are being updated
    let finalTotalAmount = totalAmount
    if (rentAmount !== undefined || electricAmount !== undefined || 
        waterAmount !== undefined || serviceAmount !== undefined) {
      
      const newRentAmount = rentAmount ?? existingBill.rentAmount.toNumber()
      const newElectricAmount = electricAmount ?? existingBill.electricAmount.toNumber()
      const newWaterAmount = waterAmount ?? existingBill.waterAmount.toNumber()
      const newServiceAmount = serviceAmount ?? existingBill.serviceAmount.toNumber()
      
      const calculatedTotal = newRentAmount + newElectricAmount + newWaterAmount + newServiceAmount
      
      if (finalTotalAmount !== undefined && Math.abs(calculatedTotal - finalTotalAmount) > 0.01) {
        res.status(400).json({
          error: 'Invalid total amount',
          message: 'Total amount does not match the sum of individual amounts'
        })
        return
      }
      
      finalTotalAmount = calculatedTotal
    }

    // Update the bill
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        ...(rentAmount !== undefined && { rentAmount }),
        ...(electricAmount !== undefined && { electricAmount }),
        ...(waterAmount !== undefined && { waterAmount }),
        ...(serviceAmount !== undefined && { serviceAmount }),
        ...(finalTotalAmount !== undefined && { totalAmount: finalTotalAmount }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status: status as BillStatus }),
        updatedAt: new Date()
      },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            tenants: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true
                  }
                }
              },
              orderBy: {
                isPrimary: 'desc'
              }
            }
          }
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true
          }
        }
      }
    })

    console.log(`Bill ${id} updated by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.json({
      message: 'Bill updated successfully',
      data: updatedBill
    })

  } catch (error) {
    console.error('Update bill error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update bill'
    })
  }
})

/**
 * DELETE /api/bills/:id
 * Delete a bill with validation checks
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if bill exists
    const existingBill = await prisma.bill.findUnique({
      where: { id },
      include: {
        contract: {
          select: {
            contractNumber: true
          }
        },
        room: {
          select: {
            number: true
          }
        }
      }
    })

    if (!existingBill) {
      res.status(404).json({
        error: 'Bill not found',
        message: `Bill with ID ${id} does not exist`
      })
      return
    }

    // Don't allow deleting paid bills
    if (existingBill.status === 'PAID') {
      res.status(409).json({
        error: 'Cannot delete paid bill',
        message: 'Paid bills cannot be deleted. Please contact administrator if needed.',
        details: {
          billStatus: existingBill.status,
          paidDate: existingBill.paidDate
        }
      })
      return
    }

    // Delete the bill
    await prisma.bill.delete({
      where: { id }
    })

    console.log(`Bill ${id} for room ${existingBill.room.number} (${existingBill.month}/${existingBill.year}) deleted by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.json({
      message: 'Bill deleted successfully',
      data: {
        id: existingBill.id,
        contractNumber: existingBill.contract.contractNumber,
        roomNumber: existingBill.room.number,
        month: existingBill.month,
        year: existingBill.year
      }
    })

  } catch (error) {
    console.error('Delete bill error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete bill'
    })
  }
})

/**
 * POST /api/bills/:id/pay
 * Mark a bill as paid
 */
router.post('/:id/pay', authenticate, validateRequest(payBillSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { paidDate = new Date(), notes } = req.body

    // Check if bill exists
    const existingBill = await prisma.bill.findUnique({
      where: { id },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            tenants: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              },
              orderBy: {
                isPrimary: 'desc'
              },
              take: 1
            }
          }
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true
          }
        }
      }
    })

    if (!existingBill) {
      res.status(404).json({
        error: 'Bill not found',
        message: `Bill with ID ${id} does not exist`
      })
      return
    }

    // Check if bill is already paid
    if (existingBill.status === 'PAID') {
      res.status(409).json({
        error: 'Bill already paid',
        message: 'This bill has already been marked as paid',
        details: {
          paidDate: existingBill.paidDate
        }
      })
      return
    }

    // Update bill status to PAID
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(paidDate),
        updatedAt: new Date()
      },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            tenants: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true
                  }
                }
              },
              orderBy: {
                isPrimary: 'desc'
              }
            }
          }
        },
        room: {
          select: {
            id: true,
            number: true,
            floor: true
          }
        }
      }
    })

    const primaryTenant = existingBill.contract.tenants[0]?.tenant
    console.log(`Bill ${id} for room ${existingBill.room.number} (${existingBill.month}/${existingBill.year}) marked as paid by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.json({
      message: 'Bill marked as paid successfully',
      data: updatedBill
    })

  } catch (error) {
    console.error('Pay bill error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to mark bill as paid'
    })
  }
})

/**
 * POST /api/bills/generate
 * Generate bills for a specific month/year for all active contracts
 */
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body

    if (!month || !year) {
      res.status(400).json({
        error: 'Missing parameters',
        message: 'Month and year are required'
      })
      return
    }

    if (month < 1 || month > 12) {
      res.status(400).json({
        error: 'Invalid month',
        message: 'Month must be between 1 and 12'
      })
      return
    }

    if (year < 2020 || year > 2100) {
      res.status(400).json({
        error: 'Invalid year',
        message: 'Year must be between 2020 and 2100'
      })
      return
    }

    // Get all active contracts
    const activeContracts = await prisma.contract.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        room: {
          select: {
            id: true,
            number: true,
            basePrice: true
          }
        },
        bills: {
          where: {
            month,
            year
          }
        }
      }
    })

    if (activeContracts.length === 0) {
      res.status(404).json({
        error: 'No active contracts',
        message: 'No active contracts found to generate bills for'
      })
      return
    }

    // Filter contracts that don't already have bills for this month/year
    const contractsNeedingBills = activeContracts.filter(contract => contract.bills.length === 0)

    if (contractsNeedingBills.length === 0) {
      res.status(409).json({
        error: 'Bills already exist',
        message: `Bills for ${month}/${year} have already been generated for all active contracts`
      })
      return
    }

    // Get default pricing (should be from settings in real implementation)
    const electricPrice = 3500 // VND per kWh
    const waterPrice = 25000 // VND per m³

    const generatedBills = []
    const errors = []

    // Generate bills for each contract
    for (const contract of contractsNeedingBills) {
      try {
        // Get meter readings for consumption calculation
        const currentReading = await prisma.meterReading.findUnique({
          where: {
            roomId_month_year: {
              roomId: contract.roomId,
              month,
              year
            }
          }
        })

        const previousMonth = month === 1 ? 12 : month - 1
        const previousYear = month === 1 ? year - 1 : year

        const previousReading = await prisma.meterReading.findUnique({
          where: {
            roomId_month_year: {
              roomId: contract.roomId,
              month: previousMonth,
              year: previousYear
            }
          }
        })

        // Calculate consumption (default to 0 if no readings)
        const electricConsumption = currentReading && previousReading 
          ? Math.max(0, currentReading.electricReading - previousReading.electricReading)
          : 0
        const waterConsumption = currentReading && previousReading
          ? Math.max(0, currentReading.waterReading - previousReading.waterReading)
          : 0

        const rentAmount = contract.room.basePrice.toNumber()
        const electricAmount = electricConsumption * electricPrice
        const waterAmount = waterConsumption * waterPrice
        const serviceAmount = 0 // Additional services if any
        const totalAmount = rentAmount + electricAmount + waterAmount + serviceAmount

        // Set due date to 5th of next month
        const dueDate = new Date(year, month, 5) // month is 0-indexed in Date constructor

        const bill = await prisma.bill.create({
          data: {
            contractId: contract.id,
            roomId: contract.roomId,
            month,
            year,
            rentAmount,
            electricAmount,
            waterAmount,
            serviceAmount,
            totalAmount,
            dueDate,
            status: 'UNPAID'
          },
          include: {
            room: {
              select: {
                number: true
              }
            }
          }
        })

        generatedBills.push(bill)

      } catch (error) {
        console.error(`Error generating bill for contract ${contract.id}:`, error)
        errors.push({
          contractId: contract.id,
          roomNumber: contract.room.number,
          error: 'Failed to generate bill'
        })
      }
    }

    console.log(`Generated ${generatedBills.length} bills for ${month}/${year} by user ${req.user?.username} at ${new Date().toISOString()}`)

    res.status(201).json({
      message: `Successfully generated ${generatedBills.length} bills for ${month}/${year}`,
      data: {
        generated: generatedBills.length,
        errors: errors.length,
        bills: generatedBills.map(bill => ({
          id: bill.id,
          roomNumber: bill.room.number,
          totalAmount: bill.totalAmount
        })),
        ...(errors.length > 0 && { errors })
      }
    })

  } catch (error) {
    console.error('Generate bills error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate bills'
    })
  }
})

export default router