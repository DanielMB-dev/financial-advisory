import { z } from 'zod';

export class Password {
  private readonly value: string;

  private constructor(password: string) {
    this.value = password;
  }

  static create(password: string): Password {
    const schema = z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number');

    const result = schema.safeParse(password);

    if (!result.success) {
      const firstError = result.error.issues[0];
      throw new Error(firstError?.message || 'Invalid password');
    }

    return new Password(result.data);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Password): boolean {
    return this.value === other.value;
  }
}
