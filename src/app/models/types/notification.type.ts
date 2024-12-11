import { z } from 'zod';
import { notificationSchema } from '../schemas';

export type Notification = z.infer<typeof notificationSchema>;
