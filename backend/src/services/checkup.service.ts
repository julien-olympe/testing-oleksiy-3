import { pool } from '../config/database';
import { CheckupStatus } from '../types';

export async function updateCheckupStatus(
  projectId: string,
  checkupId: string,
  status: 'bad' | 'average' | 'good'
): Promise<CheckupStatus> {
  // Try to update existing record
  const updateResult = await pool.query(
    `UPDATE checkup_statuses
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE project_id = $2::uuid AND checkup_id = $3::uuid
     RETURNING *`,
    [status, projectId, checkupId]
  );
  
  if (updateResult.rows.length > 0) {
    return updateResult.rows[0];
  }
  
  // If no record exists, create one
  const insertResult = await pool.query(
    `INSERT INTO checkup_statuses (project_id, checkup_id, status, created_at, updated_at)
     VALUES ($1::uuid, $2::uuid, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [projectId, checkupId, status]
  );
  
  return insertResult.rows[0];
}

export async function getCheckupStatusesByProject(
  projectId: string
): Promise<CheckupStatus[]> {
  const result = await pool.query(
    'SELECT * FROM checkup_statuses WHERE project_id = $1::uuid',
    [projectId]
  );
  return result.rows;
}

export async function verifyAllCheckupsHaveStatus(
  projectId: string
): Promise<boolean> {
  const result = await pool.query(
    `SELECT COUNT(*) as total, 
            COUNT(status) as with_status
     FROM checkup_statuses
     WHERE project_id = $1::uuid`,
    [projectId]
  );
  
  const { total, with_status } = result.rows[0];
  return parseInt(total) === parseInt(with_status);
}
