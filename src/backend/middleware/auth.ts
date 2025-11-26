import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest, SessionData } from '../types';
import { AppError, sendError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const sessionId = request.cookies.session;

  if (!sessionId) {
    throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
  }

  try {
    const session = await (request.server as any).sessionStore.get(sessionId);

    if (!session || !session.userId) {
      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
    }

    // Attach session data to request
    (request as unknown as AuthenticatedRequest).session = {
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
