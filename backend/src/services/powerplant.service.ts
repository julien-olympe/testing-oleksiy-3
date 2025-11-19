import { pool } from '../config/database';
import { Powerplant } from '../types';

export async function getAllPowerplants(): Promise<any[]> {
  const result = await pool.query(
    `SELECT p.id, p.name, p.description,
            COUNT(DISTINCT pt.id) as parts_count,
            COUNT(DISTINCT c.id) as checkups_count
     FROM powerplants p
     LEFT JOIN parts pt ON p.id::text = pt.powerplant_id::text
     LEFT JOIN checkups c ON pt.id::text = c.part_id::text
     GROUP BY p.id, p.name, p.description
     ORDER BY p.name`
  );
  return result.rows;
}

export async function getPowerplantById(id: string): Promise<Powerplant | null> {
  const result = await pool.query(
    'SELECT * FROM powerplants WHERE id = $1::uuid',
    [id]
  );
  return result.rows[0] || null;
}

export async function getPowerplantWithPartsAndCheckups(
  powerplantId: string
): Promise<any> {
  const powerplantResult = await pool.query(
    'SELECT * FROM powerplants WHERE id = $1::uuid',
    [powerplantId]
  );
  
  if (powerplantResult.rows.length === 0) {
    return null;
  }
  
  const powerplant = powerplantResult.rows[0];
  
  const partsResult = await pool.query(
    `SELECT * FROM parts WHERE powerplant_id = $1::uuid ORDER BY name`,
    [powerplantId]
  );
  
  const parts = partsResult.rows;
  
  for (const part of parts) {
    const checkupsResult = await pool.query(
      'SELECT * FROM checkups WHERE part_id = $1::uuid ORDER BY name',
      [part.id]
    );
    part.checkups = checkupsResult.rows;
  }
  
  return {
    ...powerplant,
    parts,
  };
}
