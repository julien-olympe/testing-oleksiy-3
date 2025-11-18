import { FastifyInstance, FastifyRequest } from 'fastify';
import { AuthenticatedRequest } from '../types';
import { uuidParamSchema } from '../validation/schemas';
import { powerplantService } from '../services/powerplant.service';
import { sendSuccess, sendError, AppError } from '../utils/errors';
import { setSecurityHeaders } from '../utils/security';
import { authenticate } from '../middleware/auth';

export async function powerplantsRoutes(fastify: FastifyInstance) {
  // List all powerplants
  fastify.get('/api/powerplants', { preHandler: authenticate }, async (request: FastifyRequest, reply) => {
    setSecurityHeaders(reply);
    const authRequest = request as unknown as AuthenticatedRequest;

    try {
      const powerplants = await powerplantService.getAllPowerplants();
      sendSuccess(reply, powerplants);
    } catch (error) {
      sendError(reply, error as Error, {
        userId: authRequest.session.userId,
        endpoint: '/api/powerplants',
      });
    }
  });

  // Get powerplant parts and checkups
  fastify.get('/api/powerplants/:id/parts', { preHandler: authenticate }, async (request: FastifyRequest, reply) => {
    setSecurityHeaders(reply);
    const authRequest = request as unknown as AuthenticatedRequest;

    try {
      const { id } = uuidParamSchema.parse(request.params);
      const powerplant = await powerplantService.getPowerplantParts(id);

      if (!powerplant) {
        throw new AppError(404, 'NOT_FOUND', 'Powerplant not found');
      }

      sendSuccess(reply, powerplant);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(reply, error);
      } else if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ path: string[]; message: string }> };
        const errors = zodError.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        sendError(reply, new AppError(400, 'VALIDATION_ERROR', 'Validation failed', errors));
      } else {
        sendError(reply, error as Error, {
          userId: authRequest.session.userId,
          powerplantId: (request.params as { id?: string }).id,
        });
      }
    }
  });
}
