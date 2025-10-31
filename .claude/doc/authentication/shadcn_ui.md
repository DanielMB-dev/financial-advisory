# Authentication UI/UX Implementation Plan - shadcn/ui

## Table of Contents
1. [Component Installation](#component-installation)
2. [Design System & Colors](#design-system--colors)
3. [Page Layouts & Structure](#page-layouts--structure)
4. [Component Specifications](#component-specifications)
5. [Form Validation Patterns](#form-validation-patterns)
6. [OAuth Integration Design](#oauth-integration-design)
7. [Error & Success States](#error--success-states)
8. [Email Verification UI](#email-verification-ui)
9. [Accessibility Considerations](#accessibility-considerations)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Component Installation

### Required shadcn/ui Components

Install these components using the shadcn CLI:

```bash
# Core form components
yarn dlx shadcn@latest add form
yarn dlx shadcn@latest add input
yarn dlx shadcn@latest add button
yarn dlx shadcn@latest add label

# Layout components
yarn dlx shadcn@latest add card
yarn dlx shadcn@latest add separator

# Feedback components
yarn dlx shadcn@latest add alert
yarn dlx shadcn@latest add toast

# Additional components
yarn dlx shadcn@latest add checkbox    # For "Remember me"
yarn dlx shadcn@latest add avatar      # For profile completion
yarn dlx shadcn@latest add dialog      # For modals if needed
```

### Pre-built Login Blocks

shadcn/ui provides ready-to-use login blocks. Recommended option:

```bash
# Option 1: Simple centered login (best for MVP)
yarn dlx shadcn@latest add login-01

# Option 2: Two-column with image (if you want branding)
yarn dlx shadcn@latest add login-02

# Option 3: Muted background (modern look)
yarn dlx shadcn@latest add login-03
```

**Recommendation for Financial Advisor MVP**: Use **login-01** as the base and customize it. It provides a clean, professional look suitable for financial applications without unnecessary visual complexity.

### Required npm Packages

```bash
# Form management & validation
yarn add react-hook-form @hookform/resolvers zod

# Icons (used by shadcn components)
yarn add lucide-react

# Already installed:
# - next (16.0.1)
# - react (19.2.0)
# - tailwindcss (v4)
# - zod (4.1.12)
```

---

## Design System & Colors

### Current Color Scheme

From `/Users/danielmachado/Documents/Developer/Personal/financial-advisor/app/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### Enhanced Color Palette for Auth

**IMPORTANT**: We need to extend the color system to support shadcn/ui components. Add these CSS variables to `globals.css`:

```css
@theme inline {
  /* Existing colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* shadcn/ui required colors */
  --color-card: var(--background);
  --color-card-foreground: var(--foreground);

  --color-primary: #0f172a;        /* Dark slate for primary actions */
  --color-primary-foreground: #f8fafc;

  --color-secondary: #f1f5f9;      /* Light gray for secondary elements */
  --color-secondary-foreground: #0f172a;

  --color-muted: #f8fafc;          /* Very light gray for muted backgrounds */
  --color-muted-foreground: #64748b;

  --color-accent: #f1f5f9;         /* Accent color for hover states */
  --color-accent-foreground: #0f172a;

  --color-destructive: #ef4444;    /* Red for errors */
  --color-destructive-foreground: #fef2f2;

  --color-border: #e2e8f0;         /* Border color */
  --color-input: #e2e8f0;          /* Input border */
  --color-ring: #3b82f6;           /* Focus ring (blue) */

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  @theme inline {
    --color-card: #0a0a0a;
    --color-card-foreground: #ededed;

    --color-primary: #f8fafc;
    --color-primary-foreground: #0f172a;

    --color-secondary: #1e293b;
    --color-secondary-foreground: #f8fafc;

    --color-muted: #1e293b;
    --color-muted-foreground: #94a3b8;

    --color-accent: #1e293b;
    --color-accent-foreground: #f8fafc;

    --color-destructive: #7f1d1d;
    --color-destructive-foreground: #fef2f2;

    --color-border: #1e293b;
    --color-input: #1e293b;
    --color-ring: #3b82f6;
  }
}
```

### Typography

Keep existing Geist fonts:
- **Primary**: Geist Sans (clean, modern, financial-appropriate)
- **Mono**: Geist Mono (for codes, tokens)

---

## Page Layouts & Structure

### Directory Structure

```
app/
├── (auth)/                          # Auth group (unauthenticated layout)
│   ├── layout.tsx                   # Auth layout (centered, no nav)
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── register/
│   │   └── page.tsx                 # Registration page
│   ├── reset-password/
│   │   └── page.tsx                 # Password reset request
│   ├── update-password/
│   │   └── page.tsx                 # Set new password (from email link)
│   └── verify-email/
│       └── page.tsx                 # Email verification handler
├── (dashboard)/                     # Protected routes (authenticated layout)
│   ├── layout.tsx                   # Dashboard layout (with nav)
│   ├── dashboard/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx                 # Profile completion/edit
└── api/
    └── auth/
        └── callback/
            └── route.ts             # Supabase auth callback

components/
├── ui/                              # shadcn components (auto-generated)
│   ├── form.tsx
│   ├── input.tsx
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
└── features/
    └── authentication/
        ├── components/
        │   ├── LoginForm.tsx
        │   ├── RegisterForm.tsx
        │   ├── ResetPasswordForm.tsx
        │   ├── UpdatePasswordForm.tsx
        │   ├── ProfileCompletionForm.tsx
        │   ├── PasswordInput.tsx           # Custom password with toggle
        │   ├── OAuthButtons.tsx            # Google OAuth button
        │   ├── EmailVerificationBanner.tsx
        │   └── PasswordRequirements.tsx    # Inline password validation
        ├── hooks/
        │   ├── useAuth.ts
        │   └── useEmailVerification.ts
        ├── schemas/
        │   ├── authSchemas.ts              # Zod validation schemas
        │   └── profileSchemas.ts
        └── types/
            └── auth.types.ts
```

### Auth Layout Pattern

**File**: `app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-6">
        {children}
      </div>
    </div>
  )
}
```

**Design Rationale**:
- Centered layout for focus
- Minimal distractions (no navigation)
- Muted background for depth
- Max-width constraint (28rem) for readability
- Responsive padding

### Responsive Considerations

- **Mobile (< 640px)**: Full-width with padding, single column
- **Tablet (640px - 1024px)**: Centered card, max-width 28rem
- **Desktop (> 1024px)**: Same as tablet (forms shouldn't be too wide)

---

## Component Specifications

### 1. Login Form

**File**: `components/features/authentication/components/LoginForm.tsx`

**Layout**:
```
┌─────────────────────────────┐
│  Welcome back              │
│  Sign in to your account   │
│                            │
│  Email                     │
│  ┌──────────────────────┐  │
│  │ email@example.com    │  │
│  └──────────────────────┘  │
│                            │
│  Password                  │
│  ┌──────────────────────┐  │
│  │ ••••••••••••    [👁] │  │
│  └──────────────────────┘  │
│                            │
│  ☐ Remember me             │
│                            │
│  ┌──────────────────────┐  │
│  │   Sign In            │  │
│  └──────────────────────┘  │
│                            │
│  ────── OR ──────          │
│                            │
│  ┌──────────────────────┐  │
│  │ [G] Sign in with     │  │
│  │     Google           │  │
│  └──────────────────────┘  │
│                            │
│  Forgot password?          │
│  Don't have an account?    │
│  Register                  │
└─────────────────────────────┘
```

**Key Features**:
- Email + password inputs
- Password toggle visibility (eye icon)
- "Remember me" checkbox (persists session preference)
- Primary CTA: Email/password login
- Secondary CTA: Google OAuth
- Links to password reset and registration

**Form Fields**:
```typescript
type LoginFormData = {
  email: string
  password: string
  rememberMe?: boolean
}
```

**Validation Schema** (Zod):
```typescript
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
})
```

**Error Handling**:
- **Invalid credentials**: "Invalid email or password. Please try again."
- **Account not verified**: "Please verify your email before signing in. Check your inbox for the verification link."
- **Network error**: "Unable to connect. Please check your internet connection."
- **Rate limited**: "Too many login attempts. Please try again in 5 minutes."

---

### 2. Registration Form

**File**: `components/features/authentication/components/RegisterForm.tsx`

**Layout**:
```
┌─────────────────────────────┐
│  Create your account       │
│  Start tracking your       │
│  finances today            │
│                            │
│  Email                     │
│  ┌──────────────────────┐  │
│  │ email@example.com    │  │
│  └──────────────────────┘  │
│                            │
│  Password                  │
│  ┌──────────────────────┐  │
│  │ ••••••••••••    [👁] │  │
│  └──────────────────────┘  │
│  ✓ At least 8 characters  │
│  ✗ One uppercase letter   │
│  ✗ One number             │
│                            │
│  Confirm Password          │
│  ┌──────────────────────┐  │
│  │ ••••••••••••    [👁] │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │   Create Account     │  │
│  └──────────────────────┘  │
│                            │
│  ────── OR ──────          │
│                            │
│  ┌──────────────────────┐  │
│  │ [G] Sign up with     │  │
│  │     Google           │  │
│  └──────────────────────┘  │
│                            │
│  Already have an account?  │
│  Sign in                   │
└─────────────────────────────┘
```

**Key Features**:
- Email input
- Password input with toggle
- **Live password requirements validation** (updates as user types)
- Confirm password input
- Primary CTA: Create account
- Secondary CTA: Google OAuth
- Link to login

**Form Fields**:
```typescript
type RegisterFormData = {
  email: string
  password: string
  confirmPassword: string
}
```

**Validation Schema** (Zod):
```typescript
const registerSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

**Password Requirements Component**:
```typescript
type PasswordRequirement = {
  label: string
  met: boolean
}

// Display requirements with check/x icons
- ✓ At least 8 characters (green when met)
- ✗ One uppercase letter (gray when not met)
- ✗ One lowercase letter
- ✗ One number
```

**Success Flow**:
1. Form submitted successfully
2. Show toast: "Account created! Please check your email to verify your account."
3. Redirect to login page or show banner on current page
4. Display email verification banner (see Email Verification UI section)

---

### 3. Password Reset Request Form

**File**: `components/features/authentication/components/ResetPasswordForm.tsx`

**Layout**:
```
┌─────────────────────────────┐
│  Reset your password       │
│  Enter your email and we'll│
│  send you a reset link     │
│                            │
│  Email                     │
│  ┌──────────────────────┐  │
│  │ email@example.com    │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │   Send Reset Link    │  │
│  └──────────────────────┘  │
│                            │
│  Back to login             │
└─────────────────────────────┘
```

**Form Fields**:
```typescript
type ResetPasswordFormData = {
  email: string
}
```

**Validation**:
```typescript
const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
})
```

**Success Message**:
"If an account exists with this email, you'll receive a password reset link shortly. Please check your inbox and spam folder."

**UX Note**: Always show success message (don't reveal if email exists - security best practice)

---

### 4. Update Password Form (From Email Link)

**File**: `components/features/authentication/components/UpdatePasswordForm.tsx`

**Layout**:
```
┌─────────────────────────────┐
│  Set new password          │
│  Choose a strong password  │
│                            │
│  New Password              │
│  ┌──────────────────────┐  │
│  │ ••••••••••••    [👁] │  │
│  └──────────────────────┘  │
│  ✓ At least 8 characters  │
│  ✗ One uppercase letter   │
│  ✗ One number             │
│                            │
│  Confirm Password          │
│  ┌──────────────────────┐  │
│  │ ••••••••••••    [👁] │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │   Update Password    │  │
│  └──────────────────────┘  │
└─────────────────────────────┘
```

**Form Fields**:
```typescript
type UpdatePasswordFormData = {
  password: string
  confirmPassword: string
}
```

**Validation**: Same as registration password validation

**Success Flow**:
1. Password updated successfully
2. Show toast: "Password updated! You can now sign in with your new password."
3. Redirect to login page

**Error Cases**:
- Invalid or expired token: "This password reset link has expired. Please request a new one."
- Token already used: "This password reset link has already been used. Please request a new one if needed."

---

### 5. Profile Completion Form

**File**: `components/features/authentication/components/ProfileCompletionForm.tsx`

**Context**: After email verification, users can optionally complete their profile. This is shown on first login or in profile settings.

**Layout**:
```
┌─────────────────────────────┐
│  Complete your profile     │
│  (Optional)                │
│                            │
│  Full Name                 │
│  ┌──────────────────────┐  │
│  │ John Doe             │  │
│  └──────────────────────┘  │
│                            │
│  Profile Picture           │
│  ┌──────┐                  │
│  │  JD  │  Upload Photo    │
│  └──────┘                  │
│                            │
│  ┌──────────────────────┐  │
│  │   Save Profile       │  │
│  └──────────────────────┘  │
│                            │
│  Skip for now              │
└─────────────────────────────┘
```

**Form Fields**:
```typescript
type ProfileFormData = {
  fullName?: string
  avatarUrl?: string
}
```

**Validation**:
```typescript
const profileSchema = z.object({
  fullName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional()
})
```

**Features**:
- Optional fields (can be skipped)
- Avatar upload (integration with Supabase Storage)
- Default avatar with initials if no photo uploaded
- "Skip for now" link

---

### 6. Custom Password Input Component

**File**: `components/features/authentication/components/PasswordInput.tsx`

**Purpose**: Reusable password input with toggle visibility

**Implementation**:
```typescript
"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function PasswordInput({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
}
```

**Features**:
- Toggle between text/password type
- Eye/EyeOff icons from lucide-react
- Accessible aria-labels
- Positioned absolutely in parent container

**Usage in Forms**:
```typescript
<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <FormControl>
        <PasswordInput placeholder="Enter your password" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### 7. OAuth Buttons Component

**File**: `components/features/authentication/components/OAuthButtons.tsx`

**Design Pattern**: Google OAuth button as secondary authentication option

**Implementation**:
```typescript
"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function OAuthButtons() {
  const handleGoogleSignIn = async () => {
    // Supabase OAuth implementation
    // const { data, error } = await supabase.auth.signInWithOAuth({
    //   provider: 'google',
    //   options: {
    //     redirectTo: `${window.location.origin}/auth/callback`
    //   }
    // })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          {/* Google icon SVG */}
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  )
}
```

**Visual Design**:
- Separator with "Or continue with" text
- Full-width outline button
- Google logo icon
- Clear, action-oriented text

**Placement**:
- Below primary email/password form
- Same visual weight as form (full width)
- Clear separator to distinguish authentication methods

---

### 8. Password Requirements Component

**File**: `components/features/authentication/components/PasswordRequirements.tsx`

**Purpose**: Live validation feedback as user types password

**Implementation**:
```typescript
import { Check, X } from "lucide-react"

type Requirement = {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
]

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <div className="space-y-1 text-sm">
      {requirements.map((req, index) => {
        const met = req.test(password)
        return (
          <div
            key={index}
            className={`flex items-center gap-2 ${
              met ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {met ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{req.label}</span>
          </div>
        )
      })}
    </div>
  )
}
```

**Usage**:
```typescript
<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <FormControl>
        <PasswordInput {...field} />
      </FormControl>
      <PasswordRequirements password={field.value} />
      <FormMessage />
    </FormItem>
  )}
/>
```

**Visual Design**:
- Check icon (green) when requirement met
- X icon (gray) when not met
- Text color changes: green when met, muted when not
- Positioned below password input, above error message

---

## Form Validation Patterns

### react-hook-form + Zod Integration

**File**: `components/features/authentication/schemas/authSchemas.ts`

All validation schemas in one place:

```typescript
import { z } from "zod"

// Reusable field validators
export const emailValidator = z
  .string()
  .min(1, { message: "Email is required" })
  .email({ message: "Please enter a valid email address" })

export const passwordValidator = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })

// Form schemas
export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, { message: "Password is required" })
})

export const registerSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
  email: emailValidator
})

export const updatePasswordSchema = z.object({
  password: passwordValidator,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

### Form Setup Pattern

**Consistent pattern across all forms**:

```typescript
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { loginSchema } from "../schemas/authSchemas"

export function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      // API call
      console.log(values)
    } catch (error) {
      // Error handling
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

### Error Display

**Inline field errors** (using `<FormMessage />`):
```typescript
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" placeholder="email@example.com" {...field} />
      </FormControl>
      <FormMessage /> {/* Shows validation errors */}
    </FormItem>
  )}
/>
```

**Global form errors** (API errors, network errors):
```typescript
{form.formState.errors.root && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {form.formState.errors.root.message}
    </AlertDescription>
  </Alert>
)}
```

**Setting root errors**:
```typescript
async function onSubmit(values: z.infer<typeof loginSchema>) {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      form.setError("root", {
        type: "manual",
        message: "Invalid email or password. Please try again."
      })
    }
  } catch (error) {
    form.setError("root", {
      type: "manual",
      message: "Unable to connect. Please check your internet connection."
    })
  }
}
```

---

## OAuth Integration Design

### Google OAuth Flow

**Visual Design**:
1. Separator with "Or continue with" text
2. Google button with logo, full width, outline variant
3. Positioned below primary form

**Implementation Steps**:

1. **Configure Supabase OAuth** (done in Supabase dashboard):
   - Enable Google provider
   - Add authorized redirect URLs

2. **OAuth Button Handler**:
```typescript
const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })

  if (error) {
    console.error('OAuth error:', error.message)
  }
}
```

3. **Callback Handler** (`app/api/auth/callback/route.ts`):
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard or profile completion
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

**UX Considerations**:
- Google button should have same visual prominence as email/password
- Clear error messaging if OAuth fails
- Handle email conflicts (if email already registered with password)

---

## Error & Success States

### Toast Notifications

**When to use toasts**:
- Success confirmations (registration, password reset email sent)
- Non-blocking errors (network issues, temporary failures)
- Background actions (email verification resent)

**Installation**:
```bash
yarn dlx shadcn@latest add toast
yarn dlx shadcn@latest add sonner  # Alternative toast library
```

**Usage Pattern**:
```typescript
import { useToast } from "@/components/ui/use-toast"

export function RegisterForm() {
  const { toast } = useToast()

  async function onSubmit(values) {
    // After successful registration
    toast({
      title: "Account created!",
      description: "Please check your email to verify your account.",
      variant: "default",
    })
  }
}
```

**Toast vs Alert vs Inline Error**:

| Feedback Type | Use Case | Component |
|--------------|----------|-----------|
| **Inline error** | Form validation errors | `<FormMessage />` |
| **Alert** | Critical blocking errors | `<Alert variant="destructive">` |
| **Toast** | Success messages, non-critical errors | `<Toast>` |

### Loading States

**Button loading state**:
```typescript
<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Signing in...
    </>
  ) : (
    "Sign in"
  )}
</Button>
```

**Full form loading state** (for OAuth redirects):
```typescript
{isLoading && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
)}
```

### Error Message Guidelines

**Good error messages** (specific, actionable):
- "Invalid email or password. Please try again."
- "This email is already registered. Try signing in instead."
- "Password must be at least 8 characters and contain a number."

**Bad error messages** (vague, unhelpful):
- "Something went wrong"
- "Error 401"
- "Invalid input"

**Security consideration**: Don't reveal whether email exists during login (prevents user enumeration). Always say "Invalid email or password" instead of "Email not found" or "Wrong password".

---

## Email Verification UI

### Verification Banner

**File**: `components/features/authentication/components/EmailVerificationBanner.tsx`

**When to show**:
- After registration (on login page or any page if user tries to access protected routes)
- On dashboard if user is logged in but not verified
- Dismissible but reappears on page reload if still not verified

**Design**:
```
┌────────────────────────────────────────────────┐
│ ⚠️  Please verify your email                  │
│ We sent a verification link to your@email.com │
│ Check your inbox and click the link.          │
│                                                │
│ Didn't receive it? [Resend verification email]│
│                                            [×] │
└────────────────────────────────────────────────┘
```

**Implementation**:
```typescript
"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"

export function EmailVerificationBanner({
  userEmail,
  onResend
}: {
  userEmail: string
  onResend: () => Promise<void>
}) {
  const [isResending, setIsResending] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    await onResend()
    setIsResending(false)
  }

  if (isDismissed) return null

  return (
    <Alert variant="default" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Please verify your email</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          We sent a verification link to <strong>{userEmail}</strong>.
          Check your inbox and click the link.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm">Didn't receive it?</span>
          <Button
            variant="link"
            size="sm"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend verification email"}
          </Button>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
```

**Placement**:
- **Login page**: Above login form
- **Dashboard**: Top of page (sticky or inline)
- **Any protected route**: Top of page

### Verification Handler Page

**File**: `app/(auth)/verify-email/page.tsx`

**URL**: `/verify-email?token_hash={hash}&type=email`

**Implementation**:
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token_hash: string; type: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  const { error } = await supabase.auth.verifyOtp({
    token_hash: searchParams.token_hash,
    type: 'email',
  })

  if (error) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">
          Verification Failed
        </h1>
        <p className="text-muted-foreground">
          This verification link is invalid or has expired.
        </p>
        <Button asChild>
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    )
  }

  redirect('/dashboard')
}
```

**Success Flow**:
1. User clicks link in email
2. Redirected to `/verify-email?token_hash=...&type=email`
3. Token verified
4. User redirected to dashboard
5. Toast shown: "Email verified successfully!"

**Error Flow**:
1. Invalid/expired token
2. Show error page with explanation
3. Provide link back to login
4. Option to resend verification email

### Blocking vs Banner Approach

**Recommendation**: **Banner approach** (non-blocking)

**Rationale**:
- Less frustrating for users (can still explore app)
- Persistent reminder without being aggressive
- Users can complete profile, view demo data
- Only block critical actions (adding real financial data)

**Critical actions that require verification**:
- Connecting bank accounts
- Creating transactions
- Viewing sensitive financial data
- Changing security settings

**Non-critical actions** (allow without verification):
- Viewing profile
- Completing profile
- Exploring UI/demo data
- Logging out

---

## Accessibility Considerations

### ARIA Attributes

**shadcn/ui handles most ARIA automatically**, but ensure:

1. **Form labels**: Every input has associated label
   ```typescript
   <FormLabel htmlFor="email">Email</FormLabel>
   <FormControl>
     <Input id="email" type="email" {...field} />
   </FormControl>
   ```

2. **Error announcements**: FormMessage has `role="alert"`
   ```typescript
   <FormMessage /> {/* Automatically has aria-live="polite" */}
   ```

3. **Button states**:
   ```typescript
   <Button
     disabled={isSubmitting}
     aria-busy={isSubmitting}
   >
     Sign in
   </Button>
   ```

4. **Password toggle**:
   ```typescript
   <Button
     aria-label={showPassword ? "Hide password" : "Show password"}
     onClick={() => setShowPassword(!showPassword)}
   >
     {showPassword ? <EyeOff /> : <Eye />}
   </Button>
   ```

### Keyboard Navigation

**Ensure tab order is logical**:
1. Email input
2. Password input
3. Remember me checkbox (if present)
4. Submit button
5. OAuth button
6. Links (forgot password, register)

**Enter key**: Submits form (native behavior with `<form>`)

**Escape key**: Clear field or close modal (if using dialog)

### Focus Management

**After form error**: Focus first invalid field
```typescript
// react-hook-form automatically focuses first error
const form = useForm({
  resolver: zodResolver(loginSchema),
  mode: "onBlur",
  // focusFirstError: true (default)
})
```

**After successful action**: Focus next logical element or show clear confirmation

### Color Contrast

**WCAG 2.1 AA compliance**:
- Text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

**shadcn/ui default colors meet WCAG AA** ✓

**Test with**:
- Chrome DevTools Lighthouse
- axe DevTools browser extension

### Screen Reader Testing

**Test with**:
- macOS VoiceOver
- NVDA (Windows)
- JAWS (Windows)

**Key announcements**:
- Form errors are announced
- Success messages are announced
- Loading states are announced

---

## Implementation Roadmap

### Phase 1: Setup & Dependencies (Day 1)

**Tasks**:
1. Install shadcn/ui components
   ```bash
   yarn dlx shadcn@latest init
   yarn dlx shadcn@latest add form input button label card separator alert toast checkbox avatar dialog
   yarn dlx shadcn@latest add login-01  # Base login block
   ```

2. Install form dependencies
   ```bash
   yarn add react-hook-form @hookform/resolvers zod lucide-react
   ```

3. Update `globals.css` with extended color palette (see Design System section)

4. Create directory structure:
   ```bash
   mkdir -p components/features/authentication/{components,hooks,schemas,types}
   mkdir -p app/\(auth\)/{login,register,reset-password,update-password,verify-email}
   mkdir -p app/\(dashboard\)/{dashboard,profile}
   mkdir -p app/api/auth/callback
   ```

5. Create Zod schemas (`authSchemas.ts`)

**Acceptance Criteria**:
- [ ] All shadcn components installed
- [ ] Color system extended in globals.css
- [ ] Directory structure created
- [ ] Validation schemas defined
- [ ] Dev server runs without errors

---

### Phase 2: Core Components (Day 2)

**Tasks**:
1. Create `PasswordInput.tsx` component
2. Create `PasswordRequirements.tsx` component
3. Create `OAuthButtons.tsx` component
4. Create auth layout (`app/(auth)/layout.tsx`)

**Acceptance Criteria**:
- [ ] Password input toggles visibility
- [ ] Password requirements update live
- [ ] Google OAuth button renders with correct styling
- [ ] Auth layout centers content correctly

---

### Phase 3: Authentication Forms (Day 3)

**Tasks**:
1. Create `LoginForm.tsx`
   - Email/password inputs
   - Remember me checkbox
   - OAuth integration
   - Error handling

2. Create `RegisterForm.tsx`
   - Email/password/confirm inputs
   - Live password validation
   - OAuth integration
   - Success toast

3. Create `ResetPasswordForm.tsx`
   - Email input
   - Success message

4. Create `UpdatePasswordForm.tsx`
   - New password/confirm inputs
   - Live validation
   - Success redirect

**Acceptance Criteria**:
- [ ] All forms validate correctly
- [ ] Error messages display inline
- [ ] Success messages show in toasts
- [ ] Forms are responsive on mobile

---

### Phase 4: Pages & Routes (Day 4)

**Tasks**:
1. Create login page (`app/(auth)/login/page.tsx`)
2. Create register page (`app/(auth)/register/page.tsx`)
3. Create reset password page (`app/(auth)/reset-password/page.tsx`)
4. Create update password page (`app/(auth)/update-password/page.tsx`)
5. Create verify email page (`app/(auth)/verify-email/page.tsx`)
6. Create auth callback route (`app/api/auth/callback/route.ts`)

**Acceptance Criteria**:
- [ ] All pages render forms correctly
- [ ] Navigation between pages works
- [ ] Links to external pages are correct
- [ ] Auth callback handles OAuth flow

---

### Phase 5: Email Verification UI (Day 4)

**Tasks**:
1. Create `EmailVerificationBanner.tsx`
2. Integrate banner in dashboard layout
3. Create resend verification endpoint
4. Handle verification success/error states

**Acceptance Criteria**:
- [ ] Banner shows for unverified users
- [ ] Resend button works
- [ ] Banner dismisses correctly
- [ ] Verification success redirects to dashboard

---

### Phase 6: Profile Completion (Day 5)

**Tasks**:
1. Create `ProfileCompletionForm.tsx`
2. Create profile page (`app/(dashboard)/profile/page.tsx`)
3. Integrate avatar upload with Supabase Storage
4. Handle optional fields correctly

**Acceptance Criteria**:
- [ ] Profile form saves correctly
- [ ] Avatar upload works
- [ ] Default avatar shows initials
- [ ] "Skip for now" works

---

### Phase 7: Integration & Testing (Day 5-6)

**Tasks**:
1. Integrate forms with Supabase Auth API
2. Test all authentication flows end-to-end
3. Test error cases (invalid credentials, network errors)
4. Test OAuth flow with Google
5. Test email verification flow
6. Test password reset flow
7. Test responsive design on mobile/tablet
8. Run accessibility audit

**Acceptance Criteria**:
- [ ] All auth flows work end-to-end
- [ ] Error handling is comprehensive
- [ ] UI is responsive on all screen sizes
- [ ] Accessibility score > 90 (Lighthouse)
- [ ] No console errors or warnings

---

### Phase 8: Polish & Documentation (Day 6)

**Tasks**:
1. Add loading skeletons for async operations
2. Improve error messages based on testing
3. Add micro-interactions (button hover states, etc.)
4. Update README with auth setup instructions
5. Document environment variables needed
6. Create Storybook stories for components (optional)

**Acceptance Criteria**:
- [ ] Loading states are smooth
- [ ] Error messages are clear and actionable
- [ ] Micro-interactions enhance UX
- [ ] Documentation is complete

---

## Additional Notes

### Environment Variables Required

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth callback URL (configure in Supabase dashboard)
# http://localhost:3000/api/auth/callback (development)
# https://your-domain.com/api/auth/callback (production)
```

### Supabase Email Templates

Customize Supabase email templates in dashboard:
- **Confirm signup**: Email verification link
- **Reset password**: Password reset link
- **Magic link**: Passwordless login (if needed later)

**Customization points**:
- Add branding (logo, colors)
- Customize copy for financial context
- Ensure links include correct callback URLs

### Rate Limiting Considerations

**Important for production**:
- Implement rate limiting on auth endpoints
- Limit login attempts to 5 per 5 minutes per IP
- Limit password reset requests to 3 per hour per email
- Limit verification email resends to 3 per hour

**Implementation**: Use `lib/rate-limit.ts` (already exists in project)

### Security Checklist

- [ ] HTTPS only in production
- [ ] httpOnly cookies for session tokens
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints
- [ ] Password complexity enforced
- [ ] Email verification mandatory for critical actions
- [ ] OAuth redirect URLs whitelisted
- [ ] Error messages don't reveal sensitive info (user enumeration)
- [ ] Session expiration configured appropriately

### Performance Considerations

- [ ] Forms use `mode: "onBlur"` to avoid excessive validation
- [ ] Debounce password requirements checking (100ms)
- [ ] Lazy load OAuth providers if multiple (currently just Google)
- [ ] Optimize images (Google logo SVG)
- [ ] Use Next.js Image component for avatars
- [ ] Prefetch dashboard route after successful login

### Browser Compatibility

**Target browsers**:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Known issues**:
- Safari password autofill may conflict with custom password toggle (test thoroughly)
- iOS Safari form zoom on focus (add `maximum-scale=1` if necessary, but prefer larger inputs)

---

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui Forms Guide](https://ui.shadcn.com/docs/forms/react-hook-form)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Summary

This implementation plan provides a complete blueprint for building a professional, accessible, and secure authentication system for the Financial Advisor MVP using shadcn/ui, Next.js 14, and Supabase Auth.

**Key Takeaways**:
1. **Use shadcn/ui login blocks** as starting point (login-01 recommended)
2. **Extend color system** in globals.css for full shadcn support
3. **Centralize validation** in authSchemas.ts for consistency
4. **Banner approach** for email verification (non-blocking)
5. **Comprehensive error handling** with specific, actionable messages
6. **OAuth as secondary option** (Google) with clear visual separation
7. **Live password validation** for better UX during registration
8. **Accessibility first** - leverage shadcn's built-in ARIA support
9. **Phase implementation** over 6 days with clear acceptance criteria

**Next Steps**:
1. Review this plan with the team
2. Confirm design decisions (colors, layouts)
3. Set up Supabase project and OAuth providers
4. Begin Phase 1 implementation
5. Test iteratively throughout development
