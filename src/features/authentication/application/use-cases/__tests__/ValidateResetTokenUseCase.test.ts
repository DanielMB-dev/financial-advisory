import { describe, it, expect } from 'vitest'
import { ValidateResetTokenUseCase } from '../ValidateResetTokenUseCase'

describe('ValidateResetTokenUseCase', () => {
  const useCase = new ValidateResetTokenUseCase()

  describe('execute()', () => {
    it('should validate correct token format', async () => {
      const validToken = 'a'.repeat(60)
      const result = await useCase.execute(validToken)

      expect(result.isValid).toBe(true)
      expect(result.error).toBe(null)
    })

    it('should reject empty token', async () => {
      const result = await useCase.execute('')

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('invalid')
    })

    it('should reject short token', async () => {
      const result = await useCase.execute('short')

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('invalid')
    })

    it('should reject token with invalid characters', async () => {
      const invalidToken = 'a'.repeat(40) + '!@#'
      const result = await useCase.execute(invalidToken)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('This reset link appears to be invalid. Please request a new one.')
    })

    it('should provide user-friendly error message', async () => {
      const result = await useCase.execute('bad')

      expect(result.error).not.toBeNull()
      expect(result.error).toContain('reset link')
      expect(result.error).toContain('request a new one')
    })

    // NEW: Edge case tests
    it('should accept token with exactly 40 characters', async () => {
      const token = 'a'.repeat(40)
      const result = await useCase.execute(token)

      expect(result.isValid).toBe(true)
      expect(result.error).toBe(null)
    })

    it('should handle whitespace token gracefully', async () => {
      const result = await useCase.execute('   ')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('This reset link appears to be invalid. Please request a new one.')
    })

    it('should return consistent error message for all validation failures', async () => {
      const invalidTokens = ['', 'short', 'a'.repeat(39), '!@#$' + 'a'.repeat(40), '   ']
      const expectedError = 'This reset link appears to be invalid. Please request a new one.'

      for (const token of invalidTokens) {
        const result = await useCase.execute(token)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe(expectedError)
      }
    })

    it('should handle null token', async () => {
      const result = await useCase.execute(null as unknown as string)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('This reset link appears to be invalid. Please request a new one.')
    })

    it('should handle undefined token', async () => {
      const result = await useCase.execute(undefined as unknown as string)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('This reset link appears to be invalid. Please request a new one.')
    })

    it('should accept token with URL-safe characters', async () => {
      const token = 'abc-DEF_123-xyz_789' + 'a'.repeat(25)
      const result = await useCase.execute(token)

      expect(result.isValid).toBe(true)
      expect(result.error).toBe(null)
    })

    it('should reject token with 39 characters (just below boundary)', async () => {
      const token = 'a'.repeat(39)
      const result = await useCase.execute(token)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('This reset link appears to be invalid. Please request a new one.')
    })

    it('should accept token with 41 characters (just above boundary)', async () => {
      const token = 'a'.repeat(41)
      const result = await useCase.execute(token)

      expect(result.isValid).toBe(true)
      expect(result.error).toBe(null)
    })
  })
})
