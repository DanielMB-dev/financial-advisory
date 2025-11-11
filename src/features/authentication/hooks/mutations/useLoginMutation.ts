import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import { authService, type AuthResponse } from '../../data/services'
import type { LoginRequest } from '../../data/schemas'

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (data) => authService.login(data),
    onSuccess: (response) => {
      // Invalidate session query to refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })

      toast.success('Login successful', {
        description: response.user?.email
          ? `Welcome back, ${response.user.email}`
          : 'Welcome back!',
      })

      // Redirect to dashboard
      router.push('/dashboard')
    },
    onError: (error) => {
      toast.error('Login failed', {
        description: error.message || 'Invalid email or password',
      })
    },
  })
}
