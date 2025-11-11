import { z } from 'zod'

// Reusable email validator with proper error messages
export const emailValidator = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Please enter a valid email address' })

// Reusable password validator with requirements
export const passwordValidator = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })

// Login Request Schema
export const loginRequestSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, { message: 'Password is required' }),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
// Backwards compatibility alias
export type LoginFormData = LoginRequest

// Register Request Schema (with confirmPassword)
export const registerRequestSchema = z
  .object({
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterRequest = z.infer<typeof registerRequestSchema>
// Backwards compatibility alias
export type RegisterFormData = RegisterRequest

// Password Reset Request Schema
export const passwordResetRequestSchema = z.object({
  email: emailValidator,
})

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>

// Update Password Request Schema
export const updatePasswordRequestSchema = z
  .object({
    password: passwordValidator,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type UpdatePasswordRequest = z.infer<typeof updatePasswordRequestSchema>

// Session Schema
export const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
  expiresIn: z.number(),
  tokenType: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    emailConfirmedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
})

export type Session = z.infer<typeof sessionSchema>
