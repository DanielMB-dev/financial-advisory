import { test } from '@playwright/test'
import path from 'path'

/**
 * UI/UX Analysis - Screenshot Capture
 *
 * This test suite captures comprehensive screenshots of the authentication UI
 * across multiple viewports and states for design analysis.
 */

const SCREENSHOTS_DIR = path.join(process.cwd(), '.claude', 'doc', 'authentication', 'screenshots')

test.describe('Authentication UI Analysis', () => {
  test.describe.configure({ mode: 'serial' })

  test('01 - Login Page - Initial State', async ({ page, browserName }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const filename = `01-login-initial-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('02 - Login Page - Filled Form', async ({ page, browserName }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Fill form fields
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'Password123!')

    const filename = `02-login-filled-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('03 - Login Page - Password Visible', async ({ page, browserName }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Fill password and toggle visibility
    await page.fill('input[name="password"]', 'Password123!')
    await page.click('button[aria-label*="password"]')

    const filename = `03-login-password-visible-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('04 - Login Page - Validation Errors', async ({ page, browserName }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Fill invalid email
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'short')

    // Trigger validation by blurring fields
    await page.click('input[name="email"]')
    await page.click('input[name="password"]')
    await page.click('body')

    // Wait for validation messages
    await page.waitForTimeout(500)

    const filename = `04-login-validation-errors-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('05 - Register Page - Initial State', async ({ page, browserName }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const filename = `05-register-initial-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('06 - Register Page - Password Requirements', async ({ page, browserName }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Type password to trigger requirements display
    await page.fill('input[name="password"]', 'Pass1')

    // Wait for requirements component
    await page.waitForTimeout(500)

    const filename = `06-register-password-requirements-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('07 - Register Page - All Requirements Met', async ({ page, browserName }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Type password that meets all requirements
    await page.fill('input[name="password"]', 'Password123!')

    // Wait for requirements to update
    await page.waitForTimeout(500)

    const filename = `07-register-requirements-met-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('08 - Register Page - Confirm Password Mismatch', async ({ page, browserName }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Fill passwords that don't match
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.fill('input[name="confirmPassword"]', 'Password456!')

    // Blur to trigger validation
    await page.click('body')
    await page.waitForTimeout(500)

    const filename = `08-register-password-mismatch-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('09 - Register Page - Valid Form', async ({ page, browserName }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Fill valid form
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.fill('input[name="confirmPassword"]', 'Password123!')

    const filename = `09-register-valid-form-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('10 - Dashboard Page - Protected Route', async ({ page, browserName }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Should redirect to login, capture that state
    await page.waitForTimeout(1000)

    const filename = `10-dashboard-redirect-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('11 - Mobile - Touch Target Analysis', async ({ page, browserName }) => {
    // Only run on mobile viewport
    if (browserName !== 'webkit' && page.viewportSize()?.width !== 375) {
      test.skip()
    }

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Highlight interactive elements for touch target analysis
    await page.addStyleTag({
      content: `
        button, a, input {
          outline: 2px solid red !important;
          outline-offset: 2px !important;
        }
      `,
    })

    const filename = `11-mobile-touch-targets-${browserName.toLowerCase()}.png`
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename),
      fullPage: true,
    })
  })

  test('12 - Accessibility - Focus States', async ({ page, browserName }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Tab through form to show focus states
    await page.keyboard.press('Tab') // Google button
    await page.waitForTimeout(200)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `12a-focus-google-${browserName.toLowerCase()}.png`),
      fullPage: true,
    })

    await page.keyboard.press('Tab') // Email input
    await page.waitForTimeout(200)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `12b-focus-email-${browserName.toLowerCase()}.png`),
      fullPage: true,
    })

    await page.keyboard.press('Tab') // Password input
    await page.waitForTimeout(200)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `12c-focus-password-${browserName.toLowerCase()}.png`),
      fullPage: true,
    })
  })
})
