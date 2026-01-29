import { z } from 'zod';
import { powerStateSchema, coordinatePointSchema } from './common';

// Create Beacon Input
export const createBeaconInputSchema = z.object({
  beaconId: z.string().min(1, 'Beacon ID is required'),
  sectorId: z.string().min(1, 'Sector ID is required'),
  geofenceId: z.string().optional(),
  powerState: powerStateSchema.optional(),
  mqttUsername: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update Beacon Input
export const updateBeaconInputSchema = z.object({
  sectorId: z.string().min(1, 'Sector ID is required').optional(),
  geofenceId: z.string().nullable().optional(),
  powerState: powerStateSchema.optional(),
  mqttUsername: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Create Geofence Input
export const createGeofenceInputSchema = z.object({
  sectorId: z.string().min(1, 'Sector ID is required'),
  name: z.string().optional(),
  coordinates: z
    .array(coordinatePointSchema)
    .min(3, 'Geofence must have at least 3 coordinate points'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update Geofence Input
export const updateGeofenceInputSchema = z.object({
  sectorId: z.string().min(1, 'Sector ID is required').optional(),
  name: z.string().optional(),
  coordinates: z
    .array(coordinatePointSchema)
    .min(3, 'Geofence must have at least 3 coordinate points')
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Create Sector Input
export const createSectorInputSchema = z.object({
  sectorId: z.string().min(1, 'Sector ID is required'),
  name: z.string().min(1, 'Sector name is required'),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update Sector Input
export const updateSectorInputSchema = z.object({
  name: z.string().min(1, 'Sector name is required').optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Telemetry Filter Input
export const telemetryFilterInputSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100).optional(),
  offset: z.number().min(0).default(0).optional(),
});

// Type exports
export type CreateBeaconInput = z.infer<typeof createBeaconInputSchema>;
export type UpdateBeaconInput = z.infer<typeof updateBeaconInputSchema>;
export type CreateGeofenceInput = z.infer<typeof createGeofenceInputSchema>;
export type UpdateGeofenceInput = z.infer<typeof updateGeofenceInputSchema>;
export type CreateSectorInput = z.infer<typeof createSectorInputSchema>;
export type UpdateSectorInput = z.infer<typeof updateSectorInputSchema>;
export type TelemetryFilterInput = z.infer<typeof telemetryFilterInputSchema>;
