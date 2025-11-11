import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UpdateProfileRequest } from '../schemas'

const supabase = createClient()

/**
 * User Service
 * Handles user profile-related API calls
 */
export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (error) {
      // Profile might not exist yet (new user)
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }
  },

  /**
   * Create user profile (for new users)
   */
  async createProfile(userId: string, email: string, fullName?: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || null,
        avatar_url: null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },
}
