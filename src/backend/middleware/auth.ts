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
    const sessionStore = (request.server as any).sessionStore;
    if (!sessionStore) {
      throw new AppError(500, 'SERVER_ERROR', 'Session store not available');
    }

    const session = await sessionStore.get(sessionId) as SessionData | null;

    if (!session || !session.userId) {
      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
    }

    // Attach session data to request
    (request as AuthenticatedRequest).session = {
      ...request.session,
      userId: session.userId,
      username: session.username,
    } as AuthenticatedRequest['session'];
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
