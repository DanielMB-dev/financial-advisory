import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/src/features/authentication/infrastructure/supabase/server-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from './LogoutButton'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Server-side auth check using getUser (recommended by Supabase)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Financial Advisor</CardTitle>
          <CardDescription>You are logged in as {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">User ID:</p>
              <p className="font-mono">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email:</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Verified:</p>
              <p>{user.email_confirmed_at ? 'Yes' : 'No'}</p>
            </div>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
