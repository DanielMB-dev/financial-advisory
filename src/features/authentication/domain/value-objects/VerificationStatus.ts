export enum VerificationStatusType {
  UNVERIFIED = 'unverified',
  VERIFIED = 'verified',
  PENDING = 'pending',
}

export class VerificationStatus {
  private constructor(
    private readonly status: VerificationStatusType,
    private readonly verifiedAt?: Date
  ) {}

  static unverified(): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.UNVERIFIED);
  }

  static verified(verifiedAt: Date): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.VERIFIED, verifiedAt);
  }

  static pending(): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.PENDING);
  }

  isVerified(): boolean {
    return this.status === VerificationStatusType.VERIFIED;
  }

  getStatus(): VerificationStatusType {
    return this.status;
  }

  getVerifiedAt(): Date | undefined {
    return this.verifiedAt;
  }
}
