import { Email } from '../../domain/value-objects/Email'
import { Password } from '../../domain/value-objects/Password'
import { User } from '../../domain/entities/User'

export interface AuthenticationResult {
  user: User
  accessToken: string
  refreshToken: string
}

export interface IAuthenticationService {
  // Email/password authentication
  registerWithEmail(email: Email, password: Password): Promise<User>
  loginWithEmail(email: Email, password: Password): Promise<AuthenticationResult>

  // OAuth authentication
  loginWithGoogle(): Promise<{ url: string }>
  handleGoogleCallback(code: string): Promise<AuthenticationResult>

  // Password management
  requestPasswordReset(email: Email): Promise<void>
  resetPassword(token: string, newPassword: Password): Promise<void>
  changePassword(userId: string, currentPassword: Password, newPassword: Password): Promise<void>

  // Email verification
  verifyEmail(token: string): Promise<User>
  resendVerificationEmail(email: Email): Promise<void>
}
