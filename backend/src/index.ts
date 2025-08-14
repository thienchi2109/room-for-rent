import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import roomRoutes from './routes/rooms'
import tenantRoutes from './routes/tenants'
import contractRoutes from './routes/contracts'
import residencyRecordRoutes from './routes/residencyRecords'
import dashboardRoutes from './routes/dashboard'
import billRoutes from './routes/bills'
import reportRoutes from './routes/reports'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      // Add common Render patterns
      /^https:\/\/.*\.onrender\.com$/,
      // Frontend service URL on Render
      'https://happyhome-app.onrender.com'
    ].filter(Boolean) // Remove undefined values

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin)
      }
      return false
    })

    if (isAllowed) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    cors: {
      allowedOrigins: process.env.FRONTEND_URL || 'http://localhost:3000'
    }
  })
})

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Room Rental Management API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      rooms: '/api/rooms',
      tenants: '/api/tenants',
      contracts: '/api/contracts',
      bills: '/api/bills',
      reports: '/api/reports',
      dashboard: '/api/dashboard'
    }
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/tenants', tenantRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/residency-records', residencyRecordRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/bills', billRoutes)
app.use('/api/reports', reportRoutes)

app.get('/api', (req, res) => {
  res.json({ message: 'Rental Management API Server' })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  })
}

export default app