import Fastify from 'fastify';
import fastifyJWT from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
import { authRoutes } from './routes/auth.routes';
import { projectsRoutes } from './routes/projects.routes';
import { checkupsRoutes } from './routes/checkups.routes';
import { documentationRoutes } from './routes/documentation.routes';
import { powerplantsRoutes } from './routes/powerplants.routes';
import { reportsRoutes } from './routes/reports.routes';
import { healthRoutes } from './routes/health.routes';
import { testConnection } from './config/database';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function startServer() {
  // Ensure storage directory exists
  const storagePath = process.env.FILE_STORAGE_PATH || './storage';
  if (!existsSync(storagePath)) {
    await mkdir(storagePath, { recursive: true });
  }
  
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting.');
    process.exit(1);
  }
  
  const fastify = Fastify({
    logger: true,
    bodyLimit: 15 * 1024 * 1024, // 15 MB
  });
  
  // Register plugins
  await fastify.register(fastifyCors, {
    origin: true,
    credentials: true,
  });
  
  await fastify.register(fastifyJWT, {
    secret: JWT_SECRET,
    sign: {
      expiresIn: JWT_EXPIRES_IN,
    },
  });
  
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  });
  
  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(projectsRoutes, { prefix: '/api/projects' });
  await fastify.register(checkupsRoutes, { prefix: '/api/projects' });
  await fastify.register(documentationRoutes, { prefix: '/api/projects' });
  await fastify.register(powerplantsRoutes, { prefix: '/api/powerplants' });
  await fastify.register(reportsRoutes, { prefix: '/api/projects' });
  await fastify.register(healthRoutes, { prefix: '/api' });
  
  // Start server
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

startServer();
