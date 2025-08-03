# JWT Authentication System

This document describes the JWT authentication system implemented for the Rental Management API.

## Overview

The authentication system uses JSON Web Tokens (JWT) for stateless authentication and includes:

- **JWT token generation and verification**
- **Password hashing with bcrypt**
- **Express middleware for authentication**
- **Role-based authorization**
- **Comprehensive security utilities**

## Core Components

### 1. Authentication Utilities (`src/lib/auth.ts`)

#### JWT Functions
```typescript
// Generate JWT token for authenticated user
generateToken(user: SafeUser): string

// Verify and decode JWT token
verifyToken(token: string): JWTPayload

// Extract token from Authorization header
extractTokenFromHeader(authHeader: string): string | null
```

#### Password Security
```typescript
// Hash password with bcrypt (salt rounds: 10)
hashPassword(password: string): Promise<string>

// Compare plain text password with hash
comparePassword(password: string, hash: string): Promise<boolean>
```

#### User Safety
```typescript
// Remove password from user object for safe transmission
sanitizeUser(user: User): SafeUser
```

### 2. Authentication Middleware (`src/middleware/auth.ts`)

#### Core Middleware
```typescript
// Required authentication - blocks unauthenticated requests
authenticate(req, res, next)

// Optional authentication - allows both authenticated and anonymous access
optionalAuthenticate(req, res, next)
```

#### Authorization Middleware
```typescript
// Role-based access control
requireRole('ADMIN', 'MANAGER')

// Admin-only access
requireAdmin()

// Manager or Admin access
requireManagerOrAdmin()
```

## Usage Examples

### 1. Protecting Routes

```typescript
import { authenticate, requireAdmin } from './middleware/auth'

// Require authentication
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user })
})

// Require admin role
app.delete('/api/users/:id', authenticate, requireAdmin, (req, res) => {
  // Only admins can access this endpoint
})

// Require manager or admin role
app.get('/api/reports', authenticate, requireManagerOrAdmin, (req, res) => {
  // Managers and admins can access this endpoint
})
```

### 2. Token Generation (Login)

```typescript
import { generateToken, comparePassword, sanitizeUser } from './lib/auth'

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { username }
  })
  
  if (!user || !await comparePassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  // Generate token
  const token = generateToken(sanitizeUser(user))
  
  res.json({
    token,
    user: sanitizeUser(user)
  })
})
```

### 3. Frontend Integration

#### Sending Requests with Token
```typescript
// Store token (localStorage, secure cookie, etc.)
const token = localStorage.getItem('authToken')

// Send authenticated requests
fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Security Features

### 1. Token Security
- **Expiration**: Tokens expire after 7 days (configurable)
- **Secret Key**: Uses environment variable for signing
- **Stateless**: No server-side session storage needed

### 2. Password Security
- **Bcrypt Hashing**: Industry-standard password hashing
- **Salt Rounds**: 10 rounds for optimal security/performance balance
- **No Plain Text**: Passwords never stored in plain text

### 3. User Data Protection
- **Sanitization**: Password fields removed from API responses
- **Type Safety**: TypeScript ensures proper data handling

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Optional: Generate a secure secret
# Use the generateSecureSecret() function to create one
```

### Default Settings
- **Token Expiry**: 7 days
- **Password Salt Rounds**: 10
- **Supported Token Formats**: `Bearer token` or direct token

## API Responses

### Success Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "username": "admin",
    "fullName": "Administrator",
    "role": "ADMIN",
    "createdAt": "2025-08-03T06:00:00.000Z",
    "updatedAt": "2025-08-03T06:00:00.000Z"
  }
}
```

### Error Responses
```json
// Authentication required
{
  "error": "Authentication required",
  "message": "No token provided"
}

// Invalid token
{
  "error": "Authentication failed", 
  "message": "Invalid token"
}

// Insufficient permissions
{
  "error": "Access denied",
  "message": "Required role: ADMIN"
}
```

## Request Flow

1. **Client Login**: POST credentials to `/api/auth/login`
2. **Server Validation**: Verify credentials and generate JWT
3. **Token Storage**: Client stores token securely
4. **Authenticated Requests**: Client includes token in Authorization header
5. **Server Verification**: Middleware validates token and attaches user to request
6. **Authorization**: Role-based middleware checks permissions
7. **Response**: Protected resource returned if authorized

## Testing

The authentication system includes comprehensive tests covering:

- ✅ **Token generation and verification**
- ✅ **Password hashing and comparison** 
- ✅ **Header token extraction**
- ✅ **User data sanitization**
- ✅ **Error handling for invalid tokens**

Run tests with:
```bash
npm test -- auth
```

## Security Best Practices

### 1. Token Management
- **Use HTTPS**: Always use HTTPS in production
- **Secure Storage**: Store tokens in httpOnly cookies or secure storage
- **Token Rotation**: Consider implementing refresh tokens for long-lived sessions

### 2. Password Policy
- **Minimum Length**: Enforce minimum password length
- **Complexity**: Consider requiring special characters
- **Rate Limiting**: Implement login attempt rate limiting

### 3. Environment Security
- **Secret Key**: Use a strong, randomly generated JWT secret
- **Environment Variables**: Never commit secrets to version control
- **Regular Rotation**: Rotate secrets periodically

## Error Handling

The system provides detailed error messages for debugging while maintaining security:

- **Development**: Detailed error messages for debugging
- **Production**: Generic error messages to prevent information leakage
- **Logging**: Security events logged for monitoring

## Next Steps

Once authentication is implemented, you can:

1. **Create Auth API Endpoints** (Task 3.2)
2. **Build Authentication UI** (Task 3.3)
3. **Implement Protected Routes** throughout the application
4. **Add Role-Based Features** based on user permissions

---

The authentication system is now ready for integration with your API endpoints and frontend application! 🔐
