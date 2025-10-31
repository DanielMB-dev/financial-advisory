import { IAuthenticationService } from '../ports/IAuthenticationService';
import { ISessionManager } from '../ports/ISessionManager';
import { IUserRepository } from '../ports/IUserRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserLoggedIn } from '../../domain/events/UserLoggedIn';

export class LoginWithGoogleUseCase {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly sessionManager: ISessionManager,
    private readonly userRepository: IUserRepository
  ) {}

  // Step 1: Initiate OAuth flow (redirect to Google)
  async initiateOAuth(): Promise<{ url: string }> {
    return await this.authService.loginWithGoogle();
  }

  // Step 2: Handle OAuth callback
  async handleCallback(code: string): Promise<void> {
    // 1. Exchange code for tokens
    const authResult = await this.authService.handleGoogleCallback(code);
    const { user, accessToken, refreshToken } = authResult;

    // 2. Create session
    await this.sessionManager.createSession(accessToken, refreshToken);

    // 3. Check if profile exists, create if not
    const existingProfile = await this.userRepository.findProfileById(user.getId());

    if (!existingProfile) {
      const profile = UserProfile.create({
        userId: user.getId(),
        email: user.getEmail(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.createProfile(profile);
    }

    // 4. Update last login
    user.recordLogin();
    await this.userRepository.updateUserMetadata(user.getId(), {
      lastLoginAt: user.getLastLoginAt(),
    });

    // 5. Emit event
    const event = new UserLoggedIn(user.getId(), 'google', new Date());
    console.log('UserLoggedIn event:', event);
  }
}
