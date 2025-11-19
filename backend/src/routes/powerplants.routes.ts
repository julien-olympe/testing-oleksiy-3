import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAllPowerplants, getPowerplantWithPartsAndCheckups } from '../services/powerplant.service';
import { sendError, ErrorType, logError } from '../utils/errors';
import { authenticate } from '../middleware/auth';

export async function powerplantsRoutes(fastify: FastifyInstance) {
  // Get all powerplants
  fastify.get(
    '/',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const powerplants = await getAllPowerplants();
        
        reply.send({
          powerplants: powerplants.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            partsCount: parseInt(p.parts_count) || 0,
            checkupsCount: parseInt(p.checkups_count) || 0,
          })),
        });
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: '/api/powerplants',
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to load powerplants. Please try again.');
      }
    }
  );
  
  // Get powerplant details
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const powerplant = await getPowerplantWithPartsAndCheckups(id);
        
        if (!powerplant) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Powerplant not found.');
        }
        
        reply.send(powerplant);
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: `/api/powerplants/${request.params.id}`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to load powerplant details. Please try again.');
      }
    }
  );
}
