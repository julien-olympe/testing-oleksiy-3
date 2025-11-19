import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createUser,
  findUserByUsername,
  findUserByEmail,
  verifyPassword,
} from '../services/user.service';
import { sendError, ErrorType, logError } from '../utils/errors';

interface RegisterBody {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface LoginBody {
  username: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post<{ Body: RegisterBody }>(
    '/register',
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      try {
        const { username, email, password, passwordConfirmation } = request.body;
        
        // Validation
        const errors: Record<string, string> = {};
        
        if (!username || username.length < 3 || username.length > 255) {
          errors.username = 'Username must be between 3 and 255 characters.';
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.email = 'Invalid email format.';
        }
        
        if (!password || password.length < 8 || !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
          errors.password = 'Password must be at least 8 characters and contain letters and numbers.';
        }
        
        if (password !== passwordConfirmation) {
          errors.passwordConfirmation = 'Passwords do not match.';
        }
        
        if (Object.keys(errors).length > 0) {
          return sendError(reply, 400, ErrorType.VALIDATION_ERROR, 'Validation failed', errors);
        }
        
        // Check uniqueness
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
          return sendError(
            reply,
            400,
            ErrorType.VALIDATION_ERROR,
            'Validation failed',
            { username: 'Username already taken. Please choose another.' }
          );
        }
        
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
          return sendError(
            reply,
            400,
            ErrorType.VALIDATION_ERROR,
            'Validation failed',
            { email: 'Email address already registered.' }
          );
        }
        
        // Create user
        const user = await createUser(username, email, password);
        
        // Generate JWT token
        const token = fastify.jwt.sign({ userId: user.id });
        
        reply.status(201).send({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      } catch (error) {
        logError({
          endpoint: '/api/auth/register',
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to create account. Please try again.');
      }
    }
  );
  
  // Login
  fastify.post<{ Body: LoginBody }>(
    '/login',
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      try {
        const { username, password } = request.body;
        
        if (!username || !password) {
          return sendError(reply, 401, ErrorType.UNAUTHORIZED, 'Invalid username or password.');
        }
        
        const user = await findUserByUsername(username);
        if (!user) {
          return sendError(reply, 401, ErrorType.UNAUTHORIZED, 'Invalid username or password.');
        }
        
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
          return sendError(reply, 401, ErrorType.UNAUTHORIZED, 'Invalid username or password.');
        }
        
        // Generate JWT token
        const token = fastify.jwt.sign({ userId: user.id });
        
        reply.send({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      } catch (error) {
        logError({
          endpoint: '/api/auth/login',
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to login. Please try again.');
      }
    }
  );
}
