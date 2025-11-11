import { createServerSupabaseClient } from '@/src/features/authentication/infrastructure/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  let next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // Ensure next path starts with /
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code) {
    const supabase = await createServerSupabaseClient()

    // Exchange code for session (PKCE flow)
    // The code verifier is automatically retrieved from server-side cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      // Redirect to error page
      return NextResponse.redirect(
        new URL('/auth/error?message=' + encodeURIComponent(error.message), requestUrl.origin)
      )
    }

    // Successful authentication - redirect to destination
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
}
