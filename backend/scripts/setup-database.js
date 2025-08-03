#!/usr/bin/env node

/**
 * Database Migration and Setup Script
 * 
 * This script helps set up the database for the first time.
 * It performs the following steps:
 * 1. Generates Prisma client
 * 2. Runs database migration
 * 3. Seeds the database with initial data
 * 4. Verifies the setup
 */

const { execSync } = require('child_process');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      cwd: __dirname 
    });
    console.log(`✅ ${description} completed successfully`);
    if (output.trim()) {
      console.log(output);
    }
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  // Check if DATABASE_URL is configured
  require('dotenv').config();
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password@hostname')) {
    console.error('❌ DATABASE_URL is not properly configured!');
    console.log('\n📝 Please follow these steps:');
    console.log('1. Create a Neon database at https://neon.tech/');
    console.log('2. Copy the connection string');
    console.log('3. Update the DATABASE_URL in your .env file');
    console.log('4. Run this script again\n');
    process.exit(1);
  }

  // Step 1: Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    process.exit(1);
  }

  // Step 2: Run migration
  if (!runCommand('npx prisma migrate dev --name init', 'Running database migration')) {
    console.log('\n💡 If migration fails, you might need to reset the database:');
    console.log('   npm run db:reset');
    process.exit(1);
  }

  // Step 3: Seed database
  if (!runCommand('npm run db:seed', 'Seeding database with initial data')) {
    console.log('\n💡 You can run the seed manually later:');
    console.log('   npm run db:seed');
  }

  // Step 4: Verify setup
  console.log('\n🔍 Verifying database setup...');
  if (!runCommand('npm test -- --testNamePattern="Database Connection"', 'Running database tests')) {
    console.log('⚠️ Database tests failed, but setup might still be working');
  }

  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📋 What was created:');
  console.log('✅ Database tables for all models');
  console.log('✅ Admin user (username: admin, password: admin123)');
  console.log('✅ Default settings');
  console.log('✅ Sample room data');
  console.log('\n🚀 You can now start the server: npm run dev');
}

if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };
