import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class PowerplantService {
  async getAllPowerplants() {
    const powerplants = await prisma.powerplant.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        location: true,
      },
    });

    return powerplants;
  }

  async getPowerplantParts(powerplantId: string) {
    const powerplant = await prisma.powerplant.findUnique({
      where: { id: powerplantId },
      include: {
        parts: {
          include: {
            checkups: {
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!powerplant) {
      return null;
    }

    // Transform to match API spec
    const parts = powerplant.parts.map((part) => ({
      id: part.id,
      name: part.name,
      description: part.description,
      displayOrder: part.displayOrder,
      checkups: part.checkups.map((checkup) => ({
        id: checkup.id,
        name: checkup.name,
        description: checkup.description,
        displayOrder: checkup.displayOrder,
        hasDocumentation: !!(checkup.documentationImages?.length || checkup.documentationText),
      })),
    }));

    return {
      powerplant: {
        id: powerplant.id,
        name: powerplant.name,
        location: powerplant.location,
      },
      parts,
    };
  }
}

export const powerplantService = new PowerplantService();
