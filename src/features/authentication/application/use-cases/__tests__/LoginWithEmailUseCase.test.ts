import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginWithEmailUseCase } from '../LoginWithEmailUseCase'
import { IAuthenticationService } from '../../ports/IAuthenticationService'
import { ISessionManager } from '../../ports/ISessionManager'
import { IUserRepository } from '../../ports/IUserRepository'
import { User } from '../../../domain/entities/User'
import { Email } from '../../../domain/value-objects/Email'
import { UserId } from '../../../domain/value-objects/UserId'
import { VerificationStatus } from '../../../domain/value-objects/VerificationStatus'
import {
  EmailNotVerifiedError,
  InvalidCredentialsError,
} from '../../../domain/errors/AuthenticationErrors'

describe('LoginWithEmailUseCase', () => {
  let authService: IAuthenticationService
  let sessionManager: ISessionManager
  let userRepository: IUserRepository
  let useCase: LoginWithEmailUseCase

  const mockVerifiedUser = User.create({
    id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
    email: Email.create('user@example.com'),
    verificationStatus: VerificationStatus.verified(new Date()),
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const mockUnverifiedUser = User.create({
    id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
    email: Email.create('user@example.com'),
    verificationStatus: VerificationStatus.unverified(),
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  beforeEach(() => {
    authService = {
      loginWithEmail: vi.fn(),
    } as unknown as IAuthenticationService

    sessionManager = {
      createSession: vi.fn(),
    } as unknown as ISessionManager

    userRepository = {
      updateUserMetadata: vi.fn(),
    } as unknown as IUserRepository

    useCase = new LoginWithEmailUseCase(authService, sessionManager, userRepository)
  })

  it('should login user with valid credentials and verified email', async () => {
    vi.mocked(authService.loginWithEmail).mockResolvedValue({
      user: mockVerifiedUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
    vi.mocked(sessionManager.createSession).mockResolvedValue()
    vi.mocked(userRepository.updateUserMetadata).mockResolvedValue()

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'Password123',
    })

    expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.email).toBe('user@example.com')
    expect(sessionManager.createSession).toHaveBeenCalledWith('access-token', 'refresh-token')
    expect(userRepository.updateUserMetadata).toHaveBeenCalled()
  })

  it('should throw EmailNotVerifiedError if email not verified', async () => {
    vi.mocked(authService.loginWithEmail).mockResolvedValue({
      user: mockUnverifiedUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'Password123',
      })
    ).rejects.toThrow(EmailNotVerifiedError)

    expect(sessionManager.createSession).not.toHaveBeenCalled()
  })

  it('should throw InvalidCredentialsError if credentials invalid', async () => {
    vi.mocked(authService.loginWithEmail).mockRejectedValue(new InvalidCredentialsError())

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'WrongPassword123',
      })
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('should update last login timestamp', async () => {
    vi.mocked(authService.loginWithEmail).mockResolvedValue({
      user: mockVerifiedUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
    vi.mocked(sessionManager.createSession).mockResolvedValue()
    const updateMetadataSpy = vi.mocked(userRepository.updateUserMetadata).mockResolvedValue()

    await useCase.execute({
      email: 'user@example.com',
      password: 'Password123',
    })

    expect(updateMetadataSpy).toHaveBeenCalledWith(
      expect.objectContaining({ getValue: expect.any(Function) }),
      expect.objectContaining({ lastLoginAt: expect.any(Date) })
    )
  })

  it('should create session with tokens', async () => {
    vi.mocked(authService.loginWithEmail).mockResolvedValue({
      user: mockVerifiedUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
    const createSessionSpy = vi.mocked(sessionManager.createSession).mockResolvedValue()
    vi.mocked(userRepository.updateUserMetadata).mockResolvedValue()

    await useCase.execute({
      email: 'user@example.com',
      password: 'Password123',
    })

    expect(createSessionSpy).toHaveBeenCalledWith('access-token', 'refresh-token')
  })
})
