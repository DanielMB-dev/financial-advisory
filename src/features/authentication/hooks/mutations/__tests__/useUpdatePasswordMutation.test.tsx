import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdatePasswordMutation } from '../useUpdatePasswordMutation'
import { authService } from '../../../data/services'
import type { ReactNode } from 'react'

vi.mock('../../../data/services', () => ({
  authService: {
    updatePassword: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useUpdatePasswordMutation', () => {
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

  it('should call authService.updatePassword with password data', async () => {
    const mockUpdatePassword = vi.mocked(authService.updatePassword)
    mockUpdatePassword.mockResolvedValue()

    const { result } = renderHook(() => useUpdatePasswordMutation(), { wrapper })

    result.current.updatePassword({
      password: 'NewPass123',
      confirmPassword: 'NewPass123',
    })

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({
        password: 'NewPass123',
        confirmPassword: 'NewPass123',
      })
    })
  })

  it('should set isSuccess to true on successful mutation', async () => {
    const mockUpdatePassword = vi.mocked(authService.updatePassword)
    mockUpdatePassword.mockResolvedValue()

    const { result } = renderHook(() => useUpdatePasswordMutation(), { wrapper })

    result.current.updatePassword({
      password: 'NewPass123',
      confirmPassword: 'NewPass123',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should set error on failed mutation', async () => {
    const mockUpdatePassword = vi.mocked(authService.updatePassword)
    const mockError = new Error('Failed to update password')
    mockUpdatePassword.mockRejectedValue(mockError)

    const { result } = renderHook(() => useUpdatePasswordMutation(), { wrapper })

    result.current.updatePassword({
      password: 'NewPass123',
      confirmPassword: 'NewPass123',
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it('should invalidate session queries on success', async () => {
    const mockUpdatePassword = vi.mocked(authService.updatePassword)
    mockUpdatePassword.mockResolvedValue()

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdatePasswordMutation(), { wrapper })

    result.current.updatePassword({
      password: 'NewPass123',
      confirmPassword: 'NewPass123',
    })

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['session'] })
    })
  })

  it('should provide updatePasswordAsync for async/await pattern', async () => {
    const mockUpdatePassword = vi.mocked(authService.updatePassword)
    mockUpdatePassword.mockResolvedValue()

    const { result } = renderHook(() => useUpdatePasswordMutation(), { wrapper })

    await result.current.updatePasswordAsync({
      password: 'NewPass123',
      confirmPassword: 'NewPass123',
    })

    expect(mockUpdatePassword).toHaveBeenCalledWith({
      password: 'NewPass123',
      confirmPassword: 'NewPass123',
    })
  })
})
