import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Read migration file
    const migrationSQL = readFileSync(
      join(__dirname, '001_create_tables.sql'),
      'utf-8'
    );
    
    // Execute migration
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
