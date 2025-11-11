import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { userService } from '../../data/services'
import type { UserSession } from '../../data/schemas'

export function useSessionQuery() {
  return useQuery<UserSession | null>({
    queryKey: queryKeys.auth.session(),
    queryFn: () => userService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry failed auth requests
  })
}
