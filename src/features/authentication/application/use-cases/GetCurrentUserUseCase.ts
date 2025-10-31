import { ISessionManager } from '../ports/ISessionManager';
import { IUserRepository } from '../ports/IUserRepository';
import { UserDTO } from '../dtos/UserDTO';

export class GetCurrentUserUseCase {
  constructor(
    private readonly sessionManager: ISessionManager,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(): Promise<UserDTO | null> {
    // 1. Get current session
    const session = await this.sessionManager.getCurrentSession();

    if (!session) {
      return null;
    }

    // 2. Get user from session
    const user = session.user;

    // 3. Get profile data
    const profile = await this.userRepository.findProfileById(user.getId());

    // 4. Map to DTO
    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      isEmailVerified: user.isEmailVerified(),
      fullName: profile?.getFullName(),
      avatarUrl: profile?.getAvatarUrl(),
      createdAt: user.getCreatedAt(),
      lastLoginAt: user.getLastLoginAt(),
    };
  }
}
