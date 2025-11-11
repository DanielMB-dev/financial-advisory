import { Email } from '../../domain/value-objects/Email'
import { Password } from '../../domain/value-objects/Password'
import { IAuthenticationService } from '../ports/IAuthenticationService'
import { ISessionManager } from '../ports/ISessionManager'
import { IUserRepository } from '../ports/IUserRepository'
import { EmailNotVerifiedError } from '../../domain/errors/AuthenticationErrors'
import { UserLoggedIn } from '../../domain/events/UserLoggedIn'

export interface LoginWithEmailRequest {
  email: string
  password: string
}

export interface LoginResponse {
  userId: string
  email: string
  accessToken: string
}

export class LoginWithEmailUseCase {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly sessionManager: ISessionManager,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(request: LoginWithEmailRequest): Promise<LoginResponse> {
    // 1. Validate input
    const email = Email.create(request.email)
    const password = Password.create(request.password)

    // 2. Authenticate with Supabase
    const authResult = await this.authService.loginWithEmail(email, password)
    const { user, accessToken, refreshToken } = authResult

    // 3. Business rule: Email must be verified
    if (!user.isEmailVerified()) {
      throw new EmailNotVerifiedError('Please verify your email address before logging in')
    }

    // 4. Create session (set cookies)
    await this.sessionManager.createSession(accessToken, refreshToken)

    // 5. Update last login timestamp
    user.recordLogin()
    await this.userRepository.updateUserMetadata(user.getId(), {
      lastLoginAt: user.getLastLoginAt(),
    })

    // 6. Emit domain event
    const event = new UserLoggedIn(user.getId(), 'email', new Date())
    console.log('UserLoggedIn event:', event)

    // 7. Return response
    return {
      userId: user.getId().getValue(),
      email: user.getEmail().getValue(),
      accessToken,
    }
  }
}
