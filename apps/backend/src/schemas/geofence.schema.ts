import { z } from 'zod';

const coordinatePointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const createGeofenceSchema = z.object({
  body: z.object({
    sectorId: z.string().min(1),
    name: z.string().max(200).optional(),
    coordinates: z
      .array(coordinatePointSchema)
      .min(3, 'Polygon must have at least 3 points')
      .refine(
        (coords) => {
          // Check if polygon is closed (first and last points are identical)
          if (coords.length === 0) return false;
          const first = coords[0];
          const last = coords[coords.length - 1];
          return first.x === last.x && first.y === last.y;
        },
        { message: 'Polygon must be closed (first and last points must be identical)' }
      ),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const updateGeofenceSchema = z.object({
  body: z.object({
    name: z.string().max(200).optional(),
    coordinates: z
      .array(coordinatePointSchema)
      .min(3, 'Polygon must have at least 3 points')
      .refine(
        (coords) => {
          if (coords.length === 0) return false;
          const first = coords[0];
          const last = coords[coords.length - 1];
          return first.x === last.x && first.y === last.y;
        },
        { message: 'Polygon must be closed (first and last points must be identical)' }
      )
      .optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  params: z.object({
    geofenceId: z.string().min(1),
  }),
});

export const getGeofenceSchema = z.object({
  params: z.object({
    geofenceId: z.string().min(1),
  }),
});

export const getGeofencesSchema = z.object({
  query: z.object({
    sectorId: z.string().optional(),
    beaconId: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});
