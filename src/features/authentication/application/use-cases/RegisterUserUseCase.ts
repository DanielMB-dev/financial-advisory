import { Email } from '../../domain/value-objects/Email'
import { Password } from '../../domain/value-objects/Password'
import { IAuthenticationService } from '../ports/IAuthenticationService'
import { IUserRepository } from '../ports/IUserRepository'
import { UserRegistered } from '../../domain/events/UserRegistered'

export interface RegisterUserRequest {
  email: string
  password: string
}

export class RegisterUserUseCase {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(request: RegisterUserRequest): Promise<void> {
    // 1. Validate input with value objects
    const email = Email.create(request.email)
    const password = Password.create(request.password)

    // 2. Register user via authentication service
    // Note: Supabase auth.signUp() automatically:
    //   - Creates user in auth.users
    //   - Triggers database function that creates profile in public.profiles
    //   - Sends email verification email
    // See: supabase/migrations/20251030_create_profiles_table.sql
    const user = await this.authService.registerWithEmail(email, password)

    // 3. Emit domain event (for side effects like analytics, welcome email)
    const event = new UserRegistered(user.getId(), user.getEmail(), new Date())

    // TODO: Publish event to event bus
    console.log('UserRegistered event:', event)
  }
}
