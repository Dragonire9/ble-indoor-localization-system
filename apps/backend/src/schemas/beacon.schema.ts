import { z } from 'zod';

export const createBeaconSchema = z.object({
  body: z.object({
    beaconId: z.string().min(1).max(100),
    sectorId: z.string().min(1),
    geofenceId: z.string().optional(),
    powerState: z.enum(['ON', 'OFF', 'LOW_BATTERY']).optional().default('ON'),
    mqttUsername: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const updateBeaconSchema = z.object({
  body: z.object({
    sectorId: z.string().min(1).optional(),
    geofenceId: z.string().optional().nullable(),
    powerState: z.enum(['ON', 'OFF', 'LOW_BATTERY']).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  params: z.object({
    beaconId: z.string().min(1),
  }),
});

export const getBeaconSchema = z.object({
  params: z.object({
    beaconId: z.string().min(1),
  }),
});

export const getBeaconsSchema = z.object({
  query: z.object({
    sectorId: z.string().optional(),
    connectionState: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const getBeaconTelemetrySchema = z.object({
  params: z.object({
    beaconId: z.string().min(1),
  }),
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.coerce.number().int().positive().max(1000).optional().default(100),
  }),
});
