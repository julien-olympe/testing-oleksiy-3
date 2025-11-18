import { pool } from '../utils/db';
import { logger } from '../utils/logger';

export class PowerplantService {
  async getAllPowerplants() {
    const result = await pool.query(
      `SELECT id, name, location FROM powerplants ORDER BY name ASC`
    );

    return result.rows;
  }

  async getPowerplantParts(powerplantId: string) {
    // Get powerplant
    const powerplantResult = await pool.query(
      `SELECT id, name, location FROM powerplants WHERE id = $1`,
      [powerplantId]
    );

    if (powerplantResult.rows.length === 0) {
      return null;
    }

    const powerplant = powerplantResult.rows[0];

    // Get parts with checkups
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
      [powerplantId]
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
          hasDocumentation,
        });
      }
    }

    const parts = Array.from(partsMap.values());

    return {
      id: powerplant.id,
      name: powerplant.name,
      location: powerplant.location,
      parts,
    };
  }
}

export const powerplantService = new PowerplantService();
