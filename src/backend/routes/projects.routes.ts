import { FastifyInstance } from 'fastify';
import { AuthenticatedRequest } from '../types';
import { createProjectSchema, uuidParamSchema, checkupStatusParamSchema, updateCheckupStatusSchema } from '../validation/schemas';
import { projectService } from '../services/project.service';
import { pdfService } from '../services/pdf.service';
import { sendSuccess, sendError, AppError } from '../utils/errors';
import { setSecurityHeaders } from '../utils/security';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function projectsRoutes(fastify: FastifyInstance) {
  // List projects
  fastify.get('/api/projects', { preHandler: authenticate }, async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;
    setSecurityHeaders(reply);

    try {
      const projects = await projectService.getUserProjects(authRequest.session.userId);
      sendSuccess(reply, projects, 200, projects.length);
    } catch (error) {
      sendError(reply, error as Error, {
        userId: authRequest.session.userId,
        endpoint: '/api/projects',
      });
    }
  });

  // Get project details
  fastify.get('/api/projects/:id', { preHandler: authenticate }, async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;
    setSecurityHeaders(reply);

    try {
      const { id } = uuidParamSchema.parse(request.params);
      const project = await projectService.getProjectById(id, authRequest.session.userId);
      sendSuccess(reply, project);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(reply, error, {
          userId: authRequest.session.userId,
          projectId: (request.params as { id?: string }).id,
        });
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
          projectId: (request.params as { id?: string }).id,
        });
      }
    }
  });

  // Create project
  fastify.post('/api/projects', { preHandler: authenticate }, async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;
    setSecurityHeaders(reply);

    try {
      const validated = createProjectSchema.parse(request.body);
      const project = await projectService.createProject(
        authRequest.session.userId,
        validated.powerplantId
      );
      sendSuccess(reply, project, 201);
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
        });
      }
    }
  });

  // Update checkup status
  fastify.patch(
    '/api/projects/:id/checkups/:checkupId/status',
    { preHandler: authenticate },
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;
      setSecurityHeaders(reply);

      try {
        const params = checkupStatusParamSchema.parse(request.params);
        const body = updateCheckupStatusSchema.parse(request.body);

        const result = await projectService.updateCheckupStatus(
          params.id,
          params.checkupId,
          body.status,
          authRequest.session.userId
        );

        sendSuccess(reply, result);
      } catch (error) {
        if (error instanceof AppError) {
          sendError(reply, error, {
            userId: authRequest.session.userId,
            projectId: (request.params as { id?: string }).id,
            checkupId: (request.params as { checkupId?: string }).checkupId,
          });
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
          });
        }
      }
    }
  );

  // Finish project and generate PDF
  fastify.post('/api/projects/:id/finish', { preHandler: authenticate }, async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;
    setSecurityHeaders(reply);

    try {
      const { id } = uuidParamSchema.parse(request.params);

      // Get project data
      const projectData = await projectService.finishProject(id, authRequest.session.userId);

      // Generate PDF
      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await pdfService.generateProjectPdf(projectData);
      } catch (pdfError) {
        logger.error('PDF generation failed', {
          projectId: id,
          userId: authRequest.session.userId,
        }, {
          code: 'PDF_GENERATION_ERROR',
          stack: pdfError instanceof Error ? pdfError.stack : undefined,
        });
        throw new AppError(500, 'PDF_GENERATION_ERROR', 'Unable to generate report. Please try again or contact support.');
      }

      // Mark project as finished
      try {
        await projectService.markProjectFinished(id);
        logger.info('Project finished successfully', {
          userId: authRequest.session.userId,
          projectId: id,
          powerplantId: projectData.project.powerplantId,
        });
      } catch (dbError) {
        // Critical error - PDF generated but status not updated
        logger.error('Failed to update project status after PDF generation', {
          projectId: id,
          userId: authRequest.session.userId,
        }, {
          code: 'DATABASE_ERROR',
          stack: dbError instanceof Error ? dbError.stack : undefined,
        });
        // Still return PDF, but log critical error
      }

      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Project_${id}_${projectData.project.powerplant.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.pdf`;

      // Set response headers
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);

      reply.send(pdfBuffer);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(reply, error, {
          userId: authRequest.session.userId,
          projectId: (request.params as { id?: string }).id,
        });
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
          projectId: (request.params as { id?: string }).id,
        });
      }
    }
  });
}
