import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Auth Callback Route
 *
 * Handles Supabase auth callbacks (email verification, password reset, etc.)
 * Exchanges the code for a session and redirects to the appropriate page
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/reset-password'

  console.log('[AuthCallback] Handling callback with code:', code?.substring(0, 8) + '...')
  console.log('[AuthCallback] Next URL:', next)

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle case where cookies cannot be set (e.g., in middleware)
              console.error('[AuthCallback] Failed to set cookie:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.error('[AuthCallback] Failed to remove cookie:', error)
            }
          },
        },
      }
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[AuthCallback] Code exchange failed:', error)
        // Redirect to reset-password with error
        return NextResponse.redirect(
          new URL('/reset-password?error=invalid_code', requestUrl.origin)
        )
      }

      console.log('[AuthCallback] Code exchange successful, session created')

      // Redirect to the next page (default: reset-password)
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error('[AuthCallback] Unexpected error:', error)
      return NextResponse.redirect(new URL('/reset-password?error=server_error', requestUrl.origin))
    }
  }

  // No code provided, redirect to home
  console.log('[AuthCallback] No code provided, redirecting to home')
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
