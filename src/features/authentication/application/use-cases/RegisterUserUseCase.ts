import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { IAuthenticationService } from '../ports/IAuthenticationService';
import { IUserRepository } from '../ports/IUserRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserRegistered } from '../../domain/events/UserRegistered';

export interface RegisterUserRequest {
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(request: RegisterUserRequest): Promise<void> {
    // 1. Validate input with value objects
    const email = Email.create(request.email);
    const password = Password.create(request.password);

    // 2. Register user via authentication service (Supabase creates user)
    const user = await this.authService.registerWithEmail(email, password);

    // 3. Create user profile in public.profiles
    const profile = UserProfile.create({
      userId: user.getId(),
      email: user.getEmail(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.createProfile(profile);

    // 4. Emit domain event (for side effects like analytics, welcome email)
    const event = new UserRegistered(user.getId(), user.getEmail(), new Date());

    // TODO: Publish event to event bus
    console.log('UserRegistered event:', event);
  }
}
