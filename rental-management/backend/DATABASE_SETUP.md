# Database Setup Guide

This guide explains how to set up the database for the Rental Management System.

## Prerequisites

1. **Neon Database Account**: Sign up at [neon.tech](https://neon.tech/)
2. **Node.js**: Version 18 or higher
3. **Environment Variables**: Properly configured `.env` file

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run the automated setup script
npm run db:setup
```

This script will:
- ✅ Generate Prisma client
- ✅ Run database migrations
- ✅ Seed initial data
- ✅ Verify the setup

### Option 2: Manual Setup

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Run database migration
npm run db:migrate

# 3. Seed the database
npm run db:seed

# 4. Test the connection
npm test
```

## Environment Configuration

Make sure your `.env` file has a valid `DATABASE_URL`:

```env
# Replace with your actual Neon database URL
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
```

### Getting Your Neon Database URL

1. Go to [neon.tech](https://neon.tech/) and sign in
2. Create a new project
3. Go to the **Connection Details** section
4. Copy the connection string
5. Paste it into your `.env` file

## Database Schema

The migration creates the following tables:

### Core Tables
- **users** - Admin/manager accounts
- **rooms** - Room information and status
- **tenants** - Tenant personal information
- **contracts** - Rental contracts
- **bills** - Monthly bills and payments
- **meter_readings** - Utility meter readings with AI support
- **settings** - Application configuration
- **residency_records** - Tenant residence tracking

### Junction Tables
- **contract_tenants** - Many-to-many relationship between contracts and tenants

## Initial Data

The seed script creates:

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`

⚠️ **Important**: Change the admin password after first login!

### Default Settings
- **Facility Information**: Name, address, contact details
- **Pricing**: Electric (3,500 VND/kWh), Water (25,000 VND/m³)
- **AI Configuration**: Scanning enabled, confidence threshold 0.8
- **System Settings**: Currency (VND), date format, language

### Sample Rooms
- **Room 101**: 20m², Single room, 2,500,000 VND/month
- **Room 102**: 25m², Double room, 3,000,000 VND/month
- **Room 103**: 20m², Single room, 2,500,000 VND/month
- **Room 201**: 30m², Family room, 3,500,000 VND/month
- **Room 202**: 25m², Double room, 3,000,000 VND/month

## Available Commands

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed initial data
npm run db:setup       # Complete automated setup
npm run db:studio      # Open Prisma Studio
npm run db:push        # Push schema changes
npm run db:reset       # Reset database (⚠️ Destructive)

# Testing
npm test               # Run all tests
npm test database      # Run only database tests
```

## Verification

After setup, verify everything is working:

```bash
# 1. Run tests
npm test

# 2. Check database connection
npm run db:studio

# 3. Start the server
npm run dev
```

## Troubleshooting

### Common Issues

**❌ "Invalid database URL"**
- Check your `DATABASE_URL` in `.env`
- Ensure the URL format is correct
- Verify your Neon database is running

**❌ "Connection refused"**
- Check your internet connection
- Verify Neon database credentials
- Ensure the database isn't paused (Neon auto-pauses after inactivity)

**❌ "Migration failed"**
- Try resetting: `npm run db:reset`
- Check if schema conflicts exist
- Ensure database is empty for first migration

**❌ "Seed script fails"**
- Check if migration completed successfully
- Verify admin user doesn't already exist
- Run: `npm run db:reset` then `npm run db:setup`

### Reset Database

If you need to start fresh:

```bash
# ⚠️ This will delete all data!
npm run db:reset

# Then run setup again
npm run db:setup
```

## Security Notes

1. **Change Default Password**: Update admin password after setup
2. **Environment Variables**: Never commit `.env` to version control
3. **Database Access**: Restrict database access to authorized IPs only
4. **Regular Backups**: Set up automated backups in Neon console

## Next Steps

After successful database setup:

1. ✅ Database is ready
2. 🔄 Start backend server: `npm run dev`
3. 🔄 Continue with authentication implementation
4. 🔄 Build API endpoints

For development, you can use Prisma Studio to browse and edit data:
```bash
npm run db:studio
```
