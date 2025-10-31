import { z } from 'zod';

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  static create(email: string): Email {
    const schema = z.string().email({ message: 'Invalid email format' });
    const result = schema.safeParse(email.toLowerCase());

    if (!result.success) {
      throw new Error('Invalid email format');
    }

    return new Email(result.data);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
