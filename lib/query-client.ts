import { QueryClient, DefaultOptions } from '@tanstack/react-query'

const queryConfig: DefaultOptions = {
  queries: {
    // Stale time for auth queries - session data doesn't change often
    staleTime: 1000 * 60 * 5, // 5 minutes

    // Retry failed queries
    retry: (failureCount, error: unknown) => {
      // Don't retry on auth errors
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) {
        return false
      }
      return failureCount < 3
    },

    // Refetch on window focus for auth data
    refetchOnWindowFocus: true,

    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  },
  mutations: {
    // Retry mutations only on network errors
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false // Don't retry client errors
      }
      return failureCount < 2
    },
  },
}

// Create a function to make a new query client
// This is used in both client and server components
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  })
}

// Browser query client (singleton)
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: use singleton pattern to avoid re-creating on every render
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

// Query keys factory for consistency
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  // Add more query keys as features are added
}
