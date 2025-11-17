import { FastifyRequest } from 'fastify';

export interface SessionData {
  userId: string;
  username: string;
}

// Extend FastifyRequest to include our custom session data
declare module 'fastify' {
  interface FastifyRequest {
    userSession?: SessionData;
  }
}

// Extend @fastify/session's session object to include our custom properties
declare module '@fastify/session' {
  interface FastifySessionObject {
    userId?: string;
    username?: string;
  }
}

export interface AuthenticatedRequest extends FastifyRequest {
  userSession: SessionData;
}

export interface ApiError {
  error: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
}

export interface ApiSuccess<T> {
  data: T;
  meta: {
    timestamp: string;
    total?: number;
  };
}

export interface LogContext {
  userId?: string;
  username?: string;
  projectId?: string;
  powerplantId?: string;
  checkupId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  ipAddress?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  context?: LogContext;
  error?: {
    code?: string;
    stack?: string;
  };
}
