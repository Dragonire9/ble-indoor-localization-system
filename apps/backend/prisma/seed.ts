import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../src/lib/logger';

const prisma = new PrismaClient();

interface SeedData {
  sectors: Array<{
    sectorId: string;
    name: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }>;
  beacons: Array<{
    beaconId: string;
    sectorId: string;
    geofenceId?: string | null;
    powerState: 'ON' | 'OFF' | 'LOW_BATTERY';
    connectionState: 'ONLINE' | 'OFFLINE';
    mqttUsername?: string;
    metadata?: Record<string, unknown>;
  }>;
  geofences: Array<{
    sectorId: string;
    name?: string;
    coordinates: Array<{ x: number; y: number }>;
    metadata?: Record<string, unknown>;
  }>;
  telemetry: Array<{
    beaconId: string;
    rssi?: number;
    batteryLevel?: number;
    powerState?: 'ON' | 'OFF' | 'LOW_BATTERY';
    transmissionPower?: number;
    zoneFlags?: string[];
    roleFlags?: string[];
    message?: string;
    rawData?: Record<string, unknown>;
  }>;
}

async function main() {
  try {
    // Read seed data from JSON file
    const seedFilePath = path.join(__dirname, 'seed.json');
    const seedDataRaw = fs.readFileSync(seedFilePath, 'utf-8');
    const seedData: SeedData = JSON.parse(seedDataRaw);

    logger.info('Starting database seed...');

    // Seed sectors
    logger.info(`Seeding ${seedData.sectors.length} sectors...`);
    for (const sector of seedData.sectors) {
      await prisma.sector.upsert({
        where: { sectorId: sector.sectorId },
        update: {
          name: sector.name,
          description: sector.description,
          metadata: sector.metadata as Prisma.InputJsonValue | null | undefined,
        },
        create: {
          sectorId: sector.sectorId,
          name: sector.name,
          description: sector.description,
          metadata: sector.metadata as Prisma.InputJsonValue | null | undefined,
        },
      });
    }
    logger.info('Sectors seeded successfully');

    // Seed geofences (before beacons, as beacons may reference them)
    logger.info(`Seeding ${seedData.geofences.length} geofences...`);
    const geofenceMap = new Map<string, string>(); // Map to store geofence name -> id

    for (const geofence of seedData.geofences) {
      // Find existing geofence by sectorId and name, or create new
      const existing = await prisma.geofence.findFirst({
        where: {
          sectorId: geofence.sectorId,
          name: geofence.name || undefined,
        },
      });

      if (existing) {
        geofenceMap.set(geofence.name || '', existing.id);
        await prisma.geofence.update({
          where: { id: existing.id },
          data: {
            coordinates: geofence.coordinates as Prisma.InputJsonValue,
            metadata: geofence.metadata as Prisma.InputJsonValue | null | undefined,
          },
        });
      } else {
        const created = await prisma.geofence.create({
          data: {
            sectorId: geofence.sectorId,
            name: geofence.name,
            coordinates: geofence.coordinates as Prisma.InputJsonValue,
            metadata: geofence.metadata as Prisma.InputJsonValue | null | undefined,
          },
        });
        if (geofence.name) {
          geofenceMap.set(geofence.name, created.id);
        }
      }
    }
    logger.info('Geofences seeded successfully');

    // Seed beacons
    logger.info(`Seeding ${seedData.beacons.length} beacons...`);
    for (const beacon of seedData.beacons) {
      // Resolve geofenceId if provided as name
      let geofenceId: string | null = null;
      if (beacon.geofenceId) {
        // If geofenceId is a name, look it up
        geofenceId = geofenceMap.get(beacon.geofenceId) || beacon.geofenceId;
      }

      await prisma.beacon.upsert({
        where: { beaconId: beacon.beaconId },
        update: {
          sectorId: beacon.sectorId,
          geofenceId,
          powerState: beacon.powerState,
          connectionState: beacon.connectionState,
          mqttUsername: beacon.mqttUsername,
          metadata: beacon.metadata as Prisma.InputJsonValue | null | undefined,
        },
        create: {
          beaconId: beacon.beaconId,
          sectorId: beacon.sectorId,
          geofenceId,
          powerState: beacon.powerState,
          connectionState: beacon.connectionState,
          mqttUsername: beacon.mqttUsername,
          metadata: beacon.metadata as Prisma.InputJsonValue | null | undefined,
        },
      });
    }
    logger.info('Beacons seeded successfully');

    // Seed telemetry
    logger.info(`Seeding ${seedData.telemetry.length} telemetry records...`);
    for (const telemetry of seedData.telemetry) {
      await prisma.beaconTelemetry.create({
        data: {
          beaconId: telemetry.beaconId,
          rssi: telemetry.rssi,
          batteryLevel: telemetry.batteryLevel,
          powerState: telemetry.powerState,
          transmissionPower: telemetry.transmissionPower,
          zoneFlags: telemetry.zoneFlags || [],
          roleFlags: telemetry.roleFlags || [],
          message: telemetry.message,
          rawData: telemetry.rawData as Prisma.InputJsonValue | null | undefined,
        },
      });
    }
    logger.info('Telemetry seeded successfully');

    logger.info('Database seed completed successfully!');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
