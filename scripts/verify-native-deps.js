#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Verify Native Dependencies
 *
 * This script verifies that all native binary dependencies are correctly installed.
 * This is critical for CI/CD environments where npm has issues with optional dependencies.
 *
 * See: https://github.com/npm/cli/issues/4828
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Colors for console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
}

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset)
}

// Critical native dependencies that must be present
const nativeDeps = [
  {
    name: 'lightningcss',
    path: 'node_modules/lightningcss',
    description: 'Tailwind CSS v4 CSS processing',
  },
  {
    name: '@tailwindcss/oxide',
    path: 'node_modules/@tailwindcss/oxide',
    description: 'Tailwind CSS v4 engine',
  },
  {
    name: 'rollup',
    path: 'node_modules/rollup',
    description: 'Vitest bundler',
  },
]

function checkDependency(dep) {
  const depPath = path.join(process.cwd(), dep.path)

  if (!fs.existsSync(depPath)) {
    return { success: false, message: `Module not found: ${dep.path}` }
  }

  return { success: true }
}

function main() {
  log('\n🔍 Verifying native dependencies...', 'cyan')
  log('═══════════════════════════════════════', 'cyan')

  let allGood = true
  const failures = []

  for (const dep of nativeDeps) {
    const result = checkDependency(dep)

    if (result.success) {
      log(`✅ ${dep.name} - ${dep.description}`, 'green')
    } else {
      log(`❌ ${dep.name} - ${result.message}`, 'red')
      failures.push(dep)
      allGood = false
    }
  }

  log('═══════════════════════════════════════\n', 'cyan')

  if (!allGood) {
    log('❌ Some native dependencies are missing!', 'red')
    log('\n💡 Attempting to fix by reinstalling with optional dependencies...', 'yellow')

    try {
      // Try to reinstall with optional dependencies
      log('Running: npm install --include=optional --force', 'yellow')
      execSync('npm install --include=optional --force', {
        stdio: 'inherit',
        cwd: process.cwd(),
      })

      log('\n✅ Reinstall completed. Verifying again...', 'green')

      // Verify again
      let stillFailing = false
      for (const dep of failures) {
        const result = checkDependency(dep)
        if (!result.success) {
          log(`❌ ${dep.name} - Still missing after reinstall`, 'red')
          stillFailing = true
        } else {
          log(`✅ ${dep.name} - Fixed!`, 'green')
        }
      }

      if (stillFailing) {
        log('\n❌ Some dependencies could not be installed.', 'red')
        log('This is a known npm bug: https://github.com/npm/cli/issues/4828', 'yellow')
        process.exit(1)
      }
    } catch (error) {
      log('\n❌ Failed to reinstall dependencies', 'red')
      log(error.message, 'red')
      process.exit(1)
    }
  }

  log('✅ All native dependencies verified successfully!', 'green')
  log('', 'reset')
}

main()
