export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface ISupabaseUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface IUserProfile {
  user_id: string;
  karen_level: number;
  total_points: number;
  role: UserRole;
  push_notifications: boolean;
}

export class User {
  id: string;
  email: string;
  username: string;
  karenLevel: number;
  totalPoints: number;
  role: UserRole;
  pushNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(supabaseUser: ISupabaseUser, profile: IUserProfile) {
    this.id = supabaseUser.id;
    this.email = supabaseUser.email;
    this.username = supabaseUser.username;
    this.karenLevel = profile.karen_level;
    this.totalPoints = profile.total_points;
    this.role = profile.role;
    this.pushNotifications = profile.push_notifications;
    this.createdAt = new Date(supabaseUser.created_at);
    this.updatedAt = new Date(supabaseUser.updated_at);
  }

  // Helper methods to validate constraints
  isValidKarenLevel(): boolean {
    return this.karenLevel >= 1;
  }

  isValidTotalPoints(): boolean {
    return this.totalPoints >= 0;
  }
}
