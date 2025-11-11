'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/src/features/authentication/infrastructure/supabase/server-client'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(_prevState: unknown, formData: FormData) {
  // 1. Extract and validate form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validation = loginSchema.safeParse({ email, password })
  if (!validation.success) {
    return { error: 'Invalid email or password format' }
  }

  // 2. Create Supabase client
  const supabase = await createServerSupabaseClient()

  // 3. Sign in with Supabase (handles session cookies automatically)
  const { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // 4. Revalidate cache and redirect
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = await createServerSupabaseClient()
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin') || 'http://localhost:3000'

  console.log('[signInWithGoogle] Starting OAuth flow')
  console.log('[signInWithGoogle] Origin:', origin)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback?next=/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent', // Force consent screen to show
      },
    },
  })

  console.log('[signInWithGoogle] OAuth response:', { data, error })

  if (error) {
    console.error('[signInWithGoogle] OAuth error:', error)
    redirect('/login?error=oauth_init_failed')
  }

  if (data.url) {
    console.log('[signInWithGoogle] Redirecting to Google:', data.url)
    redirect(data.url)
  }

  // Fallback redirect if no URL is provided
  console.log('[signInWithGoogle] No OAuth URL provided, redirecting to login')
  redirect('/login?error=no_oauth_url')
}
