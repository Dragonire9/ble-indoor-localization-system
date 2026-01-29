import { z } from 'zod';

export const createSectorSchema = z.object({
  body: z.object({
    sectorId: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const updateSectorSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  params: z.object({
    sectorId: z.string().min(1),
  }),
});

export const getSectorSchema = z.object({
  params: z.object({
    sectorId: z.string().min(1),
  }),
});

export const getSectorsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});
