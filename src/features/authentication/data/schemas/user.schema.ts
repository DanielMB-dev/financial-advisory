import { z } from 'zod'

// User Profile Schema
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type UserProfile = z.infer<typeof userProfileSchema>
// Backwards compatibility alias
export type UserSession = UserProfile

// Update Profile Request Schema
export const updateProfileRequestSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
})

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>
// Backwards compatibility alias
export type UpdateProfileFormData = UpdateProfileRequest

// Profile Completion Schema (for first-time users)
export const profileCompletionSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
})

export type ProfileCompletion = z.infer<typeof profileCompletionSchema>
