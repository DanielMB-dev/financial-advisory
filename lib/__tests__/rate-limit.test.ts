import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, rateLimitStore, getClientId, withRateLimit } from '../rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    rateLimitStore.clear()
  })

  describe('Basic Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      const result = await rateLimit(request, {
        limit: 5,
        window: 60000,
      })

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should block requests exceeding rate limit', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const config = { limit: 2, window: 60000 }

      // Make requests up to the limit
      await rateLimit(request, config)
      await rateLimit(request, config)

      // This should be blocked
      const result = await rateLimit(request, config)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.response).toBeDefined()
      expect(result.response?.status).toBe(429)
    })

    it('should reset rate limit after window expires', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const config = { limit: 2, window: 100 } // 100ms window

      // Use up the limit
      await rateLimit(request, config)
      await rateLimit(request, config)

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Should be allowed again
      const result = await rateLimit(request, config)
      expect(result.success).toBe(true)
    })

    it('should track remaining requests correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const config = { limit: 5, window: 60000 }

      const result1 = await rateLimit(request, config)
      expect(result1.remaining).toBe(4)

      const result2 = await rateLimit(request, config)
      expect(result2.remaining).toBe(3)

      const result3 = await rateLimit(request, config)
      expect(result3.remaining).toBe(2)
    })
  })

  describe('Client Identification', () => {
    it('should extract client ID from x-forwarded-for header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      })

      const clientId = getClientId(request)
      expect(clientId).toBe('192.168.1.1')
    })

    it('should handle multiple IPs in x-forwarded-for', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      })

      const clientId = getClientId(request)
      expect(clientId).toBe('192.168.1.1')
    })

    it('should use x-real-ip header if x-forwarded-for is not present', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-real-ip': '10.0.0.5',
        },
      })

      const clientId = getClientId(request)
      expect(clientId).toBe('10.0.0.5')
    })

    it('should fallback to "unknown" if no IP headers present', () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      const clientId = getClientId(request)
      expect(clientId).toBe('unknown')
    })
  })

  describe('Rate Limit Store', () => {
    it('should reset rate limit for a specific key', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const config = { limit: 2, window: 60000 }

      // Use up the limit
      await rateLimit(request, config)
      await rateLimit(request, config)

      // Verify blocked
      const blockedResult = await rateLimit(request, config)
      expect(blockedResult.success).toBe(false)

      // Reset the rate limit
      const clientId = getClientId(request)
      const key = `rate-limit:${clientId}:${request.nextUrl.pathname}`
      rateLimitStore.reset(key)

      // Should be allowed again
      const allowedResult = await rateLimit(request, config)
      expect(allowedResult.success).toBe(true)
    })

    it('should get current state for a key', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const config = { limit: 5, window: 60000 }

      // Make one request
      await rateLimit(request, config)

      const clientId = getClientId(request)
      const key = `rate-limit:${clientId}:${request.nextUrl.pathname}`
      const state = rateLimitStore.get(key)

      expect(state).toBeDefined()
      expect(state?.count).toBe(1)
      expect(state?.resetTime).toBeGreaterThan(Date.now())
    })

    it('should clear all rate limits', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/test1')
      const request2 = new NextRequest('http://localhost:3000/api/test2')

      // Make requests
      await rateLimit(request1)
      await rateLimit(request2)

      // Clear all
      rateLimitStore.clear()

      // Get states should be undefined
      const clientId = getClientId(request1)
      const key1 = `rate-limit:${clientId}:${request1.nextUrl.pathname}`
      const key2 = `rate-limit:${clientId}:${request2.nextUrl.pathname}`

      expect(rateLimitStore.get(key1)).toBeUndefined()
      expect(rateLimitStore.get(key2)).toBeUndefined()
    })
  })

  describe('withRateLimit Wrapper', () => {
    it('should allow requests within rate limit using wrapper', async () => {
      const handler = withRateLimit(
        async (_request: NextRequest) => {
          return NextResponse.json({ success: true })
        },
        { limit: 5, window: 60000 }
      )

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await handler(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)

      // Check rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined()
    })

    it('should block requests exceeding rate limit using wrapper', async () => {
      const handler = withRateLimit(
        async (_request: NextRequest) => {
          return NextResponse.json({ success: true })
        },
        { limit: 2, window: 60000 }
      )

      const request = new NextRequest('http://localhost:3000/api/test')

      // Make requests up to the limit
      await handler(request)
      await handler(request)

      // This should be blocked
      const response = await handler(request)

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data.error).toBe('Too Many Requests')
      expect(data.retryAfter).toBeDefined()
    })

    it('should add rate limit headers to successful responses', async () => {
      const handler = withRateLimit(
        async (_request: NextRequest) => {
          return NextResponse.json({ data: 'test' })
        },
        { limit: 10, window: 60000 }
      )

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await handler(request)

      expect(response.headers.has('X-RateLimit-Limit')).toBe(true)
      expect(response.headers.has('X-RateLimit-Remaining')).toBe(true)
      expect(response.headers.has('X-RateLimit-Reset')).toBe(true)
    })
  })

  describe('Environment Configuration', () => {
    it('should use default rate limit config from environment', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      // Test with default config (should use env vars or defaults)
      const result = await rateLimit(request)

      expect(result.success).toBe(true)
      expect(result.limit).toBeGreaterThan(0)
    })

    it('should allow custom config to override defaults', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      const result = await rateLimit(request, {
        limit: 100,
        window: 120000,
      })

      expect(result.success).toBe(true)
      expect(result.limit).toBe(100)
    })
  })

  describe('Error Response Format', () => {
    it('should return proper error response format', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const config = { limit: 1, window: 60000 }

      // Use up the limit
      await rateLimit(request, config)

      // Get blocked response
      const result = await rateLimit(request, config)

      expect(result.response).toBeDefined()
      const data = await result.response!.json()

      expect(data.error).toBe('Too Many Requests')
      expect(data.message).toContain('rate limit')
      expect(data.retryAfter).toBeGreaterThan(0)
    })

    it('should include retry-after header in blocked response', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const config = { limit: 1, window: 60000 }

      await rateLimit(request, config)
      const result = await rateLimit(request, config)

      expect(result.response).toBeDefined()
      expect(result.response!.headers.has('Retry-After')).toBe(true)
      expect(result.response!.headers.has('X-RateLimit-Limit')).toBe(true)
      expect(result.response!.headers.has('X-RateLimit-Remaining')).toBe(true)
      expect(result.response!.headers.has('X-RateLimit-Reset')).toBe(true)
    })
  })
})
