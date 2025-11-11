import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import { authService } from '../../data/services'

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })

      toast.success('Logged out successfully')

      // Redirect to login page
      router.push('/login')
    },
    onError: (error) => {
      toast.error('Logout failed', {
        description: error.message || 'Unable to logout. Please try again.',
      })
    },
  })
}
