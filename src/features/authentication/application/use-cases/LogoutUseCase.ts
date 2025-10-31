import { ISessionManager } from '../ports/ISessionManager';

export class LogoutUseCase {
  constructor(private readonly sessionManager: ISessionManager) {}

  async execute(): Promise<void> {
    await this.sessionManager.destroySession();
  }
}
