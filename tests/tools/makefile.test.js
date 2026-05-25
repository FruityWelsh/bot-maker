/**
 * Makefile Tests for ChatBot Operator
 * References: docs/strategy/omen/strategy.json (upstream)
 * References: docs/contributors/adr/architecture-decisions.md (ADR-012)
 * 
 * These tests validate that the Makefile works correctly across all platforms
 * and that it properly implements the platform-agnostic CI/CD strategy.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// References: docs/strategy/omen/strategy.json - Developer Environment Goal DG001
// References: docs/contributors/adr/architecture-decisions.md - ADR-012

describe('Makefile Platform-Agnostic CI/CD', () => {
  const makefilePath = path.join(__dirname, '../../Makefile');
  const makefileContent = fs.readFileSync(makefilePath, 'utf8');

  describe('Makefile Structure', () => {
    test('should exist and be readable', () => {
      expect(fs.existsSync(makefilePath)).toBe(true);
      expect(makefileContent.length).toBeGreaterThan(0);
    });

    test('should have platform-agnostic comment header', () => {
      const header = makefileContent.split('\n').slice(0, 10).join('\n');
      expect(header).toContain('Platform-Agnostic Makefile');
      expect(header).toContain('GitHub Actions');
      expect(header).toContain('Tekton');
      expect(header).toContain('GitLab CI/CD');
      expect(header).toContain('VSCode');
    });

    test('should reference ADR-012 in comments', () => {
      expect(makefileContent).toContain('ADR-012');
    });
  });

  describe('Core Targets', () => {
    const requiredTargets = [
      'help',
      'deps',
      'lint',
      'test',
      'build',
      'scan',
      'sign',
      'package',
      'ci'
    ];

    requiredTargets.forEach(target => {
      test(`should have ${target} target`, () => {
        expect(makefileContent).toContain(`${target}:`);
      });
    });

    test('should have ci-lint target that depends on deps and lint', () => {
      expect(makefileContent).toContain('ci-lint: deps lint');
    });

    test('should have ci-test target that depends on deps and test', () => {
      expect(makefileContent).toContain('ci-test: deps test');
    });

    test('should have ci-build target that depends on deps and build', () => {
      expect(makefileContent).toContain('ci-build: deps build');
    });

    test('should have ci-scan target that depends on deps and scan', () => {
      expect(makefileContent).toContain('ci-scan: deps scan');
    });

    test('should have ci-sign target that depends on deps and sign', () => {
      expect(makefileContent).toContain('ci-sign: deps sign');
    });

    test('should have ci-package target that depends on deps and package', () => {
      expect(makefileContent).toContain('ci-package: deps package');
    });

    test('should have ci target that runs full pipeline', () => {
      expect(makefileContent).toContain('ci: ci-lint ci-test ci-build ci-scan ci-sign ci-package');
    });
  });

  describe('Platform-Specific Wrappers', () => {
    const wrapperTargets = ['github-ci', 'gitlab-ci', 'tekton-ci', 'vscode-tasks', 'all-platforms'];

    wrapperTargets.forEach(target => {
      test(`should have ${target} wrapper target`, () => {
        expect(makefileContent).toContain(`${target}:`);
      });
    });

    test('should have all-platforms target that depends on all wrappers', () => {
      expect(makefileContent).toContain('all-platforms: github-ci gitlab-ci tekton-ci vscode-tasks');
    });
  });

  describe('Platform Detection', () => {
    test('should detect CI_PLATFORM environment variable', () => {
      expect(makefileContent).toContain('CI_PLATFORM ?= local');
    });

    test('should detect CI_COMMIT from git', () => {
      expect(makefileContent).toContain('CI_COMMIT ?= $(shell git rev-parse --short HEAD');
    });

    test('should detect CI_BRANCH from git', () => {
      expect(makefileContent).toContain('CI_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD');
    });

    test('should detect CI_REPO from git', () => {
      expect(makefileContent).toContain('CI_REPO ?= $(shell git config --get remote.origin.url');
    });
  });

  describe('Dependency Management', () => {
    test('should have deps target', () => {
      expect(makefileContent).toContain('deps: go-deps node-deps tools-deps');
    });

    test('should have go-deps target for Go dependencies', () => {
      expect(makefileContent).toContain('go-deps:');
      expect(makefileContent).toContain('go mod download');
    });

    test('should have node-deps target for Node dependencies', () => {
      expect(makefileContent).toContain('node-deps:');
      expect(makefileContent).toContain('npm install');
    });

    test('should have tools-deps target for development tools', () => {
      expect(makefileContent).toContain('tools-deps: golangci-lint godog kubebuilder kustomize');
    });
  });

  describe('Linting Targets', () => {
    test('should have lint target that runs all linters', () => {
      expect(makefileContent).toContain('lint: go-lint yaml-lint markdown-lint shell-lint');
    });

    test('should have go-lint target', () => {
      expect(makefileContent).toContain('go-lint:');
      expect(makefileContent).toContain('golangci-lint');
    });

    test('should have yaml-lint target', () => {
      expect(makefileContent).toContain('yaml-lint:');
      expect(makefileContent).toContain('yamllint');
    });

    test('should have markdown-lint target', () => {
      expect(makefileContent).toContain('markdown-lint:');
      expect(makefileContent).toContain('markdownlint');
    });

    test('should have shell-lint target', () => {
      expect(makefileContent).toContain('shell-lint:');
      expect(makefileContent).toContain('shellcheck');
    });
  });

  describe('Testing Targets', () => {
    test('should have test target that runs all tests', () => {
      expect(makefileContent).toContain('test: test-unit test-integration test-validation test-behavior');
    });

    test('should have test-unit target for Go unit tests', () => {
      expect(makefileContent).toContain('test-unit:');
      expect(makefileContent).toContain('go test');
    });

    test('should have test-validation target for Jest/AJV tests', () => {
      expect(makefileContent).toContain('test-validation:');
      expect(makefileContent).toContain('npm test');
    });

    test('should have test-behavior target for Godog tests', () => {
      expect(makefileContent).toContain('test-behavior:');
      expect(makefileContent).toContain('godog');
    });
  });

  describe('Build Targets', () => {
    test('should have build target', () => {
      expect(makefileContent).toContain('build: go-build');
    });

    test('should have go-build target', () => {
      expect(makefileContent).toContain('go-build:');
      expect(makefileContent).toContain('go build');
    });

    test('should have build-container target', () => {
      expect(makefileContent).toContain('build-container:');
      expect(makefileContent).toContain('docker build');
    });
  });

  describe('Security Targets', () => {
    test('should have scan target that runs all security scans', () => {
      expect(makefileContent).toContain('scan: scan-security scan-vulnerability');
    });

    test('should have scan-security target', () => {
      expect(makefileContent).toContain('scan-security:');
      expect(makefileContent).toContain('gosec');
      expect(makefileContent).toContain('betterleaks');
    });

    test('should have scan-vulnerability target', () => {
      expect(makefileContent).toContain('scan-vulnerability:');
      expect(makefileContent).toContain('govulncheck');
      expect(makefileContent).toContain('trivy');
    });
  });

  describe('Signing Targets', () => {
    test('should have sign target that signs all artifacts', () => {
      expect(makefileContent).toContain('sign: sign-binaries sign-container');
    });

    test('should have sign-binaries target', () => {
      expect(makefileContent).toContain('sign-binaries:');
      expect(makefileContent).toContain('cosign sign-blob');
    });

    test('should have sign-container target', () => {
      expect(makefileContent).toContain('sign-container:');
      expect(makefileContent).toContain('cosign sign');
    });
  });

  describe('Packaging Targets', () => {
    test('should have package target that packages all artifacts', () => {
      expect(makefileContent).toContain('package: package-binary package-container');
    });

    test('should have package-binary target', () => {
      expect(makefileContent).toContain('package-binary:');
      expect(makefileContent).toContain('tar czf');
    });

    test('should have package-container target', () => {
      expect(makefileContent).toContain('package-container: build-container sign-container');
      expect(makefileContent).toContain('docker push');
    });
  });

  describe('SBOM and Provenance Targets', () => {
    test('should have generate target that generates all artifacts', () => {
      expect(makefileContent).toContain('generate: generate-sbom generate-provenance');
    });

    test('should have generate-sbom target', () => {
      expect(makefileContent).toContain('generate-sbom:');
      expect(makefileContent).toContain('syft');
    });

    test('should have generate-provenance target', () => {
      expect(makefileContent).toContain('generate-provenance:');
      expect(makefileContent).toContain('cosign generate');
    });
  });

  describe('Clean Targets', () => {
    test('should have clean target that cleans all artifacts', () => {
      expect(makefileContent).toContain('clean: clean-bin clean-dist clean-coverage clean-reports');
    });

    test('should have clean-all target', () => {
      expect(makefileContent).toContain('clean-all: clean clean-deps');
    });
  });

  describe('Utility Targets', () => {
    test('should have version target', () => {
      expect(makefileContent).toContain('version:');
    });

    test('should have env target', () => {
      expect(makefileContent).toContain('env:');
    });

    test('should have doctor target', () => {
      expect(makefileContent).toContain('doctor:');
    });

    test('should have help target with colored output', () => {
      expect(makefileContent).toContain('help:');
      expect(makefileContent).toContain('\033[36m');  // Color codes
    });
  });
});

// References: docs/strategy/omen/strategy.json - Developer Environment Goal DG002
// References: docs/contributors/adr/architecture-decisions.md - ADR-012
describe('Makefile Platform Detection', () => {
  test('should detect GitHub Actions platform', () => {
    // This would be tested by actually running make with CI_PLATFORM=github
    // For now, we just verify the Makefile has the logic
    const makefileContent = fs.readFileSync(path.join(__dirname, '../../Makefile'), 'utf8');
    expect(makefileContent).toContain('CI_PLATFORM ?= local');
    expect(makefileContent).toContain('github');
  });

  test('should detect GitLab CI platform', () => {
    const makefileContent = fs.readFileSync(path.join(__dirname, '../../Makefile'), 'utf8');
    expect(makefileContent).toContain('gitlab');
  });

  test('should detect Tekton platform', () => {
    const makefileContent = fs.readFileSync(path.join(__dirname, '../../Makefile'), 'utf8');
    expect(makefileContent).toContain('tekton');
  });

  test('should default to local platform', () => {
    const makefileContent = fs.readFileSync(path.join(__dirname, '../../Makefile'), 'utf8');
    expect(makefileContent).toContain('CI_PLATFORM ?= local');
  });
});

// References: docs/strategy/omen/strategy.json - Developer Environment Goal DG003
// References: docs/contributors/adr/architecture-decisions.md - ADR-012
describe('Makefile Cross-Reference Validation', () => {
  test('should reference upstream strategy documents', () => {
    const makefileContent = fs.readFileSync(path.join(__dirname, '../../Makefile'), 'utf8');
    // The Makefile should have comments referencing the strategy
    expect(makefileContent).toContain('Platform-Agnostic');
  });

  test('should be part of the toolchain with hard references', () => {
    // The Makefile is referenced by the ADR
    const adrPath = path.join(__dirname, '../../docs/contributors/adr/architecture-decisions.md');
    const adrContent = fs.readFileSync(adrPath, 'utf8');
    expect(adrContent).toContain('Makefile');
    expect(adrContent).toContain('ADR-012');
  });
});

module.exports = {
  // Export for use in other tests
  makefilePath: path.join(__dirname, '../../Makefile'),
  validateMakefileStructure: () => {
    const makefileContent = fs.readFileSync(path.join(__dirname, '../../Makefile'), 'utf8');
    return {
      hasCoreTargets: [
        'help', 'deps', 'lint', 'test', 'build', 'scan', 'sign', 'package', 'ci'
      ].every(target => makefileContent.includes(`${target}:`)),
      
      hasPlatformWrappers: [
        'github-ci', 'gitlab-ci', 'tekton-ci', 'vscode-tasks', 'all-platforms'
      ].every(target => makefileContent.includes(`${target}:`)),
      
      hasPlatformDetection: makefileContent.includes('CI_PLATFORM ?= local'),
      
      hasReferenceToStrategy: makefileContent.includes('Platform-Agnostic')
    };
  }
};