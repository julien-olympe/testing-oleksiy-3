import { testConnection } from '../backend/dist/config/database';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env file
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

async function runHealthCheck() {
  console.log('=== Health Check Test ===\n');
  
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
  } catch (error: any) {
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
