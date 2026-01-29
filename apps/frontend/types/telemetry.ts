import { z } from 'zod';
import { powerStateSchema } from './common';

// BeaconTelemetry Schema
export const beaconTelemetrySchema = z.object({
  id: z.string(),
  beaconId: z.string(),
  timestamp: z.string().datetime(),
  rssi: z.number().nullable(),
  batteryLevel: z.number().nullable(),
  powerState: powerStateSchema.nullable(),
  transmissionPower: z.number().nullable(),
  zoneFlags: z.array(z.string()),
  roleFlags: z.array(z.string()),
  message: z.string().nullable(),
  rawData: z.record(z.string(), z.unknown()).nullable(),
});

// Telemetry List Response
export const telemetryListResponseSchema = z.array(beaconTelemetrySchema);

// Type exports
export type BeaconTelemetry = z.infer<typeof beaconTelemetrySchema>;
export type TelemetryListResponse = z.infer<typeof telemetryListResponseSchema>;
