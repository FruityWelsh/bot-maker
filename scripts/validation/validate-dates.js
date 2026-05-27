#!/usr/bin/env node
/**
 * Standalone Date Validation Script
 * 
 * Rule: All dates in documentation MUST be valid Git commit dates
 * This script validates that:
 * - Files do NOT contain placeholders ("Generated from Git commit date")
 * - All dates in files match actual Git commit dates from the repository history
 * - Dates are in YYYY-MM-DD format
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📅 Date Validation');
console.log('==================\n');

// Configure git to trust the current directory (for CI environments)
try {
  execSync('git config --global --add safe.directory *', {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('Configured git safe.directory for current repository');
} catch (error) {
  // Ignore errors - this is just a best effort
  console.log('Note: Could not configure git safe.directory (may already be configured)');
}

let allPassed = true;

// Get the current Git commit date (HEAD)
// Use process.cwd() to get the current working directory, which should be the repository root
// when the script is run from the Makefile
let gitCommitDate;
try {
  gitCommitDate = execSync('git log -1 --format="%cd" --date=iso', {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim().split(' ')[0];
  
  console.log(`Current HEAD commit date: ${gitCommitDate}`);
} catch (error) {
  console.log(`Warning: Could not get HEAD commit date: ${error.message}`);
  console.log(`Trying alternative git command...`);
  try {
    // Try without --date=iso
    const gitOutput = execSync('git log -1 --format="%cd"', {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    gitCommitDate = gitOutput.split(' ')[0];
    console.log(`Current HEAD commit date (alternative): ${gitCommitDate}`);
  } catch (error2) {
    console.log(`Warning: Alternative git command also failed: ${error2.message}`);
    console.log(`Using current date as fallback`);
    const now = new Date();
    gitCommitDate = now.toISOString().split('T')[0];
    console.log(`Using current date: ${gitCommitDate}`);
  }
}

// Files that should have date references
const filesWithDates = [
  { path: 'README.md' },
  { path: 'CONTRIBUTING.md' },
  { path: 'docs/strategy/STRATEGY.md' },
  { path: 'docs/contributors/adr/architecture-decisions.md' },
  { path: 'docs/strategy/bmml/value-proposition.yaml' },
  { path: 'docs/strategy/cubejs/metrics.yaml' },
  { path: 'docs/contributors/diagrams.md' },
  { path: 'docs/strategy/omen/strategy.json' }
];

console.log('📁 Checking files for valid Git commit dates...\n');

filesWithDates.forEach(file => {
  const fullPath = path.join(process.cwd(), file.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for placeholders - these should NOT exist
    const hasPlaceholder = content.includes('Generated from Git commit date') ||
                         content.includes('git commit date');
    
    if (hasPlaceholder) {
      console.log(`  ❌ ${file.path} contains placeholder text - must use actual Git commit dates`);
      allPassed = false;
    }
    
    // Check for old hardcoded dates from 2024
    const manualDates2024 = content.match(/2024-\d{2}-\d{2}/g) || [];
    if (manualDates2024.length > 0) {
      console.log(`  ❌ ${file.path} contains old manual dates from 2024: ${manualDates2024.join(', ')}`);
      allPassed = false;
    }
    
    // Check for dates in YYYY-MM-DD format
    const datePattern = /\b(\d{4}-\d{2}-\d{2})\b/g;
    const foundDates = content.match(datePattern) || [];
    
    // Get the Git commit date for this specific file
    // Use the most recent commit that modified this file
    let fileCommitDate;
    try {
      const fileLog = execSync(`git log -1 --format="%cd" --date=iso -- ${file.path}`, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
      fileCommitDate = fileLog.split(' ')[0];
    } catch (error) {
      console.log(`  Warning: Could not get commit date for ${file.path}: ${error.message}`);
      console.log(`  Trying alternative git command for ${file.path}...`);
      try {
        const fileLogAlt = execSync(`git log -1 --format="%cd" -- ${file.path}`, {
          cwd: process.cwd(),
          encoding: 'utf8',
          stdio: 'pipe'
        }).trim();
        fileCommitDate = fileLogAlt.split(' ')[0];
        console.log(`  Using alternative commit date for ${file.path}: ${fileCommitDate}`);
      } catch (error2) {
        console.log(`  Warning: Alternative git command also failed for ${file.path}: ${error2.message}`);
        console.log(`  Using HEAD commit date as fallback for ${file.path}`);
        // If we can't get the file's commit date, use the HEAD commit date
        fileCommitDate = gitCommitDate;
      }
    }
    
    if (content.includes('created') || content.includes('date') || content.includes('updated')) {
      if (foundDates.length === 0) {
        console.log(`  ⚠️  ${file.path} has date-related content but no dates found`);
      } else {
        // Check if all found dates match the file's Git commit date
        const invalidDates = foundDates.filter(d => d !== fileCommitDate);
        if (invalidDates.length === 0) {
          console.log(`  ✅ ${file.path} uses valid Git commit date (${fileCommitDate})`);
        } else {
          console.log(`  ❌ ${file.path} has invalid dates: ${invalidDates.join(', ')} (expected: ${fileCommitDate})`);
          allPassed = false;
        }
      }
    } else if (foundDates.length > 0) {
      // File has dates but no date-related keywords - still check they match
      const invalidDates = foundDates.filter(d => d !== fileCommitDate);
      if (invalidDates.length === 0) {
        console.log(`  ✅ ${file.path} uses valid Git commit date (${fileCommitDate})`);
      } else {
        console.log(`  ❌ ${file.path} has invalid dates: ${invalidDates.join(', ')} (expected: ${fileCommitDate})`);
        allPassed = false;
      }
    }
  } else {
    console.log(`  ⚠️  ${file.path} not found`);
  }
});

console.log('\n📝 Checking for date scripts...\n');

// Check for date generation scripts
const dateScripts = [
  'scripts/generate-dates.js',
  'scripts/update-dates.sh',
  'scripts/update-commit-dates.sh'  // New script for replacing placeholders with commit dates
];

dateScripts.forEach(script => {
  const fullPath = path.join(process.cwd(), script);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${script} exists`);
  } else {
    console.log(`  ❌ ${script} missing`);
    allPassed = false;
  }
});

console.log('\n📋 Checking for documentation about the rule...\n');

// Check for documentation about the date management rule
const contributingPath = path.join(process.cwd(), 'CONTRIBUTING.md');
if (fs.existsSync(contributingPath)) {
  const content = fs.readFileSync(contributingPath, 'utf8');
  if (content.includes('Date Management Rule') || content.includes('All dates MUST be valid Git commit dates')) {
    console.log('  ✅ CONTRIBUTING.md documents the date management rule');
  } else {
    console.log('  ❌ CONTRIBUTING.md does not document the date management rule');
    allPassed = false;
  }
} else {
  console.log('  ⚠️  CONTRIBUTING.md not found');
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All date validations PASSED');
  console.log('   All dates are valid Git commit dates from repository history');
  process.exit(0);
} else {
  console.log('❌ Some date validations FAILED');
  console.log('   Files must contain actual Git commit dates, not placeholders');
  console.log('   All dates must match the Git commit date for that file');
  process.exit(1);
}