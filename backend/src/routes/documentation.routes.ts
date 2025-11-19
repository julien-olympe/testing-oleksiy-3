import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  createDocumentation,
  getDocumentationByPartAndProject,
  getDocumentationById,
  deleteDocumentation,
  getProjectTotalStorageSize,
  readDocumentationFile,
} from '../services/documentation.service';
import { getProjectById } from '../services/project.service';
import { sendError, ErrorType, logError } from '../utils/errors';
import { authenticate } from '../middleware/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PROJECT_STORAGE = 500 * 1024 * 1024; // 500 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
];

export async function documentationRoutes(fastify: FastifyInstance) {
  // Get documentation metadata
  fastify.get<{ Params: { id: string; partId: string } }>(
    '/:id/parts/:partId/documentation',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: { id: string; partId: string } }>, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).userId;
        const { id: projectId, partId } = request.params;
        
        const project = await getProjectById(projectId, userId);
        if (!project) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        const documentation = await getDocumentationByPartAndProject(partId, projectId);
        
        reply.send({ documentation });
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: `/api/projects/${request.params.id}/parts/${request.params.partId}/documentation`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to load documentation. Please try again.');
      }
    }
  );
  
  // Upload documentation
  fastify.post<{ Params: { id: string; partId: string } }>(
    '/:id/parts/:partId/documentation',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: { id: string; partId: string } }>, reply: FastifyReply) => {
      const userId = (request.user as any).userId;
      const { id: projectId, partId } = request.params;
      
      try {
        const project = await getProjectById(projectId, userId);
        if (!project) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        if (project.status !== 'in_progress') {
          return sendError(
            reply,
            403,
            ErrorType.FORBIDDEN,
            'Cannot upload documentation to a finished project.'
          );
        }
        
        const data = await request.file();
        if (!data) {
          return sendError(reply, 400, ErrorType.VALIDATION_ERROR, 'File is required.');
        }
        
        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
          return sendError(
            reply,
            400,
            ErrorType.VALIDATION_ERROR,
            'Validation failed',
            { file: 'File type must be JPEG, PNG, GIF, or PDF. Maximum size: 10 MB.' }
          );
        }
        
        // Validate file size
        const fileBuffer = await data.toBuffer();
        if (fileBuffer.length > MAX_FILE_SIZE) {
          return sendError(
            reply,
            400,
            ErrorType.VALIDATION_ERROR,
            'Validation failed',
            { file: 'File size exceeds 10 MB limit.' }
          );
        }
        
        // Check project storage limit
        const currentStorage = await getProjectTotalStorageSize(projectId);
        if (currentStorage + fileBuffer.length > MAX_PROJECT_STORAGE) {
          return sendError(
            reply,
            507,
            ErrorType.STORAGE_ERROR,
            'Storage limit reached. Please contact administrator.'
          );
        }
        
        // Generate UUID filename
        const fileExtension = data.filename.split('.').pop() || '';
        const uuidFileName = `${uuidv4()}.${fileExtension}`;
        const storagePath = process.env.FILE_STORAGE_PATH || './storage';
        const filePath = join(storagePath, uuidFileName);
        
        // Save file
        const fs = await import('fs/promises');
        await fs.writeFile(filePath, fileBuffer);
        
        // Get description from form data if available
        let description: string | null = null;
        if (data.fields && 'description' in data.fields) {
          const descField = data.fields.description as any;
          description = descField?.value || null;
        }
        
        // Create database record
        const documentation = await createDocumentation(
          partId,
          projectId,
          filePath,
          data.mimetype,
          data.filename,
          fileBuffer.length,
          description
        );
        
        reply.status(201).send({
          id: documentation.id,
          fileName: documentation.file_name,
          fileType: documentation.file_type,
          fileSize: documentation.file_size,
          description: documentation.description,
          createdAt: documentation.created_at,
        });
      } catch (error) {
        logError({
          userId,
          endpoint: `/api/projects/${projectId}/parts/${partId}/documentation`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'File upload failed. Please try again.');
      }
    }
  );
  
  // Delete documentation
  fastify.delete<{ Params: { id: string; documentationId: string } }>(
    '/:id/documentation/:documentationId',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: { id: string; documentationId: string } }>, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).userId;
        const { id: projectId, documentationId } = request.params;
        
        const project = await getProjectById(projectId, userId);
        if (!project) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        if (project.status !== 'in_progress') {
          return sendError(
            reply,
            403,
            ErrorType.FORBIDDEN,
            'Cannot delete documentation from a finished project.'
          );
        }
        
        const documentation = await getDocumentationById(documentationId);
        if (!documentation || documentation.project_id !== projectId) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Documentation not found.');
        }
        
        await deleteDocumentation(documentationId);
        
        reply.send({ message: 'Documentation deleted successfully' });
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: `/api/projects/${request.params.id}/documentation/${request.params.documentationId}`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to delete documentation. Please try again.');
      }
    }
  );
  
  // Download documentation file
  fastify.get<{ Params: { id: string; documentationId: string } }>(
    '/:id/documentation/:documentationId/file',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: { id: string; documentationId: string } }>, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).userId;
        const { id: projectId, documentationId } = request.params;
        
        const project = await getProjectById(projectId, userId);
        if (!project) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'Project not found.');
        }
        
        const documentation = await getDocumentationById(documentationId);
        if (!documentation || documentation.project_id !== projectId) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'File not found.');
        }
        
        if (!existsSync(documentation.file_path)) {
          return sendError(reply, 404, ErrorType.NOT_FOUND, 'File not found.');
        }
        
        const fileBuffer = readDocumentationFile(documentation.file_path);
        
        reply
          .type(documentation.file_type)
          .header('Content-Disposition', `attachment; filename="${documentation.file_name}"`)
          .send(fileBuffer);
      } catch (error) {
        logError({
          userId: (request.user as any)?.userId,
          endpoint: `/api/projects/${request.params.id}/documentation/${request.params.documentationId}/file`,
          error,
        });
        sendError(reply, 500, ErrorType.INTERNAL_ERROR, 'Unable to read file. Please try again.');
      }
    }
  );
}
