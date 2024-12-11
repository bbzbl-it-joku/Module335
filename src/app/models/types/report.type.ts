import { z } from 'zod';
import { reportSchema } from '../schemas';

export type Report = z.infer<typeof reportSchema>;
