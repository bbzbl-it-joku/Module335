import { userProfileSchema } from './schemas';
import { UserProfile } from './types/user.type';

export class UserProfileModel {
  private data: UserProfile;

  constructor(data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
    this.data = userProfileSchema.parse(data);
  }

  public toJSON(): UserProfile {
    return this.data;
  }
}
