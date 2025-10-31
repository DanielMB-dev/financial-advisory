import { IUserRepository } from '../../application/ports/IUserRepository'
import { User } from '../../domain/entities/User'
import { UserProfile } from '../../domain/entities/UserProfile'
import { UserId } from '../../domain/value-objects/UserId'
import { Email } from '../../domain/value-objects/Email'
import { createServerSupabaseClient } from '../supabase/server-client'

export class SupabaseUserRepository implements IUserRepository {
  async findById(userId: UserId): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    // Get user from auth.users via Admin API
    const { data, error } = await supabase.auth.admin.getUserById(userId.getValue())

    if (error || !data.user) {
      return null
    }

    return User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    })
  }

  async findByEmail(_email: Email): Promise<User | null> {
    // Note: Supabase doesn't provide direct email lookup in auth.users
    // This would require using service role key or alternative approach
    // For now, return null (used mainly for duplicate checks which Supabase handles)
    return null
  }

  async createProfile(profile: UserProfile): Promise<UserProfile> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.getUserId().getValue(),
        email: profile.getEmail().getValue(),
        full_name: profile.getFullName(),
        avatar_url: profile.getAvatarUrl(),
        created_at: profile.getCreatedAt(),
        updated_at: profile.getUpdatedAt(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return UserProfile.reconstitute({
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    })
  }

  async findProfileById(userId: UserId): Promise<UserProfile | null> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId.getValue())
      .single()

    if (error || !data) {
      return null
    }

    return UserProfile.reconstitute({
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    })
  }

  async updateProfile(userId: UserId, profile: UserProfile): Promise<UserProfile> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.getFullName(),
        avatar_url: profile.getAvatarUrl(),
        updated_at: new Date(),
      })
      .eq('id', userId.getValue())
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return UserProfile.reconstitute({
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    })
  }

  async updateUserMetadata(userId: UserId, _metadata: { lastLoginAt?: Date }): Promise<void> {
    // Note: Supabase auth.users doesn't support custom metadata updates directly
    // Store this in profiles table
    const supabase = await createServerSupabaseClient()

    await supabase.from('profiles').update({ updated_at: new Date() }).eq('id', userId.getValue())
  }
}
