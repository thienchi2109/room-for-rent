import request from 'supertest'
import app from '../index'
import { prisma } from '../lib/database'
import { generateToken, sanitizeUser } from '../lib/auth'

describe('Room API Endpoints', () => {
  let authToken: string
  let testUserId: string
  let testRoomId: string

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.room.deleteMany({
      where: {
        number: {
          startsWith: 'TEST'
        }
      }
    })

    // Create a test user for authentication
    const testUser = await prisma.user.create({
      data: {
        username: 'testadmin',
        password: '$2b$10$hash', // This should be a real hash in practice
        fullName: 'Test Admin',
        role: 'ADMIN'
      }
    })
    testUserId = testUser.id
    authToken = generateToken(sanitizeUser(testUser))
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.room.deleteMany({
      where: {
        number: {
          startsWith: 'TEST'
        }
      }
    })
    await prisma.user.delete({
      where: { id: testUserId }
    })
  })

  afterEach(async () => {
    // Clean up rooms created in tests
    await prisma.room.deleteMany({
      where: {
        number: {
          startsWith: 'TEST'
        }
      }
    })
  })

  describe('GET /api/rooms', () => {
    it('should return empty list when no rooms exist', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('pagination')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should return rooms with pagination', async () => {
      // Create test rooms
      await prisma.room.createMany({
        data: [
          { number: 'TEST101', floor: 1, area: 25, capacity: 1, basePrice: 500000 },
          { number: 'TEST102', floor: 1, area: 30, capacity: 2, basePrice: 700000 },
          { number: 'TEST201', floor: 2, area: 25, capacity: 1, basePrice: 550000 }
        ]
      })

      const response = await request(app)
        .get('/api/rooms?limit=2&search=TEST')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toHaveLength(2)
      expect(response.body.pagination.limit).toBe(2)
      expect(response.body.pagination.totalCount).toBe(3)
    })

    it('should filter rooms by status', async () => {
      // Create test rooms
      await prisma.room.createMany({
        data: [
          { number: 'TEST101', floor: 1, area: 25, capacity: 1, basePrice: 500000, status: 'AVAILABLE' },
          { number: 'TEST102', floor: 1, area: 30, capacity: 2, basePrice: 700000, status: 'OCCUPIED' }
        ]
      })

      const response = await request(app)
        .get('/api/rooms?status=OCCUPIED&search=TEST')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].status).toBe('OCCUPIED')
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/rooms')
        .expect(401)
    })
  })

  describe('GET /api/rooms/:id', () => {
    beforeEach(async () => {
      const room = await prisma.room.create({
        data: {
          number: 'TEST101',
          floor: 1,
          area: 25,
          capacity: 1,
          basePrice: 500000
        }
      })
      testRoomId = room.id
    })

    it('should return room details', async () => {
      const response = await request(app)
        .get(`/api/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toHaveProperty('id', testRoomId)
      expect(response.body.data).toHaveProperty('number', 'TEST101')
      expect(response.body.data).toHaveProperty('contracts')
      expect(response.body.data).toHaveProperty('bills')
      expect(response.body.data).toHaveProperty('meterReadings')
    })

    it('should return 404 for non-existent room', async () => {
      const fakeId = 'non-existent-id'
      await request(app)
        .get(`/api/rooms/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('POST /api/rooms', () => {
    const validRoomData = {
      number: 'TEST201',
      floor: 2,
      area: 30,
      capacity: 2,
      basePrice: 650000
    }

    it('should create a new room', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validRoomData)
        .expect(201)

      expect(response.body).toHaveProperty('message', 'Room created successfully')
      expect(response.body.data).toHaveProperty('number', 'TEST201')
      expect(response.body.data).toHaveProperty('status', 'AVAILABLE')
    })

    it('should reject duplicate room numbers', async () => {
      // Create first room
      await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validRoomData)
        .expect(201)

      // Try to create duplicate
      await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validRoomData)
        .expect(409)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        number: 'TEST301',
        // Missing required fields
      }

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should validate field types', async () => {
      const invalidData = {
        number: 'TEST301',
        floor: 'not-a-number', // Should be number
        area: 30,
        capacity: 1,
        basePrice: 500000
      }

      await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)
    })
  })

  describe('PUT /api/rooms/:id', () => {
    beforeEach(async () => {
      const room = await prisma.room.create({
        data: {
          number: 'TEST101',
          floor: 1,
          area: 25,
          capacity: 1,
          basePrice: 500000
        }
      })
      testRoomId = room.id
    })

    it('should update room details', async () => {
      const updateData = {
        basePrice: 600000,
        capacity: 2
      }

      const response = await request(app)
        .put(`/api/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Room updated successfully')
      expect(response.body.data).toHaveProperty('basePrice', '600000')
      expect(response.body.data).toHaveProperty('capacity', 2)
    })

    it('should prevent duplicate room numbers', async () => {
      // Create another room
      await prisma.room.create({
        data: {
          number: 'TEST102',
          floor: 1,
          area: 25,
          capacity: 1,
          basePrice: 500000
        }
      })

      // Try to update first room to use existing number
      await request(app)
        .put(`/api/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ number: 'TEST102' })
        .expect(409)
    })

    it('should return 404 for non-existent room', async () => {
      const fakeId = 'non-existent-id'
      await request(app)
        .put(`/api/rooms/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ basePrice: 600000 })
        .expect(404)
    })
  })

  describe('DELETE /api/rooms/:id', () => {
    beforeEach(async () => {
      const room = await prisma.room.create({
        data: {
          number: 'TEST101',
          floor: 1,
          area: 25,
          capacity: 1,
          basePrice: 500000
        }
      })
      testRoomId = room.id
    })

    it('should delete room when no dependencies exist', async () => {
      const response = await request(app)
        .delete(`/api/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Room deleted successfully')

      // Verify room is deleted
      const deletedRoom = await prisma.room.findUnique({
        where: { id: testRoomId }
      })
      expect(deletedRoom).toBeNull()
    })

    it('should prevent deletion when room has active contracts', async () => {
      // Create tenant and contract for the room
      const tenant = await prisma.tenant.create({
        data: {
          fullName: 'Test Tenant',
          dateOfBirth: new Date('1990-01-01'),
          idCard: 'TEST123456',
          hometown: 'Test City',
          phone: '0123456789'
        }
      })

      const contract = await prisma.contract.create({
        data: {
          contractNumber: 'CT001',
          roomId: testRoomId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
          deposit: 1000000,
          status: 'ACTIVE'
        }
      })

      await prisma.contractTenant.create({
        data: {
          contractId: contract.id,
          tenantId: tenant.id,
          isPrimary: true
        }
      })

      await request(app)
        .delete(`/api/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      // Clean up
      await prisma.contractTenant.deleteMany({ where: { contractId: contract.id } })
      await prisma.contract.delete({ where: { id: contract.id } })
      await prisma.tenant.delete({ where: { id: tenant.id } })
    })

    it('should return 404 for non-existent room', async () => {
      const fakeId = 'non-existent-id'
      await request(app)
        .delete(`/api/rooms/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('PATCH /api/rooms/:id/status', () => {
    beforeEach(async () => {
      const room = await prisma.room.create({
        data: {
          number: 'TEST101',
          floor: 1,
          area: 25,
          capacity: 1,
          basePrice: 500000,
          status: 'AVAILABLE'
        }
      })
      testRoomId = room.id
    })

    it('should update room status', async () => {
      const response = await request(app)
        .patch(`/api/rooms/${testRoomId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'MAINTENANCE' })
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Room status updated successfully')
      expect(response.body.data).toHaveProperty('status', 'MAINTENANCE')
    })

    it('should reject invalid status', async () => {
      await request(app)
        .patch(`/api/rooms/${testRoomId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400)
    })

    it('should return 404 for non-existent room', async () => {
      const fakeId = 'non-existent-id'
      await request(app)
        .patch(`/api/rooms/${fakeId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'MAINTENANCE' })
        .expect(404)
    })
  })
})
