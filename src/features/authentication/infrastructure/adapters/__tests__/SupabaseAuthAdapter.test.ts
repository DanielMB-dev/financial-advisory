import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseAuthAdapter } from '../SupabaseAuthAdapter'
import { Email } from '../../../domain/value-objects/Email'
import { Password } from '../../../domain/value-objects/Password'
import {
  DuplicateEmailError,
  InvalidCredentialsError,
} from '../../../domain/errors/AuthenticationErrors'

// Mock the Supabase client
vi.mock('../../supabase/server-client', () => ({
  createServerSupabaseClient: vi.fn(() => mockSupabaseClient),
}))

const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    getUser: vi.fn(),
    verifyOtp: vi.fn(),
    resend: vi.fn(),
  },
}

describe('SupabaseAuthAdapter', () => {
  let adapter: SupabaseAuthAdapter

  beforeEach(() => {
    adapter = new SupabaseAuthAdapter()
    vi.clearAllMocks()
  })

  describe('registerWithEmail', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        email_confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const email = Email.create('user@example.com')
      const password = Password.create('Password123')

      const user = await adapter.registerWithEmail(email, password)

      expect(user).toBeDefined()
      expect(user.getId().getValue()).toBe(mockUser.id)
      expect(user.getEmail().getValue()).toBe(mockUser.email)
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password123',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })

    it('should throw DuplicateEmailError if email already exists', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      })

      const email = Email.create('existing@example.com')
      const password = Password.create('Password123')

      await expect(adapter.registerWithEmail(email, password)).rejects.toThrow(DuplicateEmailError)
    })
  })

  describe('loginWithEmail', () => {
    it('should login successfully with valid credentials', async () => {
      const mockData = {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const email = Email.create('user@example.com')
      const password = Password.create('Password123')

      const result = await adapter.loginWithEmail(email, password)

      expect(result.user).toBeDefined()
      expect(result.accessToken).toBe('access-token')
      expect(result.refreshToken).toBe('refresh-token')
    })

    it('should throw InvalidCredentialsError on wrong password', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      })

      const email = Email.create('user@example.com')
      const password = Password.create('WrongPassword123')

      await expect(adapter.loginWithEmail(email, password)).rejects.toThrow(InvalidCredentialsError)
    })
  })

  describe('loginWithGoogle', () => {
    it('should return OAuth URL', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth/...' },
        error: null,
      })

      const result = await adapter.loginWithGoogle()

      expect(result.url).toBe('https://accounts.google.com/oauth/...')
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })
  })

  describe('handleGoogleCallback', () => {
    it('should exchange code for session', async () => {
      const mockData = {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
      }

      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await adapter.handleGoogleCallback('oauth-code')

      expect(result.user).toBeDefined()
      expect(result.accessToken).toBe('access-token')
    })

    it('should throw InvalidCredentialsError on failed OAuth', async () => {
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'OAuth failed' },
      })

      await expect(adapter.handleGoogleCallback('invalid-code')).rejects.toThrow(
        InvalidCredentialsError
      )
    })
  })

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      const email = Email.create('user@example.com')
      await adapter.requestPasswordReset(email)

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        {
          redirectTo: expect.stringContaining('/auth/reset-password'),
        }
      )
    })
  })

  describe('resetPassword', () => {
    it('should update password', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: {},
        error: null,
      })

      const password = Password.create('NewPassword123')
      await adapter.resetPassword('reset-token', password)

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123',
      })
    })
  })
})
