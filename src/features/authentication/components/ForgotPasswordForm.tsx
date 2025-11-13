'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '../lib/zodResolver'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, Mail, Loader2 } from 'lucide-react'
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
import { passwordResetRequestSchema, type PasswordResetRequest } from '../data/schemas'
import { usePasswordResetMutation } from '../hooks/mutations/usePasswordResetMutation'

export function ForgotPasswordForm() {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)
  const { requestReset, isLoading } = usePasswordResetMutation()

  const form = useForm<PasswordResetRequest>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const onSubmit = form.handleSubmit((values: PasswordResetRequest) => {
    requestReset(values, {
      onSuccess: () => {
        setIsSuccess(true)
      },
    })
  })

  // Auto-redirect after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isSuccess, router])

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Check your email</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <p>
              If an account exists with this email, you&apos;ll receive password reset instructions
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">Redirecting to login in 5 seconds...</p>

        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
