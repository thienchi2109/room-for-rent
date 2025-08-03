# 🚀 Neon Database Setup Guide

Follow these steps to connect your development environment to Neon:

## Step 1: Create Neon Database

1. **Go to [neon.tech](https://neon.tech/)** (already opened in browser)
2. **Sign up/Login** with your GitHub, Google, or email
3. **Create New Project**:
   - Project name: `rental-management-dev`
   - Database name: `rental_db` (or keep default)
   - Region: Choose closest to your location
4. **Wait for creation** (takes ~30 seconds)

## Step 2: Get Connection String

1. **Go to your project dashboard**
2. **Click "Connection Details"** or **"Connect"**
3. **Copy the connection string** - it will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.neon.tech/database?sslmode=require
   ```

## Step 3: Update Your .env File

Replace the DATABASE_URL in your `.env` file with the real connection string:

### Before (current):
```env
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
```

### After (your real Neon URL):
```env
DATABASE_URL="postgresql://your-username:your-password@ep-xxx-xxx.region.neon.tech/your-database?sslmode=require"
```

**Example of what a real Neon URL looks like:**
```env
DATABASE_URL="postgresql://alex:AbC123xyz@ep-cool-lab-123456.us-east-1.neon.tech/rental_db?sslmode=require"
```

## Step 4: Test Connection

Run this command to test your connection:
```bash
npm run db:test
```

## Step 5: Setup Database (First Time Only)

Once connection test passes, run:
```bash
npm run db:setup
```

This will:
- ✅ Create all database tables
- ✅ Create admin user (username: admin, password: admin123)
- ✅ Add default settings
- ✅ Create sample rooms

## Step 6: Verify Everything Works

```bash
# Start the backend server
npm run dev

# In another terminal, open Prisma Studio to view your data
npm run db:studio
```

## 🔧 Troubleshooting

### ❌ "Connection refused"
- Check your internet connection
- Verify the URL is copied correctly
- Make sure Neon database isn't paused (Neon auto-pauses after inactivity)

### ❌ "Authentication failed"
- Double-check username and password in the URL
- Ensure you copied the complete connection string

### ❌ "Database does not exist"
- Make sure you selected the correct database name when creating the project
- Check the database name in the Neon console

### ❌ "SSL error"
- Ensure `?sslmode=require` is at the end of your URL
- Don't remove the SSL mode parameter

## 🎯 Quick Commands Reference

```bash
npm run db:test     # Test database connection
npm run db:setup    # Complete database setup (first time)
npm run db:migrate  # Run migrations only
npm run db:seed     # Seed data only
npm run db:studio   # Open database browser
npm run dev         # Start development server
```

## 🔐 Security Notes

- ✅ Never commit your `.env` file to git
- ✅ The connection string contains your password
- ✅ Change the default admin password after first login
- ✅ Use different databases for development and production

## 📱 Mobile Testing

Once setup is complete, your API will be available at:
- **Local**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/health`
- **API Info**: `http://localhost:3001/api`

---

Need help? The connection test script will guide you through any issues! 🚀
