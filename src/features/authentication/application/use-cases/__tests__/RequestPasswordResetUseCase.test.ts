import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RequestPasswordResetUseCase } from '../RequestPasswordResetUseCase'
import { IAuthenticationService } from '../../ports/IAuthenticationService'
import { Email } from '../../../domain/value-objects/Email'

describe('RequestPasswordResetUseCase', () => {
  let mockAuthService: IAuthenticationService
  let useCase: RequestPasswordResetUseCase

  beforeEach(() => {
    // Create mock authentication service
    mockAuthService = {
      requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    } as unknown as IAuthenticationService

    useCase = new RequestPasswordResetUseCase(mockAuthService)
    vi.clearAllMocks()
  })

  describe('execute()', () => {
    it('should call authService.requestPasswordReset with Email value object', async () => {
      const email = 'test@example.com'

      await useCase.execute(email)

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledTimes(1)
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        })
      )
    })

    it('should create Email value object from string', async () => {
      const email = 'user@example.com'

      await useCase.execute(email)

      const callArg = vi.mocked(mockAuthService.requestPasswordReset).mock.calls[0][0]
      expect(callArg).toBeInstanceOf(Email)
      expect(callArg.getValue()).toBe(email)
    })

    it('should normalize email to lowercase', async () => {
      const email = 'USER@EXAMPLE.COM'

      await useCase.execute(email)

      const callArg = vi.mocked(mockAuthService.requestPasswordReset).mock.calls[0][0]
      expect(callArg.getValue()).toBe('user@example.com')
    })

    it('should complete successfully when authService succeeds', async () => {
      const email = 'test@example.com'

      await expect(useCase.execute(email)).resolves.toBeUndefined()
    })

    it('should throw error when email format is invalid', async () => {
      const invalidEmail = 'not-an-email'

      await expect(useCase.execute(invalidEmail)).rejects.toThrow()
    })

    it('should propagate errors from authService', async () => {
      const email = 'test@example.com'
      const serviceError = new Error('Network error')
      vi.mocked(mockAuthService.requestPasswordReset).mockRejectedValue(serviceError)

      await expect(useCase.execute(email)).rejects.toThrow('Network error')
    })

    it('should handle empty email string', async () => {
      const email = ''

      await expect(useCase.execute(email)).rejects.toThrow()
      expect(mockAuthService.requestPasswordReset).not.toHaveBeenCalled()
    })

    it('should handle whitespace-only email', async () => {
      const email = '   '

      await expect(useCase.execute(email)).rejects.toThrow()
      expect(mockAuthService.requestPasswordReset).not.toHaveBeenCalled()
    })

    it('should handle multiple consecutive calls independently', async () => {
      const email1 = 'user1@example.com'
      const email2 = 'user2@example.com'

      await useCase.execute(email1)
      await useCase.execute(email2)

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledTimes(2)

      const call1Arg = vi.mocked(mockAuthService.requestPasswordReset).mock.calls[0][0]
      const call2Arg = vi.mocked(mockAuthService.requestPasswordReset).mock.calls[1][0]

      expect(call1Arg.getValue()).toBe(email1)
      expect(call2Arg.getValue()).toBe(email2)
    })
  })
})
