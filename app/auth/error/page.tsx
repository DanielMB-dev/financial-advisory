'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { XCircle } from 'lucide-react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An authentication error occurred'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>There was a problem with your authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">Create New Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <AuthErrorContent />
    </Suspense>
  )
}
