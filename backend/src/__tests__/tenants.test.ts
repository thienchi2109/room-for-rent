import request from 'supertest'
import app from '../index'
import { prisma } from '../lib/database'
import { generateToken, sanitizeUser } from '../lib/auth'

describe('Tenant API Endpoints', () => {
  let authToken: string
  let testUserId: string
  let testTenantId: string

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.tenant.deleteMany({
      where: {
        idCard: {
          startsWith: 'TEST'
        }
      }
    })

    // Create a test user for authentication
    const testUser = await prisma.user.create({
      data: {
        username: 'testadmin_tenant',
        password: '$2b$10$hash', // This should be a real hash in practice
        fullName: 'Test Admin Tenant',
        role: 'ADMIN'
      }
    })
    testUserId = testUser.id
    authToken = generateToken(sanitizeUser(testUser))
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.tenant.deleteMany({
      where: {
        idCard: {
          startsWith: 'TEST'
        }
      }
    })
    await prisma.user.delete({
      where: { id: testUserId }
    })
  })

  afterEach(async () => {
    // Clean up tenants created in tests
    await prisma.tenant.deleteMany({
      where: {
        idCard: {
          startsWith: 'TEST'
        }
      }
    })
  })

  describe('GET /api/tenants', () => {
    it('should return empty list when no tenants exist', async () => {
      const response = await request(app)
        .get('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('pagination')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should return tenants with pagination', async () => {
      // Create test tenants
      await prisma.tenant.createMany({
        data: [
          {
            fullName: 'Test Tenant 1',
            dateOfBirth: new Date('1990-01-01'),
            idCard: 'TEST123456789',
            hometown: 'Test City 1',
            phone: '0123456789'
          },
          {
            fullName: 'Test Tenant 2',
            dateOfBirth: new Date('1992-02-02'),
            idCard: 'TEST987654321',
            hometown: 'Test City 2',
            phone: '0987654321'
          },
          {
            fullName: 'Test Tenant 3',
            dateOfBirth: new Date('1995-03-03'),
            idCard: 'TEST555666777',
            hometown: 'Test City 3',
            phone: '0555666777'
          }
        ]
      })

      const response = await request(app)
        .get('/api/tenants?limit=2&search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toHaveLength(2)
      expect(response.body.pagination.limit).toBe(2)
      expect(response.body.pagination.total).toBe(3)
    })

    it('should search tenants by name, phone, or ID card', async () => {
      // Create test tenant
      await prisma.tenant.create({
        data: {
          fullName: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          idCard: 'TEST123456789',
          hometown: 'Test City',
          phone: '0123456789'
        }
      })

      // Search by name
      const nameResponse = await request(app)
        .get('/api/tenants?search=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(nameResponse.body.data).toHaveLength(1)
      expect(nameResponse.body.data[0].fullName).toBe('John Doe')

      // Search by phone
      const phoneResponse = await request(app)
        .get('/api/tenants?search=0123456789')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(phoneResponse.body.data).toHaveLength(1)
      expect(phoneResponse.body.data[0].phone).toBe('0123456789')
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/tenants')
        .expect(401)
    })
  })

  describe('GET /api/tenants/:id', () => {
    beforeEach(async () => {
      const tenant = await prisma.tenant.create({
        data: {
          fullName: 'Test Tenant Detail',
          dateOfBirth: new Date('1990-01-01'),
          idCard: 'TEST123456789',
          hometown: 'Test City',
          phone: '0123456789'
        }
      })
      testTenantId = tenant.id
    })

    it('should return tenant details with contracts and residency records', async () => {
      const response = await request(app)
        .get(`/api/tenants/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toHaveProperty('id', testTenantId)
      expect(response.body.data).toHaveProperty('fullName', 'Test Tenant Detail')
      expect(response.body.data).toHaveProperty('contracts')
      expect(response.body.data).toHaveProperty('residencyRecords')
      expect(Array.isArray(response.body.data.contracts)).toBe(true)
      expect(Array.isArray(response.body.data.residencyRecords)).toBe(true)
    })

    it('should return 404 for non-existent tenant', async () => {
      const fakeId = 'non-existent-id'
      await request(app)
        .get(`/api/tenants/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/tenants/${testTenantId}`)
        .expect(401)
    })
  })

  describe('POST /api/tenants', () => {
    const validTenantData = {
      fullName: 'New Test Tenant',
      dateOfBirth: '1990-05-15',
      idCard: 'TEST999888777',
      hometown: 'New Test City',
      phone: '0999888777'
    }

    it('should create a new tenant', async () => {
      const response = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData)
        .expect(201)

      expect(response.body).toHaveProperty('message', 'Tenant created successfully')
      expect(response.body.data).toHaveProperty('fullName', 'New Test Tenant')
      expect(response.body.data).toHaveProperty('idCard', 'TEST999888777')
      expect(response.body.data).toHaveProperty('id')
    })

    it('should reject duplicate ID card numbers', async () => {
      // Create first tenant
      await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData)
        .expect(201)

      // Try to create duplicate
      await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData)
        .expect(409)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        fullName: 'Test Tenant',
        // Missing required fields
      }

      const response = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
      expect(response.body).toHaveProperty('details')
      expect(Array.isArray(response.body.details)).toBe(true)
    })

    it('should validate ID card format', async () => {
      const invalidIdCardData = {
        ...validTenantData,
        idCard: 'INVALID_ID'
      }

      const response = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidIdCardData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should validate phone format', async () => {
      const invalidPhoneData = {
        ...validTenantData,
        phone: 'invalid-phone'
      }

      const response = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPhoneData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should require authentication', async () => {
      await request(app)
        .post('/api/tenants')
        .send(validTenantData)
        .expect(401)
    })
  })

  describe('PUT /api/tenants/:id', () => {
    beforeEach(async () => {
      const tenant = await prisma.tenant.create({
        data: {
          fullName: 'Update Test Tenant',
          dateOfBirth: new Date('1990-01-01'),
          idCard: 'TEST111222333',
          hometown: 'Update Test City',
          phone: '0111222333'
        }
      })
      testTenantId = tenant.id
    })

    it('should update tenant information', async () => {
      const updateData = {
        fullName: 'Updated Tenant Name',
        phone: '0999888777'
      }

      const response = await request(app)
        .put(`/api/tenants/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Tenant updated successfully')
      expect(response.body.data).toHaveProperty('fullName', 'Updated Tenant Name')
      expect(response.body.data).toHaveProperty('phone', '0999888777')
      expect(response.body.data).toHaveProperty('idCard', 'TEST111222333') // Should remain unchanged
    })

    it('should update date of birth', async () => {
      const updateData = {
        dateOfBirth: '1995-12-25'
      }

      const response = await request(app)
        .put(`/api/tenants/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.data.dateOfBirth).toContain('1995-12-25')
    })

    it('should prevent ID card conflicts when updating', async () => {
      // Create another tenant
      await prisma.tenant.create({
        data: {
          fullName: 'Another Tenant',
          dateOfBirth: new Date('1992-01-01'),
          idCard: 'TEST444555666',
          hometown: 'Another City',
          phone: '0444555666'
        }
      })

      // Try to update with existing ID card
      const updateData = {
        idCard: 'TEST444555666'
      }

      await request(app)
        .put(`/api/tenants/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409)
    })

    it('should return 404 for non-existent tenant', async () => {
      const fakeId = 'non-existent-id'
      const updateData = {
        fullName: 'Updated Name'
      }

      await request(app)
        .put(`/api/tenants/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404)
    })

    it('should validate update data', async () => {
      const invalidData = {
        idCard: 'INVALID_FORMAT'
      }

      const response = await request(app)
        .put(`/api/tenants/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should require at least one field for update', async () => {
      const response = await request(app)
        .put(`/api/tenants/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/tenants/${testTenantId}`)
        .send({ fullName: 'Updated Name' })
        .expect(401)
    })
  })

  describe('DELETE /api/tenants/:id', () => {
    beforeEach(async () => {
      const tenant = await prisma.tenant.create({
        data: {
          fullName: 'Delete Test Tenant',
          dateOfBirth: new Date('1990-01-01'),
          idCard: 'TEST777888999',
          hometown: 'Delete Test City',
          phone: '0777888999'
        }
      })
      testTenantId = tenant.id
    })

    it('should delete tenant successfully', async () => {
      const response = await request(app)
        .delete(`/api/tenants/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Tenant deleted successfully')

      // Verify tenant is deleted
      const deletedTenant = await prisma.tenant.findUnique({
        where: { id: testTenantId }
      })
      expect(deletedTenant).toBeNull()
    })

    it('should return 404 for non-existent tenant', async () => {
      const fakeId = 'non-existent-id'
      await request(app)
        .delete(`/api/tenants/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/tenants/${testTenantId}`)
        .expect(401)
    })
  })

  describe('GET /api/tenants/:id/history', () => {
    beforeEach(async () => {
      const tenant = await prisma.tenant.create({
        data: {
          fullName: 'History Test Tenant',
          dateOfBirth: new Date('1990-01-01'),
          idCard: 'TEST000111222',
          hometown: 'History Test City',
          phone: '0000111222'
        }
      })
      testTenantId = tenant.id
    })

    it('should return tenant history with pagination', async () => {
      const response = await request(app)
        .get(`/api/tenants/${testTenantId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('tenant')
      expect(response.body.data).toHaveProperty('history')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.data.tenant).toHaveProperty('fullName', 'History Test Tenant')
      expect(Array.isArray(response.body.data.history)).toBe(true)
    })

    it('should return 404 for non-existent tenant', async () => {
      const fakeId = 'non-existent-id'
      await request(app)
        .get(`/api/tenants/${fakeId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/tenants/${testTenantId}/history`)
        .expect(401)
    })
  })
})
