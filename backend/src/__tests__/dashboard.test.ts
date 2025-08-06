import request from 'supertest'
import { app } from '../index'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Mock user for authentication
const mockUser = {
  id: 'test-user-id',
  username: 'testuser',
  role: 'ADMIN'
}

const authToken = jwt.sign(mockUser, process.env.JWT_SECRET || 'test-secret')

describe('Dashboard API Endpoints', () => {
  beforeAll(async () => {
    // Setup test data if needed
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('GET /api/dashboard/overview', () => {
    it('should return dashboard overview with authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('rooms')
      expect(response.body.data).toHaveProperty('tenants')
      expect(response.body.data).toHaveProperty('revenue')
      expect(response.body.data).toHaveProperty('alerts')

      // Check room statistics structure
      expect(response.body.data.rooms).toHaveProperty('total')
      expect(response.body.data.rooms).toHaveProperty('occupied')
      expect(response.body.data.rooms).toHaveProperty('available')
      expect(response.body.data.rooms).toHaveProperty('maintenance')
      expect(response.body.data.rooms).toHaveProperty('occupancyRate')

      // Check revenue structure
      expect(response.body.data.revenue).toHaveProperty('monthly')
      expect(response.body.data.revenue).toHaveProperty('pending')
      expect(response.body.data.revenue).toHaveProperty('period')
    })

    it('should accept month and year query parameters', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview?month=12&year=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.revenue.period.month).toBe(12)
      expect(response.body.data.revenue.period.year).toBe(2024)
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/dashboard/overview')
        .expect(401)
    })

    it('should validate query parameters', async () => {
      await request(app)
        .get('/api/dashboard/overview?month=13&year=1999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)
    })
  })

  describe('GET /api/dashboard/revenue', () => {
    it('should return revenue chart data', async () => {
      const response = await request(app)
        .get('/api/dashboard/revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('revenueData')
      expect(response.body.data).toHaveProperty('summary')

      // Check revenue data structure
      expect(Array.isArray(response.body.data.revenueData)).toBe(true)
      
      if (response.body.data.revenueData.length > 0) {
        const firstItem = response.body.data.revenueData[0]
        expect(firstItem).toHaveProperty('month')
        expect(firstItem).toHaveProperty('year')
        expect(firstItem).toHaveProperty('paidRevenue')
        expect(firstItem).toHaveProperty('pendingRevenue')
        expect(firstItem).toHaveProperty('totalRevenue')
      }

      // Check summary structure
      expect(response.body.data.summary).toHaveProperty('totalPaidRevenue')
      expect(response.body.data.summary).toHaveProperty('totalPendingRevenue')
      expect(response.body.data.summary).toHaveProperty('totalRevenue')
      expect(response.body.data.summary).toHaveProperty('period')
    })

    it('should accept year and months query parameters', async () => {
      const response = await request(app)
        .get('/api/dashboard/revenue?year=2024&months=6')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.revenueData.length).toBeLessThanOrEqual(6)
      expect(response.body.data.summary.period.months).toBe(6)
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/dashboard/revenue')
        .expect(401)
    })
  })

  describe('GET /api/dashboard/notifications', () => {
    it('should return notifications and alerts', async () => {
      const response = await request(app)
        .get('/api/dashboard/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('notifications')
      expect(response.body.data).toHaveProperty('summary')

      // Check notifications structure
      expect(Array.isArray(response.body.data.notifications)).toBe(true)
      
      if (response.body.data.notifications.length > 0) {
        const firstNotification = response.body.data.notifications[0]
        expect(firstNotification).toHaveProperty('id')
        expect(firstNotification).toHaveProperty('type')
        expect(firstNotification).toHaveProperty('priority')
        expect(firstNotification).toHaveProperty('title')
        expect(firstNotification).toHaveProperty('message')
        expect(firstNotification).toHaveProperty('actionRequired')
      }

      // Check summary structure
      expect(response.body.data.summary).toHaveProperty('total')
      expect(response.body.data.summary).toHaveProperty('byType')
      expect(response.body.data.summary).toHaveProperty('byPriority')
      expect(response.body.data.summary).toHaveProperty('actionRequired')
    })

    it('should accept limit query parameter', async () => {
      const response = await request(app)
        .get('/api/dashboard/notifications?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.notifications.length).toBeLessThanOrEqual(5)
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/dashboard/notifications')
        .expect(401)
    })
  })
})
