import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class UserService {
  async createUser(username: string, email: string, password: string) {
    const lowerUsername = username.trim().toLowerCase();
    const lowerEmail = email.trim().toLowerCase();

    // Check uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: lowerUsername, mode: 'insensitive' } },
          { email: { equals: lowerEmail, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
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
    const user = await prisma.user.create({
      data: {
        username: lowerUsername,
        email: lowerEmail,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    logger.info('User registered successfully', {
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    return user;
  }

  async authenticateUser(usernameOrEmail: string, password: string) {
    const lowerInput = usernameOrEmail.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: lowerInput, mode: 'insensitive' } },
          { email: { equals: lowerInput, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      logger.warn('Login attempt with invalid credentials', {
        usernameOrEmail: lowerInput,
      });
      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return user;
  }
}

export const userService = new UserService();
