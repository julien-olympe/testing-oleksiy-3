import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema } from '../validation/schemas';
import { userService } from '../services/user.service';
import { sendSuccess, sendError, AppError } from '../utils/errors';
import { setSecurityHeaders } from '../utils/security';
import { logger } from '../utils/logger';

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/api/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    setSecurityHeaders(reply);

    try {
      const validated = registerSchema.parse(request.body);
      const user = await userService.createUser(
        validated.username,
        validated.email,
        validated.password
      );

      sendSuccess(reply, user, 201);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(reply, error);
      } else if (error && typeof error === 'object' && 'issues' in error) {
        // Zod validation error
        const zodError = error as { issues: Array<{ path: string[]; message: string }> };
        const errors = zodError.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        sendError(
          reply,
          new AppError(400, 'VALIDATION_ERROR', 'Validation failed', errors)
        );
      } else {
        sendError(reply, error as Error, {
          endpoint: '/api/auth/register',
        });
      }
    }
  });

  // Login
  fastify.post('/api/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    setSecurityHeaders(reply);

    try {
      const validated = loginSchema.parse(request.body);
      const user = await userService.authenticateUser(
        validated.usernameOrEmail,
        validated.password
      );

      // Create session using @fastify/session's built-in session management
      if (!request.session) {
        throw new AppError(500, 'INTERNAL_ERROR', 'Session not configured.');
      }
      
      // Store user data in session
      request.session.userId = user.id;
      request.session.username = user.username;

      sendSuccess(reply, user);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(reply, error);
      } else if (error && typeof error === 'object' && 'issues' in error) {
        // Zod validation error
        const zodError = error as { issues: Array<{ path: string[]; message: string }> };
        const errors = zodError.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        sendError(
          reply,
          new AppError(400, 'VALIDATION_ERROR', 'Validation failed', errors)
        );
      } else {
        sendError(reply, error as Error, {
          endpoint: '/api/auth/login',
        });
      }
    }
  });

  // Logout
  fastify.post('/api/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    setSecurityHeaders(reply);

    // Destroy session using @fastify/session's built-in method
    if (request.session) {
      const userId = request.session.userId;
      // Clear session data - @fastify/session will handle session invalidation
      delete request.session.userId;
      delete request.session.username;
      
      logger.info('User logged out', {
        userId,
      });
    }

    sendSuccess(reply, { message: 'Logged out successfully' });
  });
}
