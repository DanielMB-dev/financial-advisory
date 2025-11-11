'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/src/features/authentication/infrastructure/supabase/server-client'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function signup(_prevState: unknown, formData: FormData) {
  // 1. Extract and validate form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validation = registerSchema.safeParse({ email, password })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // 2. Create Supabase client
  const supabase = await createServerSupabaseClient()

  // 3. Sign up with Supabase
  const { error } = await supabase.auth.signUp({
    email: email.toLowerCase(),
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // 4. Revalidate cache and redirect
  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to verify your account')
}
