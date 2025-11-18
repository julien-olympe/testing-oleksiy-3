import { FastifyInstance } from 'fastify';
import { SessionData } from './index';

declare module 'fastify' {
  interface FastifyInstance {
    sessionStore: {
      get: (sessionId: string) => Promise<SessionData | null>;
      set: (sessionId: string, data: SessionData) => Promise<void>;
      destroy: (sessionId: string) => Promise<void>;
    };
  }

  interface FastifyRequest {
    session?: SessionData;
  }
}
