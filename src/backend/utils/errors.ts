import { FastifyReply } from 'fastify';
import { ApiError } from '../types';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    public message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function sendError(reply: FastifyReply, error: AppError | Error, context?: Record<string, unknown>): void {
  if (error instanceof AppError) {
    const errorResponse: ApiError = {
      error: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
    };

    if (error.errors) {
      errorResponse.errors = error.errors;
    }

    logger.error('API error', { ...context, statusCode: error.statusCode, errorCode: error.errorCode });
    reply.status(error.statusCode).send(errorResponse);
  } else {
    // Unexpected error - don't expose internal details
    logger.error('Unexpected error', context, {
      code: 'INTERNAL_ERROR',
      stack: error.stack,
    });

    const errorResponse: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      timestamp: new Date().toISOString(),
    };

    reply.status(500).send(errorResponse);
  }
}

export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200, total?: number): void {
  const response = {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(total !== undefined && { total }),
    },
  };

  reply.status(statusCode).send(response);
}
