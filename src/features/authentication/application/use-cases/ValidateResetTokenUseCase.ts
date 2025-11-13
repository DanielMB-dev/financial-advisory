import { ResetToken } from '../../domain/value-objects/ResetToken'
import { InvalidTokenError } from '../../domain/errors/AuthenticationErrors'

export interface TokenValidationResult {
  isValid: boolean
  error: string | null
}

/**
 * ValidateResetTokenUseCase
 *
 * Validates reset token FORMAT only - does NOT verify with Supabase.
 *
 * Purpose:
 * 1. Provide early user feedback before form submission
 * 2. Prevent UI form display for obviously invalid tokens
 * 3. Reduce unnecessary API calls to Supabase
 *
 * SECURITY NOTE:
 * This is CLIENT-SIDE validation. Never skip Supabase verification
 * during actual password reset. Supabase is the source of truth.
 *
 * @example
 * const useCase = new ValidateResetTokenUseCase()
 * const result = await useCase.execute(tokenFromURL)
 *
 * if (!result.isValid) {
 *   showError(result.error)
 * }
 */
export class ValidateResetTokenUseCase {
  /**
   * Validate reset token format
   *
   * @param token - Raw token string from URL query parameter
   * @returns Validation result with error message if invalid
   */
  async execute(token: string): Promise<TokenValidationResult> {
    try {
      // Just validate format - don't call Supabase
      ResetToken.create(token)

      return {
        isValid: true,
        error: null,
      }
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        return {
          isValid: false,
          error: 'This reset link appears to be invalid. Please request a new one.',
        }
      }

      // Re-throw unexpected errors (programming errors)
      throw error
    }
  }
}
