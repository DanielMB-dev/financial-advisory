import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '../../data/services'
import type { UpdatePasswordRequest } from '../../data/schemas'

interface UseUpdatePasswordMutationReturn {
  updatePassword: UseMutationResult<void, Error, UpdatePasswordRequest>['mutate']
  updatePasswordAsync: UseMutationResult<void, Error, UpdatePasswordRequest>['mutateAsync']
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Hook to update password with reset token
 */
export function useUpdatePasswordMutation(): UseUpdatePasswordMutationReturn {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: UpdatePasswordRequest) => authService.updatePassword(data),
    onSuccess: () => {
      // Invalidate session to refresh auth state
      queryClient.invalidateQueries({ queryKey: ['session'] })

      toast.success('Password reset successful', {
        description: 'Redirecting to dashboard...',
      })

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    },
    onError: (error: Error) => {
      // Categorize errors for better UX
      if (error.message.includes('invalid') || error.message.includes('expired')) {
        toast.error('Invalid or expired link', {
          description: 'Request a new password reset link',
        })
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        toast.error('Session expired', {
          description: 'Please request a new password reset link',
        })
      } else {
        toast.error('Failed to reset password', {
          description: error.message || 'Please try again',
        })
      }
    },
  })

  return {
    updatePassword: mutation.mutate,
    updatePasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
