import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export interface UserProfileProps {
  userId: UserId;
  email: Email;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfile {
  private constructor(private props: UserProfileProps) {}

  static create(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  static reconstitute(data: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfile {
    return new UserProfile({
      userId: UserId.create(data.id),
      email: Email.create(data.email),
      fullName: data.fullName ?? undefined,
      avatarUrl: data.avatarUrl ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  getUserId(): UserId {
    return this.props.userId;
  }

  getEmail(): Email {
    return this.props.email;
  }

  getFullName(): string | undefined {
    return this.props.fullName;
  }

  getAvatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  updateProfile(updates: { fullName?: string; avatarUrl?: string }): void {
    let hasChanges = false;

    if (updates.fullName !== undefined) {
      this.props.fullName = updates.fullName;
      hasChanges = true;
    }
    if (updates.avatarUrl !== undefined) {
      this.props.avatarUrl = updates.avatarUrl;
      hasChanges = true;
    }

    if (hasChanges) {
      this.props.updatedAt = new Date();
    }
  }
}
