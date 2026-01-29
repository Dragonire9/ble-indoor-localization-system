import { PrismaClient, Sector } from '@prisma/client';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../types/pagination.types';

const prisma = new PrismaClient();

export class SectorRepository {
  async create(data: { sectorId: string; name: string; description?: string; metadata?: Record<string, unknown> }): Promise<Sector> {
    return prisma.sector.create({
      data: {
        sectorId: data.sectorId,
        name: data.name,
        description: data.description,
        metadata: data.metadata,
      },
    });
  }

  async findById(sectorId: string): Promise<Sector | null> {
    return prisma.sector.findUnique({
      where: { sectorId },
      include: {
        beacons: true,
        geofences: true,
      },
    });
  }

  async findAll(page?: number, limit?: number) {
    // Pagination
    const pageNum = page && page > 0 ? page : DEFAULT_PAGE;
    const limitNum = limit && limit > 0 && limit <= MAX_LIMIT 
      ? limit 
      : DEFAULT_LIMIT;
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await prisma.sector.count();

    // For list endpoints, return simplified nested objects to avoid circular dependencies
    // and reduce payload size
    const data = await prisma.sector.findMany({
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        beacons: {
          select: {
            id: true,
            beaconId: true,
            sectorId: true,
            geofenceId: true,
            powerState: true,
            connectionState: true,
            lastSeenAt: true,
            registeredAt: true,
            mqttUsername: true,
            metadata: true,
            // Don't include nested sector/geofence to avoid circular refs
          },
        },
        geofences: {
          select: {
            id: true,
            sectorId: true,
            name: true,
            coordinates: true,
            createdAt: true,
            updatedAt: true,
            metadata: true,
            // Don't include nested sector/beacons to avoid circular refs
          },
        },
      },
    });

    return { data, total, page: pageNum, limit: limitNum };
  }

  async update(sectorId: string, data: { name?: string; description?: string; metadata?: Record<string, unknown> }): Promise<Sector> {
    return prisma.sector.update({
      where: { sectorId },
      data,
    });
  }

  async delete(sectorId: string): Promise<void> {
    await prisma.sector.delete({
      where: { sectorId },
    });
  }
}
