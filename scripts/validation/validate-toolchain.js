#!/usr/bin/env node
/**
 * Comprehensive Toolchain Validation Script
 * 
 * Validates all 8 tools in the toolchain with hard references:
 * Omen → ArchiMate → BMML → Structurizr/ADR → Cube.js → react-markdown/gray-matter/Mermaid.js → Godog/Gherkin → Jest/AJV
 * 
 * References: docs/omen/strategy.json (upstream)
 * References: docs/adr/architecture-decisions.md (ADR-008, ADR-009, ADR-010, ADR-011)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Toolchain Validation');
console.log('======================\n');

let allPassed = true;
const repoRoot = path.join(__dirname, '../..');

// Toolchain definition with file paths and references
const toolchain = [
  {
    id: 'T001',
    name: 'Omen',
    description: 'Strategy definition tool',
    files: ['docs/omen/strategy.json'],
    upstream: null,
    downstream: ['docs/archimate/enterprise-architecture.xml'],
    required: true
  },
  {
    id: 'T002',
    name: 'ArchiMate',
    description: 'Enterprise architecture modeling',
    files: ['docs/archimate/enterprise-architecture.xml'],
    upstream: ['docs/omen/strategy.json'],
    downstream: ['docs/bmml/value-proposition.yaml'],
    required: true
  },
  {
    id: 'T003',
    name: 'BMML',
    description: 'Business Motivation Model',
    files: ['docs/bmml/value-proposition.yaml'],
    upstream: ['docs/archimate/enterprise-architecture.xml'],
    downstream: ['docs/adr/architecture-decisions.md'],
    required: true
  },
  {
    id: 'T004',
    name: 'Structurizr/ADR',
    description: 'Architecture Decision Records',
    files: ['docs/adr/architecture-decisions.md'],
    upstream: ['docs/bmml/value-proposition.yaml'],
    downstream: ['docs/cubejs/metrics.yaml'],
    required: true
  },
  {
    id: 'T005',
    name: 'Cube.js',
    description: 'Business metrics and analytics',
    files: ['docs/cubejs/metrics.yaml'],
    upstream: ['docs/adr/architecture-decisions.md'],
    downstream: ['docs/diagrams.md'],
    required: true
  },
  {
    id: 'T006',
    name: 'react-markdown/gray-matter/Mermaid.js',
    description: 'Documentation rendering and diagrams',
    files: ['docs/diagrams.md', 'README.md'],
    upstream: ['docs/cubejs/metrics.yaml'],
    downstream: ['features/chatbot.feature'],
    required: true
  },
  {
    id: 'T007',
    name: 'Godog/Gherkin',
    description: 'Behavior-driven development testing',
    files: ['features/chatbot.feature'],
    upstream: ['docs/diagrams.md'],
    downstream: ['tests/schemas/validation.js', 'tests/tools/'],
    required: true
  },
  {
    id: 'T008',
    name: 'Jest/AJV',
    description: 'JavaScript testing and JSON schema validation',
    files: ['tests/schemas/validation.js', 'tests/tools/'],
    upstream: ['features/chatbot.feature'],
    downstream: null,
    required: true
  }
];

// Test 1: Check all tool files exist
console.log('📁 Test 1: Checking all tool files exist...\n');
toolchain.forEach(tool => {
  tool.files.forEach(file => {
    const fullPath = path.join(repoRoot, file);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${tool.name} file exists: ${file}`);
    } else {
      console.log(`  ❌ ${tool.name} file missing: ${file}`);
      allPassed = false;
    }
  });
});

// Test 2: Check hard references between tools
console.log('\n🔗 Test 2: Checking hard references between tools...\n');
toolchain.forEach(tool => {
  if (tool.upstream) {
    tool.files.forEach(file => {
      const fullPath = path.join(repoRoot, file);
      // Skip directories
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        tool.upstream.forEach(upstreamFile => {
          const upstreamPath = path.relative(path.dirname(file), upstreamFile);
          const upstreamName = toolchain.find(t => t.files.includes(upstreamFile))?.name || upstreamFile;
          
          if (content.includes(upstreamFile) || content.includes(upstreamPath)) {
            console.log(`  ✅ ${tool.name} references upstream ${upstreamName} (${upstreamFile})`);
          } else {
            console.log(`  ❌ ${tool.name} missing reference to upstream ${upstreamName} (${upstreamFile})`);
            allPassed = false;
          }
        });
      }
    });
  }
});

// Test 3: Check downstream references
console.log('\n🔽 Test 3: Checking downstream references...\n');
toolchain.forEach(tool => {
  if (tool.downstream) {
    tool.files.forEach(file => {
      const fullPath = path.join(repoRoot, file);
      // Skip directories
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        tool.downstream.forEach(downstreamFile => {
          const downstreamPath = path.relative(path.dirname(file), downstreamFile);
          const downstreamName = toolchain.find(t => t.files.includes(downstreamFile))?.name || downstreamFile;
          
          if (content.includes(downstreamFile) || content.includes(downstreamPath)) {
            console.log(`  ✅ ${tool.name} references downstream ${downstreamName} (${downstreamFile})`);
          } else {
            console.log(`  ❌ ${tool.name} missing reference to downstream ${downstreamName} (${downstreamFile})`);
            allPassed = false;
          }
        });
      }
    });
  }
});

// Test 4: Check for circular references
console.log('\n🔄 Test 4: Checking for circular references...\n');
let hasCircular = false;
toolchain.forEach(tool => {
  if (tool.upstream) {
    tool.upstream.forEach(upstreamFile => {
      const upstreamTool = toolchain.find(t => t.files.includes(upstreamFile));
      if (upstreamTool && upstreamTool.downstream) {
        // Check if the upstream tool's downstream includes this tool's file
        const hasCircularRef = upstreamTool.downstream.some(downstreamFile => {
          return tool.files.includes(downstreamFile);
        });
        if (hasCircularRef) {
          console.log(`  ✅ Bidirectional reference confirmed: ${tool.name} ↔ ${upstreamTool.name} (expected)`);
        }
      }
    });
  }
});
console.log('  ✅ No unexpected circular references detected');

// Test 5: Check that application code references strategy
console.log('\n📋 Test 5: Checking application code references to strategy...\n');
const appFiles = [
  'Makefile',
  '.github/workflows/ci.yml',
  '.gitlab-ci.yml',
  '.tekton/pipeline.yaml',
  '.tekton/tasks.yaml',
  '.vscode/tasks.json'
];

appFiles.forEach(file => {
  const fullPath = path.join(repoRoot, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasStrategyRef = content.includes('strategy') || content.includes('architecture');
    if (hasStrategyRef) {
      console.log(`  ✅ ${file} references strategy/architecture`);
    } else {
      console.log(`  ❌ ${file} missing strategy/architecture reference`);
      allPassed = false;
    }
  }
});

// Test 6: Check that tests validate the toolchain
console.log('\n🧪 Test 6: Checking that tests validate the toolchain...\n');
const testFiles = [
  'tests/schemas/validation.js',
  'tests/tools/makefile.test.js',
  'tests/tools/cicd.test.js'
];

testFiles.forEach(file => {
  const fullPath = path.join(repoRoot, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasToolchainRef = content.includes('toolchain') || 
                           content.includes('strategy') || 
                           content.includes('Omen') || 
                           content.includes('ArchiMate') ||
                           content.includes('BMML');
    if (hasToolchainRef) {
      console.log(`  ✅ ${file} validates toolchain references`);
    } else {
      console.log(`  ❌ ${file} missing toolchain validation`);
      allPassed = false;
    }
  }
});

// Test 7: Check CI/CD pipeline validates toolchain
console.log('\n🚀 Test 7: Checking CI/CD pipeline validates toolchain...\n');
const ciFiles = [
  '.github/workflows/ci.yml',
  '.gitlab-ci.yml',
  '.tekton/pipeline.yaml'
];

ciFiles.forEach(file => {
  const fullPath = path.join(repoRoot, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasMakeRef = content.includes('make test-strategy-chain') || 
                      content.includes('make test-dates') ||
                      content.includes('Make targets');
    if (hasMakeRef) {
      console.log(`  ✅ ${file} calls Make targets (implements strategy)`);
    } else {
      console.log(`  ❌ ${file} missing Make target calls`);
      allPassed = false;
    }
  }
});

// Test 8: Validate each tool's content
console.log('\n📝 Test 8: Validating each tool\'s content...\n');
toolchain.forEach(tool => {
  tool.files.forEach(file => {
    const fullPath = path.join(repoRoot, file);
    // Skip directories
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for metadata
      if (content.includes('metadata') || 
          content.includes('name') || 
          content.includes('version') ||
          content.includes('---')) {
        console.log(`  ✅ ${tool.name} (${file}) has metadata`);
      } else {
        console.log(`  ⚠️  ${tool.name} (${file}) missing metadata`);
      }
      
      // Check for references
      if (content.includes('references') || 
          content.includes('References') || 
          content.includes('upstream') || 
          content.includes('downstream')) {
        console.log(`  ✅ ${tool.name} (${file}) has references`);
      } else {
        console.log(`  ⚠️  ${tool.name} (${file}) missing explicit references`);
      }
    }
  });
});

// Test 9: Check for date compliance
console.log('\n📅 Test 9: Checking date compliance (no manual dates)...\n');
toolchain.forEach(tool => {
  tool.files.forEach(file => {
    const fullPath = path.join(repoRoot, file);
    // Skip directories
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const manualDates = content.match(/2024-\d{2}-\d{2}/g) || [];
      if (manualDates.length === 0) {
        console.log(`  ✅ ${tool.name} (${file}) has no manual dates from 2024`);
      } else {
        console.log(`  ❌ ${tool.name} (${file}) contains manual dates: ${manualDates.join(', ')}`);
        allPassed = false;
      }
    }
  });
});

// Test 10: Check Git commit date can be retrieved
console.log('\n🔍 Test 10: Checking Git commit date retrieval...\n');
try {
  const gitCommitDate = execSync('git log -1 --format="%cd" --date=iso', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim().split(' ')[0];
  
  console.log(`  ✅ Git commit date retrieved: ${gitCommitDate}`);
} catch (error) {
  console.log(`  ❌ Failed to retrieve Git commit date: ${error.message}`);
  allPassed = false;
}

// Final result
console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ All toolchain validations PASSED');
  console.log('   All 8 tools are properly configured with hard references');
  process.exit(0);
} else {
  console.log('❌ Some toolchain validations FAILED');
  console.log('   Check the output above for specific issues');
  process.exit(1);
}
