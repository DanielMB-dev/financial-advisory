import { NextResponse } from 'next/server'
import { LogoutUseCase } from '@/src/features/authentication/application/use-cases/LogoutUseCase'
import { SupabaseRouteHandlerSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseRouteHandlerSessionAdapter'

export async function POST() {
  try {
    const sessionManager = new SupabaseRouteHandlerSessionAdapter()
    const useCase = new LogoutUseCase(sessionManager)
    await useCase.execute()

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 })
  } catch (_error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
