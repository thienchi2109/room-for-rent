import { Router, Request, Response } from 'express'
import { prisma } from '../lib/database'
import { generateToken, comparePassword, hashPassword, sanitizeUser, SafeUser } from '../lib/auth'
import { authenticate, optionalAuthenticate } from '../middleware/auth'
import { validateRequest, loginSchema, changePasswordSchema } from '../lib/validation'

const router = Router()

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      })
      return
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      })
      return
    }

    // Generate JWT token
    const safeUser = sanitizeUser(user)
    const token = generateToken(safeUser)

    // Log successful login
    console.log(`User ${username} logged in successfully at ${new Date().toISOString()}`)

    res.json({
      message: 'Login successful',
      token,
      user: safeUser,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Login processing failed'
    })
  }
})

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 * Note: JWT is stateless, so this is mainly for logging purposes
 */
router.post('/logout', optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    // Log logout if user is authenticated
    if (req.user) {
      console.log(`User ${req.user.username} logged out at ${new Date().toISOString()}`)
    }

    res.json({
      message: 'Logout successful',
      instructions: 'Please remove the token from client storage'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Logout processing failed'
    })
  }
})

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not found in request'
      })
      return
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User no longer exists'
      })
      return
    }

    res.json({
      user: sanitizeUser(user)
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user information'
    })
  }
})

/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      })
      return
    }

    const { currentPassword, newPassword } = req.body

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found'
      })
      return
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        error: 'Password change failed',
        message: 'Current password is incorrect'
      })
      return
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    // Log password change
    console.log(`User ${user.username} changed password at ${new Date().toISOString()}`)

    res.json({
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Password change failed'
    })
  }
})

/**
 * POST /api/auth/refresh
 * Refresh JWT token (optional endpoint for token renewal)
 */
router.post('/refresh', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      })
      return
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found'
      })
      return
    }

    // Generate new token
    const safeUser = sanitizeUser(user)
    const newToken = generateToken(safeUser)

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: safeUser,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Token refresh failed'
    })
  }
})

export default router
