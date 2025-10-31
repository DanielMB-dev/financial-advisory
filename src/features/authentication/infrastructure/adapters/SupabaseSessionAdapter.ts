import { ISessionManager, Session } from '../../application/ports/ISessionManager'
import { createServerSupabaseClient } from '../supabase/server-client'
import { User } from '../../domain/entities/User'
import { SessionExpiredError } from '../../domain/errors/AuthenticationErrors'

export class SupabaseSessionAdapter implements ISessionManager {
  async createSession(accessToken: string, refreshToken: string): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      return null
    }

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return null
    }

    const user = User.reconstitute({
      id: userData.user.id,
      email: userData.user.email!,
      emailVerifiedAt: userData.user.email_confirmed_at
        ? new Date(userData.user.email_confirmed_at)
        : null,
      createdAt: new Date(userData.user.created_at),
      updatedAt: new Date(userData.user.updated_at || userData.user.created_at),
    })

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at! * 1000),
    }
  }

  async refreshSession(refreshToken: string): Promise<Session> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (error || !data.session) {
      throw new SessionExpiredError()
    }

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      throw new SessionExpiredError()
    }

    const user = User.reconstitute({
      id: userData.user.id,
      email: userData.user.email!,
      emailVerifiedAt: userData.user.email_confirmed_at
        ? new Date(userData.user.email_confirmed_at)
        : null,
      createdAt: new Date(userData.user.created_at),
      updatedAt: new Date(userData.user.updated_at || userData.user.created_at),
    })

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at! * 1000),
    }
  }

  async destroySession(): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  async isSessionValid(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return session !== null && session.expiresAt > new Date()
  }
}
