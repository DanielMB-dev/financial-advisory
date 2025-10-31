import { z } from 'zod'

/**
 * Environment Variable Schema
 * Validates all required environment variables at build time
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),

  // Supabase (Public - can be exposed to browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Supabase (Private - server-side only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Sentry (Public)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // Sentry (Private - CI/CD only)
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  NEXT_PUBLIC_DEBUG_MODE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // Security
  JWT_SECRET: z.string().min(32).optional(),
  ALLOWED_ORIGINS: z.string().optional(),
})

/**
 * Validated environment variables
 * Throws error if validation fails
 */
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENABLED: process.env.NEXT_PUBLIC_SENTRY_ENABLED,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
  JWT_SECRET: process.env.JWT_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
})

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>

/**
 * Helper to check if running in production
 */
export const isProd = env.NODE_ENV === 'production'

/**
 * Helper to check if running in development
 */
export const isDev = env.NODE_ENV === 'development'

/**
 * Helper to check if running in staging
 */
export const isStaging = env.NODE_ENV === 'staging'
