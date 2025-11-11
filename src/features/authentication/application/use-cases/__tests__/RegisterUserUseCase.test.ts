import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterUserUseCase } from '../RegisterUserUseCase'
import { IAuthenticationService } from '../../ports/IAuthenticationService'
import { IUserRepository } from '../../ports/IUserRepository'
import { User } from '../../../domain/entities/User'
import { Email } from '../../../domain/value-objects/Email'
import { UserId } from '../../../domain/value-objects/UserId'
import { VerificationStatus } from '../../../domain/value-objects/VerificationStatus'
import { DuplicateEmailError } from '../../../domain/errors/AuthenticationErrors'

describe('RegisterUserUseCase', () => {
  let authService: IAuthenticationService
  let userRepository: IUserRepository
  let useCase: RegisterUserUseCase

  const mockUser = User.create({
    id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
    email: Email.create('user@example.com'),
    verificationStatus: VerificationStatus.unverified(),
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  beforeEach(() => {
    authService = {
      registerWithEmail: vi.fn(),
    } as unknown as IAuthenticationService

    userRepository = {
      createProfile: vi.fn(),
      findProfileById: vi.fn(),
    } as unknown as IUserRepository

    useCase = new RegisterUserUseCase(authService, userRepository)
  })

  it('should register user with valid email and password', async () => {
    vi.mocked(authService.registerWithEmail).mockResolvedValue(mockUser)

    await useCase.execute({
      email: 'user@example.com',
      password: 'Password123',
    })

    expect(authService.registerWithEmail).toHaveBeenCalledWith(
      expect.objectContaining({ getValue: expect.any(Function) }),
      expect.objectContaining({ getValue: expect.any(Function) })
    )
    // Note: Profile creation is handled by database trigger, not manually
  })

  it('should throw error if email is invalid', async () => {
    await expect(
      useCase.execute({
        email: 'invalid-email',
        password: 'Password123',
      })
    ).rejects.toThrow('Invalid email format')

    expect(authService.registerWithEmail).not.toHaveBeenCalled()
  })

  it('should throw error if password is weak', async () => {
    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'weak',
      })
    ).rejects.toThrow()

    expect(authService.registerWithEmail).not.toHaveBeenCalled()
  })

  it('should throw DuplicateEmailError if email exists', async () => {
    vi.mocked(authService.registerWithEmail).mockRejectedValue(new DuplicateEmailError())

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'Password123',
      })
    ).rejects.toThrow(DuplicateEmailError)
  })

  it('should emit UserRegistered event after registration', async () => {
    vi.mocked(authService.registerWithEmail).mockResolvedValue(mockUser)
    const consoleLogSpy = vi.spyOn(console, 'log')

    await useCase.execute({
      email: 'user@example.com',
      password: 'Password123',
    })

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'UserRegistered event:',
      expect.objectContaining({
        userId: expect.any(Object),
        email: expect.any(Object),
      })
    )

    consoleLogSpy.mockRestore()
  })
})
