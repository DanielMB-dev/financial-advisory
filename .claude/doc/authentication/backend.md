# Backend Implementation Plan - Authentication Feature

**Feature**: Authentication and User Management
**Architecture**: Hexagonal (Ports & Adapters) with DDD
**Tech Stack**: Next.js 14+, TypeScript, Supabase Auth, PostgreSQL
**Last Updated**: 2025-10-30

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Domain Layer Design](#domain-layer-design)
3. [Application Layer Design](#application-layer-design)
4. [Infrastructure Layer Design](#infrastructure-layer-design)
5. [API Routes Design](#api-routes-design)
6. [Implementation Guidelines](#implementation-guidelines)
7. [Critical Notes](#critical-notes)

---

## Architecture Overview

### Key Architectural Decisions

**1. Supabase as Infrastructure Concern**
- Supabase Auth is treated as an **infrastructure adapter** (external service)
- Domain layer remains **pure** and framework-agnostic
- All Supabase-specific logic is isolated in infrastructure layer

**2. Separation of Concerns**
- `User` entity (domain) represents business user concept
- `AuthUser` (Supabase auth.users) is infrastructure detail
- `UserProfile` (public.profiles) is application/domain data

**3. Session Management Strategy**
- Sessions are managed by Supabase (JWT tokens in httpOnly cookies)
- Domain layer defines session validation ports
- Infrastructure adapters implement session management via @supabase/ssr

**4. Authentication Flows as Use Cases**
- Each auth flow (register, login, OAuth) is a distinct use case
- Use cases orchestrate domain logic and infrastructure adapters
- API routes are thin layers that invoke use cases

### Directory Structure

```
src/features/authentication/
├── domain/
│   ├── entities/
│   │   ├── User.ts                    # Core User entity
│   │   └── UserProfile.ts             # User profile data
│   ├── value-objects/
│   │   ├── Email.ts                   # Email value object
│   │   ├── Password.ts                # Password value object (validation only)
│   │   ├── UserId.ts                  # UserId value object
│   │   └── VerificationStatus.ts      # Email verification status
│   ├── events/
│   │   ├── UserRegistered.ts          # Domain event
│   │   ├── UserLoggedIn.ts            # Domain event
│   │   ├── EmailVerified.ts           # Domain event
│   │   └── PasswordResetRequested.ts  # Domain event
│   └── errors/
│       ├── InvalidCredentialsError.ts
│       ├── EmailNotVerifiedError.ts
│       ├── UserNotFoundError.ts
│       └── DuplicateEmailError.ts
├── application/
│   ├── use-cases/
│   │   ├── RegisterUserUseCase.ts
│   │   ├── LoginWithEmailUseCase.ts
│   │   ├── LoginWithGoogleUseCase.ts
│   │   ├── LogoutUseCase.ts
│   │   ├── VerifyEmailUseCase.ts
│   │   ├── RequestPasswordResetUseCase.ts
│   │   ├── ResetPasswordUseCase.ts
│   │   ├── GetCurrentUserUseCase.ts
│   │   ├── UpdateUserProfileUseCase.ts
│   │   └── ChangePasswordUseCase.ts
│   ├── ports/
│   │   ├── IAuthenticationService.ts   # Port for auth operations
│   │   ├── IUserRepository.ts          # Port for user data
│   │   ├── ISessionManager.ts          # Port for session management
│   │   └── IEmailService.ts            # Port for email operations
│   └── dtos/
│       ├── RegisterUserDTO.ts
│       ├── LoginDTO.ts
│       ├── UserDTO.ts
│       ├── UpdateProfileDTO.ts
│       └── ResetPasswordDTO.ts
└── infrastructure/
    ├── adapters/
    │   ├── SupabaseAuthAdapter.ts      # Implements IAuthenticationService
    │   ├── SupabaseSessionAdapter.ts   # Implements ISessionManager
    │   └── SupabaseEmailAdapter.ts     # Implements IEmailService
    ├── repositories/
    │   └── SupabaseUserRepository.ts   # Implements IUserRepository
    └── supabase/
        ├── client.ts                    # Supabase client factory
        ├── server-client.ts             # Server-side client
        └── middleware.ts                # Session middleware
```

---

## Domain Layer Design

### 1. Value Objects

#### **Email Value Object**

**Purpose**: Encapsulate email validation logic and ensure email is always valid.

**File**: `src/features/authentication/domain/value-objects/Email.ts`

```typescript
import { z } from 'zod';

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  static create(email: string): Email {
    const schema = z.string().email().toLowerCase();
    const result = schema.safeParse(email);

    if (!result.success) {
      throw new Error('Invalid email format');
    }

    return new Email(result.data);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

**Why**:
- Email is a domain concept with validation rules
- Prevents invalid emails from entering the domain
- Type-safe compared to raw strings

---

#### **Password Value Object**

**Purpose**: Validate password strength. **IMPORTANT**: Does NOT store password hash (that's Supabase's responsibility).

**File**: `src/features/authentication/domain/value-objects/Password.ts`

```typescript
import { z } from 'zod';

export class Password {
  private readonly value: string;

  private constructor(password: string) {
    this.value = password;
  }

  static create(password: string): Password {
    const schema = z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number');

    const result = schema.safeParse(password);

    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    return new Password(result.data);
  }

  getValue(): string {
    return this.value;
  }

  // For comparison during password change
  equals(other: Password): boolean {
    return this.value === other.value;
  }
}
```

**Critical Note**:
- This VO only validates password strength
- It does NOT hash passwords (Supabase handles that)
- The plain text password is only used for validation and passed to Supabase
- Never persist this value object

---

#### **UserId Value Object**

**Purpose**: Type-safe wrapper for user IDs (UUIDs from Supabase).

**File**: `src/features/authentication/domain/value-objects/UserId.ts`

```typescript
import { z } from 'zod';

export class UserId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  static create(id: string): UserId {
    const schema = z.string().uuid();
    const result = schema.safeParse(id);

    if (!result.success) {
      throw new Error('Invalid user ID format');
    }

    return new UserId(result.data);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

---

#### **VerificationStatus Value Object**

**Purpose**: Represent email verification state as a domain concept.

**File**: `src/features/authentication/domain/value-objects/VerificationStatus.ts`

```typescript
export enum VerificationStatusType {
  UNVERIFIED = 'unverified',
  VERIFIED = 'verified',
  PENDING = 'pending',
}

export class VerificationStatus {
  private constructor(
    private readonly status: VerificationStatusType,
    private readonly verifiedAt?: Date
  ) {}

  static unverified(): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.UNVERIFIED);
  }

  static verified(verifiedAt: Date): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.VERIFIED, verifiedAt);
  }

  static pending(): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.PENDING);
  }

  isVerified(): boolean {
    return this.status === VerificationStatusType.VERIFIED;
  }

  getStatus(): VerificationStatusType {
    return this.status;
  }

  getVerifiedAt(): Date | undefined {
    return this.verifiedAt;
  }
}
```

---

### 2. Entities

#### **User Entity**

**Purpose**: Core domain entity representing a user in the system.

**File**: `src/features/authentication/domain/entities/User.ts`

```typescript
import { Email } from '../value-objects/Email';
import { UserId } from '../value-objects/UserId';
import { VerificationStatus } from '../value-objects/VerificationStatus';

export interface UserProps {
  id: UserId;
  email: Email;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  // Reconstruct from database
  static reconstitute(data: {
    id: string;
    email: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
  }): User {
    return new User({
      id: UserId.create(data.id),
      email: Email.create(data.email),
      verificationStatus: data.emailVerifiedAt
        ? VerificationStatus.verified(data.emailVerifiedAt)
        : VerificationStatus.unverified(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt,
    });
  }

  getId(): UserId {
    return this.props.id;
  }

  getEmail(): Email {
    return this.props.email;
  }

  isEmailVerified(): boolean {
    return this.props.verificationStatus.isVerified();
  }

  getVerificationStatus(): VerificationStatus {
    return this.props.verificationStatus;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  getLastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  // Domain behavior: Mark email as verified
  verifyEmail(verifiedAt: Date): void {
    this.props.verificationStatus = VerificationStatus.verified(verifiedAt);
    this.props.updatedAt = new Date();
  }

  // Domain behavior: Record login
  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  // Business rule: Can user access protected resources?
  canAccessProtectedResources(): boolean {
    return this.isEmailVerified();
  }
}
```

**Key Points**:
- User entity does NOT store password (that's in auth.users managed by Supabase)
- Domain logic focuses on user lifecycle and business rules
- `reconstitute` method rebuilds entity from persistence layer
- `canAccessProtectedResources` is a business rule

---

#### **UserProfile Entity**

**Purpose**: Represents additional user profile data stored in `public.profiles`.

**File**: `src/features/authentication/domain/entities/UserProfile.ts`

```typescript
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export interface UserProfileProps {
  userId: UserId;
  email: Email;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfile {
  private constructor(private props: UserProfileProps) {}

  static create(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  static reconstitute(data: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfile {
    return new UserProfile({
      userId: UserId.create(data.id),
      email: Email.create(data.email),
      fullName: data.fullName,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  getUserId(): UserId {
    return this.props.userId;
  }

  getEmail(): Email {
    return this.props.email;
  }

  getFullName(): string | undefined {
    return this.props.fullName;
  }

  getAvatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain behavior: Update profile
  updateProfile(updates: { fullName?: string; avatarUrl?: string }): void {
    if (updates.fullName !== undefined) {
      this.props.fullName = updates.fullName;
    }
    if (updates.avatarUrl !== undefined) {
      this.props.avatarUrl = updates.avatarUrl;
    }
    this.props.updatedAt = new Date();
  }
}
```

---

### 3. Domain Events

**Purpose**: Communicate domain changes to other parts of the system.

#### **UserRegistered Event**

**File**: `src/features/authentication/domain/events/UserRegistered.ts`

```typescript
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export class UserRegistered {
  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
    public readonly occurredAt: Date
  ) {}
}
```

#### **UserLoggedIn Event**

**File**: `src/features/authentication/domain/events/UserLoggedIn.ts`

```typescript
import { UserId } from '../value-objects/UserId';

export class UserLoggedIn {
  constructor(
    public readonly userId: UserId,
    public readonly loginMethod: 'email' | 'google',
    public readonly occurredAt: Date
  ) {}
}
```

#### **EmailVerified Event**

**File**: `src/features/authentication/domain/events/EmailVerified.ts`

```typescript
import { UserId } from '../value-objects/UserId';

export class EmailVerified {
  constructor(
    public readonly userId: UserId,
    public readonly verifiedAt: Date
  ) {}
}
```

**Note**: Events can be used for side effects (sending welcome emails, logging, analytics, etc.)

---

### 4. Domain Errors

**File**: `src/features/authentication/domain/errors/AuthenticationErrors.ts`

```typescript
export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid email or password') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailNotVerifiedError extends Error {
  constructor(message = 'Email address has not been verified') {
    super(message);
    this.name = 'EmailNotVerifiedError';
  }
}

export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class DuplicateEmailError extends Error {
  constructor(message = 'Email address is already registered') {
    super(message);
    this.name = 'DuplicateEmailError';
  }
}

export class InvalidTokenError extends Error {
  constructor(message = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

export class SessionExpiredError extends Error {
  constructor(message = 'Session has expired') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}
```

---

## Application Layer Design

### 1. DTOs (Data Transfer Objects)

**Purpose**: Define the shape of data crossing application boundaries.

#### **RegisterUserDTO**

**File**: `src/features/authentication/application/dtos/RegisterUserDTO.ts`

```typescript
export interface RegisterUserDTO {
  email: string;
  password: string;
}
```

#### **LoginDTO**

**File**: `src/features/authentication/application/dtos/LoginDTO.ts`

```typescript
export interface LoginDTO {
  email: string;
  password: string;
}
```

#### **UserDTO**

**File**: `src/features/authentication/application/dtos/UserDTO.ts`

```typescript
export interface UserDTO {
  id: string;
  email: string;
  isEmailVerified: boolean;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}
```

#### **UpdateProfileDTO**

**File**: `src/features/authentication/application/dtos/UpdateProfileDTO.ts`

```typescript
export interface UpdateProfileDTO {
  fullName?: string;
  avatarUrl?: string;
}
```

#### **ResetPasswordDTO**

**File**: `src/features/authentication/application/dtos/ResetPasswordDTO.ts`

```typescript
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}
```

---

### 2. Ports (Interfaces)

#### **IAuthenticationService Port**

**Purpose**: Define contract for authentication operations (login, register, OAuth).

**File**: `src/features/authentication/application/ports/IAuthenticationService.ts`

```typescript
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { User } from '../../domain/entities/User';

export interface AuthenticationResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthenticationService {
  // Email/password authentication
  registerWithEmail(email: Email, password: Password): Promise<User>;
  loginWithEmail(email: Email, password: Password): Promise<AuthenticationResult>;

  // OAuth authentication
  loginWithGoogle(): Promise<{ url: string }>; // Returns OAuth URL
  handleGoogleCallback(code: string): Promise<AuthenticationResult>;

  // Password management
  requestPasswordReset(email: Email): Promise<void>;
  resetPassword(token: string, newPassword: Password): Promise<void>;
  changePassword(userId: string, currentPassword: Password, newPassword: Password): Promise<void>;

  // Email verification
  verifyEmail(token: string): Promise<User>;
  resendVerificationEmail(email: Email): Promise<void>;
}
```

**Critical Notes**:
- This port abstracts Supabase Auth completely
- Domain types (Email, Password) are used as input
- Infrastructure adapter (SupabaseAuthAdapter) implements this
- Return types use domain entities (User)

---

#### **ISessionManager Port**

**Purpose**: Define contract for session management operations.

**File**: `src/features/authentication/application/ports/ISessionManager.ts`

```typescript
import { User } from '../../domain/entities/User';

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface ISessionManager {
  // Create session (sets cookies)
  createSession(accessToken: string, refreshToken: string): Promise<void>;

  // Get current session from cookies
  getCurrentSession(): Promise<Session | null>;

  // Refresh session if expired
  refreshSession(refreshToken: string): Promise<Session>;

  // Destroy session (clear cookies)
  destroySession(): Promise<void>;

  // Validate session is active
  isSessionValid(): Promise<boolean>;
}
```

**Critical Notes**:
- Abstracts cookie management and JWT validation
- Works with Next.js cookies() API under the hood
- Implemented by SupabaseSessionAdapter using @supabase/ssr

---

#### **IUserRepository Port**

**Purpose**: Define contract for user data persistence operations.

**File**: `src/features/authentication/application/ports/IUserRepository.ts`

```typescript
import { User } from '../../domain/entities/User';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';

export interface IUserRepository {
  // User operations
  findById(userId: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;

  // Profile operations
  createProfile(profile: UserProfile): Promise<UserProfile>;
  findProfileById(userId: UserId): Promise<UserProfile | null>;
  updateProfile(userId: UserId, updates: Partial<UserProfile>): Promise<UserProfile>;

  // User metadata updates (last_login_at, etc.)
  updateUserMetadata(userId: UserId, metadata: { lastLoginAt?: Date }): Promise<void>;
}
```

**Critical Notes**:
- Repository works with domain entities (User, UserProfile)
- Repository does NOT create users (that's IAuthenticationService's job via Supabase)
- Repository only manages profile data in `public.profiles` table
- User entity is reconstituted from `auth.users` (read-only via Supabase Admin API)

---

#### **IEmailService Port**

**Purpose**: Define contract for email operations (optional for MVP, Supabase handles emails).

**File**: `src/features/authentication/application/ports/IEmailService.ts`

```typescript
import { Email } from '../../domain/value-objects/Email';

export interface IEmailService {
  sendVerificationEmail(email: Email, token: string): Promise<void>;
  sendPasswordResetEmail(email: Email, token: string): Promise<void>;
  sendWelcomeEmail(email: Email, userName?: string): Promise<void>;
}
```

**Note**: For MVP, Supabase sends verification and password reset emails automatically. This port is for future customization.

---

### 3. Use Cases

#### **RegisterUserUseCase**

**Purpose**: Orchestrate user registration flow.

**File**: `src/features/authentication/application/use-cases/RegisterUserUseCase.ts`

```typescript
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { IAuthenticationService } from '../ports/IAuthenticationService';
import { IUserRepository } from '../ports/IUserRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserRegistered } from '../../domain/events/UserRegistered';

export interface RegisterUserRequest {
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(request: RegisterUserRequest): Promise<void> {
    // 1. Validate input with value objects
    const email = Email.create(request.email);
    const password = Password.create(request.password);

    // 2. Register user via authentication service (Supabase creates user)
    const user = await this.authService.registerWithEmail(email, password);

    // 3. Create user profile in public.profiles
    const profile = UserProfile.create({
      userId: user.getId(),
      email: user.getEmail(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.createProfile(profile);

    // 4. Emit domain event (for side effects like analytics, welcome email)
    // Event handling is done via event bus (future enhancement)
    // For now, just log or handle inline
    const event = new UserRegistered(
      user.getId(),
      user.getEmail(),
      new Date()
    );

    // TODO: Publish event to event bus
    console.log('UserRegistered event:', event);
  }
}
```

**Flow**:
1. Validate email and password using value objects
2. Call `authService.registerWithEmail` (creates user in auth.users, sends verification email)
3. Create profile in `public.profiles` table
4. Emit UserRegistered event

**Critical Notes**:
- User is created by Supabase Auth, not directly by repository
- Profile is created after user registration
- Verification email is sent automatically by Supabase

---

#### **LoginWithEmailUseCase**

**Purpose**: Orchestrate email/password login flow.

**File**: `src/features/authentication/application/use-cases/LoginWithEmailUseCase.ts`

```typescript
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { IAuthenticationService } from '../ports/IAuthenticationService';
import { ISessionManager } from '../ports/ISessionManager';
import { IUserRepository } from '../ports/IUserRepository';
import { EmailNotVerifiedError } from '../../domain/errors/AuthenticationErrors';
import { UserLoggedIn } from '../../domain/events/UserLoggedIn';

export interface LoginWithEmailRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  accessToken: string;
}

export class LoginWithEmailUseCase {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly sessionManager: ISessionManager,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(request: LoginWithEmailRequest): Promise<LoginResponse> {
    // 1. Validate input
    const email = Email.create(request.email);
    const password = Password.create(request.password);

    // 2. Authenticate with Supabase
    const authResult = await this.authService.loginWithEmail(email, password);
    const { user, accessToken, refreshToken } = authResult;

    // 3. Business rule: Email must be verified
    if (!user.isEmailVerified()) {
      throw new EmailNotVerifiedError(
        'Please verify your email address before logging in'
      );
    }

    // 4. Create session (set cookies)
    await this.sessionManager.createSession(accessToken, refreshToken);

    // 5. Update last login timestamp
    user.recordLogin();
    await this.userRepository.updateUserMetadata(user.getId(), {
      lastLoginAt: user.getLastLoginAt(),
    });

    // 6. Emit domain event
    const event = new UserLoggedIn(
      user.getId(),
      'email',
      new Date()
    );
    console.log('UserLoggedIn event:', event);

    // 7. Return response
    return {
      userId: user.getId().getValue(),
      email: user.getEmail().getValue(),
      accessToken,
    };
  }
}
```

**Flow**:
1. Validate email and password
2. Call `authService.loginWithEmail` (validates credentials via Supabase)
3. Check if email is verified (business rule)
4. Create session (set httpOnly cookies)
5. Update last login timestamp
6. Emit UserLoggedIn event
7. Return user data

**Critical Notes**:
- Email verification check is a **business rule** enforced in use case
- Session is created via SessionManager (sets cookies)
- Throws EmailNotVerifiedError if email not verified

---

#### **LoginWithGoogleUseCase**

**Purpose**: Orchestrate Google OAuth flow.

**File**: `src/features/authentication/application/use-cases/LoginWithGoogleUseCase.ts`

```typescript
import { IAuthenticationService } from '../ports/IAuthenticationService';
import { ISessionManager } from '../ports/ISessionManager';
import { IUserRepository } from '../ports/IUserRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserLoggedIn } from '../../domain/events/UserLoggedIn';

export class LoginWithGoogleUseCase {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly sessionManager: ISessionManager,
    private readonly userRepository: IUserRepository
  ) {}

  // Step 1: Initiate OAuth flow (redirect to Google)
  async initiateOAuth(): Promise<{ url: string }> {
    return await this.authService.loginWithGoogle();
  }

  // Step 2: Handle OAuth callback
  async handleCallback(code: string): Promise<void> {
    // 1. Exchange code for tokens
    const authResult = await this.authService.handleGoogleCallback(code);
    const { user, accessToken, refreshToken } = authResult;

    // 2. Create session
    await this.sessionManager.createSession(accessToken, refreshToken);

    // 3. Check if profile exists, create if not
    const existingProfile = await this.userRepository.findProfileById(user.getId());

    if (!existingProfile) {
      const profile = UserProfile.create({
        userId: user.getId(),
        email: user.getEmail(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.createProfile(profile);
    }

    // 4. Update last login
    user.recordLogin();
    await this.userRepository.updateUserMetadata(user.getId(), {
      lastLoginAt: user.getLastLoginAt(),
    });

    // 5. Emit event
    const event = new UserLoggedIn(user.getId(), 'google', new Date());
    console.log('UserLoggedIn event:', event);
  }
}
```

**Flow**:
1. **Initiate OAuth**: Return Google OAuth URL
2. **Handle Callback**:
   - Exchange authorization code for tokens
   - Create session
   - Create profile if doesn't exist (Google users auto-verified)
   - Update last login

**Critical Notes**:
- OAuth flow is 2-step: initiate + callback
- Google OAuth users have email pre-verified by Google
- Profile is created on first login if doesn't exist

---

#### **LogoutUseCase**

**Purpose**: Destroy user session.

**File**: `src/features/authentication/application/use-cases/LogoutUseCase.ts`

```typescript
import { ISessionManager } from '../ports/ISessionManager';

export class LogoutUseCase {
  constructor(private readonly sessionManager: ISessionManager) {}

  async execute(): Promise<void> {
    await this.sessionManager.destroySession();
  }
}
```

**Flow**:
1. Destroy session (clear cookies, invalidate JWT)

**Simple and straightforward.**

---

#### **GetCurrentUserUseCase**

**Purpose**: Get currently authenticated user from session.

**File**: `src/features/authentication/application/use-cases/GetCurrentUserUseCase.ts`

```typescript
import { ISessionManager } from '../ports/ISessionManager';
import { IUserRepository } from '../ports/IUserRepository';
import { UserDTO } from '../dtos/UserDTO';
import { SessionExpiredError } from '../../domain/errors/AuthenticationErrors';

export class GetCurrentUserUseCase {
  constructor(
    private readonly sessionManager: ISessionManager,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(): Promise<UserDTO | null> {
    // 1. Get current session
    const session = await this.sessionManager.getCurrentSession();

    if (!session) {
      return null;
    }

    // 2. Get user from repository
    const user = session.user;

    // 3. Get profile data
    const profile = await this.userRepository.findProfileById(user.getId());

    // 4. Map to DTO
    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      isEmailVerified: user.isEmailVerified(),
      fullName: profile?.getFullName(),
      avatarUrl: profile?.getAvatarUrl(),
      createdAt: user.getCreatedAt(),
      lastLoginAt: user.getLastLoginAt(),
    };
  }
}
```

**Flow**:
1. Get session from SessionManager
2. Get user and profile data
3. Map to DTO and return

---

#### **UpdateUserProfileUseCase**

**Purpose**: Update user profile information.

**File**: `src/features/authentication/application/use-cases/UpdateUserProfileUseCase.ts`

```typescript
import { UserId } from '../../domain/value-objects/UserId';
import { IUserRepository } from '../ports/IUserRepository';
import { UpdateProfileDTO } from '../dtos/UpdateProfileDTO';
import { UserNotFoundError } from '../../domain/errors/AuthenticationErrors';

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, updates: UpdateProfileDTO): Promise<void> {
    const userIdVO = UserId.create(userId);

    // 1. Get existing profile
    const profile = await this.userRepository.findProfileById(userIdVO);

    if (!profile) {
      throw new UserNotFoundError('User profile not found');
    }

    // 2. Update profile using domain behavior
    profile.updateProfile(updates);

    // 3. Persist changes
    await this.userRepository.updateProfile(userIdVO, profile);
  }
}
```

**Flow**:
1. Get existing profile
2. Update profile using entity method
3. Persist changes

---

#### **RequestPasswordResetUseCase**

**Purpose**: Request password reset email.

**File**: `src/features/authentication/application/use-cases/RequestPasswordResetUseCase.ts`

```typescript
import { Email } from '../../domain/value-objects/Email';
import { IAuthenticationService } from '../ports/IAuthenticationService';
import { PasswordResetRequested } from '../../domain/events/PasswordResetRequested';

export class RequestPasswordResetUseCase {
  constructor(private readonly authService: IAuthenticationService) {}

  async execute(email: string): Promise<void> {
    const emailVO = Email.create(email);

    // Request password reset via Supabase (sends email)
    await this.authService.requestPasswordReset(emailVO);

    // Emit event
    const event = new PasswordResetRequested(emailVO, new Date());
    console.log('PasswordResetRequested event:', event);
  }
}
```

**Flow**:
1. Validate email
2. Call authService to send password reset email
3. Emit event

---

#### **ResetPasswordUseCase**

**Purpose**: Reset password with token.

**File**: `src/features/authentication/application/use-cases/ResetPasswordUseCase.ts`

```typescript
import { Password } from '../../domain/value-objects/Password';
import { IAuthenticationService } from '../ports/IAuthenticationService';

export class ResetPasswordUseCase {
  constructor(private readonly authService: IAuthenticationService) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const passwordVO = Password.create(newPassword);

    await this.authService.resetPassword(token, passwordVO);
  }
}
```

**Flow**:
1. Validate new password
2. Call authService to reset password with token

---

## Infrastructure Layer Design

### 1. Supabase Client Setup

#### **Supabase Client Factory**

**File**: `src/features/authentication/infrastructure/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Note**: This is the browser-side client.

---

#### **Server-Side Supabase Client**

**File**: `src/features/authentication/infrastructure/supabase/server-client.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Component can't set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Server Component can't remove cookies
          }
        },
      },
    }
  );
}
```

**Critical Notes**:
- Uses @supabase/ssr for Next.js 14+ App Router
- Integrates with Next.js cookies() API
- Must be used in Server Components and Route Handlers
- Handles session management via cookies automatically

---

### 2. Adapters

#### **SupabaseAuthAdapter**

**Purpose**: Implement IAuthenticationService using Supabase Auth.

**File**: `src/features/authentication/infrastructure/adapters/SupabaseAuthAdapter.ts`

```typescript
import { IAuthenticationService, AuthenticationResult } from '../../application/ports/IAuthenticationService';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { User } from '../../domain/entities/User';
import { createServerSupabaseClient } from '../supabase/server-client';
import {
  InvalidCredentialsError,
  DuplicateEmailError,
  InvalidTokenError,
} from '../../domain/errors/AuthenticationErrors';

export class SupabaseAuthAdapter implements IAuthenticationService {
  async registerWithEmail(email: Email, password: Password): Promise<User> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.getValue(),
      password: password.getValue(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new DuplicateEmailError();
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('User registration failed');
    }

    // Reconstitute User entity from Supabase response
    return User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    });
  }

  async loginWithEmail(email: Email, password: Password): Promise<AuthenticationResult> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.getValue(),
      password: password.getValue(),
    });

    if (error) {
      throw new InvalidCredentialsError();
    }

    if (!data.user || !data.session) {
      throw new InvalidCredentialsError();
    }

    const user = User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    });

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async loginWithGoogle(): Promise<{ url: string }> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return { url: data.url };
  }

  async handleGoogleCallback(code: string): Promise<AuthenticationResult> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new InvalidCredentialsError('OAuth authentication failed');
    }

    if (!data.user || !data.session) {
      throw new InvalidCredentialsError('OAuth authentication failed');
    }

    const user = User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    });

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async requestPasswordReset(email: Email): Promise<void> {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email.getValue(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword(token: string, newPassword: Password): Promise<void> {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword.getValue(),
    });

    if (error) {
      throw new InvalidTokenError();
    }
  }

  async changePassword(
    userId: string,
    currentPassword: Password,
    newPassword: Password
  ): Promise<void> {
    // First verify current password by attempting login
    const supabase = createServerSupabaseClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new InvalidCredentialsError('User not found');
    }

    // Verify current password
    const verifyResult = await supabase.auth.signInWithPassword({
      email: userData.user.email!,
      password: currentPassword.getValue(),
    });

    if (verifyResult.error) {
      throw new InvalidCredentialsError('Current password is incorrect');
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword.getValue(),
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async verifyEmail(token: string): Promise<User> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error || !data.user) {
      throw new InvalidTokenError();
    }

    return User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    });
  }

  async resendVerificationEmail(email: Email): Promise<void> {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.getValue(),
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
```

**Critical Notes**:
- All Supabase-specific code is isolated here
- Uses `User.reconstitute()` to create domain entities from Supabase data
- Translates Supabase errors to domain errors
- Uses server-side Supabase client for security

---

#### **SupabaseSessionAdapter**

**Purpose**: Implement ISessionManager using Supabase SSR.

**File**: `src/features/authentication/infrastructure/adapters/SupabaseSessionAdapter.ts`

```typescript
import { ISessionManager, Session } from '../../application/ports/ISessionManager';
import { createServerSupabaseClient } from '../supabase/server-client';
import { User } from '../../domain/entities/User';
import { SessionExpiredError } from '../../domain/errors/AuthenticationErrors';

export class SupabaseSessionAdapter implements ISessionManager {
  async createSession(accessToken: string, refreshToken: string): Promise<void> {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null;
    }

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return null;
    }

    const user = User.reconstitute({
      id: userData.user.id,
      email: userData.user.email!,
      emailVerifiedAt: userData.user.email_confirmed_at
        ? new Date(userData.user.email_confirmed_at)
        : null,
      createdAt: new Date(userData.user.created_at),
      updatedAt: new Date(userData.user.updated_at || userData.user.created_at),
    });

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at! * 1000),
    };
  }

  async refreshSession(refreshToken: string): Promise<Session> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new SessionExpiredError();
    }

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      throw new SessionExpiredError();
    }

    const user = User.reconstitute({
      id: userData.user.id,
      email: userData.user.email!,
      emailVerifiedAt: userData.user.email_confirmed_at
        ? new Date(userData.user.email_confirmed_at)
        : null,
      createdAt: new Date(userData.user.created_at),
      updatedAt: new Date(userData.user.updated_at || userData.user.created_at),
    });

    return {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at! * 1000),
    };
  }

  async destroySession(): Promise<void> {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  async isSessionValid(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session !== null && session.expiresAt > new Date();
  }
}
```

**Critical Notes**:
- Session management is handled by Supabase via cookies
- @supabase/ssr automatically refreshes tokens when needed
- Session cookies are httpOnly, secure, sameSite

---

### 3. Repository Implementation

#### **SupabaseUserRepository**

**Purpose**: Implement IUserRepository for user/profile data access.

**File**: `src/features/authentication/infrastructure/repositories/SupabaseUserRepository.ts`

```typescript
import { IUserRepository } from '../../application/ports/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { createServerSupabaseClient } from '../supabase/server-client';

export class SupabaseUserRepository implements IUserRepository {
  async findById(userId: UserId): Promise<User | null> {
    const supabase = createServerSupabaseClient();

    // Get user from auth.users via Admin API
    const { data, error } = await supabase.auth.admin.getUserById(userId.getValue());

    if (error || !data.user) {
      return null;
    }

    return User.reconstitute({
      id: data.user.id,
      email: data.user.email!,
      emailVerifiedAt: data.user.email_confirmed_at
        ? new Date(data.user.email_confirmed_at)
        : null,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at || data.user.created_at),
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const supabase = createServerSupabaseClient();

    // Note: Supabase doesn't provide direct email lookup in auth.users
    // This would require using service role key or alternative approach
    // For now, return null (used mainly for duplicate checks which Supabase handles)
    return null;
  }

  async createProfile(profile: UserProfile): Promise<UserProfile> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.getUserId().getValue(),
        email: profile.getEmail().getValue(),
        full_name: profile.getFullName(),
        avatar_url: profile.getAvatarUrl(),
        created_at: profile.getCreatedAt(),
        updated_at: profile.getUpdatedAt(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return UserProfile.reconstitute(data);
  }

  async findProfileById(userId: UserId): Promise<UserProfile | null> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId.getValue())
      .single();

    if (error || !data) {
      return null;
    }

    return UserProfile.reconstitute({
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async updateProfile(userId: UserId, profile: UserProfile): Promise<UserProfile> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.getFullName(),
        avatar_url: profile.getAvatarUrl(),
        updated_at: new Date(),
      })
      .eq('id', userId.getValue())
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return UserProfile.reconstitute(data);
  }

  async updateUserMetadata(userId: UserId, metadata: { lastLoginAt?: Date }): Promise<void> {
    // Note: Supabase auth.users doesn't support custom metadata updates directly
    // You can store this in profiles table or use user_metadata field
    // For simplicity, we'll store in profiles table
    const supabase = createServerSupabaseClient();

    await supabase
      .from('profiles')
      .update({ updated_at: new Date() })
      .eq('id', userId.getValue());
  }
}
```

**Critical Notes**:
- User entity data comes from `auth.users` (read-only via Supabase Admin API)
- Profile data is stored in `public.profiles` table (read/write)
- RLS policies protect profile data (users can only access their own)

---

## API Routes Design

### Route Structure

```
app/api/auth/
├── register/
│   └── route.ts              # POST /api/auth/register
├── login/
│   └── route.ts              # POST /api/auth/login
├── logout/
│   └── route.ts              # POST /api/auth/logout
├── session/
│   └── route.ts              # GET /api/auth/session
├── callback/
│   └── route.ts              # GET /api/auth/callback (OAuth)
├── verify-email/
│   └── route.ts              # GET /api/auth/verify-email
├── reset-password/
│   └── route.ts              # POST /api/auth/reset-password (request)
├── update-password/
│   └── route.ts              # POST /api/auth/update-password (reset)
└── profile/
    └── route.ts              # PATCH /api/auth/profile
```

---

### Route Handlers

#### **POST /api/auth/register**

**File**: `app/api/auth/register/route.ts`

```typescript
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
      { message: 'Registration successful. Please check your email to verify your account.' },
      { status: 201 }
    );
  } catch (error) {
    // 5. Handle errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Map domain errors to HTTP status codes
      if (error.name === 'DuplicateEmailError') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Critical Notes**:
- Route handler is **thin** - only handles HTTP concerns
- Use case orchestrates business logic
- Dependency injection done manually (can use DI container later)
- Error mapping: domain errors → HTTP status codes

---

#### **POST /api/auth/login**

**File**: `app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LoginWithEmailUseCase } from '@/src/features/authentication/application/use-cases/LoginWithEmailUseCase';
import { SupabaseAuthAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseAuthAdapter';
import { SupabaseSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseSessionAdapter';
import { SupabaseUserRepository } from '@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const authService = new SupabaseAuthAdapter();
    const sessionManager = new SupabaseSessionAdapter();
    const userRepository = new SupabaseUserRepository();

    const useCase = new LoginWithEmailUseCase(authService, sessionManager, userRepository);
    const result = await useCase.execute(validatedData);

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: result.userId,
          email: result.email,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.name === 'InvalidCredentialsError') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (error.name === 'EmailNotVerifiedError') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

#### **POST /api/auth/logout**

**File**: `app/api/auth/logout/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { LogoutUseCase } from '@/src/features/authentication/application/use-cases/LogoutUseCase';
import { SupabaseSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseSessionAdapter';

export async function POST() {
  try {
    const sessionManager = new SupabaseSessionAdapter();
    const useCase = new LogoutUseCase(sessionManager);
    await useCase.execute();

    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
```

---

#### **GET /api/auth/session**

**File**: `app/api/auth/session/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { GetCurrentUserUseCase } from '@/src/features/authentication/application/use-cases/GetCurrentUserUseCase';
import { SupabaseSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseSessionAdapter';
import { SupabaseUserRepository } from '@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository';

export async function GET() {
  try {
    const sessionManager = new SupabaseSessionAdapter();
    const userRepository = new SupabaseUserRepository();

    const useCase = new GetCurrentUserUseCase(sessionManager, userRepository);
    const user = await useCase.execute();

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
```

---

#### **GET /api/auth/callback** (OAuth)

**File**: `app/api/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LoginWithGoogleUseCase } from '@/src/features/authentication/application/use-cases/LoginWithGoogleUseCase';
import { SupabaseAuthAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseAuthAdapter';
import { SupabaseSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseSessionAdapter';
import { SupabaseUserRepository } from '@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    const authService = new SupabaseAuthAdapter();
    const sessionManager = new SupabaseSessionAdapter();
    const userRepository = new SupabaseUserRepository();

    const useCase = new LoginWithGoogleUseCase(authService, sessionManager, userRepository);
    await useCase.handleCallback(code);

    // Redirect to dashboard after successful OAuth
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
```

---

#### **POST /api/auth/reset-password** (Request)

**File**: `app/api/auth/reset-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { RequestPasswordResetUseCase } from '@/src/features/authentication/application/use-cases/RequestPasswordResetUseCase';
import { SupabaseAuthAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseAuthAdapter';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    const authService = new SupabaseAuthAdapter();
    const useCase = new RequestPasswordResetUseCase(authService);
    await useCase.execute(validatedData.email);

    return NextResponse.json(
      { message: 'Password reset email sent. Please check your inbox.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    );
  }
}
```

---

#### **PATCH /api/auth/profile**

**File**: `app/api/auth/profile/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { UpdateUserProfileUseCase } from '@/src/features/authentication/application/use-cases/UpdateUserProfileUseCase';
import { GetCurrentUserUseCase } from '@/src/features/authentication/application/use-cases/GetCurrentUserUseCase';
import { SupabaseSessionAdapter } from '@/src/features/authentication/infrastructure/adapters/SupabaseSessionAdapter';
import { SupabaseUserRepository } from '@/src/features/authentication/infrastructure/repositories/SupabaseUserRepository';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    // 1. Get current user
    const sessionManager = new SupabaseSessionAdapter();
    const userRepository = new SupabaseUserRepository();

    const getCurrentUserUseCase = new GetCurrentUserUseCase(sessionManager, userRepository);
    const currentUser = await getCurrentUserUseCase.execute();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // 3. Update profile
    const updateProfileUseCase = new UpdateUserProfileUseCase(userRepository);
    await updateProfileUseCase.execute(currentUser.id, validatedData);

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

---

## Implementation Guidelines

### 1. Database Setup

**Supabase SQL Migration**

Run this in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically create profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Critical Notes**:
- RLS policies ensure users can only access their own profile
- Trigger automatically creates profile when user registers
- Profiles table references auth.users with CASCADE delete

---

### 2. Environment Variables

Update `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3. Supabase Auth Configuration

**Configure in Supabase Dashboard** → Authentication → Settings:

1. **Session Duration**: 7 days (604800 seconds)
2. **Multiple Sessions**: Enabled
3. **Email Verification**: Required (Mandatory)
4. **Email Templates**: Customize verification and password reset templates
5. **OAuth Providers**: Enable Google OAuth
   - Add Google Client ID and Secret
   - Set redirect URL: `http://localhost:3000/api/auth/callback`

---

### 4. Dependency Injection (Optional Enhancement)

For production, consider using a DI container to avoid manual instantiation:

**File**: `src/features/authentication/infrastructure/di/container.ts`

```typescript
import { SupabaseAuthAdapter } from '../adapters/SupabaseAuthAdapter';
import { SupabaseSessionAdapter } from '../adapters/SupabaseSessionAdapter';
import { SupabaseUserRepository } from '../repositories/SupabaseUserRepository';

export class DIContainer {
  private static authService: SupabaseAuthAdapter;
  private static sessionManager: SupabaseSessionAdapter;
  private static userRepository: SupabaseUserRepository;

  static getAuthService() {
    if (!this.authService) {
      this.authService = new SupabaseAuthAdapter();
    }
    return this.authService;
  }

  static getSessionManager() {
    if (!this.sessionManager) {
      this.sessionManager = new SupabaseSessionAdapter();
    }
    return this.sessionManager;
  }

  static getUserRepository() {
    if (!this.userRepository) {
      this.userRepository = new SupabaseUserRepository();
    }
    return this.userRepository;
  }
}
```

**Usage in route handlers**:

```typescript
const authService = DIContainer.getAuthService();
const sessionManager = DIContainer.getSessionManager();
const userRepository = DIContainer.getUserRepository();
```

---

### 5. Middleware for Protected Routes

**File**: `middleware.ts` (root directory)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

---

## Critical Notes

### 1. **Supabase Auth is Infrastructure, Not Domain**

- **Domain layer** defines User entity with business rules
- **Supabase Auth** is an infrastructure detail (adapter)
- User entity is reconstituted from Supabase data
- Domain logic is portable and testable

### 2. **Password Handling**

- Password VO only validates strength
- **Never hash passwords manually** - Supabase handles this
- Password VO is used for validation, then passed to Supabase
- Never persist Password VO

### 3. **Session Management**

- Sessions are managed by Supabase via JWT tokens
- Cookies are httpOnly, secure, sameSite
- @supabase/ssr handles cookie management automatically
- Session refresh is automatic

### 4. **Email Verification**

- **Business rule**: Users must verify email to access protected resources
- Enforced in `LoginWithEmailUseCase`
- Supabase sends verification emails automatically
- Email verification is checked via `User.isEmailVerified()`

### 5. **Google OAuth Flow**

- OAuth is a 2-step process: initiate + callback
- Google users have email pre-verified
- Profile is created on first login if doesn't exist
- OAuth tokens are handled by Supabase

### 6. **Repository Pattern**

- Repository does NOT create users (Supabase does)
- Repository manages profile data in `public.profiles`
- User entity is reconstituted from `auth.users` (read-only)
- RLS policies protect profile data

### 7. **Error Handling**

- Domain errors are thrown by use cases
- API routes map domain errors to HTTP status codes
- User-friendly error messages, no sensitive details
- Validation errors return 400, auth errors return 401/403

### 8. **Testing Strategy**

- **Domain layer**: 100% coverage, no mocks needed (pure logic)
- **Application layer**: Mock ports (IAuthenticationService, IUserRepository)
- **Infrastructure layer**: Integration tests with Supabase
- **API routes**: Integration tests with supertest

### 9. **Security Considerations**

- **RLS policies** protect user data
- **httpOnly cookies** prevent XSS
- **Secure, sameSite cookies** prevent CSRF
- **Rate limiting** on auth endpoints (future enhancement)
- **Email verification** required before access

### 10. **Multiple Sessions**

- Supabase supports multiple concurrent sessions
- Each device has its own refresh token
- Logout only destroys current session
- Future: Session management UI to view/revoke sessions

### 11. **Profile vs User Separation**

- **User** (auth.users): Managed by Supabase, contains auth data
- **UserProfile** (public.profiles): Application data, managed by repository
- Separation allows extending user data without touching auth system

### 12. **Migration Path**

If you ever need to migrate from Supabase:
- Replace infrastructure adapters (SupabaseAuthAdapter, etc.)
- Domain and application layers remain unchanged
- This is the power of hexagonal architecture

---

## Implementation Order

1. **Domain Layer** (Day 1)
   - Value objects (Email, Password, UserId, VerificationStatus)
   - Entities (User, UserProfile)
   - Domain events
   - Domain errors

2. **Application Layer** (Day 1-2)
   - DTOs
   - Ports (interfaces)
   - Use cases (start with RegisterUser, LoginWithEmail)

3. **Infrastructure Layer** (Day 2)
   - Supabase client setup
   - Adapters (SupabaseAuthAdapter, SupabaseSessionAdapter)
   - Repository (SupabaseUserRepository)

4. **Database Setup** (Day 2)
   - Run SQL migration in Supabase
   - Configure Supabase Auth settings
   - Enable Google OAuth

5. **API Routes** (Day 3)
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET /api/auth/session
   - GET /api/auth/callback

6. **Middleware** (Day 3)
   - Protected routes middleware
   - Session refresh logic

7. **Additional Use Cases** (Day 3-4)
   - Password reset flow
   - Profile update
   - Email verification

8. **Testing** (Day 4-5)
   - Unit tests for domain layer
   - Integration tests for use cases
   - E2E tests for auth flows

---

## Next Steps

1. Read this implementation plan thoroughly
2. Review context session file for business requirements
3. Ask clarifying questions if needed
4. Proceed with implementation following this plan
5. Start with domain layer, then application, then infrastructure
6. Test each layer as you build

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Status**: Ready for Implementation
