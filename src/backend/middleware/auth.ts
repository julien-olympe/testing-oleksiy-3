import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { AuthenticatedRequest, SessionData } from '../types';
import { AppError, sendError } from '../utils/errors';
import { logger } from '../utils/logger';

export function createAuthenticateMiddleware(fastify: FastifyInstance) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Use @fastify/session's built-in session management
    if (!request.session) {
      throw new AppError(500, 'INTERNAL_ERROR', 'Session not configured.');
    }

    // Check if session has user data
    if (!request.session.userId || !request.session.username) {
      throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
    }

    // Attach session data to request
    request.userSession = {
      userId: request.session.userId,
      username: request.session.username,
    };
  };
}

// For backward compatibility
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Use @fastify/session's built-in session management
  if (!request.session) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Session not configured.');
  }

  // Check if session has user data
  const session = request.session as any;
  if (!session.userId || !session.username) {
    logger.warn('Authentication failed', {
      ipAddress: request.ip,
      endpoint: request.url,
    });
    throw new AppError(401, 'AUTHENTICATION_ERROR', 'Session expired or invalid. Please login again.');
  }

  // Attach session data to request
  request.userSession = {
    userId: session.userId,
    username: session.username,
  };
}
