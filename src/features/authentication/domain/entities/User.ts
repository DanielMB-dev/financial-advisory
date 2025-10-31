import { Email } from '../value-objects/Email';
import { UserId } from '../value-objects/UserId';
import { VerificationStatus } from '../value-objects/VerificationStatus';

export interface UserProps {
  id: UserId;
  email: Email;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  static reconstitute(data: {
    id: string;
    email: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
  }): User {
    return new User({
      id: UserId.create(data.id),
      email: Email.create(data.email),
      verificationStatus: data.emailVerifiedAt
        ? VerificationStatus.verified(data.emailVerifiedAt)
        : VerificationStatus.unverified(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt,
    });
  }

  getId(): UserId {
    return this.props.id;
  }

  getEmail(): Email {
    return this.props.email;
  }

  isEmailVerified(): boolean {
    return this.props.verificationStatus.isVerified();
  }

  getVerificationStatus(): VerificationStatus {
    return this.props.verificationStatus;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  getLastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  verifyEmail(verifiedAt: Date): void {
    this.props.verificationStatus = VerificationStatus.verified(verifiedAt);
    this.props.updatedAt = new Date();
  }

  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  canAccessProtectedResources(): boolean {
    return this.isEmailVerified();
  }
}
