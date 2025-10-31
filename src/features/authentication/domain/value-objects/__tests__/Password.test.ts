import { describe, it, expect } from 'vitest';
import { Password } from '../Password';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create valid password with 8+ characters, uppercase, lowercase, and number', () => {
      const password = Password.create('Password123');
      expect(password).toBeDefined();
      expect(password.getValue()).toBe('Password123');
    });

    it('should reject password with less than 8 characters', () => {
      expect(() => Password.create('Pass1')).toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should reject password without uppercase letter', () => {
      expect(() => Password.create('password123')).toThrow(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject password without lowercase letter', () => {
      expect(() => Password.create('PASSWORD123')).toThrow(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should reject password without number', () => {
      expect(() => Password.create('Password')).toThrow(
        'Password must contain at least one number'
      );
    });

    it('should accept password with all requirements', () => {
      const validPasswords = [
        'Password123',
        'MyP@ssw0rd',
        'Secure1Password',
        'Test1234',
      ];

      validPasswords.forEach((pwd) => {
        expect(() => Password.create(pwd)).not.toThrow();
      });
    });
  });

  describe('equals', () => {
    it('should compare passwords correctly', () => {
      const password1 = Password.create('Password123');
      const password2 = Password.create('Password123');
      const password3 = Password.create('DifferentPass1');

      expect(password1.equals(password2)).toBe(true);
      expect(password1.equals(password3)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return password value', () => {
      const password = Password.create('Password123');
      expect(password.getValue()).toBe('Password123');
    });
  });
});
