import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema } from '../validation/schemas';
import { userService } from '../services/user.service';
import { sendSuccess, sendError, AppError } from '../utils/errors';
import { generateSessionToken } from '../utils/security';
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

      // Create session using Fastify session API
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

    // Destroy session using Fastify session API
    if (request.session) {
      await request.session.destroy();
      logger.info('User logged out', {
        sessionId: request.cookies.session,
      });
    }

    reply.clearCookie('session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    sendSuccess(reply, { message: 'Logged out successfully' });
  });
}
