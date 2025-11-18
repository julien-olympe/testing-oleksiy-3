import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class ProjectService {
  async getUserProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        powerplant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info('Projects list retrieved', {
      userId,
      projectCount: projects.length,
    });

    return projects.map((project: { id: string; status: string; createdAt: Date; finishedAt: Date | null; powerplant: { id: string; name: string } }) => ({
      id: project.id,
      powerplant: {
        id: project.powerplant.id,
        name: project.powerplant.name,
      },
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      finishedAt: project.finishedAt?.toISOString() || null,
    }));
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        powerplant: true,
      },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    // Get all parts for the powerplant
    const parts = await prisma.part.findMany({
      where: { powerplantId: project.powerplantId },
      include: {
        checkups: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    // Get all checkup statuses for this project
    const checkupStatuses = await prisma.checkupStatus.findMany({
      where: { projectId },
    });

    const statusMap = new Map(checkupStatuses.map((cs: { checkupId: string; statusValue: string }) => [cs.checkupId, cs.statusValue]));

    // Transform data structure
    const partsWithCheckups = parts.map((part: { id: string; name: string; description: string | null; displayOrder: number; checkups: Array<{ id: string; name: string; description: string | null; displayOrder: number; documentationImages: Buffer[] | null; documentationText: string | null }> }) => ({
      id: part.id,
      name: part.name,
      description: part.description,
      displayOrder: part.displayOrder,
      checkups: part.checkups.map((checkup: { id: string; name: string; description: string | null; displayOrder: number; documentationImages: Buffer[] | null; documentationText: string | null }) => ({
        id: checkup.id,
        name: checkup.name,
        description: checkup.description,
        displayOrder: checkup.displayOrder,
        status: statusMap.get(checkup.id) || null,
        hasDocumentation: !!(checkup.documentationImages?.length || checkup.documentationText),
        documentationText: checkup.documentationText,
      })),
    }));

    logger.info('Project details retrieved', {
      userId,
      projectId,
    });

    return {
      id: project.id,
      powerplant: {
        id: project.powerplant.id,
        name: project.powerplant.name,
        location: project.powerplant.location,
      },
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      finishedAt: project.finishedAt?.toISOString() || null,
      parts: partsWithCheckups,
    };
  }

  async createProject(userId: string, powerplantId: string) {
    // Verify powerplant exists
    const powerplant = await prisma.powerplant.findUnique({
      where: { id: powerplantId },
    });

    if (!powerplant) {
      throw new AppError(404, 'NOT_FOUND', 'Powerplant not found');
    }

    const project = await prisma.project.create({
      data: {
        userId,
        powerplantId,
        status: 'In Progress',
      },
      include: {
        powerplant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('Project created successfully', {
      userId,
      projectId: project.id,
      powerplantId,
    });

    return {
      id: project.id,
      powerplant: {
        id: project.powerplant.id,
        name: project.powerplant.name,
      },
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      finishedAt: project.finishedAt?.toISOString() || null,
    };
  }

  async updateCheckupStatus(
    projectId: string,
    checkupId: string,
    status: 'bad' | 'average' | 'good',
    userId: string
  ) {
    // Verify project and authorization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.status === 'Finished') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Cannot update status on finished project');
    }

    // Verify checkup belongs to project's powerplant
    const checkup = await prisma.checkup.findFirst({
      where: {
        id: checkupId,
        part: {
          powerplantId: project.powerplantId,
        },
      },
    });

    if (!checkup) {
      throw new AppError(404, 'NOT_FOUND', 'Checkup not found or does not belong to this project\'s powerplant');
    }

    // Upsert checkup status
    const checkupStatus = await prisma.checkupStatus.upsert({
      where: {
        projectId_checkupId: {
          projectId,
          checkupId,
        },
      },
      update: {
        statusValue: status,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        checkupId,
        statusValue: status,
      },
    });

    logger.info('Checkup status updated', {
      userId,
      projectId,
      checkupId,
      status,
    });

    return {
      checkupId: checkupStatus.checkupId,
      status: checkupStatus.statusValue,
      updatedAt: checkupStatus.updatedAt.toISOString(),
    };
  }

  async finishProject(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        powerplant: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.status === 'Finished') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Project is already finished');
    }

    // Get all data for PDF
    const parts = await prisma.part.findMany({
      where: { powerplantId: project.powerplantId },
      include: {
        checkups: {
          orderBy: { displayOrder: 'asc' },
          include: {
            checkupStatuses: {
              where: { projectId },
            },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return {
      project,
      parts,
    };
  }

  async markProjectFinished(projectId: string) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'Finished',
        finishedAt: new Date(),
      },
    });
  }
}

export const projectService = new ProjectService();
