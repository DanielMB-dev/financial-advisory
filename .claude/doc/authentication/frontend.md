# Authentication Frontend Implementation Plan

**Feature**: Authentication and User Management
**Framework**: Next.js 14+ with App Router
**React Version**: 19.2.0
**Date**: October 30, 2025
**Status**: Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Dependencies to Install](#dependencies-to-install)
3. [Architecture Overview](#architecture-overview)
4. [React Query Setup](#react-query-setup)
5. [Supabase Client Setup](#supabase-client-setup)
6. [Authentication Context](#authentication-context)
7. [Data Layer: Schemas and Services](#data-layer-schemas-and-services)
8. [Query Hooks](#query-hooks)
9. [Mutation Hooks](#mutation-hooks)
10. [Protected Routes Pattern](#protected-routes-pattern)
11. [Form Management](#form-management)
12. [UI Components](#ui-components)
13. [Session Management](#session-management)
14. [OAuth Flow](#oauth-flow)
15. [Profile Completion Flow](#profile-completion-flow)
16. [Error Handling](#error-handling)
17. [Testing Strategy](#testing-strategy)
18. [Important Notes](#important-notes)

---

## Overview

This document provides a complete implementation plan for the authentication feature frontend. The architecture follows the feature-based structure with clear separation between:

- **Data layer**: Services and schemas for API communication and validation
- **Hooks layer**: Query hooks, mutation hooks, and context hooks
- **Components layer**: UI components that consume hooks
- **App layer**: Pages and layouts

**Core Principles:**
- React Query for server state management
- Zod schemas for runtime validation and TypeScript types
- Context API for auth state distribution
- Service layer for API calls
- Custom hooks for business logic
- Pure presentation components

---

## Dependencies to Install

Install the following packages:

```bash
npm install @tanstack/react-query@^5.0.0 \
  @tanstack/react-query-devtools@^5.0.0 \
  @supabase/ssr@latest \
  @supabase/supabase-js@latest \
  react-hook-form@^7.0.0 \
  @hookform/resolvers@^3.0.0 \
  axios@^1.6.0
```

**Why these versions:**
- `@tanstack/react-query@5.x` - Latest stable with React 19 support
- `@supabase/ssr` - Cookie-based session management for Next.js App Router
- `react-hook-form@7.x` - Performant form library with Zod integration
- `axios` - HTTP client for API calls (already have Zod 4.1.12 in package.json)

---

## Architecture Overview

### Directory Structure

```
src/features/authentication/
├── data/
│   ├── schemas/
│   │   ├── auth.schema.ts           # Auth-related Zod schemas
│   │   ├── user.schema.ts           # User profile schemas
│   │   └── index.ts                 # Export all schemas
│   └── services/
│       ├── auth.service.ts          # Auth API calls
│       ├── user.service.ts          # User profile API calls
│       └── index.ts                 # Export all services
├── hooks/
│   ├── queries/
│   │   ├── useSessionQuery.ts       # Session data query
│   │   ├── useUserQuery.ts          # User profile query
│   │   └── index.ts                 # Export all query hooks
│   ├── mutations/
│   │   ├── useLoginMutation.ts      # Login mutation
│   │   ├── useRegisterMutation.ts   # Register mutation
│   │   ├── useLogoutMutation.ts     # Logout mutation
│   │   ├── usePasswordResetMutation.ts
│   │   ├── useUpdatePasswordMutation.ts
│   │   ├── useUpdateProfileMutation.ts
│   │   └── index.ts                 # Export all mutation hooks
│   ├── useAuthContext.tsx           # Auth context hook
│   └── index.ts                     # Export all hooks
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── ProfileForm.tsx
│   ├── ProfileCompletionModal.tsx
│   ├── GoogleAuthButton.tsx
│   ├── ProtectedRoute.tsx
│   └── index.ts
└── index.ts                          # Feature public API

app/
├── (auth)/
│   ├── layout.tsx                   # Auth layout (unauthenticated)
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── register/
│   │   └── page.tsx                 # Register page
│   ├── forgot-password/
│   │   └── page.tsx                 # Forgot password page
│   ├── reset-password/
│   │   └── page.tsx                 # Reset password page
│   └── auth-callback/
│       └── page.tsx                 # OAuth callback handler
├── (dashboard)/
│   ├── layout.tsx                   # Dashboard layout (authenticated)
│   ├── page.tsx                     # Dashboard home
│   └── profile/
│       └── page.tsx                 # User profile page
├── layout.tsx                       # Root layout (with QueryClientProvider)
└── providers.tsx                    # Client-side providers

lib/
├── supabase/
│   ├── client.ts                    # Browser Supabase client
│   ├── server.ts                    # Server Supabase client
│   └── middleware.ts                # Supabase middleware helper
└── query-client.ts                  # React Query client config
```

---

## React Query Setup

### 1. Create Query Client Configuration

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/lib/query-client.ts`

```typescript
import { QueryClient, DefaultOptions } from '@tanstack/react-query'

const queryConfig: DefaultOptions = {
  queries: {
    // Stale time for auth queries - session data doesn't change often
    staleTime: 1000 * 60 * 5, // 5 minutes

    // Retry failed queries
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false
      }
      return failureCount < 3
    },

    // Refetch on window focus for auth data
    refetchOnWindowFocus: true,

    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  },
  mutations: {
    // Retry mutations only on network errors
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false // Don't retry client errors
      }
      return failureCount < 2
    },
  },
}

// Create a function to make a new query client
// This is used in both client and server components
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  })
}

// Browser query client (singleton)
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: use singleton pattern to avoid re-creating on every render
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

// Query keys factory for consistency
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  // Add more query keys as features are added
  // profile: { ... },
  // transactions: { ... },
}
```

**Key Configuration Decisions:**

- **5-minute stale time**: Auth data doesn't change frequently, reduce unnecessary refetches
- **No retry on 401/403**: Authentication errors shouldn't be retried automatically
- **Refetch on window focus**: Important for auth to detect session changes
- **Query key factory**: Centralized query key management for cache invalidation
- **Singleton pattern**: Avoid re-creating QueryClient on every render in browser

### 2. Create Providers Component

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/app/providers.tsx`

```typescript
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, ReactNode } from 'react'
import { getQueryClient } from '@/lib/query-client'
import { AuthProvider } from '@/src/features/authentication/hooks/useAuthContext'
import { isDev } from '@/lib/env'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create query client on mount to ensure it's only created once per page load
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
```

**Why this structure:**
- `'use client'` directive: Required for React Query in App Router
- `useState` for client: Ensures QueryClient is created only once
- `AuthProvider` nested: Auth context needs access to QueryClient
- `ReactQueryDevtools`: Only in development for debugging

### 3. Update Root Layout

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Financial Advisor - Manage Your Finances',
  description: 'Personal financial management and advisory platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

## Supabase Client Setup

### 1. Browser Client

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

// Create browser Supabase client
// This is used in client components
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

### 2. Server Client

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

// Create server Supabase client
// This is used in server components and API routes
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### 3. Middleware Helper

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/dashboard', '/profile', '/transactions', '/reports']
  const authPaths = ['/login', '/register', '/forgot-password']
  const pathname = request.nextUrl.pathname

  // Redirect to login if accessing protected route without session
  if (!user && protectedPaths.some((path) => pathname.startsWith(path))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth pages with active session
  if (user && authPaths.some((path) => pathname.startsWith(path))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
```

### 4. Update Middleware

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/middleware.ts`

Update the existing middleware to integrate Supabase session management:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

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

  // Update Supabase session (handles auth redirects)
  const supabaseResponse = await updateSession(request)

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

  // Log requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Data Layer: Schemas and Services

### Zod Schemas

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/data/schemas/auth.schema.ts`

```typescript
import { z } from 'zod'

// Password validation rules
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Email validation
const emailSchema = z.string().email('Invalid email address')

// Login Request
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

// Register Request
export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterRequest = z.infer<typeof registerRequestSchema>

// Password Reset Request
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>

// Update Password Request
export const updatePasswordRequestSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type UpdatePasswordRequest = z.infer<typeof updatePasswordRequestSchema>

// Session Response
export const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
  expiresIn: z.number(),
  tokenType: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    emailConfirmedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
})

export type Session = z.infer<typeof sessionSchema>

// Auth Response
export const authResponseSchema = z.object({
  session: sessionSchema.nullable(),
  user: sessionSchema.shape.user.nullable(),
})

export type AuthResponse = z.infer<typeof authResponseSchema>
```

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/data/schemas/user.schema.ts`

```typescript
import { z } from 'zod'

// User Profile Schema
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type UserProfile = z.infer<typeof userProfileSchema>

// Update Profile Request
export const updateProfileRequestSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
})

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

// Profile Completion Request (for first-time users)
export const profileCompletionSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
})

export type ProfileCompletion = z.infer<typeof profileCompletionSchema>
```

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/data/schemas/index.ts`

```typescript
export * from './auth.schema'
export * from './user.schema'
```

### Service Layer

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/data/services/auth.service.ts`

```typescript
import { createClient } from '@/lib/supabase/client'
import type {
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  UpdatePasswordRequest,
  AuthResponse,
  Session,
} from '../schemas'

const supabase = createClient()

/**
 * Auth Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      session: authData.session,
      user: authData.user,
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth-callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      session: authData.session,
      user: authData.user,
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  },

  /**
   * Request password reset email
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  /**
   * Update password with reset token
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },

  /**
   * Refresh session
   */
  async refreshSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth-callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  },
}
```

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/data/services/user.service.ts`

```typescript
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UpdateProfileRequest } from '../schemas'

const supabase = createClient()

/**
 * User Service
 * Handles user profile-related API calls
 */
export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Profile might not exist yet (new user)
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }
  },

  /**
   * Create user profile (for new users)
   */
  async createProfile(userId: string, email: string, fullName?: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || null,
        avatar_url: null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },
}
```

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/data/services/index.ts`

```typescript
export * from './auth.service'
export * from './user.service'
```

---

## Query Hooks

### Session Query Hook

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/queries/useSessionQuery.ts`

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { authService } from '../../data/services'
import type { Session } from '../../data/schemas'

/**
 * Hook to fetch current session
 *
 * @returns Query result with session data
 *
 * @example
 * ```tsx
 * const { data: session, isLoading } = useSessionQuery()
 *
 * if (isLoading) return <Spinner />
 * if (!session) return <LoginPrompt />
 *
 * return <Dashboard session={session} />
 * ```
 */
export function useSessionQuery(): UseQueryResult<Session | null, Error> {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => authService.getSession(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry session fetch
  })
}
```

### User Profile Query Hook

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/queries/useUserQuery.ts`

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { userService } from '../../data/services'
import type { UserProfile } from '../../data/schemas'

/**
 * Hook to fetch user profile
 *
 * @returns Query result with user profile data
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading } = useUserQuery()
 *
 * if (isLoading) return <Skeleton />
 * if (!profile) return <CompleteProfile />
 *
 * return <ProfileCard profile={profile} />
 * ```
 */
export function useUserQuery(): UseQueryResult<UserProfile | null, Error> {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => userService.getProfile(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  })
}
```

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/queries/index.ts`

```typescript
export * from './useSessionQuery'
export * from './useUserQuery'
```

---

## Mutation Hooks

### Login Mutation

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/useLoginMutation.ts`

```typescript
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { queryKeys } from '@/lib/query-client'
import { authService } from '../../data/services'
import type { LoginRequest, AuthResponse } from '../../data/schemas'

interface UseLoginMutationReturn {
  login: UseMutationResult<AuthResponse, Error, LoginRequest>['mutate']
  loginAsync: UseMutationResult<AuthResponse, Error, LoginRequest>['mutateAsync']
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Hook to handle user login
 *
 * @returns Mutation object with login function
 *
 * @example
 * ```tsx
 * const { login, isLoading, error } = useLoginMutation()
 *
 * const handleSubmit = (data: LoginRequest) => {
 *   login(data, {
 *     onSuccess: () => {
 *       router.push('/dashboard')
 *     },
 *   })
 * }
 * ```
 */
export function useLoginMutation(): UseLoginMutationReturn {
  const queryClient = useQueryClient()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      // Invalidate and refetch session/user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })

      // Set session data in cache
      queryClient.setQueryData(queryKeys.auth.session(), data.session)

      // Redirect handled by parent component or callback
    },
  })

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
```

### Register Mutation

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/useRegisterMutation.ts`

```typescript
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { authService } from '../../data/services'
import type { RegisterRequest, AuthResponse } from '../../data/schemas'

interface UseRegisterMutationReturn {
  register: UseMutationResult<AuthResponse, Error, RegisterRequest>['mutate']
  registerAsync: UseMutationResult<AuthResponse, Error, RegisterRequest>['mutateAsync']
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Hook to handle user registration
 *
 * @returns Mutation object with register function
 *
 * @example
 * ```tsx
 * const { register, isLoading, error } = useRegisterMutation()
 *
 * const handleSubmit = (data: RegisterRequest) => {
 *   register(data, {
 *     onSuccess: () => {
 *       // Show email verification message
 *     },
 *   })
 * }
 * ```
 */
export function useRegisterMutation(): UseRegisterMutationReturn {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })

      // Set session if auto-confirmed
      if (data.session) {
        queryClient.setQueryData(queryKeys.auth.session(), data.session)
      }
    },
  })

  return {
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
```

### Logout Mutation

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/useLogoutMutation.ts`

```typescript
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { queryKeys } from '@/lib/query-client'
import { authService } from '../../data/services'

interface UseLogoutMutationReturn {
  logout: UseMutationResult<void, Error, void>['mutate']
  logoutAsync: UseMutationResult<void, Error, void>['mutateAsync']
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Hook to handle user logout
 *
 * @returns Mutation object with logout function
 *
 * @example
 * ```tsx
 * const { logout, isLoading } = useLogoutMutation()
 *
 * const handleLogout = () => {
 *   logout()
 * }
 * ```
 */
export function useLogoutMutation(): UseLogoutMutationReturn {
  const queryClient = useQueryClient()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })

      // Clear entire cache to remove user data
      queryClient.clear()

      // Redirect to login
      router.push('/login')
    },
  })

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
```

### Password Reset Mutation

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/usePasswordResetMutation.ts`

```typescript
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { authService } from '../../data/services'
import type { PasswordResetRequest } from '../../data/schemas'

interface UsePasswordResetMutationReturn {
  requestReset: UseMutationResult<void, Error, PasswordResetRequest>['mutate']
  requestResetAsync: UseMutationResult<void, Error, PasswordResetRequest>['mutateAsync']
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Hook to request password reset
 *
 * @returns Mutation object with requestReset function
 *
 * @example
 * ```tsx
 * const { requestReset, isLoading, isSuccess } = usePasswordResetMutation()
 *
 * const handleSubmit = (data: PasswordResetRequest) => {
 *   requestReset(data)
 * }
 *
 * if (isSuccess) {
 *   return <Message>Check your email for reset link</Message>
 * }
 * ```
 */
export function usePasswordResetMutation(): UsePasswordResetMutationReturn {
  const mutation = useMutation({
    mutationFn: (data: PasswordResetRequest) => authService.requestPasswordReset(data),
  })

  return {
    requestReset: mutation.mutate,
    requestResetAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
```

### Update Password Mutation

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/useUpdatePasswordMutation.ts`

```typescript
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '../../data/services'
import type { UpdatePasswordRequest } from '../../data/schemas'

interface UseUpdatePasswordMutationReturn {
  updatePassword: UseMutationResult<void, Error, UpdatePasswordRequest>['mutate']
  updatePasswordAsync: UseMutationResult<void, Error, UpdatePasswordRequest>['mutateAsync']
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Hook to update password with reset token
 *
 * @returns Mutation object with updatePassword function
 *
 * @example
 * ```tsx
 * const { updatePassword, isLoading, isSuccess } = useUpdatePasswordMutation()
 *
 * const handleSubmit = (data: UpdatePasswordRequest) => {
 *   updatePassword(data, {
 *     onSuccess: () => {
 *       router.push('/login')
 *     },
 *   })
 * }
 * ```
 */
export function useUpdatePasswordMutation(): UseUpdatePasswordMutationReturn {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: UpdatePasswordRequest) => authService.updatePassword(data),
    onSuccess: () => {
      // Redirect to login after successful password update
      router.push('/login?message=password-updated')
    },
  })

  return {
    updatePassword: mutation.mutate,
    updatePasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
```

### Update Profile Mutation

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/useUpdateProfileMutation.ts`

```typescript
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { userService } from '../../data/services'
import type { UpdateProfileRequest, UserProfile } from '../../data/schemas'

interface UseUpdateProfileMutationReturn {
  updateProfile: UseMutationResult<UserProfile, Error, UpdateProfileRequest>['mutate']
  updateProfileAsync: UseMutationResult<UserProfile, Error, UpdateProfileRequest>['mutateAsync']
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Hook to update user profile
 *
 * @returns Mutation object with updateProfile function
 *
 * @example
 * ```tsx
 * const { updateProfile, isLoading } = useUpdateProfileMutation()
 *
 * const handleSubmit = (data: UpdateProfileRequest) => {
 *   updateProfile(data, {
 *     onSuccess: (updatedProfile) => {
 *       toast.success('Profile updated')
 *     },
 *   })
 * }
 * ```
 */
export function useUpdateProfileMutation(): UseUpdateProfileMutationReturn {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update user query cache with new profile
      queryClient.setQueryData(queryKeys.auth.user(), updatedProfile)
    },
  })

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
```

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/index.ts`

```typescript
export * from './useLoginMutation'
export * from './useRegisterMutation'
export * from './useLogoutMutation'
export * from './usePasswordResetMutation'
export * from './useUpdatePasswordMutation'
export * from './useUpdateProfileMutation'
```

---

## Authentication Context

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/useAuthContext.tsx`

```typescript
'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { useSessionQuery } from './queries/useSessionQuery'
import { useUserQuery } from './queries/useUserQuery'
import type { Session, UserProfile } from '../data/schemas'

interface AuthContextValue {
  // State
  session: Session | null | undefined
  user: UserProfile | null | undefined
  isLoading: boolean
  isAuthenticated: boolean

  // Helper methods
  requireAuth: () => boolean
  checkEmailVerified: () => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Auth Provider Component
 * Provides authentication state and operations to the entire app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch session and user
  const { data: session, isLoading: sessionLoading } = useSessionQuery()
  const { data: user, isLoading: userLoading } = useUserQuery()

  const isLoading = sessionLoading || userLoading
  const isAuthenticated = !!session && !!user

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Invalidate queries when auth state changes
      if (event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
      }

      if (event === 'SIGNED_OUT') {
        queryClient.clear()
        router.push('/login')
      }

      if (event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
      }

      if (event === 'USER_UPDATED') {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, queryClient, router])

  /**
   * Require authentication - redirect to login if not authenticated
   */
  const requireAuth = (): boolean => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return false
    }
    return isAuthenticated
  }

  /**
   * Check if user's email is verified
   */
  const checkEmailVerified = (): boolean => {
    return !!session?.user?.emailConfirmedAt
  }

  const value: AuthContextValue = {
    session,
    user,
    isLoading,
    isAuthenticated,
    requireAuth,
    checkEmailVerified,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 *
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useAuth()
 *
 * if (isLoading) return <Spinner />
 * if (!isAuthenticated) return <LoginPrompt />
 *
 * return <Welcome user={user} />
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
```

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/index.ts`

```typescript
export * from './useAuthContext'
export * from './queries'
export * from './mutations'
```

---

## Protected Routes Pattern

### Protected Route Component

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/ProtectedRoute.tsx`

```typescript
'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireEmailVerification?: boolean
  redirectTo?: string
  loadingComponent?: ReactNode
}

/**
 * Protected Route Component
 * Wraps content that requires authentication
 *
 * @example
 * ```tsx
 * <ProtectedRoute requireEmailVerification>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requireEmailVerification = false,
  redirectTo = '/login',
  loadingComponent = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkEmailVerified } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
      } else if (requireEmailVerification && !checkEmailVerified()) {
        router.push('/verify-email')
      }
    }
  }, [isAuthenticated, isLoading, requireEmailVerification, checkEmailVerified, router, redirectTo])

  if (isLoading) {
    return <>{loadingComponent}</>
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireEmailVerification && !checkEmailVerified()) {
    return null
  }

  return <>{children}</>
}
```

### Dashboard Layout with Protection

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/app/(dashboard)/layout.tsx`

```typescript
import { ProtectedRoute } from '@/src/features/authentication/components/ProtectedRoute'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Sidebar, Header, etc. */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
```

---

## Form Management

### Login Form Example

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/LoginForm.tsx`

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginRequestSchema, type LoginRequest } from '../data/schemas'
import { useLoginMutation } from '../hooks/mutations'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const { login, isLoading, error } = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  })

  const onSubmit = (data: LoginRequest) => {
    login(data, {
      onSuccess: () => {
        router.push(redirectTo)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

**Pattern for all forms:**
1. Use `react-hook-form` with `zodResolver`
2. Import schema from `data/schemas`
3. Use mutation hook from `hooks/mutations`
4. Handle loading, error, and success states
5. Display validation errors from schema
6. Display API errors from mutation

---

## Session Management

Session management is handled automatically by:

1. **Supabase Client**: Manages token storage and refresh
2. **Middleware**: Updates session on every request
3. **React Query**: Caches session data
4. **Auth Context**: Listens to auth state changes

**Token Refresh Strategy:**
- Supabase automatically refreshes tokens before expiry
- Middleware updates cookies on every request
- `TOKEN_REFRESHED` event invalidates React Query cache
- No manual refresh needed in most cases

**Session Expiration:**
- Configured in Supabase dashboard (default 7 days)
- Multiple sessions allowed per user
- Middleware redirects to login on expired session

---

## OAuth Flow

### Google OAuth Button

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/GoogleAuthButton.tsx`

```typescript
'use client'

import { useState } from 'react'
import { authService } from '../data/services'

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await authService.loginWithGoogle()
      // Redirect happens automatically via Supabase
    } catch (error) {
      console.error('Google login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {isLoading ? 'Connecting...' : 'Continue with Google'}
    </button>
  )
}
```

### OAuth Callback Handler

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/app/(auth)/auth-callback/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase handles the code exchange automatically
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!profile) {
          // New user - redirect to profile completion
          router.push('/complete-profile')
        } else {
          // Existing user - redirect to dashboard
          router.push('/dashboard')
        }
      } else {
        // No session - redirect to login
        router.push('/login?error=auth-failed')
      }
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Completing authentication...</p>
    </div>
  )
}
```

**OAuth Flow:**
1. User clicks "Continue with Google"
2. `loginWithGoogle()` initiates OAuth flow
3. User authenticates on Google
4. Google redirects to `/auth-callback`
5. Supabase exchanges code for session
6. Check if profile exists
7. Redirect to profile completion or dashboard

---

## Profile Completion Flow

### Profile Completion Modal

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/ProfileCompletionModal.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileCompletionSchema, type ProfileCompletion } from '../data/schemas'
import { useAuth } from '../hooks/useAuthContext'
import { userService } from '../data/services'
import { useRouter } from 'next/navigation'

interface ProfileCompletionModalProps {
  onComplete?: () => void
  allowSkip?: boolean
}

export function ProfileCompletionModal({
  onComplete,
  allowSkip = false,
}: ProfileCompletionModalProps) {
  const { session } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileCompletion>({
    resolver: zodResolver(profileCompletionSchema),
  })

  const onSubmit = async (data: ProfileCompletion) => {
    if (!session?.user) return

    try {
      setIsLoading(true)
      await userService.createProfile(session.user.id, session.user.email, data.fullName)
      onComplete?.()
      router.push('/dashboard')
    } catch (error) {
      console.error('Profile completion error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    onComplete?.()
    router.push('/dashboard')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Complete Your Profile</h2>
        <p className="mb-6 text-gray-600">
          Help us personalize your experience by completing your profile.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              {...register('fullName')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            {allowSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                disabled={isLoading}
              >
                Skip for now
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**When to Show Profile Completion:**
- After OAuth registration (no profile exists)
- After email registration if auto-confirm is enabled
- As a dismissible modal in dashboard if profile incomplete
- Can be skipped or required based on `allowSkip` prop

---

## Error Handling

### Error Display Pattern

Create reusable error components:

```typescript
// components/ErrorMessage.tsx
export function ErrorMessage({ error }: { error: Error | null }) {
  if (!error) return null

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Error Handling Strategy:**
1. **Validation Errors**: Caught by Zod schemas, displayed inline
2. **API Errors**: Caught by mutation hooks, displayed in form
3. **Network Errors**: Handled by React Query retry logic
4. **Auth Errors**: Handled by middleware and auth context

---

## Testing Strategy

### Unit Tests

Test each layer independently:

**Schema Tests:**
```typescript
// data/schemas/__tests__/auth.schema.test.ts
import { describe, it, expect } from 'vitest'
import { loginRequestSchema } from '../auth.schema'

describe('loginRequestSchema', () => {
  it('validates correct login data', () => {
    const result = loginRequestSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginRequestSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })
})
```

**Hook Tests:**
```typescript
// hooks/__tests__/useLoginMutation.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useLoginMutation } from '../mutations/useLoginMutation'
import { getQueryClient } from '@/lib/query-client'

describe('useLoginMutation', () => {
  it('calls login service on mutation', async () => {
    const queryClient = getQueryClient()
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useLoginMutation(), { wrapper })

    result.current.login({
      email: 'test@example.com',
      password: 'password',
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})
```

### Integration Tests

Test form submission flows:

```typescript
// components/__tests__/LoginForm.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '../LoginForm'

describe('LoginForm', () => {
  it('displays validation errors', async () => {
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
  })
})
```

---

## Important Notes

### 1. React Query Devtools

**Enable in development:**
- Devtools are conditionally rendered in `Providers`
- Access via floating icon in bottom-left
- Inspect queries, mutations, cache state
- Debug stale/fresh data issues

### 2. Cache Invalidation

**When to invalidate:**
- After login: Invalidate `session` and `user`
- After logout: Clear entire cache
- After profile update: Update `user` cache
- On auth state change: Invalidate relevant queries

**How to invalidate:**
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
queryClient.clear() // Clear everything
```

### 3. Query Key Consistency

**Always use query key factory:**
```typescript
// ❌ BAD
useQuery({ queryKey: ['auth', 'session'] })

// ✅ GOOD
useQuery({ queryKey: queryKeys.auth.session() })
```

This ensures cache invalidation works correctly.

### 4. Form Validation

**Two-level validation:**
1. **Client-side**: Zod schema via `zodResolver`
2. **Server-side**: API endpoint validation

Always display both validation errors and API errors.

### 5. Loading States

**Handle loading states properly:**
```typescript
const { data, isLoading, isFetching } = useQuery(...)

// Initial load
if (isLoading) return <Skeleton />

// Background refetch
if (isFetching) return <Spinner position="top-right" />

// Success
return <Content data={data} />
```

### 6. Error Boundaries

Consider adding error boundaries for auth components:
```typescript
// components/AuthErrorBoundary.tsx
export class AuthErrorBoundary extends Component {
  // Handle auth errors gracefully
}
```

### 7. Optimistic Updates

For profile updates, use optimistic updates:
```typescript
useMutation({
  mutationFn: updateProfile,
  onMutate: async (newProfile) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: queryKeys.auth.user() })

    // Snapshot previous value
    const previousProfile = queryClient.getQueryData(queryKeys.auth.user())

    // Optimistically update
    queryClient.setQueryData(queryKeys.auth.user(), newProfile)

    return { previousProfile }
  },
  onError: (err, newProfile, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.auth.user(), context.previousProfile)
  },
  onSettled: () => {
    // Refetch after success or error
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
  },
})
```

### 8. Supabase RLS Policies

**IMPORTANT**: Backend must create these RLS policies:

```sql
-- Profiles table policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

Without these, API calls will fail even with valid auth.

### 9. Environment Variables

**Required in `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 10. Color Usage

**Use colors defined in `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/app/globals.css`:**

Current colors:
- `--background`: Background color
- `--foreground`: Text color

For auth components, use Tailwind classes that reference these CSS variables:
```tsx
className="bg-background text-foreground"
```

Additional colors should be added to `globals.css` following the same pattern.

---

## Next Steps for Backend Team

Before frontend implementation can proceed, backend needs to:

1. **Create API Routes** (if not using Supabase directly):
   - Implement endpoints listed in session context
   - Handle Supabase Auth integration server-side
   - Set up proper error responses

2. **Database Setup**:
   - Create `profiles` table migration
   - Set up RLS policies
   - Create trigger for profile creation on user signup

3. **Supabase Configuration**:
   - Enable email auth
   - Configure OAuth providers (Google)
   - Customize email templates
   - Set up redirect URLs

4. **Test Accounts**:
   - Create test users for development
   - Document test credentials

---

## Summary

This implementation plan provides:

1. **Complete React Query setup** with optimized configuration
2. **Supabase client setup** for browser, server, and middleware
3. **Feature-based architecture** with clear separation of concerns
4. **Type-safe schemas** with Zod for validation
5. **Reusable hooks** for queries and mutations
6. **Auth context** for global state management
7. **Protected route pattern** for authentication
8. **Form management** with react-hook-form
9. **OAuth flow** for Google authentication
10. **Profile completion** for new users
11. **Error handling** strategy
12. **Testing patterns** for all layers

**Key Principles:**
- Server state in React Query
- Validation with Zod schemas
- Business logic in hooks
- Presentation in components
- Type safety everywhere

**Ready for Implementation:**
All patterns are documented with complete code examples. Frontend team can start implementing immediately after backend sets up Supabase and database.

---

**Document Version**: 1.0
**Last Updated**: October 30, 2025
**Status**: Ready for Implementation
