import { describe, it, expect } from 'vitest';
import { UserId } from '../UserId';

describe('UserId Value Object', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  describe('create', () => {
    it('should create valid UserId with UUID', () => {
      const userId = UserId.create(validUUID);
      expect(userId).toBeDefined();
      expect(userId.getValue()).toBe(validUUID);
    });

    it('should reject invalid UUID format', () => {
      expect(() => UserId.create('invalid-uuid')).toThrow('Invalid user ID format');
    });

    it('should reject empty string', () => {
      expect(() => UserId.create('')).toThrow('Invalid user ID format');
    });

    it('should accept various valid UUID formats', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '123e4567-e89b-12d3-a456-426614174000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      ];

      validUUIDs.forEach((uuid) => {
        expect(() => UserId.create(uuid)).not.toThrow();
      });
    });
  });

  describe('equals', () => {
    it('should compare UserIds correctly', () => {
      const userId1 = UserId.create(validUUID);
      const userId2 = UserId.create(validUUID);
      const userId3 = UserId.create('123e4567-e89b-12d3-a456-426614174000');

      expect(userId1.equals(userId2)).toBe(true);
      expect(userId1.equals(userId3)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should convert to string', () => {
      const userId = UserId.create(validUUID);
      expect(userId.toString()).toBe(validUUID);
    });
  });
});
