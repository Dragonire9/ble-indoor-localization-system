import { Beacon, ConnectionState, PrismaClient } from '@prisma/client';
import { BeaconQueryFilters, CreateBeaconInput, UpdateBeaconInput } from '../types/beacon.types';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../types/pagination.types';

const prisma = new PrismaClient();

export class BeaconRepository {
  async create(data: CreateBeaconInput): Promise<Beacon> {
    return prisma.beacon.create({
      data: {
        beaconId: data.beaconId,
        sectorId: data.sectorId,
        geofenceId: data.geofenceId,
        powerState: data.powerState || 'ON',
        connectionState: 'OFFLINE',
        mqttUsername: data.mqttUsername,
        metadata: data.metadata,
      },
    });
  }

  async findById(beaconId: string): Promise<Beacon | null> {
    return prisma.beacon.findUnique({
      where: { beaconId },
      include: {
        sector: true,
        geofence: true,
      },
    });
  }

  async findAll(filters?: BeaconQueryFilters) {
    const where: Record<string, unknown> = {};
    if (filters?.sectorId) {
      where.sectorId = Array.isArray(filters.sectorId)
        ? { in: filters.sectorId }
        : filters.sectorId;
    }
    if (filters?.connectionState) {
      where.connectionState = Array.isArray(filters.connectionState)
        ? { in: filters.connectionState }
        : filters.connectionState;
    }

    // Pagination
    const page = filters?.page && filters.page > 0 ? filters.page : DEFAULT_PAGE;
    const limit =
      filters?.limit && filters.limit > 0 && filters.limit <= MAX_LIMIT
        ? filters.limit
        : DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.beacon.count({ where });

    // Use include to avoid N+1 queries - fetch related data in single query
    // Return type includes nested relations, so we use Prisma's inferred type
    const data = await prisma.beacon.findMany({
      where,
      skip,
      take: limit,
      orderBy: { registeredAt: 'desc' },
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
        geofence: {
          select: {
            id: true,
            sectorId: true,
            name: true,
            coordinates: true,
            createdAt: true,
            updatedAt: true,
            metadata: true,
          },
        },
      },
    });

    return { data, total, page, limit };
  }

  async update(beaconId: string, data: UpdateBeaconInput): Promise<Beacon> {
    return prisma.beacon.update({
      where: { beaconId },
      data: {
        sectorId: data.sectorId,
        geofenceId: data.geofenceId,
        powerState: data.powerState,
        metadata: data.metadata,
      },
    });
  }

  async updateConnectionState(beaconId: string, connectionState: ConnectionState): Promise<Beacon> {
    return prisma.beacon.update({
      where: { beaconId },
      data: {
        connectionState,
        lastSeenAt: new Date(),
      },
    });
  }

  async delete(beaconId: string): Promise<void> {
    await prisma.beacon.delete({
      where: { beaconId },
    });
  }

  /**
  /**
   * Get filter counts for faceted filters
   * Returns counts for each filter option, applying other active filters (cross-filtering)
   */
  async getFilterCounts(filters?: BeaconQueryFilters): Promise<{
    sectors: Record<string, number>;
    connectionStates: Record<string, number>;
  }> {
    // Helper to build where clause ignoring a specific key
    const buildWhere = (ignoreKey: 'sectorId' | 'connectionState') => {
      const where: Record<string, unknown> = {};

      if (ignoreKey !== 'sectorId' && filters?.sectorId) {
        where.sectorId = Array.isArray(filters.sectorId)
          ? { in: filters.sectorId }
          : filters.sectorId;
      }

      if (ignoreKey !== 'connectionState' && filters?.connectionState) {
        where.connectionState = Array.isArray(filters.connectionState)
          ? { in: filters.connectionState }
          : filters.connectionState;
      }

      return where;
    };

    // 1. Get Sector Counts (apply all filters EXCEPT sectorId)
    // We group by sectorId to get counts for all sectors that match OTHER filters
    const sectorWhere = buildWhere('sectorId');
    const sectorGroups = await prisma.beacon.groupBy({
      by: ['sectorId'],
      where: sectorWhere,
      _count: {
        beaconId: true,
      },
    });

    const sectorCounts: Record<string, number> = {};
    sectorGroups.forEach(group => {
      sectorCounts[group.sectorId] = group._count.beaconId;
    });

    // 2. Get Connection State Counts (apply all filters EXCEPT connectionState)
    const connectionWhere = buildWhere('connectionState');
    const connectionGroups = await prisma.beacon.groupBy({
      by: ['connectionState'],
      where: connectionWhere,
      _count: {
        beaconId: true,
      },
    });

    // Initialize with 0 to ensure keys exist even if count is 0
    const connectionStateCounts: Record<string, number> = {
      ONLINE: 0,
      OFFLINE: 0,
    };

    connectionGroups.forEach(group => {
      connectionStateCounts[group.connectionState] = group._count.beaconId;
    });

    return {
      sectors: sectorCounts,
      connectionStates: connectionStateCounts,
    };
  }
}
