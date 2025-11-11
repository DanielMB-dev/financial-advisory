import { UserId } from '../value-objects/UserId'

export class EmailVerified {
  constructor(
    public readonly userId: UserId,
    public readonly verifiedAt: Date
  ) {}
}
