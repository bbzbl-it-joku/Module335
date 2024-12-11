import { z } from 'zod';

export const locationSchema = z.object({
  id: z.string().uuid().optional(),
  reportId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  extraData: z.record(z.unknown()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
