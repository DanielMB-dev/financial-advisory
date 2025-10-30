import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware - Runs on every request
 *
 * Use for:
 * - Rate limiting on sensitive routes
 * - Authentication checks
 * - Security headers
 * - Request logging
 * - A/B testing
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

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // More aggressive rate limiting for auth endpoints
    if (pathname.startsWith('/api/auth/')) {
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
  console.log('trigger')

  return NextResponse.next()
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
