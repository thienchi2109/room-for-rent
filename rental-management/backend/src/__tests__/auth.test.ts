import { generateToken, verifyToken, hashPassword, comparePassword, extractTokenFromHeader, sanitizeUser } from '../lib/auth'
import { UserRole } from '@prisma/client'

describe('Authentication Utilities', () => {
  const mockUser = {
    id: 'test-user-id',
    username: 'testuser',
    fullName: 'Test User',
    role: UserRole.ADMIN,
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const { password, ...safeUser } = mockUser
      const token = generateToken(safeUser)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should include user information in token payload', () => {
      const { password, ...safeUser } = mockUser
      const token = generateToken(safeUser)
      const decoded = verifyToken(token)
      
      expect(decoded.userId).toBe(mockUser.id)
      expect(decoded.username).toBe(mockUser.username)
      expect(decoded.role).toBe(mockUser.role)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const { password, ...safeUser } = mockUser
      const token = generateToken(safeUser)
      const decoded = verifyToken(token)
      
      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(mockUser.id)
    })

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow('Invalid token')
    })

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow('Invalid token')
    })
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are long
    })

    it('should produce different hashes for same password', async () => {
      const password = 'testpassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2) // Salt makes each hash unique
    })
  })

  describe('comparePassword', () => {
    it('should validate correct password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      const isValid = await comparePassword(password, hash)
      
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hash = await hashPassword(password)
      const isValid = await comparePassword(wrongPassword, hash)
      
      expect(isValid).toBe(false)
    })
  })

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test-jwt-token'
      const header = `Bearer ${token}`
      const extracted = extractTokenFromHeader(header)
      
      expect(extracted).toBe(token)
    })

    it('should extract token from direct header', () => {
      const token = 'test-jwt-token'
      const extracted = extractTokenFromHeader(token)
      
      expect(extracted).toBe(token)
    })

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader(undefined)
      expect(extracted).toBeNull()
    })

    it('should return empty string for empty header', () => {
      const extracted = extractTokenFromHeader('')
      expect(extracted).toBe('')
    })
  })

  describe('sanitizeUser', () => {
    it('should remove password from user object', () => {
      const sanitized = sanitizeUser(mockUser)
      
      expect(sanitized).not.toHaveProperty('password')
      expect(sanitized.id).toBe(mockUser.id)
      expect(sanitized.username).toBe(mockUser.username)
      expect(sanitized.fullName).toBe(mockUser.fullName)
      expect(sanitized.role).toBe(mockUser.role)
    })
  })
})
