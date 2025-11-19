import { pool } from '../config/database';
import { Documentation } from '../types';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

export async function createDocumentation(
  partId: string,
  projectId: string,
  filePath: string,
  fileType: string,
  fileName: string,
  fileSize: number,
  description: string | null
): Promise<Documentation> {
  const result = await pool.query(
    `INSERT INTO documentation 
     (part_id, project_id, file_path, file_type, file_name, file_size, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [partId, projectId, filePath, fileType, fileName, fileSize, description]
  );
  return result.rows[0];
}

export async function getDocumentationByPartAndProject(
  partId: string,
  projectId: string
): Promise<Documentation[]> {
  const result = await pool.query(
    `SELECT id, file_name, file_type, file_size, description, created_at
     FROM documentation
     WHERE part_id = $1 AND project_id = $2
     ORDER BY created_at DESC`,
    [partId, projectId]
  );
  return result.rows;
}

export async function getDocumentationById(
  documentationId: string
): Promise<Documentation | null> {
  const result = await pool.query(
    'SELECT * FROM documentation WHERE id = $1',
    [documentationId]
  );
  return result.rows[0] || null;
}

export async function deleteDocumentation(
  documentationId: string
): Promise<void> {
  const doc = await getDocumentationById(documentationId);
  if (!doc) {
    throw new Error('Documentation not found');
  }
  
  // Delete file from filesystem
  if (existsSync(doc.file_path)) {
    unlinkSync(doc.file_path);
  }
  
  // Delete database record
  await pool.query('DELETE FROM documentation WHERE id = $1', [documentationId]);
}

export async function getProjectTotalStorageSize(
  projectId: string
): Promise<number> {
  const result = await pool.query(
    'SELECT COALESCE(SUM(file_size), 0) as total_size FROM documentation WHERE project_id = $1',
    [projectId]
  );
  return parseInt(result.rows[0].total_size) || 0;
}

export function readDocumentationFile(filePath: string): Buffer {
  return readFileSync(filePath);
}
