import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock the use cases and infrastructure
vi.mock('@/src/features/authentication/application/use-cases/RegisterUserUseCase')
vi.mock('@/src/features/authentication/infrastructure/adapters/SupabaseAuthAdapter')
vi.mock('@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository')

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register user with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'Password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toContain('Registration successful')
  })

  it('should return 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'Password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation error')
  })

  it('should return 400 for weak password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'weak',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation error')
  })
})
