import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

// Extend FastifyRequest to store start time
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  request.startTime = Date.now();
}

export async function responseLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (request.startTime) {
    const duration = Date.now() - request.startTime;

    logger.debug('Request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      ipAddress: request.ip,
    });
  }
}
