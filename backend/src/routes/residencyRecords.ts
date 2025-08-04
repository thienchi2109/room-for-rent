import { Router, Request, Response } from 'express'
import { prisma } from '../lib/database'
import { authenticate } from '../middleware/auth'
import { validateRequest, createResidencyRecordSchema, updateResidencyRecordSchema } from '../lib/validation'

const router = Router()

/**
 * GET /api/residency-records
 * Get all residency records with filtering and pagination
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      tenantId,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)))
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}
    
    if (tenantId) {
      where.tenantId = tenantId as string
    }
    
    if (type && ['TEMPORARY_RESIDENCE', 'TEMPORARY_ABSENCE'].includes(type as string)) {
      where.type = type as string
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'startDate' || sortBy === 'endDate' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    // Get total count for pagination
    const total = await prisma.residencyRecord.count({ where })

    // Get residency records
    const residencyRecords = await prisma.residencyRecord.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true,
            idCard: true,
            phone: true
          }
        }
      },
      orderBy,
      skip,
      take: limitNum
    })

    const totalPages = Math.ceil(total / limitNum)

    console.log(`✅ Retrieved ${residencyRecords.length} residency records (page ${pageNum}/${totalPages})`)

    res.json({
      data: residencyRecords,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Error fetching residency records:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch residency records'
    })
  }
})

/**
 * GET /api/residency-records/:id
 * Get a specific residency record by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const residencyRecord = await prisma.residencyRecord.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true,
            idCard: true,
            phone: true,
            hometown: true
          }
        }
      }
    })

    if (!residencyRecord) {
      res.status(404).json({
        error: 'Residency record not found',
        message: `Residency record with ID ${id} does not exist`
      })
      return
    }

    res.json({
      data: residencyRecord
    })
  } catch (error) {
    console.error('Error fetching residency record:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch residency record'
    })
  }
})

/**
 * POST /api/residency-records
 * Create a new residency record
 */
router.post('/', authenticate, validateRequest(createResidencyRecordSchema), async (req: Request, res: Response) => {
  try {
    const { tenantId, type, startDate, endDate, notes } = req.body

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, fullName: true }
    })

    if (!tenant) {
      res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant with ID ${tenantId} does not exist`
      })
      return
    }

    // Check for overlapping records of the same type
    const overlappingRecord = await prisma.residencyRecord.findFirst({
      where: {
        tenantId,
        type,
        OR: [
          // New record starts during existing record
          {
            startDate: { lte: new Date(startDate) },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date(startDate) } }
            ]
          },
          // New record ends during existing record (if endDate provided)
          ...(endDate ? [{
            startDate: { lte: new Date(endDate) },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date(endDate) } }
            ]
          }] : []),
          // Existing record is completely within new record
          ...(endDate ? [{
            startDate: { gte: new Date(startDate) },
            endDate: { lte: new Date(endDate) }
          }] : [])
        ]
      }
    })

    if (overlappingRecord) {
      res.status(409).json({
        error: 'Overlapping residency record',
        message: `A ${type.toLowerCase().replace('_', ' ')} record already exists for this time period`
      })
      return
    }

    // Create residency record
    const residencyRecord = await prisma.residencyRecord.create({
      data: {
        tenantId,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null
      },
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true,
            idCard: true,
            phone: true
          }
        }
      }
    })

    console.log(`✅ Created residency record: ${type} for ${tenant.fullName} (ID: ${residencyRecord.id})`)

    res.status(201).json({
      data: residencyRecord,
      message: 'Residency record created successfully'
    })
  } catch (error) {
    console.error('Error creating residency record:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create residency record'
    })
  }
})

/**
 * PUT /api/residency-records/:id
 * Update a residency record
 */
router.put('/:id', authenticate, validateRequest(updateResidencyRecordSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Check if residency record exists
    const existingRecord = await prisma.residencyRecord.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })

    if (!existingRecord) {
      res.status(404).json({
        error: 'Residency record not found',
        message: `Residency record with ID ${id} does not exist`
      })
      return
    }

    // Convert dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate)
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate)
    }

    // Check for overlapping records if dates or type are being updated
    if (updateData.startDate || updateData.endDate || updateData.type) {
      const newStartDate = updateData.startDate || existingRecord.startDate
      const newEndDate = updateData.endDate !== undefined ? updateData.endDate : existingRecord.endDate
      const newType = updateData.type || existingRecord.type

      const overlappingRecord = await prisma.residencyRecord.findFirst({
        where: {
          id: { not: id }, // Exclude current record
          tenantId: existingRecord.tenantId,
          type: newType,
          OR: [
            // New record starts during existing record
            {
              startDate: { lte: newStartDate },
              OR: [
                { endDate: null },
                { endDate: { gte: newStartDate } }
              ]
            },
            // New record ends during existing record (if endDate provided)
            ...(newEndDate ? [{
              startDate: { lte: newEndDate },
              OR: [
                { endDate: null },
                { endDate: { gte: newEndDate } }
              ]
            }] : []),
            // Existing record is completely within new record
            ...(newEndDate ? [{
              startDate: { gte: newStartDate },
              endDate: { lte: newEndDate }
            }] : [])
          ]
        }
      })

      if (overlappingRecord) {
        res.status(409).json({
          error: 'Overlapping residency record',
          message: `A ${newType.toLowerCase().replace('_', ' ')} record already exists for this time period`
        })
        return
      }
    }

    // Update residency record
    const updatedRecord = await prisma.residencyRecord.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true,
            idCard: true,
            phone: true
          }
        }
      }
    })

    console.log(`✅ Updated residency record: ${updatedRecord.type} for ${existingRecord.tenant.fullName} (ID: ${id})`)

    res.json({
      data: updatedRecord,
      message: 'Residency record updated successfully'
    })
  } catch (error) {
    console.error('Error updating residency record:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update residency record'
    })
  }
})

/**
 * DELETE /api/residency-records/:id
 * Delete a residency record
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if residency record exists
    const existingRecord = await prisma.residencyRecord.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })

    if (!existingRecord) {
      res.status(404).json({
        error: 'Residency record not found',
        message: `Residency record with ID ${id} does not exist`
      })
      return
    }

    // Delete residency record
    await prisma.residencyRecord.delete({
      where: { id }
    })

    console.log(`✅ Deleted residency record: ${existingRecord.type} for ${existingRecord.tenant.fullName} (ID: ${id})`)

    res.json({
      message: 'Residency record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting residency record:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete residency record'
    })
  }
})

export default router
