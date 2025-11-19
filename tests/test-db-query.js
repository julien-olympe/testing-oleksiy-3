const { Pool } = require('pg');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load environment variables
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

async function testDB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    // Test query users table
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('Users table accessible. Count:', result.rows[0].count);
    
    // Test insert (will fail if constraints violated)
    const testUsername = `test_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;
    const insertResult = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [testUsername, testEmail, 'test_hash']
    );
    console.log('Insert test successful. User ID:', insertResult.rows[0].id);
    
    // Cleanup
    await pool.query('DELETE FROM users WHERE id = $1', [insertResult.rows[0].id]);
    console.log('Cleanup successful');
    
    await pool.end();
  } catch (error) {
    console.error('Database test error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testDB();
