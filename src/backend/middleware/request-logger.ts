import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Store start time in request object for use in onSend hook
  (request as any).startTime = Date.now();
}
