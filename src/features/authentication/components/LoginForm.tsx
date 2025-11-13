'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '../lib/zodResolver'
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
    mode: 'onBlur', // Validate on blur first
    reValidateMode: 'onChange', // Then validate on change after first error
  })

  const onSubmit = form.handleSubmit((values: LoginRequest) => {
    login(values, {
      onSuccess: () => {
        router.push(redirectTo)
      },
    })
  })

  return (
    <div className="space-y-6">
      {/* Email/Password Form */}
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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

      {/* Google OAuth First */}
      <GoogleAuthButton />

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        Don`&lsquo;`t have an account?{' '}
        <Link href="/register" className="font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
