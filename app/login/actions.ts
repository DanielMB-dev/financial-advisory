'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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
