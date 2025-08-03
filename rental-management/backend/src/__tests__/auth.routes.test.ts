import request from 'supertest'
import express from 'express'
import authRoutes from '../routes/auth'
import { prisma } from '../lib/database'
import { hashPassword } from '../lib/auth'
import { UserRole } from '@prisma/client'

// Create test app
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

// Test data
const testUser = {
  username: 'testuser',
  fullName: 'Test User',
  password: 'TestPassword123!',
  role: UserRole.MANAGER
}

describe('Auth Routes', () => {
  let userId: string
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await hashPassword(testUser.password)
    const user = await prisma.user.create({
      data: {
        username: testUser.username,
        fullName: testUser.fullName,
        password: hashedPassword,
        role: testUser.role
      }
    })
    userId = user.id
  })

  afterAll(async () => {
    // Cleanup test user
    await prisma.user.delete({ where: { id: userId } })
    await prisma.$disconnect()
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.username).toBe(testUser.username)
      expect(response.body.user).not.toHaveProperty('password')

      // Store token for other tests
      authToken = response.body.token
    })

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username
          // missing password
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user info when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.username).toBe(testUser.username)
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/auth/me')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const newPassword = 'NewPassword123!'
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: newPassword,
          confirmPassword: newPassword
        })

      if (response.status !== 200) {
        console.log('Change password response:', response.body)
      }

      expect(response.status).toBe(200)
      expect(response.body.message).toContain('successfully')

      // Update test password for logout test
      testUser.password = newPassword
    })

    it('should reject wrong current password', async () => {
      const newPassword = 'NewPassword123!'
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: newPassword,
          confirmPassword: newPassword
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token when authenticated', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.message).toContain('refreshed')
    })

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toContain('successful')
    })
  })
})
