# Test Cases - Authentication Feature

**Feature**: Authentication and User Management
**Last Updated**: 2025-10-30
**Test Strategy**: TDD (Test-Driven Development)

---

## Table of Contents

1. [Domain Layer Tests](#domain-layer-tests)
2. [Application Layer Tests](#application-layer-tests)
3. [Infrastructure Layer Tests](#infrastructure-layer-tests)
4. [Web Layer Tests](#web-layer-tests)
5. [Coverage Goals](#coverage-goals)

---

## Domain Layer Tests

### Value Objects

#### Email Value Object

**File**: `src/features/authentication/domain/value-objects/__tests__/Email.test.ts`

**Test Cases**:
1. ✅ **Should create valid email**
   - Input: `"user@example.com"`
   - Expected: Email object created
   - Method: `Email.create()`

2. ✅ **Should normalize email to lowercase**
   - Input: `"USER@EXAMPLE.COM"`
   - Expected: `"user@example.com"`
   - Method: `getValue()`

3. ❌ **Should reject invalid email format**
   - Input: `"invalid-email"`
   - Expected: Error thrown with message "Invalid email format"

4. ❌ **Should reject email without @ symbol**
   - Input: `"userexample.com"`
   - Expected: Error thrown

5. ❌ **Should reject email without domain**
   - Input: `"user@"`
   - Expected: Error thrown

6. ❌ **Should reject empty email**
   - Input: `""`
   - Expected: Error thrown

7. ✅ **Should compare emails correctly**
   - Input: Two Email objects with same value
   - Expected: `equals()` returns true

8. ✅ **Should convert email to string**
   - Input: Email("user@example.com")
   - Expected: `toString()` returns `"user@example.com"`

---

#### Password Value Object

**File**: `src/features/authentication/domain/value-objects/__tests__/Password.test.ts`

**Test Cases**:
1. ✅ **Should create valid password (8+ characters, with uppercase, lowercase, number)**
   - Input: `"Password123"`
   - Expected: Password object created

2. ❌ **Should reject password < 8 characters**
   - Input: `"Pass1"`
   - Expected: Error "Password must be at least 8 characters"

3. ❌ **Should reject password without uppercase letter**
   - Input: `"password123"`
   - Expected: Error "Password must contain at least one uppercase letter"

4. ❌ **Should reject password without lowercase letter**
   - Input: `"PASSWORD123"`
   - Expected: Error "Password must contain at least one lowercase letter"

5. ❌ **Should reject password without number**
   - Input: `"Password"`
   - Expected: Error "Password must contain at least one number"

6. ✅ **Should compare passwords correctly**
   - Input: Two Password objects with same value
   - Expected: `equals()` returns true

7. ✅ **Should return password value**
   - Input: Password("Password123")
   - Expected: `getValue()` returns `"Password123"`

---

#### UserId Value Object

**File**: `src/features/authentication/domain/value-objects/__tests__/UserId.test.ts`

**Test Cases**:
1. ✅ **Should create valid UserId with UUID**
   - Input: `"550e8400-e29b-41d4-a716-446655440000"`
   - Expected: UserId object created

2. ❌ **Should reject invalid UUID format**
   - Input: `"invalid-uuid"`
   - Expected: Error "Invalid user ID format"

3. ❌ **Should reject empty string**
   - Input: `""`
   - Expected: Error thrown

4. ✅ **Should compare UserIds correctly**
   - Input: Two UserId objects with same UUID
   - Expected: `equals()` returns true

5. ✅ **Should convert to string**
   - Input: UserId with UUID
   - Expected: `toString()` returns UUID string

---

#### VerificationStatus Value Object

**File**: `src/features/authentication/domain/value-objects/__tests__/VerificationStatus.test.ts`

**Test Cases**:
1. ✅ **Should create unverified status**
   - Method: `VerificationStatus.unverified()`
   - Expected: Status is UNVERIFIED, `isVerified()` returns false

2. ✅ **Should create verified status with timestamp**
   - Method: `VerificationStatus.verified(new Date())`
   - Expected: Status is VERIFIED, `isVerified()` returns true, `getVerifiedAt()` returns date

3. ✅ **Should create pending status**
   - Method: `VerificationStatus.pending()`
   - Expected: Status is PENDING, `isVerified()` returns false

4. ✅ **Should get verification status**
   - Method: `getStatus()`
   - Expected: Returns correct VerificationStatusType

---

### Entities

#### User Entity

**File**: `src/features/authentication/domain/entities/__tests__/User.test.ts`

**Test Cases**:
1. ✅ **Should create User with valid props**
   - Input: UserProps with all fields
   - Expected: User entity created successfully

2. ✅ **Should reconstitute User from database data**
   - Input: Database object with id, email, emailVerifiedAt, timestamps
   - Expected: User entity reconstituted with value objects

3. ✅ **Should get user ID**
   - Method: `getId()`
   - Expected: Returns UserId value object

4. ✅ **Should get user email**
   - Method: `getEmail()`
   - Expected: Returns Email value object

5. ✅ **Should check if email is verified**
   - Method: `isEmailVerified()`
   - Expected: Returns boolean based on verification status

6. ✅ **Should verify email**
   - Method: `verifyEmail(new Date())`
   - Expected: Verification status changes to verified, updatedAt updated

7. ✅ **Should record login**
   - Method: `recordLogin()`
   - Expected: lastLoginAt set to current time, updatedAt updated

8. ✅ **Should check if user can access protected resources**
   - Method: `canAccessProtectedResources()`
   - Expected: Returns true only if email is verified

9. ✅ **Should get timestamps**
   - Methods: `getCreatedAt()`, `getUpdatedAt()`, `getLastLoginAt()`
   - Expected: Returns correct Date objects

---

#### UserProfile Entity

**File**: `src/features/authentication/domain/entities/__tests__/UserProfile.test.ts`

**Test Cases**:
1. ✅ **Should create UserProfile with valid props**
   - Input: UserProfileProps
   - Expected: UserProfile entity created

2. ✅ **Should reconstitute UserProfile from database data**
   - Input: Database object with id, email, fullName, avatarUrl, timestamps
   - Expected: UserProfile entity reconstituted

3. ✅ **Should update profile with fullName**
   - Method: `updateProfile({ fullName: "John Doe" })`
   - Expected: fullName updated, updatedAt updated

4. ✅ **Should update profile with avatarUrl**
   - Method: `updateProfile({ avatarUrl: "https://..." })`
   - Expected: avatarUrl updated, updatedAt updated

5. ✅ **Should update profile with multiple fields**
   - Method: `updateProfile({ fullName: "...", avatarUrl: "..." })`
   - Expected: Both fields updated, updatedAt updated

6. ✅ **Should get profile fields**
   - Methods: `getUserId()`, `getEmail()`, `getFullName()`, `getAvatarUrl()`
   - Expected: Returns correct values

---

### Domain Events

**File**: `src/features/authentication/domain/events/__tests__/DomainEvents.test.ts`

**Test Cases**:
1. ✅ **Should create UserRegistered event**
   - Input: UserId, Email, Date
   - Expected: Event object with correct properties

2. ✅ **Should create UserLoggedIn event**
   - Input: UserId, loginMethod, Date
   - Expected: Event object with correct properties

3. ✅ **Should create EmailVerified event**
   - Input: UserId, Date
   - Expected: Event object with correct properties

---

### Domain Errors

**File**: `src/features/authentication/domain/errors/__tests__/AuthenticationErrors.test.ts`

**Test Cases**:
1. ✅ **Should create InvalidCredentialsError**
   - Expected: Error name is "InvalidCredentialsError"

2. ✅ **Should create EmailNotVerifiedError**
   - Expected: Error name is "EmailNotVerifiedError"

3. ✅ **Should create UserNotFoundError**
   - Expected: Error name is "UserNotFoundError"

4. ✅ **Should create DuplicateEmailError**
   - Expected: Error name is "DuplicateEmailError"

5. ✅ **Should create InvalidTokenError**
   - Expected: Error name is "InvalidTokenError"

6. ✅ **Should create SessionExpiredError**
   - Expected: Error name is "SessionExpiredError"

---

## Application Layer Tests

### Use Cases

#### RegisterUserUseCase

**File**: `src/features/authentication/application/use-cases/__tests__/RegisterUserUseCase.test.ts`

**Test Cases**:
1. ✅ **Should register user with valid email and password**
   - Input: `{ email: "user@example.com", password: "Password123" }`
   - Expected: User created, profile created, UserRegistered event emitted
   - Mocks: authService.registerWithEmail, userRepository.createProfile

2. ❌ **Should throw error if email is invalid**
   - Input: `{ email: "invalid", password: "Password123" }`
   - Expected: Error thrown from Email.create()

3. ❌ **Should throw error if password is weak**
   - Input: `{ email: "user@example.com", password: "weak" }`
   - Expected: Error thrown from Password.create()

4. ❌ **Should throw DuplicateEmailError if email exists**
   - Input: Valid credentials
   - Expected: authService throws DuplicateEmailError
   - Mock: authService.registerWithEmail rejects with DuplicateEmailError

5. ✅ **Should create profile after user registration**
   - Expected: userRepository.createProfile called with UserProfile
   - Verify: Profile has userId and email matching user

---

#### LoginWithEmailUseCase

**File**: `src/features/authentication/application/use-cases/__tests__/LoginWithEmailUseCase.test.ts`

**Test Cases**:
1. ✅ **Should login user with valid credentials and verified email**
   - Input: `{ email: "user@example.com", password: "Password123" }`
   - Expected: Session created, last login updated, UserLoggedIn event emitted
   - Mocks: authService.loginWithEmail, sessionManager.createSession

2. ❌ **Should throw EmailNotVerifiedError if email not verified**
   - Input: Valid credentials
   - Expected: EmailNotVerifiedError thrown
   - Mock: authService returns user with emailVerified = false

3. ❌ **Should throw InvalidCredentialsError if credentials invalid**
   - Input: Invalid credentials
   - Expected: InvalidCredentialsError thrown
   - Mock: authService.loginWithEmail rejects with InvalidCredentialsError

4. ✅ **Should update last login timestamp**
   - Expected: userRepository.updateUserMetadata called with lastLoginAt

5. ✅ **Should create session with tokens**
   - Expected: sessionManager.createSession called with accessToken and refreshToken

---

#### LoginWithGoogleUseCase

**File**: `src/features/authentication/application/use-cases/__tests__/LoginWithGoogleUseCase.test.ts`

**Test Cases**:
1. ✅ **Should initiate Google OAuth**
   - Method: `initiateOAuth()`
   - Expected: Returns { url: "google-oauth-url" }
   - Mock: authService.loginWithGoogle

2. ✅ **Should handle OAuth callback with new user**
   - Input: Authorization code
   - Expected: Session created, profile created, last login updated
   - Mocks: authService.handleGoogleCallback, userRepository.findProfileById (returns null), userRepository.createProfile

3. ✅ **Should handle OAuth callback with existing user**
   - Input: Authorization code
   - Expected: Session created, last login updated, no profile created
   - Mocks: authService.handleGoogleCallback, userRepository.findProfileById (returns profile)

4. ❌ **Should throw error if OAuth code is invalid**
   - Input: Invalid code
   - Expected: InvalidCredentialsError thrown
   - Mock: authService.handleGoogleCallback rejects

---

#### LogoutUseCase

**File**: `src/features/authentication/application/use-cases/__tests__/LogoutUseCase.test.ts`

**Test Cases**:
1. ✅ **Should destroy session**
   - Expected: sessionManager.destroySession called
   - Mock: sessionManager.destroySession

---

#### GetCurrentUserUseCase

**File**: `src/features/authentication/application/use-cases/__tests__/GetCurrentUserUseCase.test.ts`

**Test Cases**:
1. ✅ **Should return user DTO if session exists**
   - Expected: Returns UserDTO with user and profile data
   - Mocks: sessionManager.getCurrentSession, userRepository.findProfileById

2. ✅ **Should return null if no session**
   - Expected: Returns null
   - Mock: sessionManager.getCurrentSession returns null

3. ✅ **Should include profile data in DTO**
   - Expected: UserDTO contains fullName and avatarUrl from profile

---

#### UpdateUserProfileUseCase

**File**: `src/features/authentication/application/use-cases/__tests__/UpdateUserProfileUseCase.test.ts`

**Test Cases**:
1. ✅ **Should update profile with valid data**
   - Input: `{ fullName: "John Doe", avatarUrl: "https://..." }`
   - Expected: Profile updated in repository
   - Mocks: userRepository.findProfileById, userRepository.updateProfile

2. ❌ **Should throw UserNotFoundError if profile not found**
   - Expected: UserNotFoundError thrown
   - Mock: userRepository.findProfileById returns null

3. ✅ **Should update only provided fields**
   - Input: `{ fullName: "John Doe" }`
   - Expected: Only fullName updated

---

#### RequestPasswordResetUseCase

**File**: `src/features/authentication/application/use-cases/__tests__/RequestPasswordResetUseCase.test.ts`

**Test Cases**:
1. ✅ **Should request password reset for valid email**
   - Input: `"user@example.com"`
   - Expected: authService.requestPasswordReset called
   - Mock: authService.requestPasswordReset

2. ❌ **Should throw error if email is invalid**
   - Input: `"invalid-email"`
   - Expected: Error thrown from Email.create()

---

#### ResetPasswordUseCase

**File**: `src/features/authentication/application/use-cases/__tests__/ResetPasswordUseCase.test.ts`

**Test Cases**:
1. ✅ **Should reset password with valid token and password**
   - Input: `{ token: "valid-token", newPassword: "NewPassword123" }`
   - Expected: authService.resetPassword called
   - Mock: authService.resetPassword

2. ❌ **Should throw error if password is weak**
   - Input: `{ token: "valid-token", newPassword: "weak" }`
   - Expected: Error thrown from Password.create()

3. ❌ **Should throw InvalidTokenError if token is invalid**
   - Expected: InvalidTokenError thrown
   - Mock: authService.resetPassword rejects with InvalidTokenError

---

## Infrastructure Layer Tests

### Adapters

#### SupabaseAuthAdapter

**File**: `src/features/authentication/infrastructure/adapters/__tests__/SupabaseAuthAdapter.test.ts`

**Test Cases**:
1. ✅ **Should register user with email and password**
   - Mock: supabase.auth.signUp
   - Expected: Returns User entity

2. ❌ **Should throw DuplicateEmailError if email exists**
   - Mock: supabase.auth.signUp rejects with "already registered"
   - Expected: DuplicateEmailError thrown

3. ✅ **Should login with email and password**
   - Mock: supabase.auth.signInWithPassword
   - Expected: Returns AuthenticationResult

4. ❌ **Should throw InvalidCredentialsError on wrong credentials**
   - Mock: supabase.auth.signInWithPassword rejects
   - Expected: InvalidCredentialsError thrown

5. ✅ **Should initiate Google OAuth**
   - Mock: supabase.auth.signInWithOAuth
   - Expected: Returns OAuth URL

6. ✅ **Should handle Google callback**
   - Mock: supabase.auth.exchangeCodeForSession
   - Expected: Returns AuthenticationResult

7. ✅ **Should request password reset**
   - Mock: supabase.auth.resetPasswordForEmail
   - Expected: Resolves successfully

8. ✅ **Should reset password with token**
   - Mock: supabase.auth.updateUser
   - Expected: Resolves successfully

9. ✅ **Should verify email**
   - Mock: supabase.auth.verifyOtp
   - Expected: Returns User entity

---

#### SupabaseSessionAdapter

**File**: `src/features/authentication/infrastructure/adapters/__tests__/SupabaseSessionAdapter.test.ts`

**Test Cases**:
1. ✅ **Should create session**
   - Mock: supabase.auth.setSession
   - Expected: Session created

2. ✅ **Should get current session**
   - Mock: supabase.auth.getSession, supabase.auth.getUser
   - Expected: Returns Session with User

3. ✅ **Should return null if no session**
   - Mock: supabase.auth.getSession returns null
   - Expected: Returns null

4. ✅ **Should refresh session**
   - Mock: supabase.auth.refreshSession
   - Expected: Returns new Session

5. ❌ **Should throw SessionExpiredError if refresh fails**
   - Mock: supabase.auth.refreshSession rejects
   - Expected: SessionExpiredError thrown

6. ✅ **Should destroy session**
   - Mock: supabase.auth.signOut
   - Expected: Resolves successfully

7. ✅ **Should validate session**
   - Mock: getCurrentSession
   - Expected: Returns boolean

---

### Repositories

#### SupabaseUserRepository

**File**: `src/features/authentication/infrastructure/repositories/__tests__/SupabaseUserRepository.test.ts`

**Test Cases**:
1. ✅ **Should find user by ID**
   - Mock: supabase.auth.admin.getUserById
   - Expected: Returns User entity

2. ✅ **Should return null if user not found**
   - Mock: supabase.auth.admin.getUserById returns null
   - Expected: Returns null

3. ✅ **Should create profile**
   - Mock: supabase.from('profiles').insert
   - Expected: Returns UserProfile entity

4. ❌ **Should throw error if profile creation fails**
   - Mock: supabase.from('profiles').insert rejects
   - Expected: Error thrown

5. ✅ **Should find profile by ID**
   - Mock: supabase.from('profiles').select
   - Expected: Returns UserProfile entity

6. ✅ **Should update profile**
   - Mock: supabase.from('profiles').update
   - Expected: Returns updated UserProfile entity

7. ✅ **Should update user metadata**
   - Mock: supabase.from('profiles').update
   - Expected: Resolves successfully

---

## Web Layer Tests

### API Routes

#### POST /api/auth/register

**File**: `app/api/auth/register/__tests__/route.test.ts`

**Test Cases**:
1. ✅ **Should register user with valid data**
   - Input: `{ email: "user@example.com", password: "Password123" }`
   - Expected: 201 status, success message
   - Mock: RegisterUserUseCase

2. ❌ **Should return 400 for invalid email**
   - Input: `{ email: "invalid", password: "Password123" }`
   - Expected: 400 status, validation error

3. ❌ **Should return 400 for weak password**
   - Input: `{ email: "user@example.com", password: "weak" }`
   - Expected: 400 status, validation error

4. ❌ **Should return 409 for duplicate email**
   - Expected: 409 status, "Email already in use"
   - Mock: UseCase throws DuplicateEmailError

5. ❌ **Should return 429 after 10 rapid requests (rate limit)**
   - Expected: 429 status after 11th request

---

#### POST /api/auth/login

**File**: `app/api/auth/login/__tests__/route.test.ts`

**Test Cases**:
1. ✅ **Should login with valid credentials**
   - Input: `{ email: "user@example.com", password: "Password123" }`
   - Expected: 200 status, user data
   - Mock: LoginWithEmailUseCase

2. ❌ **Should return 401 for invalid credentials**
   - Expected: 401 status
   - Mock: UseCase throws InvalidCredentialsError

3. ❌ **Should return 403 for unverified email**
   - Expected: 403 status, "Please verify your email first"
   - Mock: UseCase throws EmailNotVerifiedError

4. ❌ **Should return 400 for validation errors**
   - Input: Invalid format
   - Expected: 400 status

---

#### POST /api/auth/logout

**File**: `app/api/auth/logout/__tests__/route.test.ts`

**Test Cases**:
1. ✅ **Should logout successfully**
   - Expected: 200 status, success message
   - Mock: LogoutUseCase

2. ❌ **Should return 500 on error**
   - Expected: 500 status
   - Mock: UseCase throws error

---

#### GET /api/auth/session

**File**: `app/api/auth/session/__tests__/route.test.ts`

**Test Cases**:
1. ✅ **Should return session if authenticated**
   - Expected: 200 status, user data
   - Mock: GetCurrentUserUseCase

2. ✅ **Should return null if not authenticated**
   - Expected: 200 status, { user: null }
   - Mock: UseCase returns null

---

#### GET /api/auth/callback

**File**: `app/api/auth/callback/__tests__/route.test.ts`

**Test Cases**:
1. ✅ **Should handle OAuth callback**
   - Query: `?code=xxx`
   - Expected: Redirect to /dashboard
   - Mock: LoginWithGoogleUseCase

2. ❌ **Should redirect to login on missing code**
   - Query: (empty)
   - Expected: Redirect to /login?error=missing_code

3. ❌ **Should redirect to login on OAuth error**
   - Expected: Redirect to /login?error=oauth_failed
   - Mock: UseCase throws error

---

#### POST /api/auth/reset-password

**File**: `app/api/auth/reset-password/__tests__/route.test.ts`

**Test Cases**:
1. ✅ **Should send password reset email**
   - Input: `{ email: "user@example.com" }`
   - Expected: 200 status, success message
   - Mock: RequestPasswordResetUseCase

2. ❌ **Should return 400 for invalid email**
   - Input: `{ email: "invalid" }`
   - Expected: 400 status

3. ❌ **Should return 429 after rate limit (5 req/min)**
   - Expected: 429 status after 6th request

---

#### PATCH /api/auth/profile

**File**: `app/api/auth/profile/__tests__/route.test.ts`

**Test Cases**:
1. ✅ **Should update profile when authenticated**
   - Input: `{ fullName: "John Doe", avatarUrl: "https://..." }`
   - Expected: 200 status, success message
   - Mock: UpdateUserProfileUseCase

2. ❌ **Should return 401 if not authenticated**
   - Expected: 401 status
   - Mock: GetCurrentUserUseCase returns null

3. ❌ **Should return 400 for validation errors**
   - Input: Invalid data
   - Expected: 400 status

---

## Coverage Goals

### Domain Layer
- **Target**: 100%
- **Why**: Pure business logic, no external dependencies, critical to get right

### Application Layer
- **Target**: 95%
- **Why**: Orchestrates business logic, contains most business rules

### Infrastructure Layer
- **Target**: 80%
- **Why**: Adapters with external dependencies, some paths hard to test

### Web Layer (API Routes)
- **Target**: 90%
- **Why**: Entry points to application, critical for security

### Overall Backend
- **Target**: 90%+

---

## Test Execution Commands

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests for specific feature
npm run test src/features/authentication

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test Email.test.ts
```

---

## Mocking Strategy

### Domain Layer
- **No mocks needed** - Pure functions and value objects

### Application Layer
- Mock all ports (IAuthenticationService, IUserRepository, ISessionManager)
- Use Vitest mock functions

### Infrastructure Layer
- Mock Supabase client using Vitest
- Mock Next.js cookies() API

### Web Layer
- Mock use cases
- Use Next.js test utilities for route handlers

---

**Total Test Cases**: 100+ tests across all layers
**Estimated Test Writing Time**: 8-10 hours
**Coverage Target**: 90%+
