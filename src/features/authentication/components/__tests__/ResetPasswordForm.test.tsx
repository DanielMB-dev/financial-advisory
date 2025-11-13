import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ResetPasswordForm } from '../ResetPasswordForm'
import { authService } from '../../data/services'
import type { ReactNode } from 'react'

vi.mock('../../data/services', () => ({
  authService: {
    updatePassword: vi.fn(),
  },
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
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

describe('ResetPasswordForm', () => {
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

  it('should render the form with password fields', () => {
    render(<ResetPasswordForm />, { wrapper })

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('should show validation error for short password', async () => {
    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)

    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.blur(passwordInput)

    // The PasswordRequirements component should show the unmet requirement
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })

    // Verify the requirement is shown as unmet (with X icon, not check icon)
    const requirementItem = screen.getByText(/at least 8 characters/i).closest('li')
    expect(requirementItem).toHaveClass('text-muted-foreground')
  })

  it('should show validation error for password without uppercase', async () => {
    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)

    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.blur(passwordInput)

    await waitFor(() => {
      expect(
        screen.getByText(/password must contain at least one uppercase letter/i)
      ).toBeInTheDocument()
    })
  })

  it('should show validation error for password without lowercase', async () => {
    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)

    fireEvent.change(passwordInput, { target: { value: 'PASSWORD123' } })
    fireEvent.blur(passwordInput)

    await waitFor(() => {
      expect(
        screen.getByText(/password must contain at least one lowercase letter/i)
      ).toBeInTheDocument()
    })
  })

  it('should show validation error for password without number', async () => {
    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)

    fireEvent.change(passwordInput, { target: { value: 'PasswordABC' } })
    fireEvent.blur(passwordInput)

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for mismatched passwords', async () => {
    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password456' } })
    fireEvent.blur(confirmPasswordInput)

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid matching passwords', async () => {
    const mockUpdatePassword = vi.mocked(authService.updatePassword)
    mockUpdatePassword.mockResolvedValue()

    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({
        password: 'Password123',
        confirmPassword: 'Password123',
      })
    })
  })

  it('should disable form while submitting', async () => {
    const mockUpdatePassword = vi.mocked(authService.updatePassword)
    mockUpdatePassword.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(confirmPasswordInput).toBeDisabled()
    })
  })

  it('should show success message after successful submission', async () => {
    const mockUpdatePassword = vi.mocked(authService.updatePassword)
    mockUpdatePassword.mockResolvedValue()

    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password reset successful/i)).toBeInTheDocument()
    })
  })

  it('should show password requirements when user types password', async () => {
    render(<ResetPasswordForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/new password/i)

    fireEvent.change(passwordInput, { target: { value: 'P' } })

    await waitFor(() => {
      // PasswordRequirements component should be visible
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('should show "Back to login" link', () => {
    render(<ResetPasswordForm />, { wrapper })

    expect(screen.getByText(/back to login/i)).toBeInTheDocument()
  })
})
