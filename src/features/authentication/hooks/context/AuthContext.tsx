'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSessionQuery } from '../queries'
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} from '../mutations'
import type {
  UserSession,
  LoginFormData,
  RegisterFormData,
  UpdateProfileFormData,
} from '../../data/schemas'

interface AuthContextValue {
  // User state
  user: UserSession | null | undefined
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  login: (data: LoginFormData) => void
  register: (data: RegisterFormData) => void
  logout: () => void
  updateProfile: (data: UpdateProfileFormData) => void

  // Mutation states
  isLoggingIn: boolean
  isRegistering: boolean
  isLoggingOut: boolean
  isUpdatingProfile: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Query for session data
  const { data: user, isLoading } = useSessionQuery()

  // Mutations
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const logoutMutation = useLogoutMutation()
  const updateProfileMutation = useUpdateProfileMutation()

  const value: AuthContextValue = {
    // User state
    user,
    isLoading,
    isAuthenticated: !!user,

    // Actions
    login: (data) => loginMutation.mutate(data),
    register: (data) => registerMutation.mutate(data),
    logout: () => logoutMutation.mutate(),
    updateProfile: (data) => updateProfileMutation.mutate(data),

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
