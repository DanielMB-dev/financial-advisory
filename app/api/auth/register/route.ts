import { NextRequest, NextResponse } from 'next/server';
import { RegisterUserUseCase } from '@/src/features/authentication/application/use-cases/RegisterUserUseCase';
import { SupabaseAuthAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseAuthAdapter';
import { SupabaseUserRepository } from '@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // 2. Instantiate dependencies
    const authService = new SupabaseAuthAdapter();
    const userRepository = new SupabaseUserRepository();

    // 3. Execute use case
    const useCase = new RegisterUserUseCase(authService, userRepository);
    await useCase.execute(validatedData);

    // 4. Return success response
    return NextResponse.json(
      {
        message:
          'Registration successful. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    // 5. Handle errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Map domain errors to HTTP status codes
      if (error.name === 'DuplicateEmailError') {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
