import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { rateLimit, rateLimitStore, getClientId } from '../rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    rateLimitStore.clear()
  })

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

  it('should extract client ID from request headers', () => {
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
})
