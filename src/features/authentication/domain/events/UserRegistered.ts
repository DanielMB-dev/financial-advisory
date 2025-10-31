import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export class UserRegistered {
  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
    public readonly occurredAt: Date
  ) {}
}
