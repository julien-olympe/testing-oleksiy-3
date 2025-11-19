import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });
}
