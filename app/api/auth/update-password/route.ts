import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthUseCaseFactory } from '@/src/features/authentication/infrastructure/factories/AuthUseCaseFactory'
import { InvalidTokenError } from '@/src/features/authentication/domain/errors/AuthenticationErrors'

/**
 * Update Password Schema
 * Validates both token format and password strength
 */
const updatePasswordSchema = z.object({
  token: z.string().min(40, 'Invalid reset token'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

/**
 * POST /api/auth/update-password
 *
 * Resets user password using reset token from email.
 *
 * SECURITY:
 * - Token validated by Supabase (source of truth)
 * - Password validated against strength requirements
 * - Can reveal token/password errors (token is secret)
 * - Does NOT create session (use auto-login endpoint separately)
 *
 * @example
 * POST /api/auth/update-password
 * Body: { "token": "...", "password": "NewPass123" }
 *
 * Response (200):
 * {
 *   "message": "Password reset successful"
 * }
 *
 * Response (400 - Invalid Token):
 * {
 *   "error": "Reset link has expired or is invalid. Please request a new one."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json()
    const validatedData = updatePasswordSchema.parse(body)

    // 2. Execute use case (Supabase validates token authenticity)
    // Note: Use case internally creates Password value object
    const useCase = AuthUseCaseFactory.createResetPasswordUseCase()
    await useCase.execute(validatedData.token, validatedData.password)

    // 4. Success response (does NOT include session)
    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 })
  } catch (error) {
    // 5. Handle validation errors (specific feedback OK)
    if (error instanceof z.ZodError) {
      const issue = error.issues[0]
      return NextResponse.json({ error: issue?.message || 'Validation error' }, { status: 400 })
    }

    // 6. Handle token errors (OK to be specific - token is secret)
    if (error instanceof InvalidTokenError) {
      return NextResponse.json(
        { error: 'Reset link has expired or is invalid. Please request a new one.' },
        { status: 400 }
      )
    }

    // 7. Handle password validation errors
    if (error instanceof Error) {
      // Password value object throws Error with validation message
      if (error.message.toLowerCase().includes('password')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    // 8. Catch-all for unexpected errors
    console.error('[UpdatePassword] Error:', error)
    return NextResponse.json(
      { error: 'Unable to reset password. Please try again.' },
      { status: 500 }
    )
  }
}
