export interface UserDTO {
  id: string
  email: string
  isEmailVerified: boolean
  fullName?: string
  avatarUrl?: string
  createdAt: Date
  lastLoginAt?: Date
}
