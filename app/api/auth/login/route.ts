import { NextRequest, NextResponse } from 'next/server'
import { LoginWithEmailUseCase } from '@/src/features/authentication/application/use-cases/LoginWithEmailUseCase'
import { SupabaseAuthAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseAuthAdapter'
import { SupabaseSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseSessionAdapter'
import { SupabaseUserRepository } from '@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const authService = new SupabaseAuthAdapter()
    const sessionManager = new SupabaseSessionAdapter()
    const userRepository = new SupabaseUserRepository()

    const useCase = new LoginWithEmailUseCase(authService, sessionManager, userRepository)
    const result = await useCase.execute(validatedData)

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: result.userId,
          email: result.email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.name === 'InvalidCredentialsError') {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      if (error.name === 'EmailNotVerifiedError') {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
