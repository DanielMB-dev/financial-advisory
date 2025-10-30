import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('Environment Configuration', () => {
  it('should validate NODE_ENV correctly', () => {
    const envSchema = z.object({
      NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
    })

    const result = envSchema.safeParse({
      NODE_ENV: 'test',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('test')
    }
  })

  it('should validate NEXT_PUBLIC_APP_URL as a valid URL', () => {
    const envSchema = z.object({
      NEXT_PUBLIC_APP_URL: z.string().url(),
    })

    const result = envSchema.safeParse({
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
    }
  })

  it('should reject invalid NODE_ENV values', () => {
    const envSchema = z.object({
      NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
    })

    const result = envSchema.safeParse({
      NODE_ENV: 'invalid',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
  })

  it('should reject invalid URLs', () => {
    const envSchema = z.object({
      NEXT_PUBLIC_APP_URL: z.string().url(),
    })

    const result = envSchema.safeParse({
      NEXT_PUBLIC_APP_URL: 'not-a-url',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
  })

  it('should require all mandatory environment variables', () => {
    const envSchema = z.object({
      NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    })

    // Valid case
    const validResult = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    })
    expect(validResult.success).toBe(true)

    // Invalid case - missing field
    const invalidResult = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
    })
    expect(invalidResult.success).toBe(false)
  })
})
