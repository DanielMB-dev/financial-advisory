import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import { userService } from '../../data/services'
import type { UpdateProfileFormData, UserSession } from '../../data/schemas'

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation<UserSession, Error, UpdateProfileFormData>({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update the session query cache
      queryClient.setQueryData<UserSession | null>(queryKeys.auth.session(), updatedUser)

      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error('Profile update failed', {
        description: error.message || 'Unable to update profile. Please try again.',
      })
    },
  })
}
