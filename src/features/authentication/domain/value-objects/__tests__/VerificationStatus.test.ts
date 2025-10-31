import { describe, it, expect } from 'vitest';
import { VerificationStatus, VerificationStatusType } from '../VerificationStatus';

describe('VerificationStatus Value Object', () => {
  describe('unverified', () => {
    it('should create unverified status', () => {
      const status = VerificationStatus.unverified();
      expect(status.getStatus()).toBe(VerificationStatusType.UNVERIFIED);
      expect(status.isVerified()).toBe(false);
      expect(status.getVerifiedAt()).toBeUndefined();
    });
  });

  describe('verified', () => {
    it('should create verified status with timestamp', () => {
      const verifiedAt = new Date();
      const status = VerificationStatus.verified(verifiedAt);

      expect(status.getStatus()).toBe(VerificationStatusType.VERIFIED);
      expect(status.isVerified()).toBe(true);
      expect(status.getVerifiedAt()).toBe(verifiedAt);
    });
  });

  describe('pending', () => {
    it('should create pending status', () => {
      const status = VerificationStatus.pending();
      expect(status.getStatus()).toBe(VerificationStatusType.PENDING);
      expect(status.isVerified()).toBe(false);
      expect(status.getVerifiedAt()).toBeUndefined();
    });
  });

  describe('isVerified', () => {
    it('should return true only for verified status', () => {
      const verified = VerificationStatus.verified(new Date());
      const unverified = VerificationStatus.unverified();
      const pending = VerificationStatus.pending();

      expect(verified.isVerified()).toBe(true);
      expect(unverified.isVerified()).toBe(false);
      expect(pending.isVerified()).toBe(false);
    });
  });
});
