import { createClient } from '@/lib/supabase/client'
import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'
import type {
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  UpdatePasswordRequest,
} from '../schemas'

/**
 * Get Supabase client instance
 * Creates client lazily to avoid initialization during build time
 */
const getSupabaseClient = () => createClient()

/**
 * Auth Response type matching Supabase structure
 */
export type AuthResponse = {
  session: SupabaseSession | null
  user: SupabaseUser | null
}

/**
 * Auth Service
 * Handles all authentication-related API calls using Supabase
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const supabase = getSupabaseClient()
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      session: authData.session,
      user: authData.user,
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const supabase = getSupabaseClient()
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      session: authData.session,
      user: authData.user,
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  },

  /**
   * Request password reset email
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  /**
   * Update password with reset token
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      throw new Error(error.message)
    }
  },

  /**
   * Get current session
   */
  async getSession(): Promise<SupabaseSession | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },

  /**
   * Refresh session
   */
  async refreshSession(): Promise<SupabaseSession | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  },
}
