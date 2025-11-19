import { pool } from '../config/database';

export async function getFullProjectData(
  projectId: string
): Promise<any> {
  // Get project with powerplant
  const projectResult = await pool.query(
    `SELECT p.*, pp.name as powerplant_name
     FROM projects p
     JOIN powerplants pp ON p.powerplant_id::text = pp.id::text
     WHERE p.id = $1::uuid`,
    [projectId]
  );
  
  if (projectResult.rows.length === 0) {
    return null;
  }
  
  const project = projectResult.rows[0];
  
  // Get all parts for the powerplant
  const partsResult = await pool.query(
    `SELECT * FROM parts WHERE powerplant_id = $1::uuid ORDER BY name`,
    [project.powerplant_id]
  );
  
  const parts = partsResult.rows;
  
  // Get checkups and their statuses for each part
  for (const part of parts) {
    const checkupsResult = await pool.query(
      `SELECT c.*, cs.status
       FROM checkups c
       LEFT JOIN checkup_statuses cs ON c.id::text = cs.checkup_id::text AND cs.project_id = $1::uuid
       WHERE c.part_id = $2::uuid
       ORDER BY c.name`,
      [projectId, part.id]
    );
    
    part.checkups = checkupsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
    }));
    
    // Get documentation metadata for this part
    const docsResult = await pool.query(
      `SELECT id, file_name, file_type, file_size, description, created_at, file_path
       FROM documentation
       WHERE part_id = $1::uuid AND project_id = $2::uuid
       ORDER BY created_at DESC`,
      [part.id, projectId]
    );
    
    part.documentation = docsResult.rows;
  }
  
  return {
    id: project.id,
    powerplantId: project.powerplant_id,
    powerplantName: project.powerplant_name,
    status: project.status,
    createdAt: project.created_at,
    finishedAt: project.finished_at,
    parts,
  };
}
