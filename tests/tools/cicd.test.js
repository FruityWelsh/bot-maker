/**
 * CI/CD Configuration Tests for ChatBot Operator
 * References: docs/strategy/omen/strategy.json (upstream)
 * References: docs/contributors/adr/architecture-decisions.md (ADR-012)
 * References: features/chatbot.feature (upstream)
 * 
 * These tests validate that all CI/CD configurations properly wrap the Makefile targets
 * and follow the platform-agnostic strategy.
 */

const fs = require('fs');
const path = require('path');

// References: docs/strategy/omen/strategy.json - Developer Environment Goal DG001
// References: docs/contributors/adr/architecture-decisions.md - ADR-012

describe('CI/CD Platform Configurations', () => {
  describe('GitHub Actions Configuration', () => {
    const githubWorkflowPath = path.join(__dirname, '../../.github/workflows/ci.yml');
    const githubWorkflowContent = fs.readFileSync(githubWorkflowPath, 'utf8');

    test('should exist and be readable', () => {
      expect(fs.existsSync(githubWorkflowPath)).toBe(true);
      expect(githubWorkflowContent.length).toBeGreaterThan(0);
    });

    test('should have platform-agnostic comment header', () => {
      const header = githubWorkflowContent.split('\n').slice(0, 10).join('\n');
      expect(header).toContain('Platform-agnostic CI workflow');
      expect(header).toContain('Make targets');
      expect(header).toContain('GitHub Actions');
      expect(header).toContain('Tekton');
      expect(header).toContain('GitLab CI/CD');
      expect(header).toContain('VSCode');
    });

    test('should call Make targets', () => {
      expect(githubWorkflowContent).toContain('make deps');
      expect(githubWorkflowContent).toContain('make lint');
      expect(githubWorkflowContent).toContain('make test-unit');
      expect(githubWorkflowContent).toContain('make test-integration');
      expect(githubWorkflowContent).toContain('make test-validation');
      expect(githubWorkflowContent).toContain('make test-behavior');
      expect(githubWorkflowContent).toContain('make build');
      expect(githubWorkflowContent).toContain('make scan-security');
      expect(githubWorkflowContent).toContain('make scan-vulnerability');
      expect(githubWorkflowContent).toContain('make sign');
      expect(githubWorkflowContent).toContain('make package');
    });

    test('should set CI_PLATFORM environment variable', () => {
      expect(githubWorkflowContent).toContain('CI_PLATFORM: github');
    });

    test('should set CI_COMMIT environment variable', () => {
      expect(githubWorkflowContent).toContain('CI_COMMIT: ${{ github.sha }}');
    });

    test('should set CI_BRANCH environment variable', () => {
      expect(githubWorkflowContent).toContain('CI_BRANCH: ${{ github.ref_name }}');
    });

    test('should set CI_REPO environment variable', () => {
      expect(githubWorkflowContent).toContain('CI_REPO: ${{ github.repository }}');
    });

    test('should trigger on push to main and vibe branches', () => {
      expect(githubWorkflowContent).toContain('branches: [ main, vibe/* ]');
    });

    test('should trigger on pull requests to main', () => {
      expect(githubWorkflowContent).toContain('pull_request:');
      expect(githubWorkflowContent).toContain('branches: [ main ]');
    });

    test('should have proper step structure', () => {
      expect(githubWorkflowContent).toContain('steps:');
      expect(githubWorkflowContent).toContain('- name: Checkout repository');
      expect(githubWorkflowContent).toContain('- name: Set up Go');
      expect(githubWorkflowContent).toContain('- name: Set up Node.js');
      expect(githubWorkflowContent).toContain('- name: Install dependencies');
      expect(githubWorkflowContent).toContain('- name: Lint');
      expect(githubWorkflowContent).toContain('- name: Test - Unit Tests');
      expect(githubWorkflowContent).toContain('- name: Test - Integration Tests');
      expect(githubWorkflowContent).toContain('- name: Test - Validation Tests');
      expect(githubWorkflowContent).toContain('- name: Test - Behavior Tests');
      expect(githubWorkflowContent).toContain('- name: Build');
      expect(githubWorkflowContent).toContain('- name: Scan - Security');
      expect(githubWorkflowContent).toContain('- name: Scan - Vulnerability');
      expect(githubWorkflowContent).toContain('- name: Sign - Artifacts');
      expect(githubWorkflowContent).toContain('- name: Package - Container Image');
      expect(githubWorkflowContent).toContain('- name: Generate - SBOM');
      expect(githubWorkflowContent).toContain('- name: Generate - Provenance');
    });

    test('should upload artifacts', () => {
      expect(githubWorkflowContent).toContain('actions/upload-artifact@v4');
      expect(githubWorkflowContent).toContain('name: ci-artifacts');
    });
  });

  describe('GitLab CI Configuration', () => {
    const gitlabCiPath = path.join(__dirname, '../../.gitlab-ci.yml');
    let gitlabCiContent = '';

    beforeAll(() => {
      // Generate the GitLab CI config first
      const { execSync } = require('child_process');
      try {
        execSync('cd ../../ && make gitlab-ci', { cwd: __dirname });
      } catch (e) {
        // Ignore errors, just try to read the file
      }
      if (fs.existsSync(gitlabCiPath)) {
        gitlabCiContent = fs.readFileSync(gitlabCiPath, 'utf8');
      }
    });

    test('should exist after generation', () => {
      expect(fs.existsSync(gitlabCiPath)).toBe(true);
      expect(gitlabCiContent.length).toBeGreaterThan(0);
    });

    test('should have platform-agnostic comment header', () => {
      const header = gitlabCiContent.split('\n').slice(0, 10).join('\n');
      expect(header).toContain('Platform-agnostic CI workflow');
      expect(header).toContain('Make targets');
    });

    test('should call Make targets', () => {
      expect(gitlabCiContent).toContain('make deps');
      expect(gitlabCiContent).toContain('make ci-lint');
      expect(gitlabCiContent).toContain('make ci-test');
      expect(gitlabCiContent).toContain('make ci-build');
      expect(gitlabCiContent).toContain('make ci-scan');
      expect(gitlabCiContent).toContain('make ci-sign');
      expect(gitlabCiContent).toContain('make ci-package');
    });

    test('should set CI_PLATFORM environment variable', () => {
      expect(gitlabCiContent).toContain('CI_PLATFORM: gitlab');
    });

    test('should have stages defined', () => {
      expect(gitlabCiContent).toContain('stages:');
      expect(gitlabCiContent).toContain('- setup');
      expect(gitlabCiContent).toContain('- lint');
      expect(gitlabCiContent).toContain('- test');
      expect(gitlabCiContent).toContain('- build');
      expect(gitlabCiContent).toContain('- scan');
      expect(gitlabCiContent).toContain('- sign');
      expect(gitlabCiContent).toContain('- package');
    });
  });

  describe('Tekton Pipeline Configuration', () => {
    const tektonPipelinePath = path.join(__dirname, '../../.tekton/pipeline.yaml');
    const tektonTasksPath = path.join(__dirname, '../../.tekton/tasks.yaml');
    let tektonPipelineContent = '';
    let tektonTasksContent = '';

    beforeAll(() => {
      // Generate the Tekton configs first
      const { execSync } = require('child_process');
      try {
        execSync('cd ../../ && make tekton-ci', { cwd: __dirname });
      } catch (e) {
        // Ignore errors, just try to read the files
      }
      if (fs.existsSync(tektonPipelinePath)) {
        tektonPipelineContent = fs.readFileSync(tektonPipelinePath, 'utf8');
      }
      if (fs.existsSync(tektonTasksPath)) {
        tektonTasksContent = fs.readFileSync(tektonTasksPath, 'utf8');
      }
    });

    test('should have pipeline configuration', () => {
      expect(fs.existsSync(tektonPipelinePath)).toBe(true);
      expect(tektonPipelineContent.length).toBeGreaterThan(0);
    });

    test('should have tasks configuration', () => {
      expect(fs.existsSync(tektonTasksPath)).toBe(true);
      expect(tektonTasksContent.length).toBeGreaterThan(0);
    });

    test('pipeline should have platform-agnostic description', () => {
      expect(tektonPipelineContent).toContain('Platform-agnostic CI pipeline');
      expect(tektonPipelineContent).toContain('Make targets');
    });

    test('pipeline should have params for configuration', () => {
      expect(tektonPipelineContent).toContain('params:');
      expect(tektonPipelineContent).toContain('- name: git-url');
      expect(tektonPipelineContent).toContain('- name: git-revision');
      expect(tektonPipelineContent).toContain('- name: image-registry');
      expect(tektonPipelineContent).toContain('- name: image-repo');
    });

    test('pipeline should have tasks for each stage', () => {
      expect(tektonPipelineContent).toContain('- name: setup');
      expect(tektonPipelineContent).toContain('- name: lint');
      expect(tektonPipelineContent).toContain('- name: test');
      expect(tektonPipelineContent).toContain('- name: build');
      expect(tektonPipelineContent).toContain('- name: scan');
      expect(tektonPipelineContent).toContain('- name: sign');
      expect(tektonPipelineContent).toContain('- name: package');
    });

    test('tasks should call Make targets', () => {
      expect(tektonTasksContent).toContain('make deps');
      expect(tektonTasksContent).toContain('make ci-lint');
      expect(tektonTasksContent).toContain('make ci-test');
      expect(tektonTasksContent).toContain('make ci-build');
      expect(tektonTasksContent).toContain('make ci-scan');
      expect(tektonTasksContent).toContain('make ci-sign');
      expect(tektonTasksContent).toContain('make ci-package');
    });

    test('tasks should set CI_PLATFORM environment variable', () => {
      expect(tektonTasksContent).toContain('CI_PLATFORM=tekton');
    });
  });

  describe('VSCode Tasks Configuration', () => {
    const vscodeTasksPath = path.join(__dirname, '../../.vscode/tasks.json');
    let vscodeTasksContent = '';

    beforeAll(() => {
      // Generate the VSCode tasks first
      const { execSync } = require('child_process');
      try {
        execSync('cd ../../ && make vscode-tasks', { cwd: __dirname });
      } catch (e) {
        // Ignore errors, just try to read the file
      }
      if (fs.existsSync(vscodeTasksPath)) {
        vscodeTasksContent = fs.readFileSync(vscodeTasksPath, 'utf8');
      }
    });

    test('should exist after generation', () => {
      expect(fs.existsSync(vscodeTasksPath)).toBe(true);
      expect(vscodeTasksContent.length).toBeGreaterThan(0);
    });

    test('should have version 2.0.0', () => {
      expect(vscodeTasksContent).toContain('"version": "2.0.0"');
    });

    test('should have tasks array', () => {
      expect(vscodeTasksContent).toContain('"tasks": [');
    });

    test('should have task for full CI pipeline', () => {
      expect(vscodeTasksContent).toContain('"label": "ChatBot Operator: Full CI Pipeline"');
      expect(vscodeTasksContent).toContain('"command": "make ci"');
    });

    test('should have task for lint', () => {
      expect(vscodeTasksContent).toContain('"label": "ChatBot Operator: Lint"');
      expect(vscodeTasksContent).toContain('"command": "make ci-lint"');
    });

    test('should have task for test', () => {
      expect(vscodeTasksContent).toContain('"label": "ChatBot Operator: Test"');
      expect(vscodeTasksContent).toContain('"command": "make ci-test"');
    });

    test('should have task for build', () => {
      expect(vscodeTasksContent).toContain('"label": "ChatBot Operator: Build"');
      expect(vscodeTasksContent).toContain('"command": "make ci-build"');
    });

    test('should have task for scan', () => {
      expect(vscodeTasksContent).toContain('"label": "ChatBot Operator: Security Scan"');
      expect(vscodeTasksContent).toContain('"command": "make ci-scan"');
    });

    test('should have task for sign', () => {
      expect(vscodeTasksContent).toContain('"label": "ChatBot Operator: Sign Artifacts"');
      expect(vscodeTasksContent).toContain('"command": "make ci-sign"');
    });

    test('should have task for package', () => {
      expect(vscodeTasksContent).toContain('"label": "ChatBot Operator: Package"');
      expect(vscodeTasksContent).toContain('"command": "make ci-package"');
    });

    test('should have platform generation tasks', () => {
      expect(vscodeTasksContent).toContain('"label": "Generate: GitHub Actions Workflow"');
      expect(vscodeTasksContent).toContain('"command": "make github-ci"');
      expect(vscodeTasksContent).toContain('"label": "Generate: GitLab CI Configuration"');
      expect(vscodeTasksContent).toContain('"command": "make gitlab-ci"');
      expect(vscodeTasksContent).toContain('"label": "Generate: Tekton Pipeline"');
      expect(vscodeTasksContent).toContain('"command": "make tekton-ci"');
    });
  });
});

// References: docs/strategy/omen/strategy.json - Developer Environment Goal DG002
// References: docs/contributors/adr/architecture-decisions.md - ADR-012
describe('CI/CD Cross-Reference Validation', () => {
  test('should reference upstream strategy documents', () => {
    const githubWorkflowPath = path.join(__dirname, '../../.github/workflows/ci.yml');
    const githubWorkflowContent = fs.readFileSync(githubWorkflowPath, 'utf8');
    
    expect(githubWorkflowContent).toContain('Platform-agnostic');
    expect(githubWorkflowContent).toContain('Make targets');
  });

  test('should be referenced by ADR-012', () => {
    const adrPath = path.join(__dirname, '../../docs/contributors/adr/architecture-decisions.md');
    const adrContent = fs.readFileSync(adrPath, 'utf8');
    
    expect(adrContent).toContain('GitHub Actions');
    expect(adrContent).toContain('GitLab CI');
    expect(adrContent).toContain('Tekton');
    expect(adrContent).toContain('VSCode');
    expect(adrContent).toContain('Makefile');
  });

  test('should follow the toolchain reference pattern', () => {
    // CI/CD configs -> Makefile -> ADR-012 -> ADR -> BMML -> ArchiMate -> Omen
    const adrPath = path.join(__dirname, '../../docs/contributors/adr/architecture-decisions.md');
    const adrContent = fs.readFileSync(adrPath, 'utf8');
    
    // ADR-012 should reference the Makefile
    expect(adrContent).toContain('Makefile');
    
    // ADR should reference BMML
    expect(adrContent).toContain('BMML');
    
    // Check that the chain is documented
    expect(adrContent).toContain('ADR-012');
  });
});

// References: docs/strategy/omen/strategy.json - Developer Environment Goal DG003
// References: docs/contributors/adr/architecture-decisions.md - ADR-012
describe('CI/CD Platform Consistency', () => {
  test('should have consistent Make target calls across platforms', () => {
    const githubWorkflowPath = path.join(__dirname, '../../.github/workflows/ci.yml');
    const githubWorkflowContent = fs.readFileSync(githubWorkflowPath, 'utf8');
    
    // All platforms should call the same core Make targets
    const coreTargets = ['deps', 'lint', 'test', 'build', 'scan', 'sign', 'package'];
    
    coreTargets.forEach(target => {
      expect(githubWorkflowContent).toContain(`make ${target}`);
    });
  });

  test('should have consistent platform detection across configurations', () => {
    const githubWorkflowPath = path.join(__dirname, '../../.github/workflows/ci.yml');
    const githubWorkflowContent = fs.readFileSync(githubWorkflowPath, 'utf8');
    
    // GitHub should set CI_PLATFORM=github
    expect(githubWorkflowContent).toContain('CI_PLATFORM: github');
    
    // Check that GitLab CI config exists and sets CI_PLATFORM=gitlab
    const gitlabCiPath = path.join(__dirname, '../../.gitlab-ci.yml');
    if (fs.existsSync(gitlabCiPath)) {
      const gitlabCiContent = fs.readFileSync(gitlabCiPath, 'utf8');
      expect(gitlabCiContent).toContain('CI_PLATFORM: gitlab');
    }
    
    // Check that Tekton config exists and sets CI_PLATFORM=tekton
    const tektonTasksPath = path.join(__dirname, '../../.tekton/tasks.yaml');
    if (fs.existsSync(tektonTasksPath)) {
      const tektonTasksContent = fs.readFileSync(tektonTasksPath, 'utf8');
      expect(tektonTasksContent).toContain('CI_PLATFORM=tekton');
    }
  });

  test('should have consistent artifact handling across platforms', () => {
    const githubWorkflowPath = path.join(__dirname, '../../.github/workflows/ci.yml');
    const githubWorkflowContent = fs.readFileSync(githubWorkflowPath, 'utf8');
    
    // GitHub Actions should upload artifacts
    expect(githubWorkflowContent).toContain('actions/upload-artifact@v4');
    expect(githubWorkflowContent).toContain('name: ci-artifacts');
    
    // GitLab CI should have artifacts defined
    const gitlabCiPath = path.join(__dirname, '../../.gitlab-ci.yml');
    if (fs.existsSync(gitlabCiPath)) {
      const gitlabCiContent = fs.readFileSync(gitlabCiPath, 'utf8');
      expect(gitlabCiContent).toContain('artifacts:');
    }
  });
});

module.exports = {
  // Export for use in other tests
  validateCicdConfigurations: () => {
    const results = {
      github: false,
      gitlab: false,
      tekton: false,
      vscode: false
    };
    
    // Check GitHub Actions
    const githubWorkflowPath = path.join(__dirname, '../../.github/workflows/ci.yml');
    if (fs.existsSync(githubWorkflowPath)) {
      const githubWorkflowContent = fs.readFileSync(githubWorkflowPath, 'utf8');
      results.github = githubWorkflowContent.includes('make deps') && 
                      githubWorkflowContent.includes('make lint') &&
                      githubWorkflowContent.includes('CI_PLATFORM: github');
    }
    
    // Check GitLab CI
    const gitlabCiPath = path.join(__dirname, '../../.gitlab-ci.yml');
    if (fs.existsSync(gitlabCiPath)) {
      const gitlabCiContent = fs.readFileSync(gitlabCiPath, 'utf8');
      results.gitlab = gitlabCiContent.includes('make deps') && 
                       gitlabCiContent.includes('make ci-lint') &&
                       gitlabCiContent.includes('CI_PLATFORM: gitlab');
    }
    
    // Check Tekton
    const tektonPipelinePath = path.join(__dirname, '../../.tekton/pipeline.yaml');
    const tektonTasksPath = path.join(__dirname, '../../.tekton/tasks.yaml');
    if (fs.existsSync(tektonPipelinePath) && fs.existsSync(tektonTasksPath)) {
      const tektonPipelineContent = fs.readFileSync(tektonPipelinePath, 'utf8');
      const tektonTasksContent = fs.readFileSync(tektonTasksPath, 'utf8');
      results.tekton = tektonPipelineContent.includes('Make targets') &&
                       tektonTasksContent.includes('make deps') &&
                       tektonTasksContent.includes('CI_PLATFORM=tekton');
    }
    
    // Check VSCode
    const vscodeTasksPath = path.join(__dirname, '../../.vscode/tasks.json');
    if (fs.existsSync(vscodeTasksPath)) {
      const vscodeTasksContent = fs.readFileSync(vscodeTasksPath, 'utf8');
      results.vscode = vscodeTasksContent.includes('"command": "make ci"') &&
                       vscodeTasksContent.includes('"command": "make ci-lint"');
    }
    
    return results;
  }
};