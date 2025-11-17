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
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
    },
  });

  // Rate limiting
  await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    skipOnError: false,
  });

  // Security headers on all responses
  fastify.addHook('onSend', async (request, reply) => {
    setSecurityHeaders(reply);
  });

  // Request logging
  fastify.addHook('onRequest', requestLogger);

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
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
