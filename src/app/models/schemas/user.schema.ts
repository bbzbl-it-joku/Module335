import { z } from 'zod';
import { UserRole } from '../enums/user-role.enum';

export const supabaseUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(1),
  created_at: z.string().transform(str => new Date(str)),
  updated_at: z.string().transform(str => new Date(str))
});

export const userProfileSchema = z.object({
  user_id: z.string().uuid(),
  total_points: z.number().int().min(0),
  role: z.nativeEnum(UserRole),
  created_at: z.string().transform(str => new Date(str)),
  updated_at: z.string().transform(str => new Date(str)),
});
