import { z } from 'zod';
import { ReactionType } from '../enums';

export const reactionSchema = z.object({
  id: z.string().uuid().optional(),
  reportId: z.string().uuid(),
  userId: z.string().uuid(),
  reactionType: z.nativeEnum(ReactionType),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
