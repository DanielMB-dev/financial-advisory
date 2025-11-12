import { IAuthenticationService } from '../../application/ports/IAuthenticationService'
import { SupabaseAuthAdapter } from '../adapters/SupabaseAuthAdapter'
import { RequestPasswordResetUseCase } from '../../application/use-cases/RequestPasswordResetUseCase'
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase'
import { ValidateResetTokenUseCase } from '../../application/use-cases/ValidateResetTokenUseCase'

/**
 * AuthUseCaseFactory
 *
 * Factory for creating authentication use cases with proper dependency injection.
 *
 * Usage in API Routes:
 *
 * @example
 * const useCase = AuthUseCaseFactory.createResetPasswordUseCase()
 * await useCase.execute(token, password)
 *
 * Usage in Tests:
 *
 * @example
 * const mockAdapter = new MockAuthAdapter()
 * AuthUseCaseFactory.setAuthAdapter(mockAdapter)
 * const useCase = AuthUseCaseFactory.createResetPasswordUseCase()
 * // ... test with mocked adapter
 * AuthUseCaseFactory.reset() // Clean up after test
 */
export class AuthUseCaseFactory {
  private static authAdapter: IAuthenticationService | null = null

  /**
   * Get or create singleton auth adapter instance
   * Uses lazy initialization pattern
   */
  private static getAuthAdapter(): IAuthenticationService {
    if (!this.authAdapter) {
      this.authAdapter = new SupabaseAuthAdapter()
    }
    return this.authAdapter
  }

  /**
   * Create RequestPasswordResetUseCase with dependencies
   */
  static createRequestPasswordResetUseCase(): RequestPasswordResetUseCase {
    return new RequestPasswordResetUseCase(this.getAuthAdapter())
  }

  /**
   * Create ResetPasswordUseCase with dependencies
   */
  static createResetPasswordUseCase(): ResetPasswordUseCase {
    return new ResetPasswordUseCase(this.getAuthAdapter())
  }

  /**
   * Create ValidateResetTokenUseCase
   * Note: No dependencies needed - pure format validation
   */
  static createValidateResetTokenUseCase(): ValidateResetTokenUseCase {
    return new ValidateResetTokenUseCase()
  }

  /**
   * For testing: Allow dependency injection of mock adapter
   */
  static setAuthAdapter(adapter: IAuthenticationService): void {
    this.authAdapter = adapter
  }

  /**
   * For testing: Reset to initial state
   */
  static reset(): void {
    this.authAdapter = null
  }
}
