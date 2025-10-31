import {
  IAuthenticationService,
  AuthenticationResult,
} from '../../application/ports/IAuthenticationService'
import { Email } from '../../domain/value-objects/Email'
import { Password } from '../../domain/value-objects/Password'
import { User } from '../../domain/entities/User'
import { createServerSupabaseClient } from '../supabase/server-client'
import {
  InvalidCredentialsError,
  DuplicateEmailError,
  InvalidTokenError,
} from '../../domain/errors/AuthenticationErrors'

export class SupabaseAuthAdapter implements IAuthenticationService {
  async registerWithEmail(email: Email, password: Password): Promise<User> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
      email: email.getValue(),
      password: password.getValue(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        throw new DuplicateEmailError()
      }
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('User registration failed')
    }

    return User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    })
  }

  async loginWithEmail(email: Email, password: Password): Promise<AuthenticationResult> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.getValue(),
      password: password.getValue(),
    })

    if (error) {
      throw new InvalidCredentialsError()
    }

    if (!data.user || !data.session) {
      throw new InvalidCredentialsError()
    }

    const user = User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    })

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    }
  }

  async loginWithGoogle(): Promise<{ url: string }> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return { url: data.url }
  }

  async handleGoogleCallback(code: string): Promise<AuthenticationResult> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      throw new InvalidCredentialsError('OAuth authentication failed')
    }

    if (!data.user || !data.session) {
      throw new InvalidCredentialsError('OAuth authentication failed')
    }

    const user = User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    })

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    }
  }

  async requestPasswordReset(email: Email): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email.getValue(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async resetPassword(token: string, newPassword: Password): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword.getValue(),
    })

    if (error) {
      throw new InvalidTokenError()
    }
  }

  async changePassword(
    userId: string,
    currentPassword: Password,
    newPassword: Password
  ): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      throw new InvalidCredentialsError('User not found')
    }

    // Verify current password
    const verifyResult = await supabase.auth.signInWithPassword({
      email: userData.user.email!,
      password: currentPassword.getValue(),
    })

    if (verifyResult.error) {
      throw new InvalidCredentialsError('Current password is incorrect')
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword.getValue(),
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async verifyEmail(token: string): Promise<User> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (error || !data.user) {
      throw new InvalidTokenError()
    }

    return User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    })
  }

  async resendVerificationEmail(email: Email): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.getValue(),
    })

    if (error) {
      throw new Error(error.message)
    }
  }
}
