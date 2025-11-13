import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ForgotPasswordForm } from '../ForgotPasswordForm'
import { authService } from '../../data/services'
import type { ReactNode } from 'react'

vi.mock('../../data/services', () => ({
  authService: {
    requestPasswordReset: vi.fn(),
  },
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('ForgotPasswordForm', () => {
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

  it('should render the form with email input', () => {
    render(<ForgotPasswordForm />, { wrapper })

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('should show validation error for invalid email', async () => {
    render(<ForgotPasswordForm />, { wrapper })

    const emailInput = screen.getByLabelText(/email/i)

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for empty email', async () => {
    render(<ForgotPasswordForm />, { wrapper })

    const emailInput = screen.getByLabelText(/email/i)

    // First enter a valid email, then clear it to trigger validation
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(emailInput, { target: { value: '' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address|email is required/i)
      ).toBeInTheDocument()
    })
  })

  it('should submit form with valid email', async () => {
    const mockRequestPasswordReset = vi.mocked(authService.requestPasswordReset)
    mockRequestPasswordReset.mockResolvedValue()

    render(<ForgotPasswordForm />, { wrapper })

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({ email: 'test@example.com' })
    })
  })

  it('should disable form while submitting', async () => {
    const mockRequestPasswordReset = vi.mocked(authService.requestPasswordReset)
    mockRequestPasswordReset.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<ForgotPasswordForm />, { wrapper })

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(emailInput).toBeDisabled()
    })
  })

  it('should show success message after successful submission', async () => {
    const mockRequestPasswordReset = vi.mocked(authService.requestPasswordReset)
    mockRequestPasswordReset.mockResolvedValue()

    render(<ForgotPasswordForm />, { wrapper })

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      expect(screen.getByText(/if an account exists with this email/i)).toBeInTheDocument()
    })
  })

  it('should show "Back to login" link in success state', async () => {
    const mockRequestPasswordReset = vi.mocked(authService.requestPasswordReset)
    mockRequestPasswordReset.mockResolvedValue()

    render(<ForgotPasswordForm />, { wrapper })

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/back to login/i)).toBeInTheDocument()
    })
  })

  it('should show "Sign in" link when not in success state', () => {
    render(<ForgotPasswordForm />, { wrapper })

    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })
})
