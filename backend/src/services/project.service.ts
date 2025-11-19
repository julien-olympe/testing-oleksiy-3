import { pool } from '../config/database';
import { Project } from '../types';

export async function createProject(
  userId: string,
  powerplantId: string
): Promise<Project> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create project
    const projectResult = await client.query(
      `INSERT INTO projects (user_id, powerplant_id, status, created_at)
       VALUES ($1, $2, 'in_progress', CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, powerplantId]
    );
    const project = projectResult.rows[0];
    
    // Get all checkups for the powerplant
    const checkupsResult = await client.query(
      `SELECT c.id FROM checkups c
       JOIN parts p ON c.part_id = p.id
       WHERE p.powerplant_id = $1`,
      [powerplantId]
    );
    
    // Create CheckupStatus records for each checkup
    for (const checkup of checkupsResult.rows) {
      await client.query(
        `INSERT INTO checkup_statuses (project_id, checkup_id, status, created_at, updated_at)
         VALUES ($1, $2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [project.id, checkup.id]
      );
    }
    
    await client.query('COMMIT');
    return project;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getProjectsByUserId(userId: string): Promise<any[]> {
  const result = await pool.query(
    `SELECT p.id, p.status, p.created_at, p.finished_at,
            pp.name as powerplant_name
     FROM projects p
     JOIN powerplants pp ON p.powerplant_id = pp.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getProjectById(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const result = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rows[0] || null;
}

export async function verifyProjectOwnership(
  projectId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rows.length > 0;
}

export async function updateProjectStatus(
  projectId: string,
  status: 'in_progress' | 'finished',
  userId: string
): Promise<Project> {
  const finishedAt = status === 'finished' ? 'CURRENT_TIMESTAMP' : 'NULL';
  const result = await pool.query(
    `UPDATE projects 
     SET status = $1, finished_at = ${finishedAt}
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [status, projectId, userId]
  );
  return result.rows[0];
}
