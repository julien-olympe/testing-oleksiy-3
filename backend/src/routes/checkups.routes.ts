import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { updateCheckupStatus } from '../services/checkup.service';
import { getProjectById, verifyProjectOwnership } from '../services/project.service';
import { sendError, ErrorType, logError } from '../utils/errors';
import { authenticate } from '../middleware/auth';

interface UpdateStatusBody {
  status: 'bad' | 'average' | 'good';
}

export async function checkupsRoutes(fastify: FastifyInstance) {
  fastify.put<{ Params: { id: string; checkupId: string }; Body: UpdateStatusBody }>(
    '/:id/checkups/:checkupId/status',
    { preHandler: [authenticate] },
    async (
      request: FastifyRequest<{ Params: { id: string; checkupId: string }; Body: UpdateStatusBody }>,
      reply: FastifyReply
    ) => {
      try {
        const userId = (request.user as any).userId;
        const { id: projectId, checkupId } = request.params;
        const { status } = request.body;
        
        if (!status || !['bad', 'average', 'good'].includes(status)) {
          return sendError(
            reply,
            400,
            ErrorType.VALIDATION_ERROR,
            'Status must be one of: bad, average, good'
          );
        }
        
        // Verify project ownership
        const project = await getProjectById(projectId, userId);
        if (!project) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        // Verify project is in_progress
        if (project.status !== 'in_progress') {
          return sendError(
            reply,
            403,
            ErrorType.FORBIDDEN,
            'Cannot modify checkups in a finished project.'
          );
        }
        
        // Verify checkup belongs to project's powerplant
        const { pool } = await import('../config/database');
        const checkupResult = await pool.query(
          `SELECT c.id FROM checkups c
           JOIN parts p ON c.part_id = p.id
           JOIN projects pr ON p.powerplant_id = pr.powerplant_id
           WHERE c.id = $1 AND pr.id = $2`,
          [checkupId, projectId]
        );
        
        if (checkupResult.rows.length === 0) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Checkup not found.');
        }
        
        // Update status
        const checkupStatus = await updateCheckupStatus(projectId, checkupId, status);
        
        reply.send({
          id: checkupStatus.id,
          checkupId: checkupStatus.checkup_id,
          status: checkupStatus.status,
          updatedAt: checkupStatus.updated_at,
        });
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: `/api/projects/${request.params.id}/checkups/${request.params.checkupId}/status`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to save status. Please try again.');
      }
    }
  );
}
