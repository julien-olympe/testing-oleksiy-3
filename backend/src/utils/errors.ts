import { FastifyReply } from 'fastify';

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
}

export interface ApiError {
  error: ErrorType;
  message: string;
  details?: Record<string, string>;
}

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  errorType: ErrorType,
  message: string,
  details?: Record<string, string>
) {
  const error: ApiError = {
    error: errorType,
    message,
  };
  
  if (details) {
    error.details = details;
  }
  
  reply.status(statusCode).send(error);
}

export function logError(
  context: {
    userId?: string;
    endpoint: string;
    error: unknown;
  }
) {
  const timestamp = new Date().toISOString();
  const errorMessage = context.error instanceof Error 
    ? context.error.message 
    : String(context.error);
  const stack = context.error instanceof Error 
    ? context.error.stack 
    : undefined;
  
  console.error(`[${timestamp}] Error in ${context.endpoint}`, {
    userId: context.userId,
    message: errorMessage,
    stack,
  });
}
