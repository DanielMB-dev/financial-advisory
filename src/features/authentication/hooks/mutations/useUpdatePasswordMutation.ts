import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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

  const mutation = useMutation({
    mutationFn: (data: UpdatePasswordRequest) => authService.updatePassword(data),
    onSuccess: () => {
      router.push('/login?message=password-updated')
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
