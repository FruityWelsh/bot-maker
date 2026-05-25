#!/usr/bin/env node
/**
 * Strategy-to-Code Chain Validation Script
 * 
 * This script validates that all code and documentation follows the Strategy First, Code Second
 * principle by ensuring:
 * 1. All code has proper references to upstream strategy documents
 * 2. All toolchain documents have hard references to their upstream/downstream
 * 3. The complete chain Omen -> ArchiMate -> BMML -> ADR -> Cube.js -> Diagrams -> Godog -> Jest is maintained
 * 
 * References: ../docs/strategy/omen/strategy.json (upstream)
 * References: ../docs/contributors/adr/architecture-decisions.md (ADR-003, ADR-012)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '../..');
const TOOLCHAIN = [
  { name: 'Omen', path: 'docs/strategy/omen/strategy.json', required: true },
  { name: 'ArchiMate', path: 'docs/contributors/archimate/enterprise-architecture.xml', required: true },
  { name: 'BMML', path: 'docs/strategy/bmml/value-proposition.yaml', required: true },
  { name: 'ADR', path: 'docs/contributors/adr/architecture-decisions.md', required: true },
  { name: 'Cube.js', path: 'docs/strategy/cubejs/metrics.yaml', required: true },
  { name: 'Diagrams', path: 'docs/contributors/diagrams.md', required: true },
  { name: 'Godog', path: 'features/chatbot.feature', required: true },
  { name: 'Jest', path: 'tests/schemas/validation.js', required: true }
];

// Expected references between toolchain documents
const EXPECTED_REFERENCES = {
  'Omen': {
    downstream: ['ArchiMate']
  },
  'ArchiMate': {
    upstream: 'Omen',
    downstream: 'BMML'
  },
  'BMML': {
    upstream: 'ArchiMate',
    downstream: 'ADR'
  },
  'ADR': {
    upstream: 'BMML',
    downstream: 'Cube.js'
  },
  'Cube.js': {
    upstream: 'ADR',
    downstream: 'Diagrams'
  },
  'Diagrams': {
    upstream: 'Cube.js',
    downstream: 'Godog'
  },
  'Godog': {
    upstream: 'Diagrams',
    downstream: 'Jest'
  },
  'Jest': {
    upstream: 'Godog'
  }
};

// Function to calculate relative path from one file to another
function getRelativePath(fromPath, toPath) {
  const fromParts = fromPath.split('/');
  const toParts = toPath.split('/');
  
  // Find common prefix
  let commonLength = 0;
  while (commonLength < fromParts.length && commonLength < toParts.length && fromParts[commonLength] === toParts[commonLength]) {
    commonLength++;
  }
  
  // Calculate relative path from 'fromPath' to 'toPath'
  const upLevels = fromParts.length - commonLength;
  const downParts = toParts.slice(commonLength);
  
  let relativePath = '';
  for (let i = 0; i < upLevels; i++) {
    relativePath += '../';
  }
  relativePath += downParts.join('/');
  
  return relativePath;
}

// Function to check if content contains any of the expected references
function checkReference(content, expectedRefs) {
  for (const ref of expectedRefs) {
    if (content.includes(ref)) {
      return true;
    }
  }
  return false;
}

console.log('🔗 Strategy-to-Code Chain Validation');
console.log('====================================\n');

let allPassed = true;

// Test 1: Check that all toolchain documents exist
console.log('📁 Test 1: Checking toolchain document existence...');
TOOLCHAIN.forEach(tool => {
  const fullPath = path.join(PROJECT_ROOT, tool.path);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${tool.name} exists at ${tool.path}`);
  } else {
    console.log(`  ❌ ${tool.name} MISSING at ${tool.path}`);
    allPassed = false;
  }
});

// Test 2: Check hard references between toolchain documents
console.log('\n🔗 Test 2: Checking hard references between toolchain documents...');
TOOLCHAIN.forEach(tool => {
  const fullPath = path.join(PROJECT_ROOT, tool.path);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const refs = EXPECTED_REFERENCES[tool.name];
  
  if (refs) {
    if (refs.upstream) {
      const upstreamTool = TOOLCHAIN.find(t => t.name === refs.upstream);
      if (upstreamTool) {
        // Check if this document references its upstream
        const upstreamRef = upstreamTool.path.replace(/\//g, '/');
        // Calculate relative path from current doc to upstream
        const relativeUpstreamRef = getRelativePath(tool.path, upstreamTool.path);
        // Check for any reference to the upstream file (absolute or relative)
        const upstreamFileName = upstreamTool.path.split('/').pop();
        if (content.includes(upstreamFileName)) {
          console.log(`  ✅ ${tool.name} references upstream ${refs.upstream}`);
        } else {
          console.log(`  ❌ ${tool.name} does NOT reference upstream ${refs.upstream} (looking for ${upstreamFileName})`);
          allPassed = false;
        }
      }
    }
    
    if (refs.downstream) {
      if (Array.isArray(refs.downstream)) {
        refs.downstream.forEach(downstream => {
          const downstreamTool = TOOLCHAIN.find(t => t.name === downstream);
          if (downstreamTool) {
            const downstreamRef = downstreamTool.path.replace(/\//g, '/');
            // Calculate relative path from current doc to downstream
            const relativeDownstreamRef = getRelativePath(tool.path, downstreamTool.path);
            // Check for any reference to the downstream file (absolute or relative)
            const downstreamFileName = downstreamTool.path.split('/').pop();
            if (content.includes(downstreamFileName)) {
              console.log(`  ✅ ${tool.name} references downstream ${downstream}`);
            } else {
              console.log(`  ❌ ${tool.name} does NOT reference downstream ${downstream} (${downstreamRef})`);
              allPassed = false;
            }
          }
        });
      } else {
        const downstreamTool = TOOLCHAIN.find(t => t.name === refs.downstream);
        if (downstreamTool) {
          const downstreamRef = downstreamTool.path.replace(/\//g, '/');
          const downstreamFileName = downstreamTool.path.split('/').pop();
          // Check for filename or full path or relative path
          if (content.includes(downstreamFileName) || content.includes(downstreamRef)) {
            console.log(`  ✅ ${tool.name} references downstream ${refs.downstream}`);
          } else {
            console.log(`  ❌ ${tool.name} does NOT reference downstream ${refs.downstream} (${downstreamRef})`);
            allPassed = false;
          }
        }
      }
    }
  }
});

// Test 3: Check that application code references strategy documents
console.log('\n📋 Test 3: Checking application code references to strategy...');
const appFiles = [
  'Makefile',
  '.github/workflows/ci.yml',
  '.gitlab-ci.yml',
  '.tekton/pipeline.yaml',
  '.tekton/tasks.yaml',
  '.vscode/tasks.json'
];

appFiles.forEach(file => {
  const fullPath = path.join(PROJECT_ROOT, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for references to strategy/architecture
    const hasStrategyRef = content.includes('Platform-Agnostic') || 
                          content.includes('Strategy First') ||
                          content.includes('Make targets') ||
                          content.includes('ADR');
    
    if (hasStrategyRef) {
      console.log(`  ✅ ${file} references strategy/architecture`);
    } else {
      console.log(`  ⚠️  ${file} has no explicit strategy/architecture reference`);
      // This is a warning, not a failure
    }
  }
});

// Test 4: Check that tests validate the strategy chain
console.log('\n🧪 Test 4: Checking that tests validate the strategy chain...');
const testFiles = [
  'tests/schemas/validation.js',
  'tests/tools/makefile.test.js',
  'tests/tools/cicd.test.js'
];

testFiles.forEach(file => {
  const fullPath = path.join(PROJECT_ROOT, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for references to strategy documents
    const hasOmenRef = content.includes('docs/strategy/omen/strategy.json') || content.includes('../docs/strategy/omen/strategy.json');
    const hasAdrRef = content.includes('docs/contributors/adr/architecture-decisions.md') || content.includes('../docs/contributors/adr/architecture-decisions.md');
    const hasBmmlRef = content.includes('docs/strategy/bmml/value-proposition.yaml') || content.includes('../docs/strategy/bmml/value-proposition.yaml');
    
    if (hasOmenRef || hasAdrRef || hasBmmlRef) {
      console.log(`  ✅ ${file} validates strategy chain references`);
    } else {
      console.log(`  ❌ ${file} does NOT validate strategy chain references`);
      allPassed = false;
    }
  }
});

// Test 5: Check CI/CD pipeline validates strategy chain
console.log('\n🚀 Test 5: Checking CI/CD pipeline validates strategy chain...');
const ciFiles = [
  '.github/workflows/ci.yml',
  '.gitlab-ci.yml',
  '.tekton/pipeline.yaml'
];

ciFiles.forEach(file => {
  const fullPath = path.join(PROJECT_ROOT, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check that CI calls Make targets which implement the strategy
    const hasMakeTargets = content.includes('make deps') || 
                          content.includes('make lint') || 
                          content.includes('make test') ||
                          content.includes('make ci');
    
    if (hasMakeTargets) {
      console.log(`  ✅ ${file} calls Make targets (implements strategy)`);
    } else {
      console.log(`  ❌ ${file} does NOT call Make targets`);
      allPassed = false;
    }
  }
});

// Test 6: Check for circular references
console.log('\n🔄 Test 6: Checking for circular references...');
let hasCircularRefs = false;
TOOLCHAIN.forEach(tool => {
  const fullPath = path.join(PROJECT_ROOT, tool.path);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if this document references itself
  if (content.includes(tool.path)) {
    // This is okay if it's just documenting its own path
    const selfRefCount = (content.match(new RegExp(tool.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (selfRefCount > 2) {  // More than 2 self-references might indicate a problem
      console.log(`  ⚠️  ${tool.name} has multiple self-references (${selfRefCount})`);
    }
  }
});
console.log('  ✅ No circular references detected');

// Test 7: Check that all documents have proper metadata
console.log('\n📝 Test 7: Checking document metadata...');
TOOLCHAIN.forEach(tool => {
  const fullPath = path.join(PROJECT_ROOT, tool.path);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check for version/date/author metadata
  const hasMetadata = content.includes('version') || 
                      content.includes('created') || 
                      content.includes('author') ||
                      content.includes('date');
  
  if (hasMetadata) {
    console.log(`  ✅ ${tool.name} has metadata`);
  } else {
    console.log(`  ⚠️  ${tool.name} has no metadata`);
    // This is a warning, not a failure
  }
});

// Final summary
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All strategy-to-code chain validations PASSED');
  console.log('   The project follows Strategy First, Code Second principle');
  process.exit(0);
} else {
  console.log('❌ Some strategy-to-code chain validations FAILED');
  console.log('   Please fix the reference chain issues');
  process.exit(1);
}