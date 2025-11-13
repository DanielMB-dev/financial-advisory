import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePasswordResetMutation } from '../usePasswordResetMutation'
import { authService } from '../../../data/services'
import type { ReactNode } from 'react'

vi.mock('../../../data/services', () => ({
  authService: {
    requestPasswordReset: vi.fn(),
  },
}))

describe('usePasswordResetMutation', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('should call authService.requestPasswordReset with email', async () => {
    const mockRequestPasswordReset = vi.mocked(authService.requestPasswordReset)
    mockRequestPasswordReset.mockResolvedValue()

    const { result } = renderHook(() => usePasswordResetMutation(), { wrapper })

    result.current.requestReset({ email: 'test@example.com' })

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({ email: 'test@example.com' })
    })
  })

  it('should set isSuccess to true on successful mutation', async () => {
    const mockRequestPasswordReset = vi.mocked(authService.requestPasswordReset)
    mockRequestPasswordReset.mockResolvedValue()

    const { result } = renderHook(() => usePasswordResetMutation(), { wrapper })

    result.current.requestReset({ email: 'test@example.com' })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should set error on failed mutation', async () => {
    const mockRequestPasswordReset = vi.mocked(authService.requestPasswordReset)
    const mockError = new Error('Failed to send reset email')
    mockRequestPasswordReset.mockRejectedValue(mockError)

    const { result } = renderHook(() => usePasswordResetMutation(), { wrapper })

    result.current.requestReset({ email: 'test@example.com' })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it('should provide requestResetAsync for async/await pattern', async () => {
    const mockRequestPasswordReset = vi.mocked(authService.requestPasswordReset)
    mockRequestPasswordReset.mockResolvedValue()

    const { result } = renderHook(() => usePasswordResetMutation(), { wrapper })

    await result.current.requestResetAsync({ email: 'test@example.com' })

    expect(mockRequestPasswordReset).toHaveBeenCalledWith({ email: 'test@example.com' })
  })
})
