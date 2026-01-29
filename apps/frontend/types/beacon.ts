import { z } from 'zod';
import { powerStateSchema, connectionStateSchema } from './common';

// Simplified Sector Schema (nested in Beacon - without nested arrays)
const sectorNestedSchema = z.object({
  id: z.string(),
  sectorId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

// Simplified Geofence Schema (nested in Beacon - without nested arrays)
const geofenceNestedSchema = z.object({
  id: z.string(),
  sectorId: z.string(),
  name: z.string().nullable(),
  coordinates: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
    })
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

// Beacon Schema
export const beaconSchema = z.object({
  id: z.string(),
  beaconId: z.string(),
  sectorId: z.string(),
  geofenceId: z.string().nullable(),
  powerState: powerStateSchema,
  connectionState: connectionStateSchema,
  lastSeenAt: z.string().datetime(),
  registeredAt: z.string().datetime(),
  mqttUsername: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  sector: sectorNestedSchema,
  geofence: geofenceNestedSchema.nullable(),
});

// Beacon Detail Response
export const beaconDetailResponseSchema = beaconSchema;

// Paginated Beacon List Response
import { paginationSchema } from './pagination';
export const beaconListResponseSchema = z.object({
  data: z.array(beaconSchema),
  pagination: paginationSchema,
});

// Type exports
export type Beacon = z.infer<typeof beaconSchema>;
export type BeaconListResponse = z.infer<typeof beaconListResponseSchema>;
export type BeaconDetailResponse = z.infer<typeof beaconDetailResponseSchema>;
