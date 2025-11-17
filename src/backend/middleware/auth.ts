import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { AuthenticatedRequest, SessionData } from '../types';
import { AppError, sendError } from '../utils/errors';
import { logger } from '../utils/logger';

export function createAuthenticateMiddleware(fastify: FastifyInstance) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const sessionId = request.cookies.session;

    if (!sessionId) {
      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
    }

    if (!fastify.sessionStore) {
      throw new AppError(500, 'INTERNAL_ERROR', 'Session store not configured.');
    }

    try {
      const session = await fastify.sessionStore.get(sessionId);

      if (!session || !session.userId) {
        throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
      }

      // Attach session data to request
      request.userSession = {
        userId: session.userId,
        username: session.username,
      };
    } catch (error) {
      logger.warn('Authentication failed', {
        sessionId,
        ipAddress: request.ip,
        endpoint: request.url,
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
    }
  };
}

// For backward compatibility
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.server.sessionStore) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Session store not configured.');
  }

  const sessionId = request.cookies.session;

  if (!sessionId) {
    throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
  }

  try {
    const session = await request.server.sessionStore.get(sessionId);

    if (!session || !session.userId) {
      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
    }

    // Attach session data to request
    request.userSession = {
      userId: session.userId,
      username: session.username,
    };
  } catch (error) {
    logger.warn('Authentication failed', {
      sessionId,
      ipAddress: request.ip,
      endpoint: request.url,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
  }
}
