import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/src/features/authentication/infrastructure/supabase/server-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/src/features/authentication/components/LoginForm'

export default async function LoginPage() {
  // Check if user is already logged in
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[LoginPage] User check:', user ? { id: user.id, email: user.email } : 'No user')

  // If already authenticated, redirect to dashboard
  if (user) {
    console.log('[LoginPage] User already authenticated, redirecting to dashboard')
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
