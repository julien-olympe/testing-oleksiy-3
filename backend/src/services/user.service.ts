import { pool } from '../config/database';
import { User } from '../types';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, username, email, password_hash, created_at, updated_at`,
    [username, email, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
