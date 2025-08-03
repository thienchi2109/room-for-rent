import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '@prisma/client'

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Type for JWT payload
export interface JWTPayload {
  userId: string
  username: string
  role: string
  iat?: number
  exp?: number
}

// Type for user without password
export type SafeUser = Omit<User, 'password'>

/**
 * Generate JWT token for user
 */
export function generateToken(user: SafeUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  } as jwt.SignOptions)
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    throw new Error('Token verification failed')
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a secure random JWT secret
 */
export function generateSecureSecret(): string {
  return require('crypto').randomBytes(64).toString('hex')
}

/**
 * Extract token from Authorization header
 * Supports both "Bearer token" and "token" formats
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || authHeader === '') {
    return authHeader === '' ? '' : null
  }

  // Handle "Bearer token" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Handle direct token format
  return authHeader
}

/**
 * Remove sensitive data from user object
 */
export function sanitizeUser(user: User): SafeUser {
  const { password, ...safeUser } = user
  return safeUser
}
