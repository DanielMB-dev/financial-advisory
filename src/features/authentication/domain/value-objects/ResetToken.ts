import { InvalidTokenError } from '../errors/AuthenticationErrors'

/**
 * ResetToken Value Object
 *
 * Encapsulates password reset token validation logic.
 * This validates FORMAT only - Supabase validates authenticity.
 *
 * Supabase tokens are typically 40+ characters, alphanumeric with URL-safe chars.
 *
 * @example
 * const token = ResetToken.create(tokenString)
 * console.log(token.getHash()) // Safe for logging
 */
export class ResetToken {
  private constructor(private readonly value: string) {}

  /**
   * Create a ResetToken with format validation
   *
   * Validation rules:
   * - Non-empty string
   * - Minimum 40 characters (Supabase standard)
   * - Alphanumeric + URL-safe characters only (a-zA-Z0-9_-)
   *
   * @throws InvalidTokenError if validation fails
   */
  static create(token: string): ResetToken {
    // Rule 1: Non-empty
    if (!token || token.trim().length === 0) {
      throw new InvalidTokenError('Reset token cannot be empty')
    }

    // Rule 2: Minimum length (Supabase tokens are typically 40+ chars)
    if (token.length < 40) {
      throw new InvalidTokenError('Invalid reset token format')
    }

    // Rule 3: Only alphanumeric + URL-safe characters
    if (!/^[a-zA-Z0-9_-]+$/.test(token)) {
      throw new InvalidTokenError('Invalid reset token format')
    }

    return new ResetToken(token)
  }

  /**
   * Get the raw token value
   * Use with caution - never log this directly
   */
  getValue(): string {
    return this.value
  }

  /**
   * Get safe hash for logging/debugging
   * Only exposes first 8 characters
   */
  getHash(): string {
    return this.value.substring(0, 8) + '...'
  }

  /**
   * Value object equality
   */
  equals(other: ResetToken): boolean {
    return this.value === other.value
  }
}
