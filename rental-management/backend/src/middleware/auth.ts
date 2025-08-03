import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/database'
import { verifyToken, extractTokenFromHeader, sanitizeUser, JWTPayload, SafeUser } from '../lib/auth'

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      })
      return
    }

    // Verify token
    let decoded: JWTPayload
    try {
      decoded = verifyToken(token)
    } catch (error) {
      res.status(401).json({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Invalid token'
      })
      return
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found'
      })
      return
    }

    // Attach sanitized user to request
    req.user = sanitizeUser(user)
    next()

  } catch (error) {
    console.error('Authentication middleware error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication processing failed'
    })
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is provided, but doesn't fail if not
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      // No token provided, continue without user
      return next()
    }

    try {
      const decoded = verifyToken(token)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (user) {
        req.user = sanitizeUser(user)
      }
    } catch (error) {
      // Token invalid, continue without user
      console.log('Optional authentication failed:', error)
    }

    next()

  } catch (error) {
    console.error('Optional authentication middleware error:', error)
    next() // Continue without authentication
  }
}

/**
 * Role-based authorization middleware factory
 * Requires authentication first
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Access denied',
        message: `Required role: ${allowedRoles.join(' or ')}`
      })
      return
    }

    next()
  }
}

/**
 * Admin-only middleware
 * Convenience wrapper for admin role requirement
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('ADMIN')(req, res, next)
}

/**
 * Manager or Admin middleware
 * Allows both manager and admin roles
 */
export function requireManagerOrAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('ADMIN', 'MANAGER')(req, res, next)
}
