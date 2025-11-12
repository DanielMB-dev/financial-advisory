import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/src/features/authentication/infrastructure/supabase/route-handler-client'

/**
 * POST /api/auth/auto-login-after-reset
 *
 * Auto-login user after successful password reset.
 *
 * IMPORTANT: This endpoint should be called AFTER /api/auth/update-password succeeds.
 * Separation of concerns: password reset !== session creation.
 *
 * How Supabase Handles This:
 * After successful password reset, Supabase automatically creates a session.
 * This endpoint just needs to verify the session exists.
 *
 * @example
 * POST /api/auth/auto-login-after-reset
 *
 * Response (200):
 * {
 *   "message": "Login successful",
 *   "user": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get Supabase client (with cookie handling)
    const supabase = await createRouteHandlerSupabaseClient()

    // 2. Get current session (Supabase creates session after password reset)
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json(
        { error: 'No active session. Please log in with your new password.' },
        { status: 401 }
      )
    }

    // 3. Return success with user data
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[AutoLoginAfterReset] Error:', error)
    return NextResponse.json(
      { error: 'Unable to complete login. Please log in manually.' },
      { status: 500 }
    )
  }
}
