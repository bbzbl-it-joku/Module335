import { z } from 'zod';
import { UserRole } from '../enums/user-role.enum';
import { supabaseUserSchema, userProfileSchema } from '../schemas';

export interface ISupabaseUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface IUserProfile {
  user_id: string;
  total_points: number;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

export interface IUser {
  id: string;
  email: string;
  username: string;
  totalPoints: number;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type SupabaseUser = z.infer<typeof supabaseUserSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;


