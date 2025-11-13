import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthUseCaseFactory } from '@/src/features/authentication/infrastructure/factories/AuthUseCaseFactory'
import { rateLimitStore } from '@/lib/rate-limit'

/**
 * Request Password Reset Schema
 * Validates email format before processing
 */
const requestPasswordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

/**
 * POST /api/auth/reset-password
 *
 * Initiates password reset flow by sending reset email.
 *
 * SECURITY:
 * - Always returns same message (never reveals account existence)
 * - Rate limited: 3 requests/email/hour AND 10 requests/IP/hour
 * - Logs errors internally but returns generic success message
 *
 * @example
 * POST /api/auth/reset-password
 * Body: { "email": "user@example.com" }
 *
 * Response (200):
 * {
 *   "message": "If an account exists with this email, you will receive password reset instructions"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json()
    const validatedData = requestPasswordResetSchema.parse(body)

    // 2. Email-based rate limiting (3 requests per email per hour)
    // This is in addition to IP-based rate limiting (10/hour) in middleware
    const emailKey = `reset-password-email:${validatedData.email.toLowerCase()}`
    const emailRateLimit = rateLimitStore.check(emailKey, {
      limit: 3,
      window: 3600000, // 1 hour in milliseconds
    })

    if (!emailRateLimit.success) {
      const retryAfter = Math.ceil((emailRateLimit.reset - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Too many password reset requests for this email. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': emailRateLimit.reset.toString(),
          },
        }
      )
    }

    // 3. Execute use case (sends email if account exists)
    // Note: Use case internally creates Email value object
    const useCase = AuthUseCaseFactory.createRequestPasswordResetUseCase()
    await useCase.execute(validatedData.email)

    // 4. SECURITY: Same message regardless of account existence
    return NextResponse.json(
      {
        message:
          'If an account exists with this email, you will receive password reset instructions',
      },
      { status: 200 }
    )
  } catch (error) {
    // 5. Handle validation errors (specific)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // 6. SECURITY: Log error internally but return generic message
    console.error('[RequestPasswordReset] Error:', error)

    return NextResponse.json(
      {
        message:
          'If an account exists with this email, you will receive password reset instructions',
      },
      { status: 200 } // Still 200 OK for security
    )
  }
}
