import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ResetPasswordUseCase } from '../ResetPasswordUseCase'
import { IAuthenticationService } from '../../ports/IAuthenticationService'
import { Password } from '../../../domain/value-objects/Password'

describe('ResetPasswordUseCase', () => {
  let mockAuthService: IAuthenticationService
  let useCase: ResetPasswordUseCase

  beforeEach(() => {
    mockAuthService = {
      resetPassword: vi.fn().mockResolvedValue(undefined),
    } as unknown as IAuthenticationService

    useCase = new ResetPasswordUseCase(mockAuthService)
    vi.clearAllMocks()
  })

  describe('execute()', () => {
    const validToken = 'a'.repeat(60)
    const validPassword = 'Password123'

    it('should call authService.resetPassword with token and Password value object', async () => {
      await useCase.execute(validToken, validPassword)

      expect(mockAuthService.resetPassword).toHaveBeenCalledTimes(1)
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        validToken,
        expect.objectContaining({
          getValue: expect.any(Function),
        })
      )
    })

    it('should create Password value object from string', async () => {
      await useCase.execute(validToken, validPassword)

      const callArgs = vi.mocked(mockAuthService.resetPassword).mock.calls[0]
      expect(callArgs[1]).toBeInstanceOf(Password)
      expect(callArgs[1].getValue()).toBe(validPassword)
    })

    it('should pass token as-is without modification', async () => {
      await useCase.execute(validToken, validPassword)

      const callArgs = vi.mocked(mockAuthService.resetPassword).mock.calls[0]
      expect(callArgs[0]).toBe(validToken)
    })

    it('should complete successfully when authService succeeds', async () => {
      await expect(useCase.execute(validToken, validPassword)).resolves.toBeUndefined()
    })

    it('should throw error for weak password (< 8 characters)', async () => {
      const weakPassword = 'Pass1'

      await expect(useCase.execute(validToken, weakPassword)).rejects.toThrow()
      expect(mockAuthService.resetPassword).not.toHaveBeenCalled()
    })

    it('should throw error for password without uppercase letter', async () => {
      const noUpperPassword = 'password123'

      await expect(useCase.execute(validToken, noUpperPassword)).rejects.toThrow()
      expect(mockAuthService.resetPassword).not.toHaveBeenCalled()
    })

    it('should throw error for password without lowercase letter', async () => {
      const noLowerPassword = 'PASSWORD123'

      await expect(useCase.execute(validToken, noLowerPassword)).rejects.toThrow()
      expect(mockAuthService.resetPassword).not.toHaveBeenCalled()
    })

    it('should throw error for password without number', async () => {
      const noNumberPassword = 'PasswordABC'

      await expect(useCase.execute(validToken, noNumberPassword)).rejects.toThrow()
      expect(mockAuthService.resetPassword).not.toHaveBeenCalled()
    })

    it('should throw error for empty password', async () => {
      const emptyPassword = ''

      await expect(useCase.execute(validToken, emptyPassword)).rejects.toThrow()
      expect(mockAuthService.resetPassword).not.toHaveBeenCalled()
    })

    it('should propagate errors from authService (invalid token)', async () => {
      const serviceError = new Error('Invalid or expired token')
      vi.mocked(mockAuthService.resetPassword).mockRejectedValue(serviceError)

      await expect(useCase.execute(validToken, validPassword)).rejects.toThrow(
        'Invalid or expired token'
      )
    })

    it('should propagate errors from authService (network error)', async () => {
      const networkError = new Error('Network error')
      vi.mocked(mockAuthService.resetPassword).mockRejectedValue(networkError)

      await expect(useCase.execute(validToken, validPassword)).rejects.toThrow('Network error')
    })

    it('should handle multiple consecutive calls independently', async () => {
      const password1 = 'Password123'
      const password2 = 'DifferentPass456'

      await useCase.execute(validToken, password1)
      await useCase.execute(validToken, password2)

      expect(mockAuthService.resetPassword).toHaveBeenCalledTimes(2)

      const call1Password = vi.mocked(mockAuthService.resetPassword).mock.calls[0][1]
      const call2Password = vi.mocked(mockAuthService.resetPassword).mock.calls[1][1]

      expect(call1Password.getValue()).toBe(password1)
      expect(call2Password.getValue()).toBe(password2)
    })
  })
})
