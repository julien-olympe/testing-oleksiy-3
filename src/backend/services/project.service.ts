import { pool } from '../utils/db';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ProjectService {
  async getUserProjects(userId: string) {
    const result = await pool.query(
      `SELECT 
        p.id, p.status, p.created_at, p.finished_at,
        pp.id as powerplant_id, pp.name as powerplant_name
      FROM projects p
      JOIN powerplants pp ON pp.id = p.powerplant_id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC`,
      [userId]
    );

    logger.info('Projects list retrieved', {
      userId,
      projectCount: result.rows.length,
    });

    return result.rows.map((row) => ({
      id: row.id,
      powerplant: {
        id: row.powerplant_id,
        name: row.powerplant_name,
      },
      status: row.status,
      createdAt: row.created_at.toISOString(),
      finishedAt: row.finished_at?.toISOString() || null,
    }));
  }

  async getProjectById(projectId: string, userId: string) {
    // Get project
    const projectResult = await pool.query(
      `SELECT 
        p.id, p.status, p.created_at, p.finished_at, p.powerplant_id,
        pp.name as powerplant_name, pp.location as powerplant_location
      FROM projects p
      JOIN powerplants pp ON pp.id = p.powerplant_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    const project = projectResult.rows[0];

    // Get all parts for the powerplant
    const partsResult = await pool.query(
      `SELECT 
        p.id, p.name, p.description, p.display_order,
        c.id as checkup_id, c.name as checkup_name, c.description as checkup_description,
        c.display_order as checkup_display_order,
        c.documentation_images, c.documentation_text
      FROM parts p
      LEFT JOIN checkups c ON c.part_id = p.id
      WHERE p.powerplant_id = $1
      ORDER BY p.display_order ASC, c.display_order ASC`,
      [project.powerplant_id]
    );

    // Get all checkup statuses for this project
    const statusResult = await pool.query(
      `SELECT checkup_id, status_value FROM checkup_statuses WHERE project_id = $1`,
      [projectId]
    );

    const statusMap = new Map(
      statusResult.rows.map((row) => [row.checkup_id, row.status_value])
    );

    // Group parts and checkups
    const partsMap = new Map();
    for (const row of partsResult.rows) {
      if (!partsMap.has(row.id)) {
        partsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          displayOrder: row.display_order,
          checkups: [],
        });
      }

      if (row.checkup_id) {
        const hasDocumentation = !!(row.documentation_images?.length || row.documentation_text);
        partsMap.get(row.id).checkups.push({
          id: row.checkup_id,
          name: row.checkup_name,
          description: row.checkup_description,
          displayOrder: row.checkup_display_order,
          status: statusMap.get(row.checkup_id) || null,
          hasDocumentation,
          documentationText: row.documentation_text,
        });
      }
    }

    logger.info('Project details retrieved', {
      userId,
      projectId,
    });

    return {
      id: project.id,
      powerplant: {
        id: project.powerplant_id,
        name: project.powerplant_name,
        location: project.powerplant_location,
      },
      status: project.status,
      createdAt: project.created_at.toISOString(),
      finishedAt: project.finished_at?.toISOString() || null,
      parts: Array.from(partsMap.values()),
    };
  }

  async createProject(userId: string, powerplantId: string) {
    // Verify powerplant exists
    const powerplantResult = await pool.query(
      `SELECT id FROM powerplants WHERE id = $1`,
      [powerplantId]
    );

    if (powerplantResult.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Powerplant not found');
    }

    // Create project
    const projectResult = await pool.query(
      `INSERT INTO projects (user_id, powerplant_id, status, created_at, updated_at)
       VALUES ($1, $2, 'In Progress', NOW(), NOW())
       RETURNING id, status, created_at, finished_at`,
      [userId, powerplantId]
    );

    const project = projectResult.rows[0];

    // Get powerplant name
    const ppResult = await pool.query(
      `SELECT id, name FROM powerplants WHERE id = $1`,
      [powerplantId]
    );

    logger.info('Project created successfully', {
      userId,
      projectId: project.id,
      powerplantId,
    });

    return {
      id: project.id,
      powerplant: {
        id: ppResult.rows[0].id,
        name: ppResult.rows[0].name,
      },
      status: project.status,
      createdAt: project.created_at.toISOString(),
      finishedAt: project.finished_at?.toISOString() || null,
    };
  }

  async updateCheckupStatus(
    projectId: string,
    checkupId: string,
    status: 'bad' | 'average' | 'good',
    userId: string
  ) {
    // Verify project and authorization
    const projectResult = await pool.query(
      `SELECT id, status, powerplant_id FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    const project = projectResult.rows[0];

    if (project.status === 'Finished') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Cannot update status on finished project');
    }

    // Verify checkup belongs to project's powerplant
    const checkupResult = await pool.query(
      `SELECT c.id FROM checkups c
       JOIN parts p ON p.id = c.part_id
       WHERE c.id = $1 AND p.powerplant_id = $2`,
      [checkupId, project.powerplant_id]
    );

    if (checkupResult.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Checkup not found or does not belong to this project\'s powerplant');
    }

    // Upsert checkup status
    const statusResult = await pool.query(
      `INSERT INTO checkup_statuses (project_id, checkup_id, status_value, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (project_id, checkup_id)
       DO UPDATE SET status_value = $3, updated_at = NOW()
       RETURNING checkup_id, status_value, updated_at`,
      [projectId, checkupId, status]
    );

    const checkupStatus = statusResult.rows[0];

    logger.info('Checkup status updated', {
      userId,
      projectId,
      checkupId,
      status,
    });

    return {
      checkupId: checkupStatus.checkup_id,
      status: checkupStatus.status_value,
      updatedAt: checkupStatus.updated_at.toISOString(),
    };
  }

  async finishProject(projectId: string, userId: string) {
    // Get project with user and powerplant
    const projectResult = await pool.query(
      `SELECT 
        p.id, p.status, p.powerplant_id,
        pp.name as powerplant_name, pp.location as powerplant_location,
        u.username
      FROM projects p
      JOIN powerplants pp ON pp.id = p.powerplant_id
      JOIN users u ON u.id = p.user_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    const projectRow = projectResult.rows[0];

    if (projectRow.status === 'Finished') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Project is already finished');
    }

    // Get all parts with checkups and their statuses
    const partsResult = await pool.query(
      `SELECT 
        p.id, p.name, p.description, p.display_order,
        c.id as checkup_id, c.name as checkup_name, c.description as checkup_description,
        c.display_order as checkup_display_order,
        c.documentation_images, c.documentation_text,
        cs.status_value
      FROM parts p
      LEFT JOIN checkups c ON c.part_id = p.id
      LEFT JOIN checkup_statuses cs ON cs.checkup_id = c.id AND cs.project_id = $1
      WHERE p.powerplant_id = $2
      ORDER BY p.display_order ASC, c.display_order ASC`,
      [projectId, projectRow.powerplant_id]
    );

    // Group parts and checkups
    const partsMap = new Map();
    for (const row of partsResult.rows) {
      if (!partsMap.has(row.id)) {
        partsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          displayOrder: row.display_order,
          checkups: [],
        });
      }

      if (row.checkup_id) {
        partsMap.get(row.id).checkups.push({
          id: row.checkup_id,
          name: row.checkup_name,
          description: row.checkup_description,
          displayOrder: row.checkup_display_order,
          documentationImages: row.documentation_images || [],
          documentationText: row.documentation_text,
          checkupStatuses: row.status_value ? [{
            id: '', // Not needed for PDF
            projectId,
            checkupId: row.checkup_id,
            statusValue: row.status_value,
            createdAt: new Date(),
            updatedAt: new Date(),
          }] : [],
        });
      }
    }

    // Get project creation date
    const projectDateResult = await pool.query(
      `SELECT created_at FROM projects WHERE id = $1`,
      [projectId]
    );
    const createdAt = projectDateResult.rows[0]?.created_at || new Date();

    const project = {
      id: projectRow.id,
      userId: userId,
      powerplantId: projectRow.powerplant_id,
      status: projectRow.status,
      createdAt: createdAt,
      finishedAt: null,
      updatedAt: new Date(),
      user: { username: projectRow.username },
      powerplant: {
        name: projectRow.powerplant_name,
        location: projectRow.powerplant_location,
      },
    };

    return {
      project,
      parts: Array.from(partsMap.values()),
    };
  }

  async markProjectFinished(projectId: string) {
    await pool.query(
      `UPDATE projects SET status = 'Finished', finished_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [projectId]
    );
  }
}

export const projectService = new ProjectService();
