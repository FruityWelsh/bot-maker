#!/usr/bin/env node
/**
 * Standalone Date Validation Script
 * 
 * Rule: Do not manually add dates - use tools that reference real time
 * This script validates that all date references in documentation use dynamic dates
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📅 Date Validation');
console.log('==================\n');

let allPassed = true;

// Get the current Git commit date
let gitCommitDate;
try {
  gitCommitDate = execSync('git log -1 --format="%cd" --date=iso', {
    cwd: path.join(__dirname, '../..'),
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim().split(' ')[0];
  
  console.log(`Git commit date: ${gitCommitDate}`);
} catch (error) {
  const now = new Date();
  gitCommitDate = now.toISOString().split('T')[0];
  console.log(`Using current date: ${gitCommitDate}`);
}

// Files that should have dynamic date references
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

console.log('📁 Checking files for manual dates...\n');

filesWithDates.forEach(file => {
  const fullPath = path.join(__dirname, '../..', file.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for manual dates from 2024
    const manualDates = content.match(/2024-\d{2}-\d{2}/g) || [];
    if (manualDates.length > 0) {
      console.log(`  ❌ ${file.path} contains manual dates: ${manualDates.join(', ')}`);
      allPassed = false;
    } else {
      console.log(`  ✅ ${file.path} has no manual dates from 2024`);
    }
    
    // Check for dynamic date references
    const hasDynamicRef = content.includes('Generated from Git commit date') ||
                         content.includes('git commit date');
    
    if (content.includes('created') || content.includes('date') || content.includes('updated')) {
      if (hasDynamicRef) {
        console.log(`  ✅ ${file.path} uses dynamic date references`);
      } else {
        console.log(`  ❌ ${file.path} has date fields but no dynamic references`);
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
  'scripts/update-dates.sh'
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

// Check for documentation about the no manual dates rule
const contributingPath = path.join(__dirname, '../..', 'CONTRIBUTING.md');
if (fs.existsSync(contributingPath)) {
  const content = fs.readFileSync(contributingPath, 'utf8');
  if (content.includes('Do not manually add dates')) {
    console.log('  ✅ CONTRIBUTING.md documents the no manual dates rule');
  } else {
    console.log('  ❌ CONTRIBUTING.md does not document the no manual dates rule');
    allPassed = false;
  }
} else {
  console.log('  ⚠️  CONTRIBUTING.md not found');
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All date validations PASSED');
  console.log('   No manual dates found, all use dynamic references');
  process.exit(0);
} else {
  console.log('❌ Some date validations FAILED');
  console.log('   Manual dates found or dynamic references missing');
  process.exit(1);
}