import { Email } from '../../domain/value-objects/Email'
import { IAuthenticationService } from '../ports/IAuthenticationService'
import { PasswordResetRequested } from '../../domain/events/PasswordResetRequested'

export class RequestPasswordResetUseCase {
  constructor(private readonly authService: IAuthenticationService) {}

  async execute(email: string): Promise<void> {
    const emailVO = Email.create(email)

    // Request password reset via Supabase (sends email)
    await this.authService.requestPasswordReset(emailVO)

    // Emit event
    const event = new PasswordResetRequested(emailVO, new Date())
    console.log('PasswordResetRequested event:', event)
  }
}
