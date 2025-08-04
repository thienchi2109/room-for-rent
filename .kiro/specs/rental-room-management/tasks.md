# Implementation Plan

- [x] 1. Setup project structure and development environment





  - Initialize Next.js frontend with TypeScript and Tailwind CSS
  - Setup Express.js backend with TypeScript
  - Configure Neon PostgreSQL database connection
  - Setup Prisma ORM with initial schema
  - Configure development scripts and environment variables
  - _Requirements: 7.1, 7.2_

- [x] 2. Implement core database schema and models
  - [x] 2.1 Create Prisma schema with all core models
    - Define Room, Tenant, Contract, Bill, MeterReading, Settings, User models
    - Setup proper relationships and constraints
    - Add enums for status fields (RoomStatus, ContractStatus, BillStatus)
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1, 7.2_

  - [x] 2.2 Run initial database migration
    - Execute Prisma migrate to create database tables
    - Seed database with initial settings and admin user
    - Test database connection and basic CRUD operations
    - _Requirements: 7.4, 6.1_

- [x] 3. Setup authentication system
  - [x] 3.1 Implement JWT authentication middleware
    - Create JWT token generation and verification functions
    - Implement authentication middleware for Express routes
    - Setup password hashing with bcrypt
    - _Requirements: 6.2, 6.3_

  - [x] 3.2 Create login/logout API endpoints
    - Implement POST /api/auth/login endpoint
    - Implement POST /api/auth/logout endpoint
    - Implement GET /api/auth/me endpoint for user verification
    - Add input validation and error handling
    - _Requirements: 6.1, 6.2, 6.5_

  - [x] 3.3 Build authentication UI components
    - Create login form with validation
    - Implement authentication state management with Zustand
    - Add protected route wrapper component
    - Create logout functionality
    - _Requirements: 6.1, 6.5_

- [x] 4. Implement room management system
  - [x] 4.1 Create room CRUD API endpoints
    - Implement GET /api/rooms with pagination and filtering
    - Implement POST /api/rooms for creating new rooms
    - Implement PUT /api/rooms/:id for updating room information
    - Implement DELETE /api/rooms/:id with validation checks
    - Add room status management endpoints
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.2 Build room management UI components
    - Create room list view with responsive table/cards
    - Implement room creation and editing forms
    - Add room status indicators and update functionality
    - Create room deletion with confirmation dialog
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.3 Implement interactive room map
    - Create responsive grid layout for room visualization
    - Implement color-coded room status display
    - Add click handlers for room details and actions
    - Implement real-time status updates with TanStack Query
    - Add floor-based filtering and floor view
    - _Requirements: 1.6, 1.7_

- [ ] 5. Implement tenant management system
  - [x] 5.1 Create tenant CRUD API endpoints


    - Implement GET /api/tenants with search and pagination
    - Implement POST /api/tenants for creating new tenants
    - Implement PUT /api/tenants/:id for updating tenant information
    - Implement DELETE /api/tenants/:id with validation checks
    - Add tenant history tracking endpoints
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [x] 5.2 Build tenant management UI components
    - Create tenant list with search functionality
    - Implement tenant creation and editing forms
    - Add tenant profile view with rental history
    - Create tenant deletion with validation
    - Improved dialog padding and spacing for better UX
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

  - [x] 5.3 Implement residency record management
    - Create API endpoints for temporary residence/absence records
    - Build UI forms for residency record management
    - Add residency history display in tenant profile
    - _Requirements: 2.4_

- [ ] 6. Implement contract management system
  - [x] 6.1 Create contract CRUD API endpoints
    - Implement GET /api/contracts with filtering and pagination
    - Implement POST /api/contracts for creating new contracts
    - Implement PUT /api/contracts/:id for updating contracts
    - Add contract validation logic (room availability, date validation)
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [ ] 6.2 Build contract management UI components
    - Create contract list view with status filtering
    - Implement multi-step contract creation form
    - Add contract editing and viewing interfaces
    - Create contract status management UI
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [ ] 6.3 Implement check-in/check-out functionality
    - Create POST /api/contracts/:id/checkin endpoint
    - Create POST /api/contracts/:id/checkout endpoint
    - Implement room status updates during check-in/out
    - Build check-in/check-out UI workflows
    - Add final bill calculation for check-out
    - _Requirements: 3.3, 3.4_

- [ ] 7. Implement AI-powered meter reading system
  - [ ] 7.1 Setup Gemini AI integration
    - Create GeminiAIService class for image analysis
    - Implement image-to-base64 conversion utilities
    - Add AI prompt engineering for meter reading
    - Setup error handling and retry logic
    - _Requirements: 4.2_

  - [ ] 7.2 Create localStorage image management
    - Implement MeterImageStorage class for client-side image storage
    - Add automatic cleanup of old images (7 days retention)
    - Create image retrieval and preview functionality
    - _Requirements: 4.2_

  - [ ] 7.3 Build AI meter scanning UI components
    - Create AIMeterScanner component with camera/upload functionality
    - Implement image preview and scanning progress indicators
    - Add confidence score display and validation
    - Create fallback manual input when AI confidence is low
    - _Requirements: 4.2_

- [ ] 8. Implement meter reading and bill generation
  - [ ] 8.1 Create meter reading API endpoints
    - Implement GET /api/meter-readings with filtering
    - Implement POST /api/meter-readings for submitting readings
    - Add POST /api/meter-readings/ai-scan for AI processing
    - Implement PUT /api/meter-readings/:id for corrections
    - _Requirements: 4.1, 4.2, 4.7_

  - [ ] 8.2 Build meter reading form with AI integration
    - Create enhanced meter reading form with AI scanning
    - Implement auto-fill functionality based on AI results
    - Add manual override and correction capabilities
    - Create batch meter reading interface for multiple rooms
    - _Requirements: 4.1, 4.2, 4.7_

  - [ ] 8.3 Implement automatic bill generation
    - Create bill calculation service with pricing logic
    - Implement POST /api/bills/generate endpoint
    - Add consumption calculation (new reading - old reading)
    - Create bill validation and error handling
    - _Requirements: 4.3, 4.4, 4.5_

- [ ] 9. Implement bill management system
  - [ ] 9.1 Create bill CRUD API endpoints
    - Implement GET /api/bills with filtering and pagination
    - Implement POST /api/bills for manual bill creation
    - Implement PUT /api/bills/:id for bill updates
    - Add POST /api/bills/:id/pay for payment processing
    - _Requirements: 4.5, 4.6_

  - [ ] 9.2 Build bill management UI components
    - Create bill list view with status filtering
    - Implement bill details view with payment history
    - Add payment marking functionality
    - Create bill editing and correction interfaces
    - _Requirements: 4.5, 4.6, 4.7_

- [ ] 10. Implement dashboard and reporting system
  - [ ] 10.1 Create dashboard API endpoints
    - Implement GET /api/dashboard/overview for key metrics
    - Implement GET /api/dashboard/revenue for chart data
    - Add GET /api/dashboard/notifications for alerts
    - Create revenue calculation and aggregation logic
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 10.2 Build dashboard UI with charts
    - Create dashboard overview with key statistics
    - Implement revenue charts using Recharts
    - Add room occupancy visualization
    - Create upcoming payment notifications display
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 10.3 Implement report generation
    - Create revenue report generation logic
    - Add date range filtering for reports
    - Implement PDF/Excel export functionality
    - Create custom report builder interface
    - _Requirements: 5.6, 5.7_

- [ ] 11. Implement comprehensive settings system
  - [ ] 11.1 Create settings API endpoints
    - Implement GET /api/settings with category filtering
    - Implement PUT /api/settings/category/:name for updates
    - Add POST /api/settings/logo for logo upload
    - Create settings validation and encryption for sensitive data
    - _Requirements: Settings module from design_

  - [ ] 11.2 Build settings management UI
    - Create tabbed settings interface (General, Pricing, AI, etc.)
    - Implement logo upload component with preview
    - Add form validation and auto-save functionality
    - Create settings reset and backup options
    - _Requirements: Settings module from design_

- [ ] 12. Implement automated scheduling system
  - [ ] 12.1 Setup node-cron job scheduler
    - Create cron job for monthly bill generation
    - Implement contract expiry notification job
    - Add overdue payment reminder job
    - Create error logging and notification system
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 12.2 Build notification system
    - Create notification storage and retrieval system
    - Implement in-app notification display
    - Add email notification functionality (optional)
    - Create notification preferences management
    - _Requirements: 8.2, 8.3_

- [ ] 13. Implement responsive design and mobile optimization
  - [ ] 13.1 Create responsive layout components
    - Implement mobile-first responsive layout
    - Create footer navigation for mobile devices
    - Add desktop sidebar navigation
    - Implement responsive breakpoint management
    - _Requirements: Mobile-first design from requirements_

  - [ ] 13.2 Optimize mobile user experience
    - Implement touch-friendly UI elements
    - Add pull-to-refresh functionality
    - Create mobile-optimized forms and modals
    - Implement swipe gestures for navigation
    - _Requirements: Mobile-first design from requirements_

- [ ] 14. Implement data fetching and state management
  - [ ] 14.1 Setup TanStack Query configuration
    - Configure QueryClient with caching strategies
    - Implement query key factory for organized cache management
    - Add error handling and retry logic
    - Create optimistic update patterns for mutations
    - _Requirements: Performance optimization from design_

  - [ ] 14.2 Create data fetching hooks
    - Implement useRooms, useTenants, useContracts hooks
    - Add infinite query hooks for mobile pagination
    - Create mutation hooks with cache invalidation
    - Implement real-time data refresh for critical components
    - _Requirements: Performance optimization from design_

- [ ] 15. Implement comprehensive testing
  - [ ] 15.1 Create backend API tests
    - Write unit tests for all service functions
    - Create integration tests for API endpoints
    - Add database operation tests with test database
    - Implement authentication and authorization tests
    - _Requirements: Testing strategy from design_

  - [ ] 15.2 Create frontend component tests
    - Write unit tests for utility functions and hooks
    - Create component tests using React Testing Library
    - Add integration tests for user workflows
    - Implement E2E tests for critical paths
    - _Requirements: Testing strategy from design_

- [ ] 16. Setup deployment and production configuration
  - [ ] 16.1 Configure production environment
    - Setup Vercel deployment for frontend
    - Configure Railway/Render deployment for backend
    - Setup environment variables and secrets management
    - Configure Neon database for production
    - _Requirements: 7.1, 7.5_

  - [ ] 16.2 Implement monitoring and logging
    - Add application logging and error tracking
    - Setup performance monitoring
    - Create health check endpoints
    - Implement backup and recovery procedures
    - _Requirements: 7.3, 8.4_

- [ ] 17. Final integration and optimization
  - [ ] 17.1 Perform end-to-end integration testing
    - Test complete user workflows from login to bill generation
    - Verify AI meter reading integration works correctly
    - Test responsive design across different devices
    - Validate all CRUD operations and data consistency
    - _Requirements: All requirements integration_

  - [ ] 17.2 Performance optimization and polish
    - Optimize bundle size and loading performance
    - Implement lazy loading for heavy components
    - Add loading states and error boundaries
    - Create user onboarding and help documentation
    - _Requirements: Performance and UX requirements_