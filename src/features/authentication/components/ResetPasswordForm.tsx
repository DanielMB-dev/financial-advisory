'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '../lib/zodResolver'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { updatePasswordRequestSchema, type UpdatePasswordRequest } from '../data/schemas'
import { useUpdatePasswordMutation } from '../hooks/mutations/useUpdatePasswordMutation'
import { PasswordInput } from './PasswordInput'
import { PasswordRequirements } from './PasswordRequirements'

export function ResetPasswordForm() {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const { updatePassword, isLoading } = useUpdatePasswordMutation()

  const form = useForm<UpdatePasswordRequest>({
    resolver: zodResolver(updatePasswordRequestSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const password = form.watch('password')

  const onSubmit = form.handleSubmit((values: UpdatePasswordRequest) => {
    updatePassword(values, {
      onSuccess: () => {
        setIsSuccess(true)
      },
    })
  })

  // Countdown timer and auto-redirect after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/dashboard')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isSuccess, router])

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Password reset successful!</h2>
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard in {countdown}...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                {password && <PasswordRequirements password={password} />}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
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
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset password'
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
