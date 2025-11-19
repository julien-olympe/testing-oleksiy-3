const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load environment variables from .env file FIRST, before importing database module
const envPath = resolve(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
});

// Now import database module after env vars are set
const { testConnection } = require('../backend/dist/config/database');

async function runHealthCheck() {
  console.log('=== Health Check Test ===\n');
  
  // Verify DATABASE_URL is loaded
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const masked = url.replace(/:[^:@]+@/, ':****@');
    console.log(`  (masked: ${masked})\n`);
  }
  
  let allPassed = true;
  
  // Test 1: Database Connection
  console.log('Test 1: Database Connection');
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✓ Database connection: PASSED');
    } else {
      console.log('✗ Database connection: FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.log('✗ Database connection: FAILED');
    console.log(`  Error: ${error.message}`);
    allPassed = false;
  }
  
  console.log('\n=== Health Check Results ===');
  if (allPassed) {
    console.log('✓ All health checks PASSED');
    process.exit(0);
  } else {
    console.log('✗ Some health checks FAILED');
    process.exit(1);
  }
}

runHealthCheck();
