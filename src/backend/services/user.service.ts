import { pool } from '../utils/db';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class UserService {
  async createUser(username: string, email: string, password: string) {
    try {
      const lowerUsername = username.trim().toLowerCase();
      const lowerEmail = email.trim().toLowerCase();

      // Check uniqueness
      const existingUserResult = await pool.query(
        `SELECT id, username, email FROM users 
         WHERE LOWER(username) = $1 OR LOWER(email) = $2 
         LIMIT 1`,
        [lowerUsername, lowerEmail]
      );

      if (existingUserResult.rows.length > 0) {
        const existingUser = existingUserResult.rows[0];
        if (existingUser.username.toLowerCase() === lowerUsername) {
          throw new AppError(409, 'VALIDATION_ERROR', 'Username already exists');
        }
        if (existingUser.email.toLowerCase() === lowerEmail) {
          throw new AppError(409, 'VALIDATION_ERROR', 'Email already exists');
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (username, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, username, email, created_at`,
        [lowerUsername, lowerEmail, passwordHash]
      );

      const user = userResult.rows[0];

      logger.info('User registered successfully', {
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      return {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      logger.error('Error in createUser', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async authenticateUser(usernameOrEmail: string, password: string) {
    const lowerInput = usernameOrEmail.trim().toLowerCase();

    const userResult = await pool.query(
      `SELECT id, username, email, password_hash FROM users 
       WHERE LOWER(username) = $1 OR LOWER(email) = $1 
       LIMIT 1`,
      [lowerInput]
    );

    if (userResult.rows.length === 0) {
      logger.warn('Login attempt with invalid credentials', {
        usernameOrEmail: lowerInput,
      });
      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Invalid credentials');
    }

    const user = userResult.rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      logger.warn('Login attempt with invalid password', {
        userId: user.id,
        username: user.username,
      });
      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Invalid credentials');
    }

    logger.info('User logged in successfully', {
      userId: user.id,
      username: user.username,
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async getUserById(userId: string) {
    const userResult = await pool.query(
      `SELECT id, username, email FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return userResult.rows[0];
  }
}

export const userService = new UserService();
