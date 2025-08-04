import request from 'supertest'
import app from '../index'
import { prisma } from '../lib/database'
import { generateToken, sanitizeUser } from '../lib/auth'

describe('Contract API Endpoints', () => {
  let authToken: string
  let testUserId: string
  let testRoomId: string
  let testTenantId: string
  let testContractId: string

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.contractTenant.deleteMany({})
    await prisma.contract.deleteMany({
      where: {
        contractNumber: {
          startsWith: 'TEST'
        }
      }
    })
    await prisma.room.deleteMany({
      where: {
        number: {
          startsWith: 'TEST'
        }
      }
    })
    await prisma.tenant.deleteMany({
      where: {
        fullName: {
          startsWith: 'Test'
        }
      }
    })

    // Create a test user for authentication
    const testUser = await prisma.user.create({
      data: {
        username: 'testcontractadmin',
        password: '$2b$10$hash', // This should be a real hash in practice
        fullName: 'Test Contract Admin',
        role: 'ADMIN'
      }
    })
    testUserId = testUser.id
    authToken = generateToken(sanitizeUser(testUser))

    // Create a test room
    const testRoom = await prisma.room.create({
      data: {
        number: 'TEST-ROOM-001',
        floor: 1,
        area: 25.5,
        type: 'Standard',
        basePrice: 3000000,
        status: 'AVAILABLE'
      }
    })
    testRoomId = testRoom.id

    // Create a test tenant
    const testTenant = await prisma.tenant.create({
      data: {
        fullName: 'Test Tenant Contract',
        dateOfBirth: new Date('1990-01-01'),
        idCard: '123456789012',
        hometown: 'Test City',
        phone: '0123456789'
      }
    })
    testTenantId = testTenant.id
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.contractTenant.deleteMany({})
    await prisma.contract.deleteMany({
      where: {
        contractNumber: {
          startsWith: 'TEST'
        }
      }
    })
    await prisma.room.delete({
      where: { id: testRoomId }
    })
    await prisma.tenant.delete({
      where: { id: testTenantId }
    })
    await prisma.user.delete({
      where: { id: testUserId }
    })
  })

  afterEach(async () => {
    // Clean up contracts created in tests (except the main test contract)
    await prisma.contractTenant.deleteMany({
      where: {
        contract: {
          contractNumber: {
            startsWith: 'TEST',
            not: 'TEST-CONTRACT-001'
          }
        }
      }
    })
    await prisma.contract.deleteMany({
      where: {
        contractNumber: {
          startsWith: 'TEST',
          not: 'TEST-CONTRACT-001'
        }
      }
    })
  })

  describe('POST /api/contracts', () => {
    it('should create a new contract successfully', async () => {
      const contractData = {
        contractNumber: 'TEST-CONTRACT-001',
        roomId: testRoomId,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        deposit: 5000000,
        status: 'ACTIVE',
        tenantIds: [testTenantId],
        primaryTenantId: testTenantId
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(201)

      expect(response.body.message).toBe('Contract created successfully')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.contractNumber).toBe(contractData.contractNumber)
      expect(response.body.data.roomId).toBe(testRoomId)
      expect(response.body.data.deposit).toBe(contractData.deposit.toString())
      expect(response.body.data.status).toBe('ACTIVE')

      testContractId = response.body.data.id
    })

    it('should fail to create contract with duplicate contract number', async () => {
      const contractData = {
        contractNumber: 'TEST-CONTRACT-001', // Same as above
        roomId: testRoomId,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        deposit: 5000000,
        tenantIds: [testTenantId],
        primaryTenantId: testTenantId
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(409)

      expect(response.body.error).toBe('Contract number already exists')
    })

    it('should fail to create contract with non-existent room', async () => {
      const contractData = {
        contractNumber: 'TEST-CONTRACT-002',
        roomId: 'non-existent-room-id',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        deposit: 5000000,
        tenantIds: [testTenantId],
        primaryTenantId: testTenantId
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(404)

      expect(response.body.error).toBe('Room not found')
    })

    it('should fail to create contract with non-existent tenant', async () => {
      const contractData = {
        contractNumber: 'TEST-CONTRACT-003',
        roomId: testRoomId,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        deposit: 5000000,
        tenantIds: ['non-existent-tenant-id'],
        primaryTenantId: 'non-existent-tenant-id'
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(404)

      expect(response.body.error).toBe('One or more tenants not found')
    })

    it('should fail to create contract with invalid primary tenant', async () => {
      const contractData = {
        contractNumber: 'TEST-CONTRACT-004',
        roomId: testRoomId,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        deposit: 5000000,
        tenantIds: [testTenantId],
        primaryTenantId: 'different-tenant-id'
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(400)

      expect(response.body.error).toBe('Invalid primary tenant')
    })

    it('should fail to create contract without authentication', async () => {
      const contractData = {
        contractNumber: 'TEST-CONTRACT-005',
        roomId: testRoomId,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        deposit: 5000000,
        tenantIds: [testTenantId],
        primaryTenantId: testTenantId
      }

      const response = await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(401)

      expect(response.body.error).toBe('Authentication required')
    })

    it('should fail with validation errors for invalid data', async () => {
      const contractData = {
        contractNumber: '', // Empty contract number
        roomId: testRoomId,
        startDate: '2025-12-31', // End date before start date
        endDate: '2025-01-01',
        deposit: -1000, // Negative deposit
        tenantIds: [], // Empty tenant array
        primaryTenantId: testTenantId
      }

      const response = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractData)
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
      expect(response.body.details).toBeInstanceOf(Array)
    })
  })

  describe('GET /api/contracts', () => {
    it('should get all contracts with pagination', async () => {
      const response = await request(app)
        .get('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toHaveProperty('page')
      expect(response.body.pagination).toHaveProperty('limit')
      expect(response.body.pagination).toHaveProperty('total')
    })

    it('should filter contracts by status', async () => {
      const response = await request(app)
        .get('/api/contracts?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      if (response.body.data.length > 0) {
        response.body.data.forEach((contract: any) => {
          expect(contract.status).toBe('ACTIVE')
        })
      }
    })

    it('should filter contracts by room ID', async () => {
      const response = await request(app)
        .get(`/api/contracts?roomId=${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      if (response.body.data.length > 0) {
        response.body.data.forEach((contract: any) => {
          expect(contract.roomId).toBe(testRoomId)
        })
      }
    })

    it('should search contracts by contract number', async () => {
      const response = await request(app)
        .get('/api/contracts?search=TEST-CONTRACT')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/contracts')
        .expect(401)

      expect(response.body.error).toBe('Authentication required')
    })
  })

  describe('GET /api/contracts/:id', () => {
    it('should get a specific contract by ID', async () => {
      const response = await request(app)
        .get(`/api/contracts/${testContractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toHaveProperty('id', testContractId)
      expect(response.body.data).toHaveProperty('contractNumber')
      expect(response.body.data).toHaveProperty('room')
      expect(response.body.data).toHaveProperty('tenants')
      expect(response.body.data).toHaveProperty('bills')
      expect(response.body.data.room).toHaveProperty('number')
      expect(response.body.data.tenants).toBeInstanceOf(Array)
    })

    it('should return 404 for non-existent contract', async () => {
      const response = await request(app)
        .get('/api/contracts/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Contract not found')
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/contracts/${testContractId}`)
        .expect(401)

      expect(response.body.error).toBe('Authentication required')
    })
  })

  describe('PUT /api/contracts/:id', () => {
    it('should update a contract successfully', async () => {
      const updateData = {
        deposit: 6000000,
        status: 'ACTIVE'
      }

      const response = await request(app)
        .put(`/api/contracts/${testContractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.message).toBe('Contract updated successfully')
      expect(response.body.data.deposit).toBe(updateData.deposit.toString())
      expect(response.body.data.status).toBe(updateData.status)
    })

    it('should fail to update non-existent contract', async () => {
      const updateData = {
        deposit: 6000000
      }

      const response = await request(app)
        .put('/api/contracts/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404)

      expect(response.body.error).toBe('Contract not found')
    })

    it('should fail to update with duplicate contract number', async () => {
      // First create another contract
      const anotherContract = await prisma.contract.create({
        data: {
          contractNumber: 'TEST-CONTRACT-DUPLICATE',
          roomId: testRoomId,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          deposit: 4000000,
          status: 'TERMINATED'
        }
      })

      const updateData = {
        contractNumber: 'TEST-CONTRACT-001' // Trying to use existing contract number
      }

      const response = await request(app)
        .put(`/api/contracts/${anotherContract.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409)

      expect(response.body.error).toBe('Contract number already exists')

      // Clean up
      await prisma.contract.delete({
        where: { id: anotherContract.id }
      })
    })

    it('should fail with validation errors', async () => {
      const updateData = {
        deposit: -1000, // Invalid negative deposit
        startDate: '2025-12-31',
        endDate: '2025-01-01' // End date before start date
      }

      const response = await request(app)
        .put(`/api/contracts/${testContractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })

    it('should fail without authentication', async () => {
      const updateData = {
        deposit: 6000000
      }

      const response = await request(app)
        .put(`/api/contracts/${testContractId}`)
        .send(updateData)
        .expect(401)

      expect(response.body.error).toBe('Authentication required')
    })
  })

  describe('DELETE /api/contracts/:id', () => {
    it('should fail to delete active contract', async () => {
      const response = await request(app)
        .delete(`/api/contracts/${testContractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409)

      expect(response.body.error).toBe('Cannot delete active contract')
    })

    it('should delete terminated contract successfully', async () => {
      // First terminate the contract
      await request(app)
        .put(`/api/contracts/${testContractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'TERMINATED' })
        .expect(200)

      // Then delete it
      const response = await request(app)
        .delete(`/api/contracts/${testContractId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.message).toBe('Contract deleted successfully')
      expect(response.body.data).toHaveProperty('id', testContractId)
    })

    it('should return 404 for non-existent contract', async () => {
      const response = await request(app)
        .delete('/api/contracts/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Contract not found')
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/contracts/some-id')
        .expect(401)

      expect(response.body.error).toBe('Authentication required')
    })
  })
})
