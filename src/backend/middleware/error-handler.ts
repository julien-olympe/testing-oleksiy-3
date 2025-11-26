import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError, sendError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Don't send error response if response has already been sent
  if (reply.sent || (reply as any).raw?.headersSent) {
    return;
  }

  if (error instanceof AppError) {
    sendError(reply, error, {
      endpoint: request.url,
      method: request.method,
      ipAddress: request.ip,
    });
    return;
  }

  // Handle Fastify errors
  if ('statusCode' in error) {
    const fastifyError = error as FastifyError;
    const appError = new AppError(
      fastifyError.statusCode || 500,
      'INTERNAL_ERROR',
      fastifyError.message || 'An unexpected error occurred'
    );
    sendError(reply, appError, {
      endpoint: request.url,
      method: request.method,
      ipAddress: request.ip,
    });
    return;
  }

  // Handle unexpected errors
  sendError(reply, error, {
    endpoint: request.url,
    method: request.method,
    ipAddress: request.ip,
  });
}
