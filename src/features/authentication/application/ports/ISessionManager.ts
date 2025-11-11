import { User } from '../../domain/entities/User'

export interface Session {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export interface ISessionManager {
  // Create session (sets cookies)
  createSession(accessToken: string, refreshToken: string): Promise<void>

  // Get current session from cookies
  getCurrentSession(): Promise<Session | null>

  // Refresh session if expired
  refreshSession(refreshToken: string): Promise<Session>

  // Destroy session (clear cookies)
  destroySession(): Promise<void>

  // Validate session is active
  isSessionValid(): Promise<boolean>
}
