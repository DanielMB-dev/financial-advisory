import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseSessionAdapter } from '../SupabaseSessionAdapter';
import { SessionExpiredError } from '../../../domain/errors/AuthenticationErrors';

// Mock the Supabase client
vi.mock('../../supabase/server-client', () => ({
  createServerSupabaseClient: vi.fn(() => mockSupabaseClient),
}));

const mockSupabaseClient = {
  auth: {
    setSession: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    refreshSession: vi.fn(),
    signOut: vi.fn(),
  },
};

describe('SupabaseSessionAdapter', () => {
  let adapter: SupabaseSessionAdapter;

  beforeEach(() => {
    adapter = new SupabaseSessionAdapter();
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create session successfully', async () => {
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {},
        error: null,
      });

      await adapter.createSession('access-token', 'refresh-token');

      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });

    it('should throw error if session creation fails', async () => {
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {},
        error: { message: 'Session creation failed' },
      });

      await expect(
        adapter.createSession('invalid-token', 'invalid-refresh')
      ).rejects.toThrow('Session creation failed');
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session', async () => {
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const session = await adapter.getCurrentSession();

      expect(session).not.toBeNull();
      expect(session?.user).toBeDefined();
      expect(session?.accessToken).toBe('access-token');
      expect(session?.refreshToken).toBe('refresh-token');
    });

    it('should return null if no session exists', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const session = await adapter.getCurrentSession();

      expect(session).toBeNull();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const session = await adapter.refreshSession('old-refresh-token');

      expect(session.accessToken).toBe('new-access-token');
      expect(session.refreshToken).toBe('new-refresh-token');
    });

    it('should throw SessionExpiredError if refresh fails', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid refresh token' },
      });

      await expect(adapter.refreshSession('invalid-token')).rejects.toThrow(
        SessionExpiredError
      );
    });
  });

  describe('destroySession', () => {
    it('should destroy session successfully', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      await adapter.destroySession();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('isSessionValid', () => {
    it('should return true for valid session', async () => {
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };

      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const isValid = await adapter.isSessionValid();

      expect(isValid).toBe(true);
    });

    it('should return false if no session exists', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const isValid = await adapter.isSessionValid();

      expect(isValid).toBe(false);
    });
  });
});
