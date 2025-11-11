# Authentication Frontend Implementation Plan

**Date**: 2025-11-10
**Status**: Ready for Implementation
**Objective**: Complete frontend implementation following react-hook-form + React Query architecture

---

## Executive Summary

This plan provides **COMPLETE implementation details** for the authentication frontend refactor. The current implementation uses server actions, lacks critical UX features (confirmPassword, password toggle, live validation), and deviates from the architectural specifications.

**Critical Issues to Fix:**
1. ❌ RegisterForm missing `confirmPassword` field (AC1 requirement)
2. ❌ No password visibility toggle (eye icon)
3. ❌ No live password requirements indicator
4. ❌ Forms use server actions instead of react-hook-form + React Query
5. ❌ Missing proper form validation with inline error messages
6. ❌ Missing hooks: `useUserQuery`, `usePasswordResetMutation`, `useUpdatePasswordMutation`
7. ❌ Missing components: `PasswordInput`, `PasswordRequirements`, `GoogleAuthButton`

**Approach**: Path A - Update implementation to match specifications (3 hours estimated)

---

## Architecture Overview

### Feature-Based Architecture Layers

```
src/features/authentication/
├── data/                           # ✅ EXISTS - Data layer
│   ├── schemas/                    # ✅ Zod schemas (already correct!)
│   │   ├── auth.schema.ts          # Has registerRequestSchema WITH confirmPassword
│   │   ├── user.schema.ts
│   │   └── index.ts
│   └── services/                   # ✅ Services (already correct!)
│       ├── auth.service.ts         # Supabase auth methods
│       ├── user.service.ts
│       └── index.ts
│
├── hooks/                          # ⚠️ INCOMPLETE - Hooks layer
│   ├── queries/
│   │   ├── useSessionQuery.ts      # ✅ EXISTS
│   │   ├── useUserQuery.ts         # ❌ MISSING - NEED TO CREATE
│   │   └── index.ts
│   ├── mutations/
│   │   ├── useRegisterMutation.ts  # ✅ EXISTS (but needs update)
│   │   ├── useLoginMutation.ts     # ✅ EXISTS
│   │   ├── useLogoutMutation.ts    # ✅ EXISTS
│   │   ├── useUpdateProfileMutation.ts # ✅ EXISTS
│   │   ├── usePasswordResetMutation.ts    # ❌ MISSING - NEED TO CREATE
│   │   ├── useUpdatePasswordMutation.ts   # ❌ MISSING - NEED TO CREATE
│   │   └── index.ts
│   ├── context/
│   │   └── AuthContext.tsx         # ✅ EXISTS
│   └── index.ts
│
└── components/                     # ⚠️ NEEDS REFACTORING
    ├── RegisterForm.tsx            # ❌ BROKEN - Uses server actions, missing confirmPassword
    ├── LoginForm.tsx               # ❌ BROKEN - Missing password toggle
    ├── PasswordInput.tsx           # ❌ MISSING - NEED TO CREATE
    ├── PasswordRequirements.tsx    # ❌ MISSING - NEED TO CREATE
    ├── GoogleAuthButton.tsx        # ❌ MISSING - NEED TO CREATE
    └── index.ts
```

---

## Current State Analysis

### What Works ✅

#### Data Layer (COMPLETE)
- **Schemas** (`data/schemas/auth.schema.ts`):
  ```typescript
  // Already has confirmPassword!
  export const registerRequestSchema = z
    .object({
      email: emailValidator,
      password: passwordValidator,
      confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    })
  ```

- **Services** (`data/services/auth.service.ts`):
  - `login()`, `register()`, `logout()`
  - `requestPasswordReset()`, `updatePassword()`
  - `getSession()`, `refreshSession()`
  - `loginWithGoogle()`

#### Hooks Layer (PARTIAL)
- ✅ `useSessionQuery.ts` - Fetch current session
- ✅ `useRegisterMutation.ts` - Register user
- ✅ `useLoginMutation.ts` - Login user
- ✅ `useLogoutMutation.ts` - Logout user
- ✅ `useUpdateProfileMutation.ts` - Update profile
- ✅ `AuthContext.tsx` - Auth state context

### What's Broken ❌

#### Missing Hooks
1. **`useUserQuery.ts`** - Fetch user profile
2. **`usePasswordResetMutation.ts`** - Request password reset
3. **`useUpdatePasswordMutation.ts`** - Update password with token

#### Broken Components
1. **`RegisterForm.tsx`** - Uses server actions, missing confirmPassword
2. **`LoginForm.tsx`** - Missing password toggle

#### Missing Components
1. **`PasswordInput.tsx`** - Password input with visibility toggle
2. **`PasswordRequirements.tsx`** - Live password validation indicator
3. **`GoogleAuthButton.tsx`** - Reusable Google OAuth button

---

## Implementation Plan

### Phase 1: Create Missing Hooks (30 minutes)

#### 1.1 Create `useUserQuery.ts`

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/queries/useUserQuery.ts`

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { userService } from '../../data/services'
import type { UserProfile } from '../../data/schemas'

/**
 * Hook to fetch user profile
 * Uses React Query for caching and automatic refetching
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

**Dependencies**:
- Service: `userService.getProfile()` should exist in `user.service.ts`
- Query key: Already defined in `/lib/query-client.ts` as `queryKeys.auth.user()`

#### 1.2 Create `usePasswordResetMutation.ts`

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/usePasswordResetMutation.ts`

```typescript
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
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
 * Sends reset email via Supabase
 */
export function usePasswordResetMutation(): UsePasswordResetMutationReturn {
  const mutation = useMutation({
    mutationFn: (data: PasswordResetRequest) => authService.requestPasswordReset(data),
    onSuccess: () => {
      toast.success('Password reset email sent', {
        description: 'Please check your email for the reset link.',
        duration: 5000,
      })
    },
    onError: (error) => {
      toast.error('Failed to send reset email', {
        description: error.message || 'Please try again later.',
      })
    },
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

**Dependencies**:
- Service: `authService.requestPasswordReset()` already exists in `auth.service.ts`
- Schema: `PasswordResetRequest` already exists in `auth.schema.ts`

#### 1.3 Create `useUpdatePasswordMutation.ts`

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/useUpdatePasswordMutation.ts`

```typescript
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
 * Redirects to login on success
 */
export function useUpdatePasswordMutation(): UseUpdatePasswordMutationReturn {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: UpdatePasswordRequest) => authService.updatePassword(data),
    onSuccess: () => {
      toast.success('Password updated successfully', {
        description: 'You can now log in with your new password.',
        duration: 5000,
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?message=password-updated')
      }, 2000)
    },
    onError: (error) => {
      toast.error('Failed to update password', {
        description: error.message || 'Please try again or request a new reset link.',
      })
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

**Dependencies**:
- Service: `authService.updatePassword()` already exists in `auth.service.ts`
- Schema: `UpdatePasswordRequest` already exists in `auth.schema.ts`

#### 1.4 Update Index Files

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/queries/index.ts`

```typescript
export * from './useSessionQuery'
export * from './useUserQuery'  // ADD THIS
```

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/index.ts`

```typescript
export * from './useLoginMutation'
export * from './useLogoutMutation'
export * from './useRegisterMutation'
export * from './useUpdateProfileMutation'
export * from './usePasswordResetMutation'    // ADD THIS
export * from './useUpdatePasswordMutation'  // ADD THIS
```

---

### Phase 2: Create Reusable Components (1 hour)

#### 2.1 Create `PasswordInput.tsx`

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/PasswordInput.tsx`

```typescript
'use client'

import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Inherits all input props like placeholder, disabled, etc.
}

/**
 * Password input with visibility toggle
 *
 * Features:
 * - Eye icon to show/hide password
 * - Accessible with proper aria-labels
 * - Forwards ref for react-hook-form integration
 * - Styled to match shadcn/ui Input component
 *
 * Usage:
 * ```tsx
 * <PasswordInput
 *   placeholder="Enter password"
 *   {...field}
 * />
 * ```
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={className}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1} // Don't include in tab order
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
```

**Key Features**:
- ✅ Eye/EyeOff icons from `lucide-react` (already installed)
- ✅ Toggles between `type="password"` and `type="text"`
- ✅ `forwardRef` for react-hook-form integration
- ✅ Absolute positioned button (doesn't affect input width)
- ✅ Accessible with aria-label
- ✅ Uses shadcn/ui Button and Input components

#### 2.2 Create `PasswordRequirements.tsx`

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/PasswordRequirements.tsx`

```typescript
'use client'

import { Check, X } from 'lucide-react'

interface Requirement {
  label: string
  test: (password: string) => boolean
}

/**
 * Password requirements matching the Zod schema
 * Must stay in sync with passwordValidator in auth.schema.ts
 */
const requirements: Requirement[] = [
  {
    label: 'At least 8 characters',
    test: (pw) => pw.length >= 8
  },
  {
    label: 'One uppercase letter',
    test: (pw) => /[A-Z]/.test(pw)
  },
  {
    label: 'One lowercase letter',
    test: (pw) => /[a-z]/.test(pw)
  },
  {
    label: 'One number',
    test: (pw) => /[0-9]/.test(pw)
  },
]

interface PasswordRequirementsProps {
  password: string
}

/**
 * Live password requirements indicator
 *
 * Features:
 * - Updates as user types (re-renders on every keystroke)
 * - Green check when requirement is met
 * - Gray X when requirement is not met
 * - Matches validation logic from Zod schema
 *
 * Usage:
 * ```tsx
 * const password = watch('password')
 * {password && <PasswordRequirements password={password} />}
 * ```
 */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <div className="space-y-1 text-sm" role="status" aria-live="polite">
      {requirements.map((req, index) => {
        const met = req.test(password)
        return (
          <div
            key={index}
            className={`flex items-center gap-2 transition-colors ${
              met ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            {met ? (
              <Check className="h-4 w-4" aria-label="Requirement met" />
            ) : (
              <X className="h-4 w-4" aria-label="Requirement not met" />
            )}
            <span>{req.label}</span>
          </div>
        )
      })}
    </div>
  )
}
```

**Key Features**:
- ✅ Matches Zod `passwordValidator` rules exactly
- ✅ Live updates (controlled by parent component's `watch('password')`)
- ✅ Green text + Check icon when met
- ✅ Gray text + X icon when not met
- ✅ Smooth color transition with Tailwind
- ✅ Accessible with `role="status"` and `aria-live="polite"`

**IMPORTANT**: This component must stay in sync with `passwordValidator` in `auth.schema.ts`. If you change validation rules, update both!

#### 2.3 Create `GoogleAuthButton.tsx`

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/GoogleAuthButton.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { authService } from '../data/services'

/**
 * Google OAuth authentication button
 *
 * Features:
 * - Google logo SVG
 * - Loading state during OAuth redirect
 * - Error handling (shows toast on error)
 * - Automatic redirect via Supabase
 *
 * Usage:
 * ```tsx
 * <GoogleAuthButton />
 * ```
 */
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
      // Error toast is already shown by the service
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {/* Google Logo SVG */}
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {isLoading ? 'Connecting...' : 'Continue with Google'}
    </Button>
  )
}
```

**Key Features**:
- ✅ Official Google colors in SVG logo
- ✅ Loading state with text change
- ✅ Uses existing `authService.loginWithGoogle()` method
- ✅ Button is `type="button"` (won't submit parent form)
- ✅ Variant="outline" for secondary action styling

#### 2.4 Update Components Index

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/index.ts`

```typescript
export * from './RegisterForm'
export * from './LoginForm'
export * from './PasswordInput'        // ADD
export * from './PasswordRequirements' // ADD
export * from './GoogleAuthButton'     // ADD
```

---

### Phase 3: Refactor Forms (1 hour)

#### 3.1 Refactor `RegisterForm.tsx`

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/RegisterForm.tsx`

**REPLACE ENTIRE FILE** with:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { registerRequestSchema, type RegisterRequest } from '../data/schemas'
import { useRegisterMutation } from '../hooks/mutations'
import { PasswordInput } from './PasswordInput'
import { PasswordRequirements } from './PasswordRequirements'
import { GoogleAuthButton } from './GoogleAuthButton'

/**
 * Registration form with email/password and Google OAuth
 *
 * Features:
 * - react-hook-form for state management
 * - Zod validation with inline error messages
 * - confirmPassword field (AC1 requirement)
 * - Password visibility toggle
 * - Live password requirements indicator
 * - Google OAuth button
 * - Success toast on registration
 * - Error toast on failure
 *
 * Form flow:
 * 1. User fills email, password, confirmPassword
 * 2. Password requirements show live validation
 * 3. On submit: validate → register → toast → redirect to login
 */
export function RegisterForm() {
  const router = useRouter()
  const { mutate: register, isPending: isLoading } = useRegisterMutation()

  // Setup react-hook-form with Zod validation
  const form = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur', // Validate on blur for better UX (not on every keystroke)
  })

  // Watch password for live requirements indicator
  const password = form.watch('password')

  async function onSubmit(values: RegisterRequest) {
    register(values, {
      onSuccess: () => {
        // Success toast is already shown in the mutation hook
        // Redirect to login page
        router.push('/login?message=check-email')
      },
      // Error toast is already shown in the mutation hook
    })
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                {/* Show live password requirements when user starts typing */}
                {password && <PasswordRequirements password={password} />}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field - AC1 REQUIREMENT */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google OAuth */}
      <GoogleAuthButton />

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
```

**Key Changes**:
1. ✅ **react-hook-form** replaces server actions
2. ✅ **zodResolver** for validation
3. ✅ **confirmPassword field** added (AC1)
4. ✅ **PasswordInput** component used
5. ✅ **PasswordRequirements** shown live
6. ✅ **GoogleAuthButton** component used
7. ✅ **FormMessage** for inline errors
8. ✅ **mode: 'onBlur'** for better UX
9. ✅ Toast notifications handled in mutation hook
10. ✅ Disabled state during loading

#### 3.2 Refactor `LoginForm.tsx`

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/components/LoginForm.tsx`

**REPLACE ENTIRE FILE** with:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { loginRequestSchema, type LoginRequest } from '../data/schemas'
import { useLoginMutation } from '../hooks/mutations'
import { PasswordInput } from './PasswordInput'
import { GoogleAuthButton } from './GoogleAuthButton'

/**
 * Login form with email/password and Google OAuth
 *
 * Features:
 * - react-hook-form for state management
 * - Zod validation with inline error messages
 * - Password visibility toggle
 * - Google OAuth button
 * - Forgot password link
 * - Success toast on login
 * - Error toast on failure
 * - Redirect to original destination or /dashboard
 *
 * Form flow:
 * 1. User fills email, password
 * 2. On submit: validate → login → toast → redirect
 */
export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const { mutate: login, isPending: isLoading } = useLoginMutation()

  // Setup react-hook-form with Zod validation
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  })

  async function onSubmit(values: LoginRequest) {
    login(values, {
      onSuccess: () => {
        // Success toast is already shown in the mutation hook
        // Redirect to dashboard or original destination
        router.push(redirectTo)
      },
      // Error toast is already shown in the mutation hook
    })
  }

  return (
    <div className="space-y-6">
      {/* Google OAuth First */}
      <GoogleAuthButton />

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
```

**Key Changes**:
1. ✅ **react-hook-form** replaces server actions
2. ✅ **zodResolver** for validation
3. ✅ **PasswordInput** component used (with toggle)
4. ✅ **GoogleAuthButton** component used
5. ✅ **Forgot password link** in label row
6. ✅ **FormMessage** for inline errors
7. ✅ **Redirect support** via query param
8. ✅ Toast notifications handled in mutation hook
9. ✅ Google OAuth shown first (better UX)
10. ✅ Disabled state during loading

---

### Phase 4: Update Mutation Hook (If Needed)

Check if `useRegisterMutation.ts` needs to be updated to match the new schema type.

**File**: `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/src/features/authentication/hooks/mutations/useRegisterMutation.ts`

**Current code uses**: `RegisterFormData` and `RegisterResponse`

**Should use**: `RegisterRequest` from schemas

**UPDATE to**:

```typescript
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '../../data/services'
import type { RegisterRequest, AuthResponse } from '../../data/schemas'

// Module-level flag to prevent concurrent registrations
let isRegistrationInProgress = false

export function useRegisterMutation() {
  const router = useRouter()

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (data) => {
      // Synchronous guard against concurrent mutations
      if (isRegistrationInProgress) {
        throw new Error('Registration already in progress')
      }

      try {
        isRegistrationInProgress = true
        return await authService.register(data)
      } finally {
        isRegistrationInProgress = false
      }
    },
    onSuccess: () => {
      toast.success('Account created!', {
        description: 'Please check your email to verify your account.',
        duration: 5000,
      })
    },
    onError: (error) => {
      // Don't show error for concurrent mutation attempts
      if (error.message === 'Registration already in progress') {
        return
      }

      toast.error('Registration failed', {
        description: error.message || 'Unable to create account. Please try again.',
      })
    },
  })
}
```

**Key Changes**:
1. ✅ Use `RegisterRequest` type (includes confirmPassword)
2. ✅ Use `AuthResponse` return type
3. ✅ Keep concurrent registration guard
4. ✅ Keep toast notifications

---

## Critical Requirements Checklist

### AC1 Compliance ✅

- ✅ **confirmPassword field** in RegisterForm
- ✅ **Password visibility toggle** (eye icon) via PasswordInput
- ✅ **Live password requirements** indicator
- ✅ **react-hook-form** with zodResolver (NOT server actions)
- ✅ **Zod validation** with inline error messages via FormMessage
- ✅ **Success toasts** after registration
- ✅ **Error toasts** for failures
- ✅ **Google OAuth button** with separator

### Design Spec Compliance ✅

- ✅ Follow shadcn/ui patterns (Form, FormField, FormItem, FormLabel, FormMessage)
- ✅ Use colors from `app/globals.css`
- ✅ Buttons show loading states (`isPending ? 'Creating...' : 'Create account'`)
- ✅ Inputs disabled during submission
- ✅ Error messages display inline below fields
- ✅ Separator with "Or continue with" text

### Code Quality ✅

- ✅ TypeScript strict mode (no `any` types)
- ✅ Proper React Query patterns (queries and mutations)
- ✅ Service layer for API calls
- ✅ Component composition and reusability
- ✅ forwardRef for PasswordInput (react-hook-form integration)
- ✅ Accessible with aria-labels and roles

---

## Testing Validation

After implementation, run E2E tests to verify:

```bash
npm run test:e2e
```

**Expected results**:
1. ✅ Registration with valid credentials
2. ✅ Invalid email format validation
3. ✅ Password too short validation
4. ✅ Passwords do not match validation
5. ✅ Duplicate registration handling
6. ✅ Login with empty email
7. ✅ Login with empty password
8. ✅ Login with invalid credentials
9. ✅ User-friendly error messages display
10. ✅ Submit button disable during submission
11. ✅ Keyboard navigation support
12. ✅ Success toast after registration

**Expected pass rate**: 100% (12/12 tests)

---

## Architecture Patterns

### Form Pattern

```typescript
// 1. Define schema (already in data/schemas/auth.schema.ts)
export const registerRequestSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: z.string().min(1),
}).refine(...)

// 2. Create mutation hook (in hooks/mutations/)
export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => toast.success(...),
    onError: (error) => toast.error(...),
  })
}

// 3. Build form component (in components/)
export function RegisterForm() {
  const form = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {...},
  })

  const { mutate, isPending } = useRegisterMutation()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField ... />
      </form>
    </Form>
  )
}
```

### Live Validation Pattern

```typescript
// Watch field value
const password = form.watch('password')

// Show live indicator
{password && <PasswordRequirements password={password} />}
```

### Error Handling Pattern

```typescript
// Inline errors (field-level)
<FormMessage /> // Automatically shows field errors

// Global errors (toast)
onError: (error) => toast.error('Title', { description: error.message })
```

---

## Important Notes

### Colors

Use colors from `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/app/globals.css`:

- Text: `text-foreground`, `text-muted-foreground`
- Background: `bg-background`, `bg-muted`
- Buttons: `bg-primary`, `bg-secondary`
- Success: `text-green-600` (for met requirements)
- Error: `text-destructive`
- Border: `border-border`

### Form Validation Timing

- **Client-side**: Zod schema + react-hook-form (instant feedback)
- **Trigger**: `mode: 'onBlur'` (validate when field loses focus)
- **Display**: Inline errors below fields + global errors as toasts
- **Server-side**: Backend validation (security, already implemented)

### Password Requirements Display

Show live as user types:
- ✅ Green text + Check icon when met
- ❌ Gray text + X icon when not met
- Only show when `password.length > 0`
- Must match Zod `passwordValidator` rules

### Dependencies Already Installed ✅

From validation report:
- ✅ react-hook-form
- ✅ @hookform/resolvers
- ✅ zod
- ✅ @tanstack/react-query
- ✅ @supabase/ssr
- ✅ shadcn/ui (form, input, button, label, separator)
- ✅ sonner (toasts)
- ✅ lucide-react (icons: Eye, EyeOff, Check, X)

**No new dependencies needed!**

---

## Files Summary

### Files to Create (6 files)

1. `src/features/authentication/hooks/queries/useUserQuery.ts`
2. `src/features/authentication/hooks/mutations/usePasswordResetMutation.ts`
3. `src/features/authentication/hooks/mutations/useUpdatePasswordMutation.ts`
4. `src/features/authentication/components/PasswordInput.tsx`
5. `src/features/authentication/components/PasswordRequirements.tsx`
6. `src/features/authentication/components/GoogleAuthButton.tsx`

### Files to Modify (6 files)

1. `src/features/authentication/hooks/queries/index.ts` (add 1 export)
2. `src/features/authentication/hooks/mutations/index.ts` (add 2 exports)
3. `src/features/authentication/hooks/mutations/useRegisterMutation.ts` (update types)
4. `src/features/authentication/components/RegisterForm.tsx` (complete refactor)
5. `src/features/authentication/components/LoginForm.tsx` (complete refactor)
6. `src/features/authentication/components/index.ts` (add 3 exports)

---

## Estimated Timeline

- **Phase 1** (Create Hooks): 30 minutes
- **Phase 2** (Create Components): 1 hour
- **Phase 3** (Refactor Forms): 1 hour
- **Phase 4** (Update Mutation): 15 minutes
- **Testing**: 30 minutes

**Total**: 3 hours 15 minutes

---

## Success Criteria

### Before Merging

- [ ] All 6 new files created
- [ ] All 6 modified files updated
- [ ] RegisterForm has confirmPassword field
- [ ] LoginForm has password toggle
- [ ] E2E tests pass at 100% (12/12)
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No ESLint warnings: `npm run lint`
- [ ] Forms work on mobile (responsive)
- [ ] Password toggle works correctly
- [ ] Live password requirements update correctly
- [ ] Success and error toasts display correctly

### User Experience

- [ ] Registration form feels smooth and intuitive
- [ ] Password requirements guide user to create strong password
- [ ] Error messages are helpful and specific
- [ ] Loading states are clear
- [ ] Forms don't flicker or jump during validation
- [ ] Tab navigation works correctly
- [ ] Enter key submits form
- [ ] Google OAuth redirects correctly

---

## Next Steps After Implementation

1. **Type check**: `npm run type-check`
2. **Run E2E tests**: `npm run test:e2e`
3. **Manual testing**:
   - Register flow with confirmPassword
   - Password toggle works
   - Live requirements update
   - Login flow
   - Google OAuth
4. **Responsive testing**: Mobile, tablet, desktop
5. **Accessibility audit**: `npm run lighthouse` or browser DevTools
6. **Create summary**: `.claude/doc/authentication/frontend_implementation_complete.md`

---

## Known Issues to Watch For

### Schema Type Mismatches

**Issue**: useRegisterMutation might use `RegisterFormData` instead of `RegisterRequest`

**Fix**: Update mutation hook to use `RegisterRequest` from schemas (includes confirmPassword)

### PasswordRequirements Sync

**Issue**: Requirements in component must match Zod schema rules

**Fix**: Keep both in sync. Consider extracting to shared constants if they diverge.

### Toast Duplication

**Issue**: Both mutation hook and form component might show toasts

**Fix**: Let mutation hook handle toasts, don't duplicate in form

---

**Status**: ✅ Ready for implementation
**Blockers**: None - all dependencies installed, architecture defined
**Risk**: Low - clear specifications, existing schemas correct, patterns established
