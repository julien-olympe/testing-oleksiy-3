import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

// Store request start times
const requestTimings = new Map<string, number>();

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  requestTimings.set(request.id, Date.now());
}

export async function responseLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Don't log if response has already been sent
  if (reply.sent || (reply as any).raw?.headersSent) {
    return;
  }
  
  const startTime = requestTimings.get(request.id);
  if (startTime) {
    const duration = Date.now() - startTime;
    requestTimings.delete(request.id);

    // Safely get status code
    const statusCode = reply.statusCode || (reply as any).raw?.statusCode || 200;

    logger.debug('Request completed', {
      method: request.method,
      url: request.url,
      statusCode: statusCode,
      duration: `${duration}ms`,
      ipAddress: request.ip,
    });
  }
}
