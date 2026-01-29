import { z } from 'zod';

// Power State Enum
export const powerStateSchema = z.enum(['ON', 'OFF', 'LOW_BATTERY']);

// Connection State Enum
export const connectionStateSchema = z.enum(['ONLINE', 'OFFLINE']);

// Coordinate Point Schema
export const coordinatePointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Type exports
export type PowerState = z.infer<typeof powerStateSchema>;
export type ConnectionState = z.infer<typeof connectionStateSchema>;
export type CoordinatePoint = z.infer<typeof coordinatePointSchema>;
