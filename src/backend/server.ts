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
  // CORS
  await fastify.register(fastifyCors, {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  });

  // Cookie support
  await fastify.register(fastifyCookie, {
    secret: SESSION_SECRET,
  });

  // Session support
  await fastify.register(fastifySession, {
    secret: SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Use 'lax' in development to allow cross-origin
      maxAge: 86400, // 24 hours
      path: '/', // Ensure cookie is available for all paths
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // Set domain for localhost in development
    },
  });

  // Rate limiting (more lenient in development)
  const isProduction = process.env.NODE_ENV === 'production';
  await fastify.register(fastifyRateLimit, {
    max: isProduction ? 100 : 10000, // Much higher limit in development/test
    timeWindow: '1 minute',
    skipOnError: false,
    keyGenerator: (request: any) => {
      // Skip rate limiting for health checks by using unique keys per request
      if (request.url && request.url.startsWith('/api/health')) {
        return `health-${Date.now()}-${Math.random()}`; // Unique key per health check
      }
      return request.ip || 'unknown';
    },
  });

  // Security headers on all responses (set early in request lifecycle)
  fastify.addHook('preHandler', async (request, reply) => {
    setSecurityHeaders(reply);
  });

  // Request logging
  fastify.addHook('onRequest', requestLogger);
  fastify.addHook('onSend', responseLogger);

  // Error handler
  fastify.setErrorHandler(errorHandler);

  // Register routes
  await fastify.register(authRoutes);
  await fastify.register(projectsRoutes);
  await fastify.register(powerplantsRoutes);
  await fastify.register(healthRoutes);

  // Start server
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
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
