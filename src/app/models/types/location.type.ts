import { z } from 'zod';
import { locationSchema } from '../schemas';

export type Location = z.infer<typeof locationSchema>;
