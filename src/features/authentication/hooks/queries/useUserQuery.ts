import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { userService } from '../../data/services'
import type { UserProfile } from '../../data/schemas'

/**
 * Hook to fetch user profile
 */
export function useUserQuery(): UseQueryResult<UserProfile | null, Error> {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => userService.getProfile(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  })
}
