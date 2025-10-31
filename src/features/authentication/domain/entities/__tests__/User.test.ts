import { describe, it, expect } from 'vitest';
import { User } from '../User';
import { Email } from '../../value-objects/Email';
import { UserId } from '../../value-objects/UserId';
import { VerificationStatus } from '../../value-objects/VerificationStatus';

describe('User Entity', () => {
  const validUserId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
  const validEmail = Email.create('user@example.com');
  const now = new Date();

  describe('create', () => {
    it('should create User with valid props', () => {
      const user = User.create({
        id: validUserId,
        email: validEmail,
        verificationStatus: VerificationStatus.verified(now),
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });

      expect(user).toBeDefined();
      expect(user.getId().equals(validUserId)).toBe(true);
      expect(user.getEmail().equals(validEmail)).toBe(true);
      expect(user.isEmailVerified()).toBe(true);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute User from database data', () => {
      const dbData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        emailVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      const user = User.reconstitute(dbData);

      expect(user).toBeDefined();
      expect(user.getId().getValue()).toBe(dbData.id);
      expect(user.getEmail().getValue()).toBe(dbData.email);
      expect(user.isEmailVerified()).toBe(true);
      expect(user.getLastLoginAt()).toEqual(now);
    });

    it('should reconstitute unverified user', () => {
      const dbData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        emailVerifiedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      const user = User.reconstitute(dbData);

      expect(user.isEmailVerified()).toBe(false);
      expect(user.getVerificationStatus().isVerified()).toBe(false);
      expect(user.getLastLoginAt()).toBeUndefined();
    });
  });

  describe('getters', () => {
    const user = User.create({
      id: validUserId,
      email: validEmail,
      verificationStatus: VerificationStatus.verified(now),
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });

    it('should get user ID', () => {
      expect(user.getId().equals(validUserId)).toBe(true);
    });

    it('should get user email', () => {
      expect(user.getEmail().equals(validEmail)).toBe(true);
    });

    it('should get verification status', () => {
      expect(user.getVerificationStatus().isVerified()).toBe(true);
    });

    it('should get created at', () => {
      expect(user.getCreatedAt()).toEqual(now);
    });

    it('should get updated at', () => {
      expect(user.getUpdatedAt()).toEqual(now);
    });

    it('should get last login at', () => {
      expect(user.getLastLoginAt()).toEqual(now);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email and update timestamp', () => {
      const user = User.create({
        id: validUserId,
        email: validEmail,
        verificationStatus: VerificationStatus.unverified(),
        createdAt: now,
        updatedAt: now,
      });

      expect(user.isEmailVerified()).toBe(false);

      const verifiedAt = new Date(now.getTime() + 1000);
      user.verifyEmail(verifiedAt);

      expect(user.isEmailVerified()).toBe(true);
      expect(user.getVerificationStatus().getVerifiedAt()).toEqual(verifiedAt);
      expect(user.getUpdatedAt().getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('recordLogin', () => {
    it('should record login and update timestamp', () => {
      const user = User.create({
        id: validUserId,
        email: validEmail,
        verificationStatus: VerificationStatus.verified(now),
        createdAt: now,
        updatedAt: now,
      });

      expect(user.getLastLoginAt()).toBeUndefined();

      user.recordLogin();

      expect(user.getLastLoginAt()).toBeDefined();
      expect(user.getUpdatedAt().getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('canAccessProtectedResources', () => {
    it('should return true if email is verified', () => {
      const user = User.create({
        id: validUserId,
        email: validEmail,
        verificationStatus: VerificationStatus.verified(now),
        createdAt: now,
        updatedAt: now,
      });

      expect(user.canAccessProtectedResources()).toBe(true);
    });

    it('should return false if email is not verified', () => {
      const user = User.create({
        id: validUserId,
        email: validEmail,
        verificationStatus: VerificationStatus.unverified(),
        createdAt: now,
        updatedAt: now,
      });

      expect(user.canAccessProtectedResources()).toBe(false);
    });
  });
});
