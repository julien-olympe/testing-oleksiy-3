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
import { requestLogger } from './middleware/request-logger';
import { setSecurityHeaders } from './utils/security';

const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-to-a-random-secret-in-production';

const fastify = Fastify({
  logger: false, // We use custom JSON logger
});

// Register plugins
async function start() {
  try {
    console.log('Starting server setup...');
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
    });
    console.log('Session registered successfully');
  } catch (err) {
    console.error('Error during plugin registration:', err);
    throw err;
  }

  try {
    // Rate limiting
    console.log('Registering rate limit...');
    await fastify.register(fastifyRateLimit, {
      max: 100,
      timeWindow: '1 minute',
      skipOnError: false,
    });

    // Request logging - store start time
    console.log('Adding hooks...');
    fastify.addHook('onRequest', requestLogger);

    // Security headers and request completion logging on all responses
    fastify.addHook('onSend', async (request, reply) => {
      setSecurityHeaders(reply);
      
      // Log request completion if start time was set
      const startTime = (request as any).startTime;
      if (startTime) {
        const duration = Date.now() - startTime;
        const { logger } = await import('./utils/logger');
        logger.debug('Request completed', {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          duration: `${duration}ms`,
          ipAddress: request.ip,
        });
      }
    });

    // Error handler
    fastify.setErrorHandler(errorHandler);

    // Register routes
    console.log('Registering routes...');
    await fastify.register(authRoutes);
    await fastify.register(projectsRoutes);
    await fastify.register(powerplantsRoutes);
    await fastify.register(healthRoutes);
    console.log('All routes registered');
  } catch (err) {
    console.error('Error during route/hook registration:', err);
    throw err;
  }

  // Start server
  try {
    console.log(`Starting server on port ${PORT}...`);
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    fastify.log.error(err);
    process.exit(1);
  }
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
