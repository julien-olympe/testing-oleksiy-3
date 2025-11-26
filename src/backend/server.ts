import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import { authRoutes } from './routes/auth.routes';
import { projectsRoutes } from './routes/projects.routes';
import { powerplantsRoutes } from './routes/powerplants.routes';
import { healthRoutes } from './routes/health.routes';
import { errorHandler } from './middleware/error-handler';
import { requestLogger, responseLogger } from './middleware/request-logger';
import { setSecurityHeaders } from './utils/security';

const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-to-a-random-secret-in-production';

const fastify = Fastify({
  logger: false, // We use custom JSON logger
});

// Register plugins
async function start() {
  console.log('Starting server...');
  try {
    // CORS
    console.log('Registering CORS...');
    await fastify.register(fastifyCors, {
      origin: FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    });

    // Cookie support
    console.log('Registering cookie...');
    await fastify.register(fastifyCookie, {
      secret: SESSION_SECRET,
    });

    // Session support
    console.log('Registering session...');
    await fastify.register(fastifySession, {
    secret: SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
    },
    store: {
      get: (sessionId: string, callback: (err?: Error, session?: any) => void) => {
        try {
          const session = (fastify as any).__sessionStore?.[sessionId] || null;
          callback(undefined, session);
        } catch (err) {
          callback(err as Error);
        }
      },
      set: (sessionId: string, session: any, callback: (err?: Error) => void) => {
        try {
          if (!(fastify as any).__sessionStore) {
            (fastify as any).__sessionStore = {};
          }
          (fastify as any).__sessionStore[sessionId] = session;
          callback();
        } catch (err) {
          callback(err as Error);
        }
      },
      destroy: (sessionId: string, callback: (err?: Error) => void) => {
        try {
          if ((fastify as any).__sessionStore) {
            delete (fastify as any).__sessionStore[sessionId];
          }
          callback();
        } catch (err) {
          callback(err as Error);
        }
      },
    },
    });
    
    // Make sessionStore available on fastify instance for backward compatibility
    (fastify as any).sessionStore = {
      get: async (sessionId: string) => {
        return (fastify as any).__sessionStore?.[sessionId] || null;
      },
      set: async (sessionId: string, session: any) => {
        if (!(fastify as any).__sessionStore) {
          (fastify as any).__sessionStore = {};
        }
        (fastify as any).__sessionStore[sessionId] = session;
      },
      destroy: async (sessionId: string) => {
        if ((fastify as any).__sessionStore) {
          delete (fastify as any).__sessionStore[sessionId];
        }
      },
    };

    // Rate limiting (temporarily disabled to debug header error)
    // console.log('Registering rate limit...');
    // await fastify.register(fastifyRateLimit, {
    //   max: 100,
    //   timeWindow: '1 minute',
    //   skipOnError: false,
    // });

    // Security headers on all responses (set early in request lifecycle)
    fastify.addHook('preHandler', async (request, reply) => {
      setSecurityHeaders(reply);
    });

    // Response logging
    fastify.addHook('onSend', async (request, reply) => {
      await responseLogger(request, reply);
    });

    // Request logging
    fastify.addHook('onRequest', requestLogger);

    // Error handler
    fastify.setErrorHandler(errorHandler);

    // Register routes
    console.log('Registering routes...');
    await fastify.register(authRoutes);
    await fastify.register(projectsRoutes);
    await fastify.register(powerplantsRoutes);
    await fastify.register(healthRoutes);

    // Start server
    console.log('Starting server on port', PORT);
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error('Error during startup:', err);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    process.exit(1);
  }
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
