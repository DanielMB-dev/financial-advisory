import { User } from '../../domain/entities/User';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';

export interface IUserRepository {
  // User operations
  findById(userId: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;

  // Profile operations
  createProfile(profile: UserProfile): Promise<UserProfile>;
  findProfileById(userId: UserId): Promise<UserProfile | null>;
  updateProfile(userId: UserId, profile: UserProfile): Promise<UserProfile>;

  // User metadata updates (last_login_at, etc.)
  updateUserMetadata(userId: UserId, metadata: { lastLoginAt?: Date }): Promise<void>;
}
