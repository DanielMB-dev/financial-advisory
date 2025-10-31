import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseUserRepository } from '../SupabaseUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { UserProfile } from '../../../domain/entities/UserProfile';

// Mock the Supabase client
vi.mock('../../supabase/server-client', () => ({
  createServerSupabaseClient: vi.fn(() => mockSupabaseClient),
}));

const createMockChain = () => ({
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
});

const mockSupabaseClient = {
  auth: {
    admin: {
      getUserById: vi.fn(),
    },
  },
  from: vi.fn(() => createMockChain()),
};

describe('SupabaseUserRepository', () => {
  let repository: SupabaseUserRepository;

  beforeEach(() => {
    repository = new SupabaseUserRepository();
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const user = await repository.findById(userId);

      expect(user).not.toBeNull();
      expect(user?.getId().getValue()).toBe(mockUser.id);
      expect(user?.getEmail().getValue()).toBe(mockUser.email);
    });

    it('should return null if user not found', async () => {
      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' },
      });

      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const user = await repository.findById(userId);

      expect(user).toBeNull();
    });
  });

  describe('createProfile', () => {
    it('should create profile successfully', async () => {
      const mockProfileData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        full_name: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        ...createMockChain(),
        single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const profile = UserProfile.create({
        userId: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
        email: Email.create('user@example.com'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await repository.createProfile(profile);

      expect(created).toBeDefined();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
    });

    it('should throw error if creation fails', async () => {
      const mockChain = {
        ...createMockChain(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' }
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const profile = UserProfile.create({
        userId: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
        email: Email.create('user@example.com'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(repository.createProfile(profile)).rejects.toThrow('Insert failed');
    });
  });

  describe('findProfileById', () => {
    it('should find profile by user ID', async () => {
      const mockProfileData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        ...createMockChain(),
        single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const profile = await repository.findProfileById(userId);

      expect(profile).not.toBeNull();
      expect(profile?.getUserId().getValue()).toBe(mockProfileData.id);
      expect(profile?.getFullName()).toBe('John Doe');
    });

    it('should return null if profile not found', async () => {
      const mockChain = {
        ...createMockChain(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const profile = await repository.findProfileById(userId);

      expect(profile).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockProfileData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        full_name: 'Jane Doe',
        avatar_url: 'https://example.com/new-avatar.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        ...createMockChain(),
        single: vi.fn().mockResolvedValue({ data: mockProfileData, error: null }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const profile = UserProfile.create({
        userId,
        email: Email.create('user@example.com'),
        fullName: 'Jane Doe',
        avatarUrl: 'https://example.com/new-avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updated = await repository.updateProfile(userId, profile);

      expect(updated).toBeDefined();
      expect(updated.getFullName()).toBe('Jane Doe');
    });
  });
});
