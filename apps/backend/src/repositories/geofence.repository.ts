import { PrismaClient, Geofence } from '@prisma/client';
import { CreateGeofenceInput, UpdateGeofenceInput, GeofenceQueryFilters } from '../types/geofence.types';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../types/pagination.types';

const prisma = new PrismaClient();

export class GeofenceRepository {
  async create(data: CreateGeofenceInput): Promise<Geofence> {
    return prisma.geofence.create({
      data: {
        sectorId: data.sectorId,
        name: data.name,
        coordinates: data.coordinates as unknown as Record<string, unknown>,
        metadata: data.metadata,
      },
    });
  }

  async findById(geofenceId: string): Promise<Geofence | null> {
    return prisma.geofence.findUnique({
      where: { id: geofenceId },
      include: {
        sector: true,
        beacons: true,
      },
    });
  }

  async findAll(filters?: GeofenceQueryFilters) {
    const where: Record<string, unknown> = {};

    if (filters?.sectorId) {
      where.sectorId = filters.sectorId;
    }

    if (filters?.beaconId) {
      where.beacons = {
        some: {
          beaconId: filters.beaconId,
        },
      };
    }

    // Pagination
    const page = filters?.page && filters.page > 0 ? filters.page : DEFAULT_PAGE;
    const limit = filters?.limit && filters.limit > 0 && filters.limit <= MAX_LIMIT 
      ? filters.limit 
      : DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.geofence.count({ where });

    // Use include to avoid N+1 queries
    const data = await prisma.geofence.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sector: {
          select: {
            id: true,
            sectorId: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            metadata: true,
          },
        },
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
          },
        },
      },
    });

    return { data, total, page, limit };
  }

  async update(geofenceId: string, data: UpdateGeofenceInput): Promise<Geofence> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.coordinates !== undefined) {
      updateData.coordinates = data.coordinates as unknown as Record<string, unknown>;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    return prisma.geofence.update({
      where: { id: geofenceId },
      data: updateData,
    });
  }

  async delete(geofenceId: string): Promise<void> {
    await prisma.geofence.delete({
      where: { id: geofenceId },
    });
  }
}
