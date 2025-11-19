import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createProject,
  getProjectsByUserId,
  getProjectById,
  verifyProjectOwnership,
  updateProjectStatus,
} from '../services/project.service';
import { getFullProjectData } from '../services/project-data.service';
import { sendError, ErrorType, logError } from '../utils/errors';
import { authenticate } from '../middleware/auth';

interface CreateProjectBody {
  powerplantId: string;
}

export async function projectsRoutes(fastify: FastifyInstance) {
  // Get all projects for user
  fastify.get(
    '/',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).userId;
        const projects = await getProjectsByUserId(userId);
        
        reply.send({
          projects: projects.map((p) => ({
            id: p.id,
            powerplantName: p.powerplant_name,
            status: p.status,
            createdAt: p.created_at,
            finishedAt: p.finished_at,
          })),
        });
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: '/api/projects',
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to load projects. Please try again.');
      }
    }
  );
  
  // Create new project
  fastify.post<{ Body: CreateProjectBody }>(
    '/',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Body: CreateProjectBody }>, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).userId;
        const { powerplantId } = request.body;
        
        if (!powerplantId) {
          return sendError(reply, 400, ErrorType.VALIDATION_ERROR, 'Please select a powerplant.');
        }
        
        // Verify powerplant exists (import from powerplant service)
        const { getPowerplantById } = await import('../services/powerplant.service');
        const powerplant = await getPowerplantById(powerplantId);
        if (!powerplant) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Powerplant not found.');
        }
        
        const project = await createProject(userId, powerplantId);
        
        reply.status(201).send({
          id: project.id,
          powerplantId: project.powerplant_id,
          powerplantName: powerplant.name,
          status: project.status,
          createdAt: project.created_at,
          finishedAt: project.finished_at,
        });
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: '/api/projects',
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to create project. Please try again.');
      }
    }
  );
  
  // Get project details
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).userId;
        const { id } = request.params;
        
        const project = await getProjectById(id, userId);
        if (!project) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        const projectData = await getFullProjectData(id);
        if (!projectData) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        reply.send(projectData);
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: `/api/projects/${request.params.id}`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to load project details. Please try again.');
      }
    }
  );
}
