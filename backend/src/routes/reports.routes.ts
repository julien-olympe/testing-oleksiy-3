import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { readFileSync, existsSync } from 'fs';
import { getProjectById, updateProjectStatus } from '../services/project.service';
import { getFullProjectData } from '../services/project-data.service';
import { verifyAllCheckupsHaveStatus } from '../services/checkup.service';
import { generateProjectPDF } from '../services/pdf.service';
import { sendError, ErrorType, logError } from '../utils/errors';
import { authenticate } from '../middleware/auth';

export async function reportsRoutes(fastify: FastifyInstance) {
  // Finish project and generate PDF
  fastify.post<{ Params: { id: string } }>(
    '/:id/finish',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).userId;
        const { id: projectId } = request.params;
        
        const project = await getProjectById(projectId, userId);
        if (!project) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        if (project.status === 'finished') {
          return sendError(
            reply,
            403,
            ErrorType.FORBIDDEN,
            'Cannot finish a project that is already finished.'
          );
        }
        
        // Verify all checkups have status
        const allCheckupsHaveStatus = await verifyAllCheckupsHaveStatus(projectId);
        if (!allCheckupsHaveStatus) {
          return sendError(
            reply,
            400,
            ErrorType.VALIDATION_ERROR,
            'Cannot finish project. All checkups must have a status set.'
          );
        }
        
        // Get full project data
        const projectData = await getFullProjectData(projectId);
        if (!projectData) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        // Generate PDF
        try {
          const storagePath = process.env.FILE_STORAGE_PATH || './storage';
          await generateProjectPDF(projectData, storagePath);
          
          // Update project status
          const updatedProject = await updateProjectStatus(projectId, 'finished', userId);
          
          reply.send({
            message: 'Project finished and PDF report generated successfully',
            projectId: updatedProject.id,
            reportId: updatedProject.id,
            status: updatedProject.status,
            finishedAt: updatedProject.finished_at,
          });
        } catch (error) {
          if (error instanceof Error && error.message === 'PDF generation timeout') {
            return sendError(
              reply,
              504,
              ErrorType.TIMEOUT_ERROR,
              'Report generation timeout. Please try again.'
            );
          }
          throw error;
        }
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: `/api/projects/${request.params.id}/finish`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to generate PDF report. Please try again.');
      }
    }
  );
  
  // Download PDF report
  fastify.get<{ Params: { id: string } }>(
    '/:id/report',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).userId;
        const { id: projectId } = request.params;
        
        const project = await getProjectById(projectId, userId);
        if (!project) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        if (project.status !== 'finished') {
          return sendError(
            reply,
            400,
            ErrorType.VALIDATION_ERROR,
            'Project is not finished. PDF report not yet generated.'
          );
        }
        
        const storagePath = process.env.FILE_STORAGE_PATH || './storage';
        const pdfPath = `${storagePath}/report_${projectId}.pdf`;
        
        if (!existsSync(pdfPath)) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Report not found.');
        }
        
        const pdfBuffer = readFileSync(pdfPath);
        
        reply
          .type('application/pdf')
          .header('Content-Disposition', `attachment; filename="report_${projectId}.pdf"`)
          .send(pdfBuffer);
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: `/api/projects/${request.params.id}/report`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to read report. Please try again.');
      }
    }
  );
}
