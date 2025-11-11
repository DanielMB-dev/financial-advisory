import { describe, it, expect } from 'vitest'
import { Email } from '../Email'

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const email = Email.create('user@example.com')
      expect(email).toBeDefined()
      expect(email.getValue()).toBe('user@example.com')
    })

    it('should normalize email to lowercase', () => {
      const email = Email.create('USER@EXAMPLE.COM')
      expect(email.getValue()).toBe('user@example.com')
    })

    it('should reject invalid email format', () => {
      expect(() => Email.create('invalid-email')).toThrow('Invalid email format')
    })

    it('should reject email without @ symbol', () => {
      expect(() => Email.create('userexample.com')).toThrow('Invalid email format')
    })

    it('should reject email without domain', () => {
      expect(() => Email.create('user@')).toThrow('Invalid email format')
    })

    it('should reject empty email', () => {
      expect(() => Email.create('')).toThrow('Invalid email format')
    })
  })

  describe('equals', () => {
    it('should compare emails correctly', () => {
      const email1 = Email.create('user@example.com')
      const email2 = Email.create('user@example.com')
      const email3 = Email.create('other@example.com')

      expect(email1.equals(email2)).toBe(true)
      expect(email1.equals(email3)).toBe(false)
    })

    it('should compare emails case-insensitively', () => {
      const email1 = Email.create('USER@EXAMPLE.COM')
      const email2 = Email.create('user@example.com')

      expect(email1.equals(email2)).toBe(true)
    })
  })

  describe('toString', () => {
    it('should convert email to string', () => {
      const email = Email.create('user@example.com')
      expect(email.toString()).toBe('user@example.com')
    })
  })
})
