import { chromium, Browser, Page } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots')
const BASE_URL = 'http://localhost:3000'

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

interface ScreenshotConfig {
  name: string
  url: string
  waitForSelector?: string
  beforeScreenshot?: (page: Page) => Promise<void>
}

const desktopViewport = { width: 1920, height: 1080 }
const tabletViewport = { width: 768, height: 1024 }
const mobileViewport = { width: 375, height: 812 }

async function captureScreenshots(
  browser: Browser,
  config: ScreenshotConfig,
  viewportName: string,
  viewport: { width: number; height: number }
) {
  const context = await browser.newContext({
    viewport,
  })
  const page = await context.newPage()

  try {
    console.log(`📸 Capturing ${config.name} - ${viewportName}...`)

    await page.goto(`${BASE_URL}${config.url}`)

    if (config.waitForSelector) {
      await page.waitForSelector(config.waitForSelector, { timeout: 5000 })
    } else {
      await page.waitForLoadState('networkidle')
    }

    if (config.beforeScreenshot) {
      await config.beforeScreenshot(page)
    }

    const filename = `${config.name}-${viewportName}.png`
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, filename),
      fullPage: true,
    })
    console.log(`✅ Saved ${filename}`)
  } catch (error) {
    console.error(`❌ Error capturing ${config.name} - ${viewportName}:`, error)
  } finally {
    await context.close()
  }
}

async function main() {
  console.log('🚀 Starting UI screenshot capture...\n')

  const browser = await chromium.launch({
    headless: true,
  })

  const screenshots: ScreenshotConfig[] = [
    {
      name: '01-login-initial',
      url: '/login',
      waitForSelector: 'button[type="submit"]',
    },
    {
      name: '02-register-initial',
      url: '/register',
      waitForSelector: 'button[type="submit"]',
    },
    {
      name: '03-login-validation-errors',
      url: '/login',
      waitForSelector: 'button[type="submit"]',
      beforeScreenshot: async (page) => {
        // Fill form with invalid data and submit to trigger validation
        await page.fill('input[name="email"]', 'invalid-email')
        await page.fill('input[name="password"]', '123')
        await page.click('button[type="submit"]')
        await page.waitForTimeout(1000) // Wait for error messages
      },
    },
    {
      name: '04-register-validation-errors',
      url: '/register',
      waitForSelector: 'button[type="submit"]',
      beforeScreenshot: async (page) => {
        // Fill form with invalid data to trigger validation
        await page.fill('input[name="email"]', 'invalid-email')
        await page.fill('input[name="password"]', 'short')
        await page.click('button[type="submit"]')
        await page.waitForTimeout(1000) // Wait for error messages
      },
    },
    {
      name: '05-login-filled-form',
      url: '/login',
      waitForSelector: 'button[type="submit"]',
      beforeScreenshot: async (page) => {
        await page.fill('input[name="email"]', 'user@example.com')
        await page.fill('input[name="password"]', 'password123')
      },
    },
    {
      name: '06-register-filled-form',
      url: '/register',
      waitForSelector: 'button[type="submit"]',
      beforeScreenshot: async (page) => {
        await page.fill('input[name="email"]', 'newuser@example.com')
        await page.fill('input[name="password"]', 'SecurePass123')
      },
    },
  ]

  const viewports = [
    { name: 'desktop', viewport: desktopViewport },
    { name: 'tablet', viewport: tabletViewport },
    { name: 'mobile', viewport: mobileViewport },
  ]

  for (const screenshot of screenshots) {
    for (const { name, viewport } of viewports) {
      await captureScreenshots(browser, screenshot, name, viewport)
    }
  }

  await browser.close()
  console.log(`\n✨ All screenshots saved to: ${SCREENSHOT_DIR}`)
}

main().catch(console.error)
