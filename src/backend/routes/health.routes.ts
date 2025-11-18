import { FastifyInstance } from 'fastify';
import { pool } from '../utils/db';
import { setSecurityHeaders } from '../utils/security';
import { logger } from '../utils/logger';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/health', async (request, reply) => {
    setSecurityHeaders(reply);

    try {
      // Check database connection
      await pool.query('SELECT 1');

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
