import { ISupabaseUser, IUserProfile } from './types/user.type';
import { UserRole } from './enums/user-role.enum';
import { supabaseUserSchema, userProfileSchema } from './schemas';
import { IUser } from './types/user.type';

export class User implements IUser {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly totalPoints: number;
  readonly role: UserRole;
  readonly pushNotifications: boolean;
  readonly deviceToken: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(supabaseUser: ISupabaseUser, profile: IUserProfile) {
    // Validate input data
    const validatedUser = supabaseUserSchema.parse(supabaseUser);
    const validatedProfile = userProfileSchema.parse(profile);

    // Assign validated data
    this.id = validatedUser.id;
    this.email = validatedUser.email;
    this.username = validatedUser.username;
    this.totalPoints = validatedProfile.total_points;
    this.role = validatedProfile.role;
    this.pushNotifications = validatedProfile.push_notifications;
    this.deviceToken = validatedProfile.device_token;
    this.createdAt = new Date(validatedUser.created_at);
    this.updatedAt = new Date(validatedUser.updated_at);
  }

  static createFromSupabase(supabaseUser: ISupabaseUser, profile: IUserProfile): User {
    return new User(supabaseUser, profile);
  }

  toJSON(): IUser {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      totalPoints: this.totalPoints,
      role: this.role,
      pushNotifications: this.pushNotifications,
      deviceToken: this.deviceToken,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  isAdmin(): boolean {
    return this.role === UserRole.Admin;
  }

  isValidTotalPoints(): boolean {
    return this.totalPoints >= 0;
  }

  // Helper method to create a new user with updated profile data
  withProfileUpdates(updates: Partial<IUserProfile>): User {
    return new User(
      {
        id: this.id,
        email: this.email,
        username: this.username,
        created_at: this.createdAt.toISOString(),
        updated_at: this.updatedAt.toISOString()
      },
      {
        user_id: this.id,
        total_points: updates.total_points ?? this.totalPoints,
        role: this.role,
        push_notifications: updates.push_notifications ?? this.pushNotifications,
        device_token: updates.device_token ?? this.deviceToken,
      }
    );
  }
}
