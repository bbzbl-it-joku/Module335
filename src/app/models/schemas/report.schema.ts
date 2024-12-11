import { z } from 'zod';
import { ReportStatus } from '../enums';
import { categorySchema } from './category.schema';

export const reportSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  category: categorySchema,
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.nativeEnum(ReportStatus),
  mediaUrls: z.array(z.string().url()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
