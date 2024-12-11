import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  iconName: z.string().optional(),
  createdAt: z.date().optional()
});
