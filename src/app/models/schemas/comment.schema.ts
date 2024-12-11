import { z } from 'zod';

export const commentSchema = z.object({
  id: z.string().uuid().optional(),
  reportId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
