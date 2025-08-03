#!/usr/bin/env node

/**
 * Quick Database Connection Test
 * 
 * This script helps you test your Neon database connection
 * Run with: node scripts/test-connection.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔄 Testing Neon database connection...\n');

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('Please add your Neon database URL to the .env file\n');
    process.exit(1);
  }

  if (process.env.DATABASE_URL.includes('username:password@hostname')) {
    console.error('❌ DATABASE_URL is still using placeholder values');
    console.log('Please replace with your actual Neon database URL\n');
    console.log('Steps:');
    console.log('1. Go to https://neon.tech/');
    console.log('2. Create a new project');
    console.log('3. Copy the connection string');
    console.log('4. Replace DATABASE_URL in your .env file\n');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    console.log('\n🔍 Testing basic query...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Query successful!');
    console.log('📋 Database info:', result[0]?.version?.substring(0, 50) + '...');

    console.log('\n🏗️ Checking if tables exist...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Tables exist! Found ${userCount} users`);
      
      if (userCount === 0) {
        console.log('\n💡 Database is empty. Run the setup to create initial data:');
        console.log('   npm run db:setup');
      } else {
        console.log('✅ Database has data!');
      }
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('⚠️ Tables don\'t exist yet. Run migration first:');
        console.log('   npm run db:migrate');
      } else {
        console.log('⚠️ Error checking tables:', error.message);
      }
    }

    console.log('\n🎉 Connection test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. If tables don\'t exist: npm run db:setup');
    console.log('2. Start development server: npm run dev');
    console.log('3. View database: npm run db:studio');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL format');
    console.log('2. Ensure your Neon database is not paused');
    console.log('3. Verify your internet connection');
    console.log('4. Check if the database exists in Neon console');
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testConnection().catch(console.error);
}

module.exports = { testConnection };
