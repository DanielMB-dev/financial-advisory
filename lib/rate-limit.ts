import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate Limiting Configuration
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number
  /** Time window in milliseconds */
  window: number
}

/**
 * Rate Limiter Store
 * In production, use Redis or a proper distributed cache
 * This in-memory store is for development only
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map()

  /**
   * Check if request should be rate limited
   */
  check(
    key: string,
    config: RateLimitConfig
  ): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now()
    const record = this.store.get(key)

    // Clean up expired entries
    if (record && record.resetTime < now) {
      this.store.delete(key)
    }

    const currentRecord = this.store.get(key)

    if (!currentRecord) {
      // First request
      this.store.set(key, {
        count: 1,
        resetTime: now + config.window,
      })

      return {
        success: true,
        limit: config.limit,
        remaining: config.limit - 1,
        reset: now + config.window,
      }
    }

    if (currentRecord.count >= config.limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset: currentRecord.resetTime,
      }
    }

    // Increment count
    currentRecord.count++

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - currentRecord.count,
      reset: currentRecord.resetTime,
    }
  }

  /**
   * Reset rate limit for a key (useful for testing or admin overrides)
   */
  reset(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get current state for a key (useful for debugging)
   */
  get(key: string): { count: number; resetTime: number } | undefined {
    return this.store.get(key)
  }
}

// Singleton instance
const rateLimitStore = new RateLimitStore()

/**
 * Get client identifier from request
 * Uses IP address, falls back to a random identifier
 */
export function getClientId(request: NextRequest): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  // For authenticated routes, you might want to use user ID instead
  // const userId = request.headers.get('x-user-id')
  // return userId || ip

  return ip
}

/**
 * Apply rate limiting to a request
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request, {
 *     limit: 10,
 *     window: 60000, // 1 minute
 *   })
 *
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response
 *   }
 *
 *   // Process request...
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  config?: Partial<RateLimitConfig>
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  response?: NextResponse
}> {
  // Default configuration
  const rateLimitConfig: RateLimitConfig = {
    limit: parseInt(process.env.RATE_LIMIT_REQUESTS || '60', 10),
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10) * 1000, // Convert to ms
    ...config,
  }

  const clientId = getClientId(request)
  const key = `rate-limit:${clientId}:${request.nextUrl.pathname}`

  const result = rateLimitStore.check(key, rateLimitConfig)

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

    return {
      ...result,
      response: NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      ),
    }
  }

  return result
}

/**
 * Rate limit middleware wrapper
 * Use this to easily add rate limiting to any route handler
 *
 * @example
 * ```ts
 * export const GET = withRateLimit(
 *   async (request: NextRequest) => {
 *     // Your route handler
 *     return NextResponse.json({ data: 'success' })
 *   },
 *   { limit: 10, window: 60000 }
 * )
 * ```
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: Partial<RateLimitConfig>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResult = await rateLimit(request, config)

    if (!rateLimitResult.success) {
      return rateLimitResult.response!
    }

    const response = await handler(request)

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

    return response
  }
}

// Export store for testing/admin purposes
export { rateLimitStore }
