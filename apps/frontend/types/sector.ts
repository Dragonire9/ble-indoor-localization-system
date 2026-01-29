import { z } from 'zod';
import { beaconSchema } from './beacon';
import { geofenceSchema } from './geofence';

// Sector Schema
export const sectorSchema = z.object({
  id: z.string(),
  sectorId: z.string(),
  name: z.string().min(1, 'Sector name is required'),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  beacons: z.array(beaconSchema),
  geofences: z.array(geofenceSchema),
});

// Sector Detail Response
export const sectorDetailResponseSchema = sectorSchema;

// Paginated Sector List Response
import { paginationSchema } from './pagination';
export const sectorListResponseSchema = z.object({
  data: z.array(sectorSchema),
  pagination: paginationSchema,
});

// Type exports
export type Sector = z.infer<typeof sectorSchema>;
export type SectorListResponse = z.infer<typeof sectorListResponseSchema>;
export type SectorDetailResponse = z.infer<typeof sectorDetailResponseSchema>;
