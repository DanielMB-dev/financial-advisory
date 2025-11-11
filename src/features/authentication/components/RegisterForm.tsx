'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '../lib/zodResolver'
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
    mode: 'onBlur', // Validate on blur first
    reValidateMode: 'onChange', // Then validate on change after first error
  })

  // Watch password for live requirements indicator
  const password = form.watch('password')

  const onSubmit = form.handleSubmit(
    // Success callback - called when validation passes
    (values: RegisterRequest) => {
      register(values, {
        onSuccess: () => {
          router.push('/login?message=check-email')
        },
      })
    }
  )

  return (
    <div className="space-y-6">
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

      {/* Google OAuth - includes separator */}
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
