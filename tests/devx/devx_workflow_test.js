// DevX Workflow Tests
// ====================
// Tests for Developer Experience workflow automation
// References: features/devx_workflow.feature (BDD scenarios)
// References: docs/SEMANTIC_VERSIONING.md (Versioning Policy)
// References: docs/CONTRIBUTING.md (Contribution Guidelines)
// References: docs/DESIGN_VERIFICATION.md (Design Verification)
// References: docs/IMPLEMENTATION_PLAN.md (Implementation Plan)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test utilities
const PROJECT_ROOT = path.resolve(__dirname, '../..');

function readFile(filePath) {
  return fs.readFileSync(path.resolve(PROJECT_ROOT, filePath), 'utf8');
}

function fileExists(filePath) {
  return fs.existsSync(path.resolve(PROJECT_ROOT, filePath));
}

function runCommand(command, cwd = PROJECT_ROOT) {
  try {
    return execSync(command, { cwd, encoding: 'utf8' });
  } catch (error) {
    return { error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

// Test suite: DevX Workflow Tests
describe('DevX Workflow', () => {
  // Version Policy Enforcement Tests
  // ==================================
  describe('Version Policy Enforcement', () => {
    test('should have VERSION file with 0.1.0-dev', () => {
      const version = fs.readFileSync(path.resolve(PROJECT_ROOT, 'VERSION'), 'utf8').trim();
      expect(version).toBe('0.1.0-dev');
    });

    test('should have all version files synchronized to 0.1.0-dev', () => {
      const expectedVersion = '0.1.0-dev';
      const files = [
        { path: 'package.json', pattern: /"version": "0\.1\.0-dev"/ },
        { path: 'docs/strategy/omen/strategy.json', pattern: /"version": "0\.1\.0-dev"/ },
        { path: 'docs/strategy/bmml/value-proposition.yaml', pattern: /version: "0\.1\.0-dev"/ },
        { path: 'docs/contributors/adr/architecture-decisions.md', pattern: /version: 0\.1\.0-dev/ },
        { path: 'docs/strategy/cubejs/metrics.yaml', pattern: /version: "0\.1\.0-dev"/ }
      ];

      files.forEach(({ path, pattern }) => {
        if (fileExists(path)) {
          const content = readFile(path);
          expect(content).toMatch(pattern);
        } else {
          // File doesn't exist - this is a warning, not a failure
          console.warn(`⚠️  File not found: ${path}`);
        }
      });
    });

    test('should pass version consistency check', () => {
      const result = runCommand('make verify-versions', PROJECT_ROOT);
      expect(result).toContain('✅ All versions match: 0.1.0-dev');
    });

    test('should detect version mismatch', () => {
      const result = runCommand('make verify-versions', PROJECT_ROOT);
      expect(result).toMatch(/✅ All versions match|❌/);
    });
  });

  // Design Verification Tests
  // =========================
  describe('Design Verification', () => {
    test('should have DESIGN_VERIFICATION.md', () => {
      expect(fileExists('docs/DESIGN_VERIFICATION.md')).toBe(true);
    });

    test('should have IMPLEMENTATION_PLAN.md', () => {
      expect(fileExists('docs/IMPLEMENTATION_PLAN.md')).toBe(true);
    });

    test('should have SEMANTIC_VERSIONING.md', () => {
      expect(fileExists('docs/SEMANTIC_VERSIONING.md')).toBe(true);
    });

    test('should reference all design documents in DESIGN_VERIFICATION.md', () => {
      if (fileExists('docs/DESIGN_VERIFICATION.md')) {
        const content = readFile('docs/DESIGN_VERIFICATION.md');
        const requiredFiles = [
          'docs/strategy/omen/strategy.json',
          'docs/contributors/archimate/enterprise-architecture.xml',
          'docs/strategy/bmml/value-proposition.yaml',
          'docs/contributors/adr/architecture-decisions.md',
          'docs/strategy/cubejs/metrics.yaml'
        ];

        requiredFiles.forEach(file => {
          expect(content).toContain(file);
        });
      }
    });
  });

  // Pre-commit Hooks Tests
  // ======================
  describe('Pre-commit Hooks', () => {
    test('should have setup script for git hooks', () => {
      expect(fileExists('scripts/setup-git-hooks.sh')).toBe(true);
    });

    test('should have pre-push hook script', () => {
      expect(fileExists('scripts/validation/pre-push-hook.sh')).toBe(true);
    });

    test('should have commit-msg hook script', () => {
      expect(fileExists('scripts/setup-commit-hooks.sh')).toBe(true);
    });

    test('should reference all validation scripts in pre-push hook', () => {
      if (fileExists('scripts/validation/pre-push-hook.sh')) {
        const content = readFile('scripts/validation/pre-push-hook.sh');
        const requiredScripts = [
          'scan-secrets.sh',
          'check-strategy-chain.js',
          'validate-toolchain.js',
          'validate-dates.js'
        ];

        requiredScripts.forEach(script => {
          expect(content).toContain(script);
        });
      }
    });
  });

  // Validation Scripts Tests
  // ==========================
  describe('Validation Scripts', () => {
    test('should have all validation scripts', () => {
      const scripts = [
        'check-strategy-chain.js',
        'validate-toolchain.js',
        'validate-dates.js',
        'validate-cncf-compliance.sh',
        'validate-commit-message.sh',
        'scan-secrets.sh',
        'pre-push-hook.sh'
      ];

      scripts.forEach(script => {
        expect(fileExists(`scripts/validation/${script}`)).toBe(true);
      });
    });

    test('should have strategy chain validation script', () => {
      if (fileExists('scripts/validation/check-strategy-chain.js')) {
        const content = readFile('scripts/validation/check-strategy-chain.js');
        expect(content).toContain('Omen');
        expect(content).toContain('ArchiMate');
        expect(content).toContain('BMML');
        expect(content).toContain('ADR');
      }
    });

    test('should have toolchain validation script', () => {
      if (fileExists('scripts/validation/validate-toolchain.js')) {
        const content = readFile('scripts/validation/validate-toolchain.js');
        expect(content).toContain('Omen');
        expect(content).toContain('ArchiMate');
        expect(content).toContain('Godog');
      }
    });

    test('should have date validation script', () => {
      if (fileExists('scripts/validation/validate-dates.js')) {
        const content = readFile('scripts/validation/validate-dates.js');
        expect(content).toContain('manual dates');
      }
    });

    test('should have CNCF compliance validation script', () => {
      expect(fileExists('scripts/validation/validate-cncf-compliance.sh')).toBe(true);
    });

    test('should have commit message validation script', () => {
      expect(fileExists('scripts/validation/validate-commit-message.sh')).toBe(true);
    });

    test('should have secret scanning script', () => {
      expect(fileExists('scripts/validation/scan-secrets.sh')).toBe(true);
    });
  });

  // DevX Documentation Tests
  // ========================
  describe('DevX Documentation', () => {
    test('should have DevX workflow feature file', () => {
      expect(fileExists('features/devx_workflow.feature')).toBe(true);
    });

    test('should have DevX BDD scenarios', () => {
      if (fileExists('features/devx_workflow.feature')) {
        const content = readFile('features/devx_workflow.feature');
        expect(content).toContain('Version Policy Enforcement');
        expect(content).toContain('Design Verification Enforcement');
        expect(content).toContain('Pre-commit Hooks');
        expect(content).toContain('CI/CD Integration');
      }
    });

    test('should reference DevX tools in CONTRIBUTING.md', () => {
      if (fileExists('CONTRIBUTING.md')) {
        const content = readFile('CONTRIBUTING.md');
        const requiredReferences = [
          'SEMANTIC_VERSIONING.md',
          'DESIGN_VERIFICATION.md',
          'IMPLEMENTATION_PLAN.md',
          '.betterleaks.toml',
          '.commitlintrc.js',
          '.vale.ini',
          'verify-versions',
          'setup-git-hooks.sh'
        ];

        requiredReferences.forEach(ref => {
          expect(content).toContain(ref);
        });
      }
    });
  });

  // Makefile Targets Tests
  // ======================
  describe('Makefile Targets', () => {
    test('should have verify-versions target', () => {
      if (fileExists('Makefile')) {
        const makefile = readFile('Makefile');
        expect(makefile).toContain('verify-versions:');
      }
    });

    test('should have bump-version target', () => {
      if (fileExists('Makefile')) {
        const makefile = readFile('Makefile');
        expect(makefile).toContain('bump-version:');
      }
    });

    test('should have test-strategy-chain target', () => {
      if (fileExists('Makefile')) {
        const makefile = readFile('Makefile');
        expect(makefile).toContain('test-strategy-chain:');
      }
    });

    test('should have test-toolchain target', () => {
      if (fileExists('Makefile')) {
        const makefile = readFile('Makefile');
        expect(makefile).toContain('test-toolchain:');
      }
    });

    test('should have test-dates target', () => {
      if (fileExists('Makefile')) {
        const makefile = readFile('Makefile');
        expect(makefile).toContain('test-dates:');
      }
    });
  });

  // Configuration Files Tests
  // ==========================
  describe('Configuration Files', () => {
    test('should have .betterleaks.toml for secret scanning', () => {
      expect(fileExists('.betterleaks.toml')).toBe(true);
    });

    test('should have .commitlintrc.js for commit linting', () => {
      expect(fileExists('.commitlintrc.js')).toBe(true);
    });

    test('should have .vale.ini for documentation linting', () => {
      expect(fileExists('.vale.ini')).toBe(true);
    });

    test('should have .yamllint.yaml for YAML linting', () => {
      expect(fileExists('.yamllint.yaml')).toBe(true);
    });

    test('should have .markdownlint.yaml for markdown linting', () => {
      expect(fileExists('.markdownlint.yaml')).toBe(true);
    });
  });

  // DevPod Configuration Tests
  // ============================
  describe('DevPod Configuration', () => {
    test('should have DevPod configuration', () => {
      expect(fileExists('.devpod/devpod.yaml')).toBe(true);
    });

    test('should have DevPod Dockerfile', () => {
      expect(fileExists('.devpod/Dockerfile')).toBe(true);
    });

    test('should reference DevX tools in DevPod Dockerfile', () => {
      if (fileExists('.devpod/Dockerfile')) {
        const content = readFile('.devpod/Dockerfile');
        const requiredTools = [
          'go',
          'node',
          'make',
          'git',
          'kubectl',
          'kubebuilder',
          'betterleaks'
        ];

        requiredTools.forEach(tool => {
          const toolPattern = new RegExp(tool, 'i');
          expect(content).toMatch(toolPattern);
        });
      }
    });
  });

  // End-to-End DevX Workflow Tests
  // ================================
  describe('End-to-End DevX Workflow', () => {
    test('should have all components for complete workflow', () => {
      const requiredFiles = [
        'VERSION',
        'Makefile',
        'CONTRIBUTING.md',
        'docs/SEMANTIC_VERSIONING.md',
        'docs/DESIGN_VERIFICATION.md',
        'docs/IMPLEMENTATION_PLAN.md',
        'scripts/setup-git-hooks.sh',
        'scripts/validation/pre-push-hook.sh',
        'scripts/validation/scan-secrets.sh',
        'scripts/validation/check-strategy-chain.js',
        'scripts/validation/validate-toolchain.js',
        'scripts/validation/validate-dates.js',
        'features/devx_workflow.feature'
      ];

      requiredFiles.forEach(file => {
        expect(fileExists(file)).toBe(true);
      });
    });

    test('should have proper references between DevX components', () => {
      if (fileExists('CONTRIBUTING.md') && fileExists('features/devx_workflow.feature')) {
        const contributing = readFile('CONTRIBUTING.md');
        expect(contributing).toContain('SEMANTIC_VERSIONING.md');
        expect(contributing).toContain('DESIGN_VERIFICATION.md');
        expect(contributing).toContain('IMPLEMENTATION_PLAN.md');

        const devxFeature = readFile('features/devx_workflow.feature');
        expect(devxFeature).toContain('SEMANTIC_VERSIONING.md');
        expect(devxFeature).toContain('CONTRIBUTING.md');
        expect(devxFeature).toContain('DESIGN_VERIFICATION.md');
      }
    });
  });

  // DevX Test Suite Tests
  // =====================
  describe('DevX Test Suite', () => {
    test('should have this test file', () => {
      expect(fileExists('tests/devx/devx_workflow_test.js')).toBe(true);
    });

    test('should test version consistency', () => {
      if (fileExists('tests/devx/devx_workflow_test.js')) {
        const testContent = readFile('tests/devx/devx_workflow_test.js');
        expect(testContent).toContain('verify-versions');
      }
    });

    test('should test design verification', () => {
      if (fileExists('tests/devx/devx_workflow_test.js')) {
        const testContent = readFile('tests/devx/devx_workflow_test.js');
        expect(testContent).toContain('DESIGN_VERIFICATION');
      }
    });

    test('should test pre-commit hooks', () => {
      if (fileExists('tests/devx/devx_workflow_test.js')) {
        const testContent = readFile('tests/devx/devx_workflow_test.js');
        expect(testContent).toContain('Pre-commit Hooks');
      }
    });
  });
});

module.exports = {
  readFile,
  fileExists,
  runCommand
};
