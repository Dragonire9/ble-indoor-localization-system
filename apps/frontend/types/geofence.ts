import { z } from 'zod';
import { coordinatePointSchema } from './common';
import { beaconSchema } from './beacon';

// Simplified Sector Schema (nested in Geofence - without nested arrays)
const sectorNestedSchema = z.object({
  id: z.string(),
  sectorId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

// Geofence Schema
export const geofenceSchema = z.object({
  id: z.string(),
  sectorId: z.string(),
  name: z.string().nullable(),
  coordinates: z.array(coordinatePointSchema).min(3, 'Geofence must have at least 3 coordinate points'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  sector: sectorNestedSchema,
  beacons: z.array(beaconSchema),
});

// Geofence Detail Response
export const geofenceDetailResponseSchema = geofenceSchema;

// Paginated Geofence List Response
import { paginationSchema } from './pagination';
export const geofenceListResponseSchema = z.object({
  data: z.array(geofenceSchema),
  pagination: paginationSchema,
});

// Type exports
export type Geofence = z.infer<typeof geofenceSchema>;
export type GeofenceListResponse = z.infer<typeof geofenceListResponseSchema>;
export type GeofenceDetailResponse = z.infer<typeof geofenceDetailResponseSchema>;
