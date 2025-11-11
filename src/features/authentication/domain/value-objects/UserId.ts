import { z } from 'zod'

export class UserId {
  private readonly value: string

  private constructor(id: string) {
    this.value = id
  }

  static create(id: string): UserId {
    const schema = z.string().uuid()
    const result = schema.safeParse(id)

    if (!result.success) {
      throw new Error('Invalid user ID format')
    }

    return new UserId(result.data)
  }

  getValue(): string {
    return this.value
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
