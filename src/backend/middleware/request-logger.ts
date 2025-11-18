import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const startTime = Date.now();

  // Use reply's onSend hook directly
  reply.raw.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.debug('Request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      ipAddress: request.ip,
    });
  });
}
