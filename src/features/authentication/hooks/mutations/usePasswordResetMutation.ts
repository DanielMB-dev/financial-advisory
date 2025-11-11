import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { authService } from '../../data/services'
import type { PasswordResetRequest } from '../../data/schemas'

interface UsePasswordResetMutationReturn {
  requestReset: UseMutationResult<void, Error, PasswordResetRequest>['mutate']
  requestResetAsync: UseMutationResult<void, Error, PasswordResetRequest>['mutateAsync']
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

/**
 * Hook to request password reset
 */
export function usePasswordResetMutation(): UsePasswordResetMutationReturn {
  const mutation = useMutation({
    mutationFn: (data: PasswordResetRequest) => authService.requestPasswordReset(data),
  })

  return {
    requestReset: mutation.mutate,
    requestResetAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
