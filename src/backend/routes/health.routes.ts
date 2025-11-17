import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders } from '../utils/security';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/health', async (request, reply) => {
    setSecurityHeaders(reply);

    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      reply.send({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Health check failed', {
        endpoint: '/api/health',
      }, {
        code: 'DATABASE_ERROR',
        stack: error instanceof Error ? error.stack : undefined,
      });

      reply.status(503).send({
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });
}
