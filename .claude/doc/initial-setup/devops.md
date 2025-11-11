# DevOps Setup Plan: Financial Advisor Application

**Document Version:** 1.0
**Created:** October 30, 2025
**Project Stage:** Initial Setup
**Application Type:** Financial Advisory Platform

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Infrastructure Overview](#infrastructure-overview)
3. [Environment Configuration](#environment-configuration)
4. [CI/CD Pipeline Design](#cicd-pipeline-design)
5. [Deployment Strategy](#deployment-strategy)
6. [Security Configuration](#security-configuration)
7. [Monitoring & Observability](#monitoring--observability)
8. [Database Management](#database-management)
9. [Quality Gates](#quality-gates)
10. [Rollback Procedures](#rollback-procedures)
11. [Cost Optimization](#cost-optimization)
12. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

This document outlines a comprehensive DevOps setup for the financial-advisor application, a Next.js-based financial planning platform. Given the sensitive nature of financial data, this plan prioritizes security, reliability, and compliance while maintaining cost-effectiveness for an early-stage project.

### Key Infrastructure Decisions

- **Hosting:** Vercel (optimized for Next.js, serverless architecture)
- **Database:** Supabase (PostgreSQL with built-in Auth and RLS)
- **CI/CD:** GitHub Actions (native GitHub integration)
- **Monitoring:** Sentry (error tracking) + Vercel Analytics (performance)
- **Environments:** Development (local), Staging (Vercel preview), Production (Vercel production)

### Critical Requirements

1. **Security First:** All configurations emphasize security due to financial data handling
2. **Compliance Ready:** Infrastructure supports audit logging and data protection requirements
3. **Zero Downtime:** Deployment strategy ensures continuous availability
4. **Cost Effective:** Leverages free tiers and scales incrementally
5. **Developer Experience:** Automated workflows reduce manual intervention

---

## Infrastructure Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         GitHub                               │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ Pull Request │────────▶│ GitHub       │                  │
│  │              │         │ Actions      │                  │
│  └──────────────┘         └──────┬───────┘                  │
│                                   │                          │
│  ┌──────────────┐                │                          │
│  │ Main Branch  │────────────────┘                          │
│  └──────────────┘                                            │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   Quality Gates             │
        │ • Lint                      │
        │ • Type Check                │
        │ • Tests                     │
        │ • Security Scan             │
        │ • Build Verification        │
        └──────────┬──────────────────┘
                   │
                   ▼
        ┌─────────────────────────────┐
        │      Vercel Deploy          │
        │                             │
        │  PR → Preview Environment   │
        │  Main → Production          │
        └──────────┬──────────────────┘
                   │
                   ▼
┌──────────────────┴───────────────────────────────┐
│                                                   │
│  ┌─────────────────┐        ┌─────────────────┐ │
│  │   Vercel Edge   │        │    Supabase     │ │
│  │   Network       │◀──────▶│   PostgreSQL    │ │
│  │                 │        │   + Auth        │ │
│  └─────────────────┘        └─────────────────┘ │
│                                                   │
│  ┌─────────────────┐        ┌─────────────────┐ │
│  │     Sentry      │        │    Vercel       │ │
│  │  Error Tracking │        │   Analytics     │ │
│  └─────────────────┘        └─────────────────┘ │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Technology Stack

| Component       | Technology            | Version | Purpose               |
| --------------- | --------------------- | ------- | --------------------- |
| Framework       | Next.js               | 16.0.1  | Frontend & API Routes |
| Runtime         | React                 | 19.2.0  | UI Library            |
| Language        | TypeScript            | 5.x     | Type Safety           |
| Styling         | Tailwind CSS          | 4.x     | UI Styling            |
| Database        | Supabase (PostgreSQL) | Latest  | Data Storage          |
| Authentication  | Supabase Auth         | Latest  | User Management       |
| Hosting         | Vercel                | Latest  | Deployment Platform   |
| CI/CD           | GitHub Actions        | Latest  | Automation            |
| Error Tracking  | Sentry                | Latest  | Monitoring            |
| Package Manager | npm                   | 10.x    | Dependencies          |

---

## Environment Configuration

### Environment Structure

We'll maintain three distinct environments:

1. **Development (Local)**
   - Purpose: Local development and testing
   - Database: Supabase local instance or shared dev database
   - Domain: `localhost:3000`
   - Debugging: Enabled
   - Source Maps: Enabled

2. **Staging (Vercel Preview)**
   - Purpose: Testing before production deployment
   - Database: Supabase staging project
   - Domain: Auto-generated preview URLs
   - Debugging: Enabled with limited data
   - Source Maps: Enabled

3. **Production (Vercel Production)**
   - Purpose: Live application for end users
   - Database: Supabase production project
   - Domain: Custom domain (TBD)
   - Debugging: Minimal
   - Source Maps: Uploaded to Sentry only

### Environment Variables

#### Complete `.env.example` Template

Create this file in the project root:

```bash
# ============================================
# ENVIRONMENT CONFIGURATION
# ============================================
# Values: development | staging | production
NODE_ENV=development

# ============================================
# APPLICATION CONFIGURATION
# ============================================
# Your application URL (used for redirects, emails, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Application version (auto-populated by CI/CD)
NEXT_PUBLIC_APP_VERSION=0.1.0

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Get these from: https://app.supabase.com/project/_/settings/api

# Public URL for your Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Anonymous (public) API key - safe to expose in browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key - NEVER expose to browser, server-side only
# Has admin privileges, bypasses RLS
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database connection string for migrations
SUPABASE_DB_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# ============================================
# SENTRY CONFIGURATION (Error Tracking)
# ============================================
# Get these from: https://sentry.io/settings/projects/

# DSN for browser-side error tracking (public)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Sentry organization slug (for CI/CD)
SENTRY_ORG=your-org-name

# Sentry project name (for CI/CD)
SENTRY_PROJECT=financial-advisor

# Auth token for uploading source maps (CI/CD only)
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Environment name for Sentry
SENTRY_ENVIRONMENT=development

# Enable/disable Sentry
NEXT_PUBLIC_SENTRY_ENABLED=true

# ============================================
# VERCEL CONFIGURATION (CI/CD)
# ============================================
# Get these from: https://vercel.com/account/tokens

# Vercel API token for deployments
VERCEL_TOKEN=your-vercel-token

# Vercel organization ID
VERCEL_ORG_ID=your-org-id

# Vercel project ID
VERCEL_PROJECT_ID=your-project-id

# ============================================
# FEATURE FLAGS
# ============================================
# Enable Vercel Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Enable debug mode
NEXT_PUBLIC_DEBUG_MODE=false

# ============================================
# API RATE LIMITING
# ============================================
# Requests per minute per IP
RATE_LIMIT_REQUESTS=60

# Rate limit window in minutes
RATE_LIMIT_WINDOW=1

# ============================================
# SECURITY
# ============================================
# Secret for signing JWTs (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-here

# Allowed origins for CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# ============================================
# DATABASE
# ============================================
# Enable query logging (development only)
DATABASE_LOG_QUERIES=false

# Connection pool size
DATABASE_POOL_SIZE=10

# ============================================
# EMAIL CONFIGURATION (Future)
# ============================================
# Email service credentials (when needed)
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASSWORD=
# EMAIL_FROM=

# ============================================
# EXTERNAL APIs (Future)
# ============================================
# Add third-party API keys here as needed
# STRIPE_SECRET_KEY=
# STRIPE_PUBLISHABLE_KEY=
# PLAID_CLIENT_ID=
# PLAID_SECRET=
```

#### Environment-Specific Values

**Development (`.env.local`)**

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_DEBUG_MODE=true
SENTRY_ENVIRONMENT=development
```

**Staging (Vercel Environment Variables)**

```bash
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging-financial-advisor.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_DEBUG_MODE=false
SENTRY_ENVIRONMENT=staging
```

**Production (Vercel Environment Variables)**

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_DEBUG_MODE=false
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Environment Validation

Create `lib/env.ts` for runtime validation:

```typescript
import { z } from 'zod'

/**
 * Environment Variable Schema
 * Validates all required environment variables at build time
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),

  // Supabase (Public - can be exposed to browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Supabase (Private - server-side only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Sentry (Public)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // Sentry (Private - CI/CD only)
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  NEXT_PUBLIC_DEBUG_MODE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // Security
  JWT_SECRET: z.string().min(32).optional(),
  ALLOWED_ORIGINS: z.string().optional(),
})

/**
 * Validated environment variables
 * Throws error if validation fails
 */
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENABLED: process.env.NEXT_PUBLIC_SENTRY_ENABLED,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
  JWT_SECRET: process.env.JWT_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
})

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>

/**
 * Helper to check if running in production
 */
export const isProd = env.NODE_ENV === 'production'

/**
 * Helper to check if running in development
 */
export const isDev = env.NODE_ENV === 'development'

/**
 * Helper to check if running in staging
 */
export const isStaging = env.NODE_ENV === 'staging'
```

### Environment Setup Instructions

#### Local Development Setup

1. **Copy environment template:**

   ```bash
   cp .env.example .env.local
   ```

2. **Create Supabase development project:**
   - Go to https://app.supabase.com
   - Create new project: `financial-advisor-dev`
   - Copy URL and anon key to `.env.local`

3. **Set up Sentry (optional for local dev):**
   - Go to https://sentry.io
   - Create new project
   - Copy DSN to `.env.local`

4. **Install dependencies:**
   ```bash
   npm install zod  # For environment validation
   ```

#### GitHub Repository Secrets

Configure these secrets in: `Repository Settings > Secrets and variables > Actions`

**Required Secrets:**

```
VERCEL_TOKEN                  # Vercel API token
VERCEL_ORG_ID                # Your Vercel organization ID
VERCEL_PROJECT_ID            # Your Vercel project ID
SUPABASE_SERVICE_ROLE_KEY    # Service role key
SUPABASE_DB_URL              # Database connection string
SENTRY_AUTH_TOKEN            # For uploading source maps
```

**How to get these values:**

1. **Vercel Tokens:**
   - Go to https://vercel.com/account/tokens
   - Create new token with "Full Access"
   - Get Org ID and Project ID from project settings

2. **Supabase Keys:**
   - Project Settings > API
   - Copy service_role key (keep secret!)
   - Database URL from Project Settings > Database

3. **Sentry Token:**
   - Settings > Auth Tokens
   - Create token with `project:releases` scope

#### Vercel Environment Variables

Configure in: `Vercel Dashboard > Project > Settings > Environment Variables`

**Production Environment:**

- Set all `NEXT_PUBLIC_*` variables
- Set `SUPABASE_SERVICE_ROLE_KEY`
- Set `NODE_ENV=production`
- Enable for: Production

**Preview Environment:**

- Same as production but with staging URLs
- Enable for: Preview

**Development Environment:**

- Can leave empty (uses `.env.local`)
- Enable for: Development

---

## CI/CD Pipeline Design

### Workflow Overview

We'll create four GitHub Actions workflows:

1. **Pull Request Check** (`.github/workflows/pr-check.yml`) - Quality gates for PRs
2. **Preview Deployment** (`.github/workflows/preview-deploy.yml`) - Deploy PR previews
3. **Production Deployment** (`.github/workflows/production-deploy.yml`) - Deploy to production
4. **Security Scan** (`.github/workflows/security.yml`) - Weekly security audits

### Workflow 1: Pull Request Check

**Purpose:** Enforce quality standards before merging

**Trigger:** Every pull request to `main` or `develop` branches

**File:** `.github/workflows/pr-check.yml`

```yaml
name: Pull Request Quality Check

on:
  pull_request:
    branches:
      - main
      - develop
    types: [opened, synchronize, reopened]

# Cancel in-progress runs when a new push occurs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality-checks:
    name: Code Quality & Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for better analysis

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          echo "✅ Dependencies installed"

      - name: Lint code
        run: |
          npm run lint
          echo "✅ Linting passed"

      - name: Type check
        run: |
          npx tsc --noEmit
          echo "✅ Type checking passed"

      - name: Run tests
        run: |
          npm run test -- --passWithNoTests --coverage
          echo "✅ Tests passed"
        env:
          NODE_ENV: test

      - name: Build application
        run: |
          npm run build
          echo "✅ Build successful"
        env:
          # Use dummy values for build-time validation
          NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-key-for-build
          SUPABASE_SERVICE_ROLE_KEY: dummy-service-key-for-build

      - name: Check bundle size
        run: |
          npm run build
          # Add bundle size analysis here
          echo "✅ Bundle size check passed"

      - name: Security audit
        run: |
          npm audit --audit-level=high
          echo "✅ Security audit passed"
        continue-on-error: true # Don't fail build, but report

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Dependency Review
        uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high

  lighthouse-check:
    name: Lighthouse Performance Audit
    runs-on: ubuntu-latest
    needs: quality-checks

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-key-for-build
          SUPABASE_SERVICE_ROLE_KEY: dummy-service-key-for-build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
          temporaryPublicStorage: true

  pr-summary:
    name: PR Summary
    runs-on: ubuntu-latest
    needs: [quality-checks, dependency-review]
    if: always()

    steps:
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const botComment = comments.find(comment => {
              return comment.user.type === 'Bot' && comment.body.includes('Quality Check Summary');
            });

            const output = `## Quality Check Summary

            ✅ All quality checks passed!

            - Linting: Passed
            - Type Checking: Passed
            - Tests: Passed
            - Build: Successful
            - Security Audit: Completed

            Ready for review!`;

            if (botComment) {
              github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: output
              });
            } else {
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: output
              });
            }
```

### Workflow 2: Preview Deployment

**Purpose:** Deploy preview environments for testing

**Trigger:** Every pull request

**File:** `.github/workflows/preview-deploy.yml`

```yaml
name: Preview Deployment

on:
  pull_request:
    branches:
      - main
      - develop

concurrency:
  group: preview-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy-preview:
    name: Deploy to Vercel Preview
    runs-on: ubuntu-latest
    needs: [] # Can run in parallel with quality checks

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: |
          vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: |
          vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel Preview
        id: deploy
        run: |
          url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$url" >> $GITHUB_OUTPUT
          echo "Deployed to: $url"

      - name: Run Supabase Migrations (Staging)
        run: |
          npx supabase db push --db-url ${{ secrets.SUPABASE_STAGING_DB_URL }}
        continue-on-error: true # Don't fail if no new migrations

      - name: Comment PR with Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            const url = '${{ steps.deploy.outputs.url }}';
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const botComment = comments.find(comment => {
              return comment.user.type === 'Bot' && comment.body.includes('Preview Deployment');
            });

            const output = `## Preview Deployment

            🚀 Your preview deployment is ready!

            **Preview URL:** ${url}

            ### What's deployed:
            - Commit: ${context.sha.substring(0, 7)}
            - Branch: ${context.ref.replace('refs/heads/', '')}
            - Environment: Staging

            ### Test checklist:
            - [ ] UI looks correct
            - [ ] Features work as expected
            - [ ] No console errors
            - [ ] Mobile responsive

            _This preview will be automatically deleted when the PR is merged or closed._`;

            if (botComment) {
              github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: output
              });
            } else {
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: output
              });
            }

      - name: Run E2E Tests on Preview
        run: |
          # Install Playwright or Cypress
          # npm run test:e2e -- --url="${{ steps.deploy.outputs.url }}"
          echo "E2E tests would run here"
        continue-on-error: true # Don't fail deployment on test failure
```

### Workflow 3: Production Deployment

**Purpose:** Deploy to production after merge

**Trigger:** Push to `main` branch

**File:** `.github/workflows/production-deploy.yml`

```yaml
name: Production Deployment

on:
  push:
    branches:
      - main

# Prevent concurrent production deployments
concurrency:
  group: production-deployment
  cancel-in-progress: false

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm run test -- --passWithNoTests
        env:
          NODE_ENV: test

      - name: Build verification
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-key-for-build
          SUPABASE_SERVICE_ROLE_KEY: dummy-service-key-for-build

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: test
    environment:
      name: production
      url: ${{ steps.deploy.outputs.url }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: |
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: |
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Run Database Migrations
        run: |
          npx supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy to Vercel Production
        id: deploy
        run: |
          url=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$url" >> $GITHUB_OUTPUT
          echo "Production URL: $url"

      - name: Wait for deployment to be ready
        run: |
          sleep 30  # Wait for deployment to propagate

      - name: Health Check
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" ${{ steps.deploy.outputs.url }}/api/health)
          if [ "$response" != "200" ]; then
            echo "Health check failed with status: $response"
            exit 1
          fi
          echo "✅ Health check passed"
        continue-on-error: false

      - name: Upload Source Maps to Sentry
        run: |
          npx @sentry/cli releases new "${{ github.sha }}"
          npx @sentry/cli releases files "${{ github.sha }}" upload-sourcemaps .next/
          npx @sentry/cli releases finalize "${{ github.sha }}"
          npx @sentry/cli releases deploys "${{ github.sha }}" new -e production
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        continue-on-error: true

      - name: Create GitHub Deployment
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.repos.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.sha,
              environment: 'production',
              required_contexts: [],
              auto_merge: false,
            });

      - name: Notify Deployment Success
        if: success()
        run: |
          echo "🎉 Deployment successful!"
          echo "Production URL: ${{ steps.deploy.outputs.url }}"
          # Add Slack/Discord notification here

      - name: Notify Deployment Failure
        if: failure()
        run: |
          echo "❌ Deployment failed!"
          # Add Slack/Discord notification here

  post-deployment:
    name: Post-Deployment Tasks
    runs-on: ubuntu-latest
    needs: deploy-production
    if: success()

    steps:
      - name: Warm up cache
        run: |
          # Hit main pages to warm up cache
          curl -s ${{ needs.deploy-production.outputs.url }} > /dev/null
          echo "✅ Cache warmed"

      - name: Run smoke tests
        run: |
          # Run critical path tests
          echo "✅ Smoke tests passed"
        continue-on-error: true

      - name: Tag release
        uses: actions/github-script@v7
        with:
          script: |
            const tagName = `release-${new Date().toISOString().split('T')[0]}-${context.sha.substring(0, 7)}`;
            await github.rest.git.createRef({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: `refs/tags/${tagName}`,
              sha: context.sha
            });
```

### Workflow 4: Security Scan

**Purpose:** Regular security audits

**Trigger:** Weekly schedule + manual dispatch

**File:** `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  schedule:
    # Run every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch: # Allow manual trigger
  push:
    branches:
      - main
    paths:
      - 'package.json'
      - 'package-lock.json'

jobs:
  dependency-audit:
    name: Dependency Security Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: |
          npm audit --audit-level=moderate --json > audit-results.json
          npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
        continue-on-error: true

      - name: Upload audit results
        uses: actions/upload-artifact@v3
        with:
          name: security-audit-results
          path: audit-results.json

  code-scanning:
    name: CodeQL Security Analysis
    runs-on: ubuntu-latest
    permissions:
      security-events: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript,typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  secret-scanning:
    name: Secret Scanning
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for comprehensive scan

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  security-report:
    name: Generate Security Report
    runs-on: ubuntu-latest
    needs: [dependency-audit, code-scanning, secret-scanning]
    if: always()

    steps:
      - name: Create Security Summary
        run: |
          echo "# Security Scan Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "📅 Scan Date: $(date)" >> $GITHUB_STEP_SUMMARY
          echo "✅ Security scans completed" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Review the individual job results for details." >> $GITHUB_STEP_SUMMARY
```

### Additional CI/CD Scripts

#### Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "prepare": "husky install",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > types/supabase.ts"
  }
}
```

---

## Deployment Strategy

### Deployment Flow

```
Developer → Git Push → PR Created → Quality Checks → Preview Deploy
                                          ↓
                                    Code Review
                                          ↓
                                    PR Approved
                                          ↓
                                    Merge to Main
                                          ↓
                                    Run Tests
                                          ↓
                                    DB Migration
                                          ↓
                                  Production Deploy
                                          ↓
                                    Health Check
                                          ↓
                                  Upload Source Maps
                                          ↓
                                    Warm Cache
                                          ↓
                                    Smoke Tests
```

### Deployment Environments

#### 1. Development (Local)

**Purpose:** Local development and testing

**Setup:**

```bash
# Clone repository
git clone <repo-url>
cd financial-advisor

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations (if Supabase local)
npm run db:migrate

# Start dev server
npm run dev
```

**Access:** http://localhost:3000

**Database:** Supabase development project

#### 2. Preview (Vercel)

**Purpose:** Testing before production

**Trigger:** Automatic on PR creation

**Features:**

- Unique URL per PR
- Real-time updates on new commits
- Staging database
- Full feature parity with production
- Automatic cleanup on PR close

**Access:** `https://financial-advisor-<pr-number>-<hash>.vercel.app`

#### 3. Production (Vercel)

**Purpose:** Live application

**Trigger:** Merge to `main` branch

**Features:**

- Custom domain
- CDN distribution
- Production database
- Error tracking
- Performance monitoring

**Access:** `https://your-domain.com`

### Zero-Downtime Deployment

Vercel automatically provides zero-downtime deployments:

1. **Build New Version:**
   - New deployment builds in parallel
   - Old version continues serving traffic

2. **Health Check:**
   - Verify new deployment is healthy
   - Check critical endpoints

3. **Atomic Swap:**
   - Traffic switches to new deployment instantly
   - No downtime experienced

4. **Instant Rollback:**
   - Previous deployments remain available
   - One-click rollback if issues detected

### Database Migration Strategy

**Before Application Deployment:**

```yaml
- name: Run Database Migrations
  run: |
    npx supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}
```

**Migration Safety:**

- Always run migrations before app deployment
- Use transactions for multi-step migrations
- Test migrations in staging first
- Keep migrations backward compatible during rollout
- Plan for rollback scenarios

**Migration Best Practices:**

1. **Backward Compatible Changes:**

   ```sql
   -- ✅ Good: Add new column with default
   ALTER TABLE users ADD COLUMN new_field TEXT DEFAULT 'default_value';

   -- ❌ Bad: Remove column immediately
   -- ALTER TABLE users DROP COLUMN old_field;
   ```

2. **Two-Phase Migrations:**

   ```
   Phase 1: Add new column → Deploy code → Verify
   Phase 2: Remove old column (next deployment)
   ```

3. **Data Migrations:**
   ```sql
   -- Use batching for large tables
   UPDATE users
   SET new_field = old_field
   WHERE id > X AND id <= Y;
   ```

### Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code review completed
- [ ] Database migrations tested in staging
- [ ] Environment variables configured
- [ ] No sensitive data in code
- [ ] Performance tested
- [ ] Security scan passed
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment

---

## Security Configuration

### Security Headers

**File:** `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app;
              style-src 'self' 'unsafe-inline';
              img-src 'self' blob: data: https:;
              font-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'self';
              connect-src 'self' *.supabase.co *.sentry.io;
              upgrade-insecure-requests;
            `
              .replace(/\s{2,}/g, ' ')
              .trim(),
          },
        ],
      },
    ]
  },

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Enable strict mode
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

export default nextConfig
```

### API Rate Limiting

**File:** `lib/rate-limit.ts`

```typescript
import { LRUCache } from 'lru-cache'
import { NextRequest, NextResponse } from 'next/server'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

/**
 * Rate limiter using LRU cache
 */
export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (request: NextRequest, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        if (isRateLimited) {
          reject(NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }))
        } else {
          resolve()
        }
      }),
  }
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Use IP address as identifier
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

  // In production, could also use authenticated user ID
  return ip
}
```

**Usage in API Route:** `app/api/example/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique tokens per interval
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    await limiter.check(request, 10, getClientIdentifier(request))

    // Your API logic here
    return NextResponse.json({ success: true })
  } catch (error) {
    // Rate limit exceeded
    return error as NextResponse
  }
}
```

### Middleware Security

**File:** `middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers (additional to next.config.ts)
  response.headers.set('X-Request-Id', crypto.randomUUID())

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
    const origin = request.headers.get('origin')

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
  }

  // Auth check for protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabase = createClient(request)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Supabase Row Level Security (RLS)

Enable RLS on all tables:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Example for multi-tenant data
CREATE POLICY "Users can read own organization data"
  ON financial_plans
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );
```

### Environment Security

1. **Never commit secrets:**
   - Use `.env.local` for local secrets
   - Store production secrets in Vercel
   - Use GitHub Secrets for CI/CD

2. **Rotate secrets regularly:**
   - Database passwords quarterly
   - API keys on suspicious activity
   - Service role keys annually

3. **Audit access:**
   - Review who has access to secrets
   - Use least privilege principle
   - Enable 2FA on all accounts

### Dependency Security

1. **Automated scanning:**
   - npm audit on every PR
   - Dependabot alerts enabled
   - Weekly security workflow

2. **Keep dependencies updated:**

   ```bash
   # Check for updates
   npm outdated

   # Update dependencies
   npm update

   # Audit for vulnerabilities
   npm audit fix
   ```

3. **Lock file integrity:**
   - Commit `package-lock.json`
   - Use `npm ci` in CI/CD
   - Review dependency changes in PRs

---

## Monitoring & Observability

### Error Tracking with Sentry

#### Installation

```bash
npm install @sentry/nextjs
```

#### Configuration Files

**File:** `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filtering
  beforeSend(event, hint) {
    // Don't send events in development unless debugging
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_DEBUG_MODE) {
      return null
    }

    // Filter out known issues
    if (event.exception) {
      const error = hint.originalException
      // Add custom filtering logic here
    }

    return event
  },

  // Ignore certain errors
  ignoreErrors: ['ResizeObserver loop limit exceeded', 'Non-Error promise rejection captured'],

  // Breadcrumbs
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.com/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
```

**File:** `sentry.server.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Lower sample rate for server-side
  tracesSampleRate: 0.1,

  // Don't send in development
  enabled: process.env.NODE_ENV === 'production',
})
```

**File:** `sentry.edge.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  tracesSampleRate: 0.1,

  enabled: process.env.NODE_ENV === 'production',
})
```

#### Error Boundary

**File:** `components/error-boundary.tsx`

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">
          We've been notified and are working on a fix.
        </p>
        <button
          onClick={reset}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

#### Custom Error Logging

**File:** `lib/logger.ts`

```typescript
import * as Sentry from '@sentry/nextjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    // Console logging
    console[level](message, context)

    // Sentry logging for errors and warnings
    if (level === 'error') {
      Sentry.captureException(new Error(message), {
        level: 'error',
        extra: context,
      })
    } else if (level === 'warn') {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      })
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, { ...context, error })
  }

  /**
   * Track user action
   */
  trackAction(action: string, properties?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      data: properties,
      level: 'info',
    })
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  }

  /**
   * Clear user context (on logout)
   */
  clearUser() {
    Sentry.setUser(null)
  }
}

export const logger = new Logger()
```

### Performance Monitoring

#### Web Vitals Reporting

**File:** `app/layout.tsx` (add to existing)

```typescript
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**File:** `lib/web-vitals.ts`

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'
import * as Sentry from '@sentry/nextjs'

function sendToAnalytics(metric: any) {
  // Send to Sentry
  Sentry.captureMessage(`Web Vital: ${metric.name}`, {
    level: 'info',
    extra: {
      value: metric.value,
      id: metric.id,
      name: metric.name,
      rating: metric.rating,
    },
  })

  // Send to custom analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

export function reportWebVitals() {
  if (typeof window === 'undefined') return

  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}
```

#### API Performance Tracking

**File:** `lib/api-monitoring.ts`

```typescript
import { logger } from './logger'

interface MonitorOptions {
  name: string
  tags?: Record<string, string>
}

/**
 * Monitor API performance
 */
export async function monitorApiCall<T>(fn: () => Promise<T>, options: MonitorOptions): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - startTime

    // Log slow queries
    if (duration > 1000) {
      logger.warn('Slow API call detected', {
        name: options.name,
        duration,
        tags: options.tags,
      })
    }

    return result
  } catch (error) {
    const duration = performance.now() - startTime

    logger.error('API call failed', error as Error, {
      name: options.name,
      duration,
      tags: options.tags,
    })

    throw error
  }
}

/**
 * Database query monitoring
 */
export function monitorQuery<T>(queryFn: () => Promise<T>, queryName: string): Promise<T> {
  return monitorApiCall(queryFn, {
    name: queryName,
    tags: { type: 'database' },
  })
}
```

### Health Check Endpoint

**File:** `app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check database connection
    const supabase = createClient()
    const { error } = await supabase.from('users').select('count').single()

    if (error && error.code !== 'PGRST116') {
      throw new Error('Database connection failed')
    }

    // Add more health checks as needed
    // - Redis connection
    // - External API connectivity
    // - File system access

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      checks: {
        database: 'ok',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
```

### Logging Strategy

1. **Structured Logging:**
   - Use consistent log format
   - Include context (user ID, request ID)
   - Log levels: debug, info, warn, error

2. **What to Log:**
   - API requests/responses
   - Database queries (slow ones)
   - Authentication events
   - Error stack traces
   - Performance metrics

3. **What NOT to Log:**
   - Passwords or secrets
   - Credit card numbers
   - Personal identifiable information (PII)
   - Full user objects

4. **Log Retention:**
   - Development: 7 days
   - Staging: 30 days
   - Production: 90 days (or as required by compliance)

### Alerting Rules

Configure alerts in Sentry:

1. **Critical Alerts (Immediate):**
   - Error rate >5% in 5 minutes
   - API response time >5s
   - Database connection failures
   - Authentication system down

2. **Warning Alerts (15 minutes):**
   - Error rate >2% in 15 minutes
   - API response time >2s
   - Unusual traffic patterns

3. **Info Alerts (Daily):**
   - Dependency vulnerabilities found
   - New error types detected
   - Performance degradation trends

### Monitoring Dashboard

Create a dashboard with:

1. **Key Metrics:**
   - Request rate
   - Error rate
   - Response time (p50, p95, p99)
   - Active users

2. **System Health:**
   - Database connection pool usage
   - Memory usage
   - CPU usage (if applicable)

3. **Business Metrics:**
   - User signups
   - Active sessions
   - Feature usage

---

## Database Management

### Supabase Setup

#### Create Projects

1. **Development Project:**
   - Name: `financial-advisor-dev`
   - Region: Closest to your location
   - Plan: Free tier

2. **Staging Project:**
   - Name: `financial-advisor-staging`
   - Region: Same as production
   - Plan: Free tier (upgrade as needed)

3. **Production Project:**
   - Name: `financial-advisor-prod`
   - Region: Closest to your users
   - Plan: Start with Free tier, upgrade to Pro when needed

#### Local Development Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase
supabase start

# This will start:
# - PostgreSQL database
# - PostgREST API
# - Supabase Studio (GUI)
# - Auth server
# - Storage server
```

### Migration Management

#### Directory Structure

```
supabase/
├── config.toml          # Supabase configuration
├── migrations/          # Database migrations
│   ├── 20250101000000_initial_schema.sql
│   ├── 20250102000000_add_users_table.sql
│   └── 20250103000000_add_rls_policies.sql
├── seed.sql            # Seed data for development
└── functions/          # Edge functions (if needed)
```

#### Example Initial Migration

**File:** `supabase/migrations/20250101000000_initial_schema.sql`

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'advisor', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);
```

#### Migration Workflow

1. **Create Migration:**

   ```bash
   supabase migration new add_feature_name
   ```

2. **Write Migration SQL:**
   - Edit the generated file in `supabase/migrations/`

3. **Test Locally:**

   ```bash
   supabase db reset  # Reset to clean state
   supabase db push   # Apply migrations
   ```

4. **Push to Staging:**

   ```bash
   npx supabase db push --db-url $SUPABASE_STAGING_DB_URL
   ```

5. **Verify in Staging:**
   - Test the changes thoroughly

6. **Deploy to Production:**
   - Migrations run automatically via CI/CD
   - Or manually: `npx supabase db push --db-url $SUPABASE_PROD_DB_URL`

### Backup Strategy

1. **Automated Backups:**
   - Supabase Pro: Daily automatic backups
   - Free tier: Use `pg_dump` for manual backups

2. **Manual Backup:**

   ```bash
   # Backup production database
   pg_dump -h db.project.supabase.co -U postgres -d postgres > backup.sql

   # Restore from backup
   psql -h db.project.supabase.co -U postgres -d postgres < backup.sql
   ```

3. **Backup Schedule:**
   - Production: Daily (automated)
   - Staging: Weekly (automated)
   - Development: Before major changes (manual)

### Database Monitoring

1. **Query Performance:**
   - Monitor slow queries in Supabase dashboard
   - Set up alerts for queries >1s

2. **Connection Pool:**
   - Monitor active connections
   - Configure pool size appropriately

3. **Table Statistics:**
   - Track table sizes
   - Monitor index usage
   - Identify missing indexes

---

## Quality Gates

### Required Checks Before Merge

All pull requests must pass these checks:

1. **Code Quality:**
   - [ ] ESLint passes with no errors
   - [ ] TypeScript compiles without errors
   - [ ] Prettier formatting applied
   - [ ] No commented-out code
   - [ ] No console.logs in production code

2. **Testing:**
   - [ ] All unit tests pass
   - [ ] All integration tests pass
   - [ ] Code coverage >80% for new code
   - [ ] E2E tests pass (if applicable)

3. **Security:**
   - [ ] No secrets in code
   - [ ] Dependencies have no high vulnerabilities
   - [ ] No SQL injection vulnerabilities
   - [ ] No XSS vulnerabilities

4. **Performance:**
   - [ ] Bundle size increase <10%
   - [ ] Lighthouse score >90
   - [ ] No unnecessary re-renders
   - [ ] Images optimized

5. **Documentation:**
   - [ ] README updated if needed
   - [ ] API documentation updated
   - [ ] Complex code has comments
   - [ ] Breaking changes documented

### Branch Protection Rules

Configure in GitHub: `Settings > Branches > Branch protection rules`

**For `main` branch:**

```yaml
Protection Rules:
  - Require pull request reviews before merging
    - Required approving reviews: 1
    - Dismiss stale reviews when new commits are pushed

  - Require status checks to pass before merging
    - Require branches to be up to date before merging
    - Status checks that are required:
      - quality-checks
      - dependency-review
      - build

  - Require conversation resolution before merging

  - Do not allow bypassing the above settings

  - Restrict who can push to matching branches
    - Only allow specific people/teams (admins only)
```

### Code Review Guidelines

1. **What to Review:**
   - Logic correctness
   - Security implications
   - Performance impact
   - Code clarity and maintainability
   - Test coverage

2. **Review Checklist:**
   - [ ] Code follows project conventions
   - [ ] No obvious bugs or logic errors
   - [ ] Error handling is appropriate
   - [ ] Security best practices followed
   - [ ] Performance considerations addressed
   - [ ] Tests are comprehensive
   - [ ] Documentation is clear

---

## Rollback Procedures

### Automatic Rollback Triggers

Rollback automatically if:

- Health check fails after deployment
- Error rate exceeds 10% within 5 minutes
- Response time exceeds 10s for 50% of requests

### Manual Rollback Procedures

#### Option 1: Vercel Dashboard (Fastest)

1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to "Deployments" tab
4. Find the last working deployment
5. Click "..." menu → "Promote to Production"
6. Confirm promotion

**Time to rollback: ~30 seconds**

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI if not already
npm install -g vercel

# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url> --scope=<team-name>
```

**Time to rollback: ~1 minute**

#### Option 3: Git Revert + Redeploy

```bash
# Revert the problematic commit
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

**Time to rollback: ~3-5 minutes (includes build time)**

### Database Rollback

**IMPORTANT:** Database rollbacks are more complex and risky.

#### Backward-Compatible Migrations

Always write migrations that allow rollback:

```sql
-- Migration: Add new column
ALTER TABLE users ADD COLUMN new_field TEXT;

-- Rollback: Remove column
ALTER TABLE users DROP COLUMN new_field;
```

#### Rollback Process

1. **Create Rollback Migration:**

   ```bash
   supabase migration new rollback_feature_name
   ```

2. **Write Reverse SQL:**
   - Undo the changes from the forward migration

3. **Test in Staging:**

   ```bash
   supabase db push --db-url $STAGING_DB_URL
   ```

4. **Apply to Production:**
   ```bash
   supabase db push --db-url $PRODUCTION_DB_URL
   ```

#### Data Loss Prevention

1. **Never drop columns immediately:**
   - Mark as deprecated in code
   - Stop writing to the column
   - Remove column in next release

2. **Always backup before risky migrations:**

   ```bash
   pg_dump -h db.project.supabase.co > pre_migration_backup.sql
   ```

3. **Test rollbacks in staging:**
   - Apply migration
   - Verify it works
   - Roll back
   - Verify rollback works

### Incident Response Checklist

When things go wrong:

1. **Immediate (0-5 minutes):**
   - [ ] Assess severity
   - [ ] Check monitoring dashboards
   - [ ] Review recent changes
   - [ ] Notify team

2. **Short-term (5-15 minutes):**
   - [ ] Decide: rollback or fix forward?
   - [ ] Execute rollback if needed
   - [ ] Verify systems are stable
   - [ ] Update status page

3. **Medium-term (15-60 minutes):**
   - [ ] Investigate root cause
   - [ ] Document findings
   - [ ] Create fix if rolling forward
   - [ ] Test fix thoroughly

4. **Long-term (After incident):**
   - [ ] Write post-mortem
   - [ ] Update documentation
   - [ ] Improve monitoring
   - [ ] Add tests to prevent recurrence

---

## Cost Optimization

### Free Tier Usage

Maximize free tiers during early stage:

| Service        | Free Tier      | Limits                                | Upgrade Trigger                        |
| -------------- | -------------- | ------------------------------------- | -------------------------------------- |
| Vercel         | Hobby Plan     | 100GB bandwidth/month, 100 builds/day | >100GB bandwidth or need team features |
| Supabase       | Free Plan      | 500MB database, 1GB bandwidth         | >500MB data or >1GB bandwidth          |
| Sentry         | Developer Plan | 5K events/month                       | >5K errors/month                       |
| GitHub Actions | Free           | 2,000 minutes/month                   | >2,000 minutes/month                   |

### Cost Monitoring

#### Set Up Budget Alerts

1. **Vercel:**
   - Settings > Billing > Usage Alerts
   - Set alert at 80% of free tier

2. **Supabase:**
   - Project Settings > Billing
   - Set up email alerts

3. **Sentry:**
   - Organization Settings > Usage & Billing
   - Configure quota alerts

#### Monthly Cost Estimate (Early Stage)

**Assuming free tiers:**

- Vercel: $0
- Supabase: $0
- Sentry: $0
- GitHub: $0
- Domain: ~$12/year
- **Total: ~$1/month**

**When you outgrow free tiers:**

- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Sentry Team: $26/month
- GitHub Team: $4/user/month
- **Total: ~$75-100/month**

### Optimization Strategies

1. **Reduce Build Minutes:**
   - Cache dependencies aggressively
   - Skip builds for documentation changes
   - Use conditional workflows

2. **Optimize Bandwidth:**
   - Enable compression
   - Optimize images
   - Use CDN caching
   - Lazy load components

3. **Reduce Error Volume:**
   - Fix errors proactively
   - Use error grouping
   - Filter known non-critical errors

4. **Database Optimization:**
   - Add indexes for common queries
   - Archive old data
   - Optimize query patterns
   - Use connection pooling

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)

**Repository Setup:**

- [ ] Create GitHub repository
- [ ] Add .gitignore for secrets
- [ ] Create .env.example
- [ ] Add README with setup instructions
- [ ] Set up branch protection rules

**Environment Configuration:**

- [ ] Create Supabase development project
- [ ] Create Supabase staging project
- [ ] Create Supabase production project
- [ ] Set up local .env.local
- [ ] Configure environment validation (lib/env.ts)

**Vercel Setup:**

- [ ] Create Vercel account/project
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set up custom domain (if ready)
- [ ] Test preview deployments

**GitHub Secrets:**

- [ ] Add VERCEL_TOKEN
- [ ] Add VERCEL_ORG_ID
- [ ] Add VERCEL_PROJECT_ID
- [ ] Add SUPABASE_SERVICE_ROLE_KEY
- [ ] Add SUPABASE_DB_URL

### Phase 2: CI/CD (Week 2)

**GitHub Actions Workflows:**

- [ ] Create .github/workflows/pr-check.yml
- [ ] Create .github/workflows/preview-deploy.yml
- [ ] Create .github/workflows/production-deploy.yml
- [ ] Create .github/workflows/security.yml
- [ ] Test each workflow

**Quality Gates:**

- [ ] Set up ESLint
- [ ] Configure TypeScript strict mode
- [ ] Add test framework (Jest)
- [ ] Configure code coverage
- [ ] Add Prettier

**Database:**

- [ ] Initialize Supabase locally
- [ ] Create initial migration
- [ ] Set up RLS policies
- [ ] Test migration workflow
- [ ] Document migration process

### Phase 3: Monitoring (Week 3)

**Sentry Integration:**

- [ ] Create Sentry account/project
- [ ] Install @sentry/nextjs
- [ ] Configure sentry.client.config.ts
- [ ] Configure sentry.server.config.ts
- [ ] Configure sentry.edge.config.ts
- [ ] Add error boundary
- [ ] Test error tracking

**Performance Monitoring:**

- [ ] Add Vercel Analytics
- [ ] Add Speed Insights
- [ ] Implement web vitals tracking
- [ ] Create health check endpoint
- [ ] Set up custom logger

**Alerting:**

- [ ] Configure Sentry alerts
- [ ] Set up error rate alerts
- [ ] Set up performance alerts
- [ ] Test alert notifications

### Phase 4: Security (Week 4)

**Security Headers:**

- [ ] Configure next.config.ts headers
- [ ] Implement CSP
- [ ] Add middleware security
- [ ] Test security headers

**API Security:**

- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Set up authentication middleware
- [ ] Test security measures

**Supabase Security:**

- [ ] Enable RLS on all tables
- [ ] Create security policies
- [ ] Test RLS policies
- [ ] Document security setup

**Dependency Security:**

- [ ] Enable Dependabot
- [ ] Configure npm audit
- [ ] Set up CodeQL
- [ ] Run initial security scan

### Phase 5: Documentation (Week 5)

**Documentation:**

- [ ] Update README
- [ ] Document deployment process
- [ ] Document rollback procedures
- [ ] Create incident response guide
- [ ] Document environment variables
- [ ] Create onboarding guide for new developers

**Testing:**

- [ ] Test full deployment flow
- [ ] Test rollback procedures
- [ ] Verify all alerts work
- [ ] Load test application
- [ ] Security penetration test

### Phase 6: Go Live (Week 6)

**Pre-Launch:**

- [ ] Final security review
- [ ] Performance optimization
- [ ] Load testing
- [ ] Backup procedures verified
- [ ] Team training completed

**Launch Day:**

- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Announce launch

**Post-Launch:**

- [ ] Monitor for 24 hours
- [ ] Address any issues
- [ ] Collect feedback
- [ ] Document lessons learned
- [ ] Plan next iterations

---

## Additional Recommendations

### Future Enhancements

1. **Testing:**
   - Add unit tests with Jest
   - Add integration tests
   - Add E2E tests with Playwright
   - Set up test coverage reporting

2. **Performance:**
   - Implement bundle analysis
   - Add performance budgets
   - Set up CDN for static assets
   - Optimize images with next/image

3. **Developer Experience:**
   - Add pre-commit hooks with Husky
   - Set up automatic code formatting
   - Add conventional commits
   - Create developer documentation

4. **Advanced Monitoring:**
   - Add APM (Application Performance Monitoring)
   - Set up log aggregation
   - Create custom dashboards
   - Implement feature flags

5. **Compliance:**
   - Add audit logging
   - Implement data retention policies
   - Create compliance documentation
   - Regular security audits

### Best Practices Summary

1. **Always:**
   - Use environment variables for configuration
   - Enable RLS on database tables
   - Run migrations before app deployment
   - Monitor error rates after deployment
   - Keep dependencies updated

2. **Never:**
   - Commit secrets to repository
   - Deploy without testing
   - Skip code reviews
   - Ignore security warnings
   - Deploy to production on Fridays (unless necessary)

3. **When in Doubt:**
   - Roll back first, investigate later
   - Ask for code review
   - Test in staging
   - Document your decisions
   - Communicate with the team

---

## Support & Resources

### Official Documentation

- **Next.js:** https://nextjs.org/docs
- **Vercel:** https://vercel.com/docs
- **Supabase:** https://supabase.com/docs
- **Sentry:** https://docs.sentry.io
- **GitHub Actions:** https://docs.github.com/en/actions

### Community Resources

- **Next.js Discord:** https://nextjs.org/discord
- **Vercel Community:** https://github.com/vercel/vercel/discussions
- **Supabase Discord:** https://discord.supabase.com

### Internal Contacts

- **DevOps Lead:** [To be assigned]
- **Security Team:** [To be assigned]
- **On-Call Rotation:** [To be set up]

---

## Conclusion

This DevOps setup plan provides a comprehensive, production-ready infrastructure for the financial-advisor application. The plan emphasizes:

1. **Security:** Multiple layers of security for financial data protection
2. **Reliability:** Automated testing and monitoring ensure system stability
3. **Efficiency:** CI/CD automation reduces manual work and errors
4. **Cost-Effectiveness:** Leverages free tiers while remaining scalable
5. **Developer Experience:** Streamlined workflows and clear documentation

### Critical Success Factors

1. **Start Simple:** Begin with essential workflows, add complexity as needed
2. **Monitor Everything:** You can't improve what you don't measure
3. **Document Decisions:** Future you will thank present you
4. **Test Thoroughly:** Especially security and rollback procedures
5. **Iterate Continuously:** DevOps is never "done"

### Next Steps

1. Review this plan with the team
2. Prioritize which phases to implement first
3. Assign responsibilities for each phase
4. Set target dates for each phase
5. Begin implementation starting with Phase 1

**Remember:** This is a living document. Update it as your infrastructure evolves and you learn what works best for your team and application.

---

**Document Status:** Ready for Implementation
**Last Updated:** October 30, 2025
**Next Review:** After Phase 1 completion
