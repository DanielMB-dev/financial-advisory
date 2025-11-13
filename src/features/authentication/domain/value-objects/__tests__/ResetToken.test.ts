import { describe, it, expect } from 'vitest'
import { ResetToken } from '../ResetToken'
import { InvalidTokenError } from '../../errors/AuthenticationErrors'

describe('ResetToken', () => {
  describe('create()', () => {
    it('should create valid token with 40+ characters', () => {
      const validToken = 'a'.repeat(60)
      const token = ResetToken.create(validToken)

      expect(token.getValue()).toBe(validToken)
    })

    it('should accept URL-safe characters', () => {
      const tokenWithDashes = 'abc-def_123-xyz_' + 'a'.repeat(30)
      const token = ResetToken.create(tokenWithDashes)

      expect(token.getValue()).toBe(tokenWithDashes)
    })

    it('should reject empty token', () => {
      expect(() => ResetToken.create('')).toThrow(InvalidTokenError)
      expect(() => ResetToken.create('')).toThrow('Reset token cannot be empty')
    })

    it('should reject whitespace-only token', () => {
      expect(() => ResetToken.create('   ')).toThrow(InvalidTokenError)
    })

    it('should reject token shorter than 40 chars', () => {
      expect(() => ResetToken.create('a'.repeat(39))).toThrow(InvalidTokenError)
      expect(() => ResetToken.create('a'.repeat(39))).toThrow('Invalid reset token format')
    })

    it('should reject token with invalid characters', () => {
      const tokenWithSpecialChars = 'a'.repeat(40) + '!@#$'
      expect(() => ResetToken.create(tokenWithSpecialChars)).toThrow(InvalidTokenError)
    })

    it('should reject token with spaces', () => {
      const tokenWithSpaces = 'abc def ' + 'a'.repeat(40)
      expect(() => ResetToken.create(tokenWithSpaces)).toThrow(InvalidTokenError)
    })
  })

  describe('getHash()', () => {
    it('should provide safe hash for logging', () => {
      const token = ResetToken.create('a'.repeat(60))
      const hash = token.getHash()

      expect(hash).toBe('aaaaaaaa...')
      expect(hash.length).toBeLessThan(token.getValue().length)
    })

    it('should never expose full token in hash', () => {
      const fullToken = 'secret-token-' + 'x'.repeat(50)
      const token = ResetToken.create(fullToken)
      const hash = token.getHash()

      expect(hash).not.toContain('secret-token-')
      expect(hash.length).toBe(11) // 8 chars + '...'
    })
  })

  describe('equals()', () => {
    it('should return true for identical tokens', () => {
      const token1 = ResetToken.create('a'.repeat(60))
      const token2 = ResetToken.create('a'.repeat(60))

      expect(token1.equals(token2)).toBe(true)
    })

    it('should return false for different tokens', () => {
      const token1 = ResetToken.create('a'.repeat(60))
      const token2 = ResetToken.create('b'.repeat(60))

      expect(token1.equals(token2)).toBe(false)
    })
  })
})
