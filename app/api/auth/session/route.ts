import { NextResponse } from 'next/server'
import { GetCurrentUserUseCase } from '@/src/features/authentication/application/use-cases/GetCurrentUserUseCase'
import { SupabaseRouteHandlerSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseRouteHandlerSessionAdapter'
import { SupabaseUserRepository } from '@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository'

export async function GET() {
  try {
    const sessionManager = new SupabaseRouteHandlerSessionAdapter()
    const userRepository = new SupabaseUserRepository()

    const useCase = new GetCurrentUserUseCase(sessionManager, userRepository)
    const user = await useCase.execute()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
  }
}
