#!/usr/bin/env node

/**
 * Display migration SQL for manual execution
 * Since Supabase doesn't allow programmatic SQL execution,
 * this script shows you what to copy/paste
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrationFile = '20251030_create_profiles_table.sql';
const filePath = path.join(migrationsDir, migrationFile);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  📋 Supabase Migration - Profiles Table');
console.log('═══════════════════════════════════════════════════════════════\n');

if (!fs.existsSync(filePath)) {
  console.error('❌ Migration file not found:', filePath);
  process.exit(1);
}

const sql = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Migration file: ' + migrationFile);
console.log('📁 Location: ' + filePath);
console.log('\n📋 COPY THE SQL BELOW:\n');
console.log('─────────────────────────────────────────────────────────────────');
console.log(sql);
console.log('─────────────────────────────────────────────────────────────────');

console.log('\n\n✅ HOW TO APPLY THIS MIGRATION:\n');
console.log('1. Copy the SQL above (between the dashed lines)');
console.log('2. Go to your Supabase Dashboard');
console.log('3. Navigate to: SQL Editor (in left sidebar)');
console.log('4. Click "+ New query"');
console.log('5. Paste the SQL');
console.log('6. Click "Run" (or press Cmd/Ctrl + Enter)');
console.log('7. Verify success message\n');

console.log('📊 What this migration creates:');
console.log('   ✓ profiles table (for user data)');
console.log('   ✓ RLS policies (users can only access their own data)');
console.log('   ✓ Auto-create profile trigger (on user registration)');
console.log('   ✓ Auto-update timestamp trigger\n');

console.log('🔗 Quick link to SQL Editor:');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STORAGE_SUPABASE_URL;
if (supabaseUrl) {
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef) {
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
  }
}

console.log('═══════════════════════════════════════════════════════════════\n');
