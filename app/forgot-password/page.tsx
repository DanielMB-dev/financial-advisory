import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/src/features/authentication/infrastructure/supabase/server-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ForgotPasswordForm } from '@/src/features/authentication/components/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  // Check if user is already logged in
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If already authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
