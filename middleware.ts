import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware - Runs on every request
 *
 * Use for:
 * - Supabase session management (refresh tokens)
 * - Rate limiting on sensitive routes
 * - Authentication checks
 * - Security headers
 * - Request logging
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // Create response - we'll use this to set cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase session management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie in both request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from both request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if it exists - this is important for keeping the user logged in
  await supabase.auth.getUser()

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // CRITICAL: Password reset endpoint - strictest rate limiting (10/hour per IP)
    if (pathname === '/api/auth/reset-password') {
      const { rateLimit } = await import('./lib/rate-limit')
      const rateLimitResult = await rateLimit(request, {
        limit: 10, // 10 requests
        window: 3600000, // per hour (3600000ms)
      })

      if (!rateLimitResult.success) {
        const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        return NextResponse.json(
          {
            error: 'Too many password reset requests from this IP address. Please try again later.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            },
          }
        )
      }
    }
    // Stricter rate limiting for password update endpoint (10/hour per IP)
    else if (pathname === '/api/auth/update-password') {
      const { rateLimit } = await import('./lib/rate-limit')
      const rateLimitResult = await rateLimit(request, {
        limit: 10, // 10 requests
        window: 3600000, // per hour
      })

      if (!rateLimitResult.success) {
        return rateLimitResult.response
      }
    }
    // More aggressive rate limiting for other auth endpoints
    else if (pathname.startsWith('/api/auth/')) {
      const { rateLimit } = await import('./lib/rate-limit')
      const rateLimitResult = await rateLimit(request, {
        limit: 5, // 5 requests
        window: 60000, // per minute
      })

      if (!rateLimitResult.success) {
        return rateLimitResult.response
      }
    } else {
      // Standard rate limiting for other API routes
      const { rateLimit } = await import('./lib/rate-limit')
      const rateLimitResult = await rateLimit(request, {
        limit: 60, // 60 requests
        window: 60000, // per minute
      })

      if (!rateLimitResult.success) {
        return rateLimitResult.response
      }
    }
  }

  // Security headers are already set in next.config.ts
  // But you can add request-specific headers here if needed

  // Log requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`)
  }

  return response
}

/**
 * Middleware Configuration
 * Specify which routes should run through middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
