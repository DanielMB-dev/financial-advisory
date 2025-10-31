import { Email } from '../value-objects/Email';

export class PasswordResetRequested {
  constructor(
    public readonly email: Email,
    public readonly occurredAt: Date
  ) {}
}
