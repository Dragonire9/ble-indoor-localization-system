import { PrismaClient, BeaconTelemetry } from '@prisma/client';
import { MqttTelemetryPayload } from '../types/mqtt.types';

const prisma = new PrismaClient();

export class BeaconTelemetryRepository {
  async create(beaconId: string, data: MqttTelemetryPayload): Promise<BeaconTelemetry> {
    return prisma.beaconTelemetry.create({
      data: {
        beaconId,
        rssi: data.rssi,
        batteryLevel: data.batteryLevel,
        powerState: data.powerState,
        transmissionPower: data.transmissionPower,
        zoneFlags: data.zoneFlags || [],
        roleFlags: data.roleFlags || [],
        message: data.message,
        rawData: data.rawData,
      },
    });
  }

  async findByBeaconId(
    beaconId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<BeaconTelemetry[]> {
    const where: Record<string, unknown> = { beaconId };

    if (options?.startDate || options?.endDate) {
      where.timestamp = {};
      if (options.startDate) {
        where.timestamp.gte = options.startDate;
      }
      if (options.endDate) {
        where.timestamp.lte = options.endDate;
      }
    }

    // Use select to fetch only needed fields - avoid N+1 by not including relations
    return prisma.beaconTelemetry.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
      select: {
        id: true,
        beaconId: true,
        timestamp: true,
        rssi: true,
        batteryLevel: true,
        powerState: true,
        transmissionPower: true,
        zoneFlags: true,
        roleFlags: true,
        message: true,
        rawData: true,
      },
    });
  }
}
