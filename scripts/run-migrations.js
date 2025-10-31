#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * Uses Supabase CLI to apply migrations safely
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Colors for console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

function checkSupabaseInstalled() {
  return new Promise((resolve) => {
    const child = spawn('supabase', ['--version'], { stdio: 'pipe' });
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
      resolve(false);
    });
  });
}

function checkAuthenticated() {
  return new Promise((resolve) => {
    const child = spawn('supabase', ['projects', 'list'], { stdio: 'pipe' });
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
      resolve(false);
    });
  });
}

function checkProjectLinked() {
  return fs.existsSync(path.join(process.cwd(), 'supabase', '.branches'));
}

// Extract project reference from environment
function getProjectRef() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STORAGE_SUPABASE_URL;
  if (!supabaseUrl) return null;
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

async function main() {
  log('🚀 Financial Advisor - Database Migration', 'cyan');
  log('==========================================', 'cyan');

  try {
    // Check if Supabase CLI is installed
    log('📋 Checking Supabase CLI...', 'blue');
    const isInstalled = await checkSupabaseInstalled();

    if (!isInstalled) {
      log('❌ Supabase CLI is not installed.', 'red');
      log('💡 Install it by running:', 'yellow');
      log('   brew install supabase/tap/supabase', 'yellow');
      log('   or follow instructions at: https://supabase.com/docs/guides/cli', 'yellow');
      process.exit(1);
    }

    log('✅ Supabase CLI found', 'green');

    // Check authentication
    log('🔐 Checking authentication...', 'blue');
    const isAuthenticated = await checkAuthenticated();

    if (!isAuthenticated) {
      log('❌ You are not authenticated with Supabase.', 'red');
      log('💡 Login by running:', 'yellow');
      log('   supabase login', 'yellow');
      log('   Then run this command again.', 'yellow');
      process.exit(1);
    }

    log('✅ Authenticated successfully', 'green');

    // Check if project is linked
    log('🔗 Checking project link...', 'blue');
    const isLinked = checkProjectLinked();
    const projectRef = getProjectRef();

    if (!isLinked) {
      if (!projectRef) {
        log('❌ Could not determine project reference from environment variables.', 'red');
        log('💡 Please set NEXT_PUBLIC_SUPABASE_URL or STORAGE_SUPABASE_URL in .env.local', 'yellow');
        process.exit(1);
      }

      log(`📡 Linking project with Supabase (${projectRef})...`, 'magenta');
      await runCommand('supabase', ['link', '--project-ref', projectRef]);
      log('✅ Project linked successfully', 'green');
    } else {
      log('✅ Project already linked', 'green');
    }

    // Run migrations
    log('📊 Running migrations...', 'blue');
    await runCommand('supabase', ['db', 'push']);

    log('', 'reset');
    log('✅ Migrations executed successfully!', 'green');
    log('', 'reset');
    log('🎯 Next steps:', 'cyan');
    log(`1. Verify tables at: https://supabase.com/dashboard/project/${projectRef}`, 'reset');
    log('2. Configure Google OAuth if not done', 'reset');
    log('3. Run: npm run dev', 'reset');
    log('', 'reset');

  } catch (error) {
    log('', 'reset');
    log('❌ Error during migration:', 'red');
    log(error.message, 'red');
    log('', 'reset');
    log('💡 Possible solutions:', 'yellow');
    log('1. Check authentication: supabase login', 'yellow');
    log('2. Verify project reference in .env.local', 'yellow');
    log('3. Check your permissions in the project', 'yellow');
    log('4. Try manually: supabase db push', 'yellow');
    process.exit(1);
  }
}

main();
