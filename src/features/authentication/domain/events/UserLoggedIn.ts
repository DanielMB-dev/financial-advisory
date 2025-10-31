import { UserId } from '../value-objects/UserId';

export class UserLoggedIn {
  constructor(
    public readonly userId: UserId,
    public readonly loginMethod: 'email' | 'google',
    public readonly occurredAt: Date
  ) {}
}
