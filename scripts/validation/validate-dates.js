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

let allPassed = true;

// Get the current Git commit date (HEAD)
let gitCommitDate;
try {
  gitCommitDate = execSync('git log -1 --format="%cd" --date=iso', {
    cwd: path.join(__dirname, '../..'),
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim().split(' ')[0];
  
  console.log(`Current HEAD commit date: ${gitCommitDate}`);
} catch (error) {
  const now = new Date();
  gitCommitDate = now.toISOString().split('T')[0];
  console.log(`Using current date: ${gitCommitDate}`);
}

// Files that should have date references
const filesWithDates = [
  { path: 'README.md' },
  { path: 'CONTRIBUTING.md' },
  { path: 'docs/STRATEGY.md' },
  { path: 'docs/adr/architecture-decisions.md' },
  { path: 'docs/bmml/value-proposition.yaml' },
  { path: 'docs/cubejs/metrics.yaml' },
  { path: 'docs/diagrams.md' },
  { path: 'docs/omen/strategy.json' }
];

console.log('📁 Checking files for valid Git commit dates...\n');

filesWithDates.forEach(file => {
  const fullPath = path.join(__dirname, '../..', file.path);
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
        cwd: path.join(__dirname, '../..'),
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
      fileCommitDate = fileLog.split(' ')[0];
    } catch (error) {
      // If we can't get the file's commit date, use the HEAD commit date
      fileCommitDate = gitCommitDate;
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
  const fullPath = path.join(__dirname, '../..', script);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${script} exists`);
  } else {
    console.log(`  ❌ ${script} missing`);
    allPassed = false;
  }
});

console.log('\n📋 Checking for documentation about the rule...\n');

// Check for documentation about the date management rule
const contributingPath = path.join(__dirname, '../..', 'CONTRIBUTING.md');
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