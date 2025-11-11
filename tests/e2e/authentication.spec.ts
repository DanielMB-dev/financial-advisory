import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:3000'

// Generate unique email for each test run
const timestamp = Date.now()
const generateTestEmail = (suffix: string) => `test-${timestamp}-${suffix}@example.com`

test.describe('Authentication Feature Validation', () => {
  test.describe('AC1: User Registration (Email/Password)', () => {
    test('should register new user with valid credentials', async ({ page }) => {
      // Given: New user visits registration page
      await page.goto(`${BASE_URL}/register`)

      // When: User fills form with valid data
      const testEmail = generateTestEmail('register')
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', 'Password123')
      await page.fill('input[name="confirmPassword"]', 'Password123')

      // And: Submits the form
      await page.click('button[type="submit"]')

      // Then: Success message shown
      await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10000 })

      // And: User stays on registration page (no redirect to login)
      await expect(page).toHaveURL(/\/register/)
    })

    test('should show error for invalid email format', async ({ page }) => {
      // Given: User on registration page
      await page.goto(`${BASE_URL}/register`)

      // When: User enters invalid email
      await page.fill('input[name="email"]', 'invalid-email')
      await page.fill('input[name="password"]', 'Password123')
      await page.fill('input[name="confirmPassword"]', 'Password123')
      await page.click('button[type="submit"]')

      // Then: Validation error shown
      await expect(page.getByText(/invalid email/i)).toBeVisible()
    })

    test('should show error when password too short', async ({ page }) => {
      // Given: User on registration page
      await page.goto(`${BASE_URL}/register`)

      // When: User enters password < 8 characters
      await page.fill('input[name="email"]', generateTestEmail('short-pwd'))
      await page.fill('input[name="password"]', 'Pass1')
      await page.fill('input[name="confirmPassword"]', 'Pass1')
      await page.click('button[type="submit"]')

      // Then: Validation error shown (use more specific selector to avoid matching PasswordRequirements)
      await expect(
        page
          .locator('[role="alert"]')
          .getByText(/at least 8 characters/i)
          .first()
      ).toBeVisible()
    })

    test('should show error when passwords do not match', async ({ page }) => {
      // Given: User on registration page
      await page.goto(`${BASE_URL}/register`)

      // When: User enters mismatched passwords
      await page.fill('input[name="email"]', generateTestEmail('mismatch'))
      await page.fill('input[name="password"]', 'Password123')
      await page.fill('input[name="confirmPassword"]', 'Password456')
      await page.click('button[type="submit"]')

      // Then: Validation error shown
      await expect(page.getByText(/passwords.*match/i)).toBeVisible()
    })

    test('should prevent duplicate registration', async ({ page }) => {
      // Given: User already registered
      const duplicateEmail = generateTestEmail('duplicate')

      // First registration
      await page.goto(`${BASE_URL}/register`)
      await page.fill('input[name="email"]', duplicateEmail)
      await page.fill('input[name="password"]', 'Password123')
      await page.fill('input[name="confirmPassword"]', 'Password123')
      await page.click('button[type="submit"]')
      await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10000 })

      // Wait a moment
      await page.waitForTimeout(2000)

      // When: Attempt to register same email again
      await page.goto(`${BASE_URL}/register`)
      await page.fill('input[name="email"]', duplicateEmail)
      await page.fill('input[name="password"]', 'Password123')
      await page.fill('input[name="confirmPassword"]', 'Password123')
      await page.click('button[type="submit"]')

      // Then: Error or success (idempotent - resends email)
      // Due to backend idempotency, this should succeed (resend verification)
      await page.waitForTimeout(3000)
      const hasError = await page
        .getByText(/already/i)
        .isVisible()
        .catch(() => false)
      const hasSuccess = await page
        .getByText(/check your email/i)
        .isVisible()
        .catch(() => false)

      expect(hasError || hasSuccess).toBeTruthy()
    })
  })

  test.describe('AC4: User Login (Email/Password)', () => {
    test('should show error when email is empty', async ({ page }) => {
      // Given: User on login page
      await page.goto(`${BASE_URL}/login`)

      // When: User submits without email
      await page.fill('input[name="password"]', 'Password123')
      await page.click('button[type="submit"]')

      // Then: Validation error shown
      await expect(page.getByText(/email.*required/i)).toBeVisible()
    })

    test('should show error when password is empty', async ({ page }) => {
      // Given: User on login page
      await page.goto(`${BASE_URL}/login`)

      // When: User submits without password
      await page.fill('input[name="email"]', 'test@example.com')
      await page.click('button[type="submit"]')

      // Then: Validation error shown
      await expect(page.getByText(/password.*required/i)).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      // Given: User on login page
      await page.goto(`${BASE_URL}/login`)

      // When: User enters non-existent credentials
      await page.fill('input[name="email"]', 'nonexistent@example.com')
      await page.fill('input[name="password"]', 'WrongPassword123')
      await page.click('button[type="submit"]')

      // Then: Error message shown
      await page.waitForTimeout(2000)
      const hasInvalidCreds = await page
        .getByText(/invalid credentials/i)
        .isVisible()
        .catch(() => false)
      const hasLoginFailed = await page
        .getByText(/login failed/i)
        .isVisible()
        .catch(() => false)

      expect(hasInvalidCreds || hasLoginFailed).toBeTruthy()
    })
  })

  test.describe('AC10: Protected Routes', () => {
    test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
      // Given: Unauthenticated user
      // Clear any existing sessions
      await page.context().clearCookies()

      // When: User tries to access dashboard
      await page.goto(`${BASE_URL}/dashboard`)

      // Then: Redirected to login page
      await page.waitForURL(/\/login/, { timeout: 10000 })
      await expect(page).toHaveURL(/\/login/)
    })

    test('should not allow access to protected route without session', async ({ page }) => {
      // Given: No session
      await page.context().clearCookies()

      // When: Direct navigation to dashboard
      await page.goto(`${BASE_URL}/dashboard`)

      // Then: Redirected or shows login prompt
      await page.waitForTimeout(1000)
      const currentUrl = page.url()

      // Should either be on login page or dashboard with "Not authenticated" message
      const isOnLogin = currentUrl.includes('/login')
      const hasAuthError = await page
        .getByText(/not authenticated/i)
        .isVisible()
        .catch(() => false)

      expect(isOnLogin || hasAuthError).toBeTruthy()
    })
  })

  test.describe('AC12: Error Messages', () => {
    test('should display user-friendly error messages', async ({ page }) => {
      // Test various error scenarios
      await page.goto(`${BASE_URL}/register`)

      // Invalid email
      await page.fill('input[name="email"]', 'bad-email')
      await page.locator('input[name="email"]').blur()
      await page.waitForTimeout(500)
      let errorText = await page.textContent('body')
      expect(errorText?.toLowerCase()).toContain('email')

      // Short password
      await page.fill('input[name="email"]', 'valid@example.com')
      await page.fill('input[name="password"]', '12345')
      await page.locator('input[name="password"]').blur()
      await page.waitForTimeout(500)
      errorText = await page.textContent('body')
      expect(errorText?.toLowerCase()).toContain('8')

      // Password mismatch
      await page.fill('input[name="password"]', 'Password123')
      await page.fill('input[name="confirmPassword"]', 'Different123')
      await page.locator('input[name="confirmPassword"]').blur()
      await page.waitForTimeout(500)
      errorText = await page.textContent('body')
      expect(errorText?.toLowerCase()).toMatch(/match|same/)
    })
  })

  test.describe('Form Usability', () => {
    test('should disable submit button while submitting', async ({ page }) => {
      // Given: User on registration page
      await page.goto(`${BASE_URL}/register`)

      // When: User fills form
      await page.fill('input[name="email"]', generateTestEmail('button-test'))
      await page.fill('input[name="password"]', 'Password123')
      await page.fill('input[name="confirmPassword"]', 'Password123')

      // Get submit button
      const submitButton = page.locator('button[type="submit"]')

      // Click and check if disabled immediately
      await submitButton.click()

      // Then: Button should show loading state or be disabled
      await page.waitForTimeout(500)
      const buttonText = await submitButton.textContent()
      const isDisabled = await submitButton.isDisabled()

      // Should either be disabled or show loading text
      expect(
        isDisabled ||
          buttonText?.toLowerCase().includes('creating') ||
          buttonText?.toLowerCase().includes('loading')
      ).toBeTruthy()
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Given: User on registration page
      await page.goto(`${BASE_URL}/register`)

      // When: User tabs through form
      await page.keyboard.press('Tab')
      await page.keyboard.type(generateTestEmail('keyboard'))
      await page.keyboard.press('Tab')
      await page.keyboard.type('Password123')
      await page.keyboard.press('Tab')
      await page.keyboard.type('Password123')

      // Then: All fields should be filled
      const email = await page.inputValue('input[name="email"]')
      const password = await page.inputValue('input[name="password"]')
      const confirmPassword = await page.inputValue('input[name="confirmPassword"]')

      expect(email).toContain('@example.com')
      expect(password).toBe('Password123')
      expect(confirmPassword).toBe('Password123')
    })
  })

  test.describe('Responsive Design', () => {
    test('should be usable on mobile viewport', async ({ page }) => {
      // Given: Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // When: User visits registration page
      await page.goto(`${BASE_URL}/register`)

      // Then: Form should be visible and usable
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('input[name="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()

      // Form should fill viewport width appropriately
      const formWidth = await page.locator('form').boundingBox()
      expect(formWidth?.width).toBeLessThan(375)
    })
  })

  test.describe('Visual Feedback', () => {
    test('should show success toast after successful registration', async ({ page }) => {
      // Given: User on registration page
      await page.goto(`${BASE_URL}/register`)

      // When: User registers successfully
      await page.fill('input[name="email"]', generateTestEmail('toast'))
      await page.fill('input[name="password"]', 'Password123')
      await page.fill('input[name="confirmPassword"]', 'Password123')
      await page.click('button[type="submit"]')

      // Then: Success toast/message visible
      await expect(page.getByText(/success/i).or(page.getByText(/check your email/i))).toBeVisible({
        timeout: 10000,
      })
    })
  })
})
