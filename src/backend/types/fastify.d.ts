import 'fastify';
import '@fastify/session';

declare module 'fastify' {
  interface FastifyInstance {
    sessionStore: import('@fastify/session').SessionStore;
  }
}

declare module '@fastify/session' {
  interface FastifySessionObject {
    userId?: string;
    username?: string;
  }
}
