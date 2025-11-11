import { createServerSupabaseClient } from '@/src/features/authentication/infrastructure/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth callback handler for Google and other OAuth providers
 * This route handles the OAuth redirect and exchanges the code for a session
 *
 * Configured in Google Cloud Console as the redirect URI
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  let next = requestUrl.searchParams.get('next') ?? '/dashboard'

  console.log('[OAuth Callback] Request URL:', requestUrl.href)
  console.log('[OAuth Callback] Code received:', code ? 'YES' : 'NO')
  console.log('[OAuth Callback] Next path:', next)

  // Ensure next path starts with /
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code) {
    const supabase = await createServerSupabaseClient()

    console.log('[OAuth Callback] Exchanging code for session...')

    // Exchange code for session (PKCE flow for OAuth)
    // The code verifier is automatically retrieved from server-side cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[OAuth Callback] Exchange error:', error)
      // Redirect to login with error
      return NextResponse.redirect(
        new URL(
          '/login?error=oauth_failed&message=' + encodeURIComponent(error.message),
          requestUrl.origin
        )
      )
    }

    console.log('[OAuth Callback] Session established successfully')

    // Successful OAuth authentication - redirect to destination
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    const redirectUrl = isLocalEnv
      ? `${requestUrl.origin}${next}`
      : forwardedHost
        ? `https://${forwardedHost}${next}`
        : `${requestUrl.origin}${next}`

    console.log('[OAuth Callback] Redirecting to:', redirectUrl)
    return NextResponse.redirect(redirectUrl)
  }

  // No code provided - redirect to login
  console.log('[OAuth Callback] No code provided, redirecting to login')
  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
}
