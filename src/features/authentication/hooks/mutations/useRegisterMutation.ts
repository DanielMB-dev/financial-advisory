import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService, type AuthResponse } from '../../data/services'
import type { RegisterRequest } from '../../data/schemas'

// Module-level flag to prevent concurrent registrations
// This is a synchronous guard that works across all component instances
let isRegistrationInProgress = false

export function useRegisterMutation() {
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (data) => {
      // Synchronous guard against concurrent mutations
      if (isRegistrationInProgress) {
        throw new Error('Registration already in progress')
      }

      try {
        isRegistrationInProgress = true
        return await authService.register(data)
      } finally {
        // Always reset the flag, even on error
        isRegistrationInProgress = false
      }
    },
    onSuccess: () => {
      toast.success('Registration successful', {
        description: 'Please check your email to verify your account.',
        duration: 5000,
      })

      // Don't redirect - let user see the success message
      // They need to check their email for verification link
    },
    onError: (error) => {
      // Don't show error for concurrent mutation attempts
      if (error.message === 'Registration already in progress') {
        return
      }

      toast.error('Registration failed', {
        description: error.message || 'Unable to create account. Please try again.',
      })
    },
  })
}
