import { describe, it, expect } from 'vitest';
import { UserProfile } from '../UserProfile';
import { Email } from '../../value-objects/Email';
import { UserId } from '../../value-objects/UserId';

describe('UserProfile Entity', () => {
  const validUserId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
  const validEmail = Email.create('user@example.com');
  const now = new Date();

  describe('create', () => {
    it('should create UserProfile with valid props', () => {
      const profile = UserProfile.create({
        userId: validUserId,
        email: validEmail,
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: now,
        updatedAt: now,
      });

      expect(profile).toBeDefined();
      expect(profile.getUserId().equals(validUserId)).toBe(true);
      expect(profile.getEmail().equals(validEmail)).toBe(true);
      expect(profile.getFullName()).toBe('John Doe');
      expect(profile.getAvatarUrl()).toBe('https://example.com/avatar.jpg');
    });

    it('should create UserProfile with optional fields as undefined', () => {
      const profile = UserProfile.create({
        userId: validUserId,
        email: validEmail,
        createdAt: now,
        updatedAt: now,
      });

      expect(profile.getFullName()).toBeUndefined();
      expect(profile.getAvatarUrl()).toBeUndefined();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute UserProfile from database data', () => {
      const dbData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: now,
        updatedAt: now,
      };

      const profile = UserProfile.reconstitute(dbData);

      expect(profile).toBeDefined();
      expect(profile.getUserId().getValue()).toBe(dbData.id);
      expect(profile.getEmail().getValue()).toBe(dbData.email);
      expect(profile.getFullName()).toBe(dbData.fullName);
      expect(profile.getAvatarUrl()).toBe(dbData.avatarUrl);
    });

    it('should handle null optional fields', () => {
      const dbData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        fullName: null,
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
      };

      const profile = UserProfile.reconstitute(dbData);

      expect(profile.getFullName()).toBeUndefined();
      expect(profile.getAvatarUrl()).toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('should update profile with fullName', () => {
      const profile = UserProfile.create({
        userId: validUserId,
        email: validEmail,
        createdAt: now,
        updatedAt: now,
      });

      const updateTime = now.getTime();
      profile.updateProfile({ fullName: 'Jane Doe' });

      expect(profile.getFullName()).toBe('Jane Doe');
      expect(profile.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(updateTime);
    });

    it('should update profile with avatarUrl', () => {
      const profile = UserProfile.create({
        userId: validUserId,
        email: validEmail,
        createdAt: now,
        updatedAt: now,
      });

      profile.updateProfile({ avatarUrl: 'https://example.com/new-avatar.jpg' });

      expect(profile.getAvatarUrl()).toBe('https://example.com/new-avatar.jpg');
    });

    it('should update profile with multiple fields', () => {
      const profile = UserProfile.create({
        userId: validUserId,
        email: validEmail,
        createdAt: now,
        updatedAt: now,
      });

      profile.updateProfile({
        fullName: 'Jane Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      expect(profile.getFullName()).toBe('Jane Doe');
      expect(profile.getAvatarUrl()).toBe('https://example.com/avatar.jpg');
    });

    it('should not update if no fields provided', () => {
      const profile = UserProfile.create({
        userId: validUserId,
        email: validEmail,
        fullName: 'John Doe',
        createdAt: now,
        updatedAt: now,
      });

      const originalUpdatedAt = profile.getUpdatedAt();
      profile.updateProfile({});

      expect(profile.getFullName()).toBe('John Doe');
      expect(profile.getUpdatedAt()).toBe(originalUpdatedAt);
    });
  });

  describe('getters', () => {
    const profile = UserProfile.create({
      userId: validUserId,
      email: validEmail,
      fullName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: now,
      updatedAt: now,
    });

    it('should get user ID', () => {
      expect(profile.getUserId().equals(validUserId)).toBe(true);
    });

    it('should get email', () => {
      expect(profile.getEmail().equals(validEmail)).toBe(true);
    });

    it('should get full name', () => {
      expect(profile.getFullName()).toBe('John Doe');
    });

    it('should get avatar URL', () => {
      expect(profile.getAvatarUrl()).toBe('https://example.com/avatar.jpg');
    });

    it('should get created at', () => {
      expect(profile.getCreatedAt()).toEqual(now);
    });

    it('should get updated at', () => {
      expect(profile.getUpdatedAt()).toEqual(now);
    });
  });
});
