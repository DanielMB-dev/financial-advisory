'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResetPasswordForm } from '@/src/features/authentication/components/ResetPasswordForm'
import { useEffect } from 'react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const code = searchParams.get('code')

  // If there's a code in the URL, redirect to callback route for server-side exchange
  useEffect(() => {
    if (code) {
      console.log(
        '[ResetPassword] Code detected, redirecting to callback route for server-side exchange'
      )
      router.replace(`/auth/callback?code=${code}&next=/reset-password`)
    }
  }, [code, router])

  // Show loading while redirecting to callback
  if (code) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-10">
            <div className="text-center space-y-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <div className="space-y-2">
                <p className="font-medium text-foreground">Verifying reset link...</p>
                <p className="text-xs text-muted-foreground">This may take a few seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if callback failed
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Invalid reset link</CardTitle>
            <CardDescription>The password reset link has expired or is invalid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error === 'invalid_code'
                ? 'This reset link has expired or has already been used.'
                : 'An error occurred while verifying your reset link.'}
            </p>
            <Button onClick={() => router.push('/forgot-password')} className="w-full">
              Request new link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show the reset form (session should be set by callback route)
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
