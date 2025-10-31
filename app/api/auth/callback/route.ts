import { NextRequest, NextResponse } from 'next/server'
import { LoginWithGoogleUseCase } from '@/src/features/authentication/application/use-cases/LoginWithGoogleUseCase'
import { SupabaseAuthAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseAuthAdapter'
import { SupabaseSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseSessionAdapter'
import { SupabaseUserRepository } from '@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
    }

    const authService = new SupabaseAuthAdapter()
    const sessionManager = new SupabaseSessionAdapter()
    const userRepository = new SupabaseUserRepository()

    const useCase = new LoginWithGoogleUseCase(authService, sessionManager, userRepository)
    await useCase.handleCallback(code)

    // Redirect to dashboard after successful OAuth
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (_error) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url))
  }
}
