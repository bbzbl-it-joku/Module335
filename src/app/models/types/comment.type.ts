import { z } from 'zod';
import { commentSchema } from '../schemas';

export type Comment = z.infer<typeof commentSchema>;
