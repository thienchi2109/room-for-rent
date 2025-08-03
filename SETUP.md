# Setup Instructions

## Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL database account
- Git

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   cd rental-management
   npm install
   ```

2. **Configure Neon Database:**
   - Create a new project on [Neon](https://neon.tech)
   - Copy your database URL
   - Update `backend/.env` with your DATABASE_URL

3. **Setup database:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL="your-neon-database-url"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
rental-management/
├── frontend/          # Next.js app
├── backend/           # Express.js API
├── shared/            # Shared types
└── package.json       # Workspace config
```

## Default Login

After seeding the database:
- Username: `admin`
- Password: `admin123`

## Next Steps

1. Configure your Neon database URL
2. Run the setup commands
3. Access the application at http://localhost:3000
4. Start implementing the remaining tasks from the task list