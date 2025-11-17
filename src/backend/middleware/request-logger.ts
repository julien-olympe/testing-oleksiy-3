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
  if (request.startTime && !reply.sent) {
    const duration = Date.now() - request.startTime;
    const statusCode = reply.statusCode || 200;

    logger.debug('Request completed', {
      method: request.method,
      url: request.url,
      statusCode: statusCode,
      duration: `${duration}ms`,
      ipAddress: request.ip,
    });
  }
}
