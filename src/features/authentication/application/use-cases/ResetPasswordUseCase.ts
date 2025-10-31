import { Password } from '../../domain/value-objects/Password';
import { IAuthenticationService } from '../ports/IAuthenticationService';

export class ResetPasswordUseCase {
  constructor(private readonly authService: IAuthenticationService) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const passwordVO = Password.create(newPassword);

    await this.authService.resetPassword(token, passwordVO);
  }
}
