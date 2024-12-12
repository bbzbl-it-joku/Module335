import { z } from 'zod';
import { NotificationType } from './notification-type.enum';

export const notificationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  content: z.record(z.unknown()),
  read: z.boolean(),
  createdAt: z.date().optional()
});
