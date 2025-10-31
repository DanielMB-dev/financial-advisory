import { UserId } from '../../domain/value-objects/UserId';
import { IUserRepository } from '../ports/IUserRepository';
import { UpdateProfileDTO } from '../dtos/UpdateProfileDTO';
import { UserNotFoundError } from '../../domain/errors/AuthenticationErrors';

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, updates: UpdateProfileDTO): Promise<void> {
    const userIdVO = UserId.create(userId);

    // 1. Get existing profile
    const profile = await this.userRepository.findProfileById(userIdVO);

    if (!profile) {
      throw new UserNotFoundError('User profile not found');
    }

    // 2. Update profile using domain behavior
    profile.updateProfile(updates);

    // 3. Persist changes
    await this.userRepository.updateProfile(userIdVO, profile);
  }
}
