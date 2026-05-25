# DevX Workflow Feature
# =======================
# BDD scenarios for Developer Experience workflow
# References: docs/SEMANTIC_VERSIONING.md (Versioning Policy)
# References: docs/CONTRIBUTING.md (Contribution Guidelines)
# References: docs/DESIGN_VERIFICATION.md (Design Verification)
# References: docs/IMPLEMENTATION_PLAN.md (Implementation Plan)
# References: scripts/validation/ (Validation Scripts)
# References: .betterleaks.toml (Secret Scanning)
# References: .commitlintrc.js (Conventional Commits)
# References: .vale.ini (Documentation Linting)
#
# **Purpose**: Ensure DevX policies, contributing guidelines, and pre-commit checks
# are properly linked and tested as a cohesive user experience

Feature: DevX Workflow Automation
  As a developer contributing to the ChatBot Operator project
  I want automated checks that enforce project policies
  So that I can contribute with confidence and avoid common mistakes

  Background:
    Given the project has the following DevX infrastructure:
      | Component | Location | Purpose |
      |-----------|----------|---------|
      | Version Policy | docs/SEMANTIC_VERSIONING.md | Enforce versioning rules |
      | Contributing Guide | CONTRIBUTING.md | Contribution workflow |
      | Design Verification | docs/DESIGN_VERIFICATION.md | Design completeness tracking |
      | Implementation Plan | docs/IMPLEMENTATION_PLAN.md | Implementation roadmap |
      | Pre-commit Hooks | .git/hooks/ | Local validation |
      | CI/CD | .github/workflows/ci.yml | Remote validation |
      | Secret Scanning | .betterleaks.toml | Prevent secret commits |
      | Commit Linting | .commitlintrc.js | Enforce commit format |
      | Documentation Linting | .vale.ini | Enforce doc standards |

  # Version Policy Enforcement
  # ==========================

  Scenario: Version consistency is enforced across all files
    Given I have updated the VERSION file to "0.2.0-dev"
    When I run "make verify-versions"
    Then the command should succeed with exit code 0
    And all version files should contain "0.2.0-dev"
    And the output should show "✅ All versions match: 0.2.0-dev"

  Scenario: Version mismatch is detected
    Given the VERSION file contains "0.2.0-dev"
    And package.json contains "version": "0.1.0-dev"
    When I run "make verify-versions"
    Then the command should fail with exit code 1
    And the output should contain "❌ Version mismatch in package.json"
    And the output should contain "❌ Version consistency check FAILED"

  Scenario: Version bump script updates all files
    Given I run "./scripts/bump-version.sh 0.2.0-dev"
    When the script completes
    Then VERSION file should contain "0.2.0-dev"
    And package.json should contain "version": "0.2.0-dev"
    And docs/omen/strategy.json should contain "version": "0.2.0-dev"
    And docs/bmml/value-proposition.yaml should contain "version: \"0.2.0-dev\""
    And docs/adr/architecture-decisions.md should contain "version: 0.2.0-dev"
    And docs/cubejs/metrics.yaml should contain "version: \"0.2.0-dev\""
    And docs/diagrams.md should contain "version: 0.2.0-dev"

  Scenario: Stable version release is blocked without requirements
    Given I run "./scripts/bump-version.sh 1.0.0"
    And DESIGN_VERIFICATION.md does not have all checkboxes checked
    When the script runs
    Then the script should fail with exit code 1
    And the output should contain "❌ ERROR: Formal verification not complete"
    And VERSION file should still contain the old version

  Scenario: Stable version release is allowed when requirements are met
    Given DESIGN_VERIFICATION.md has all checkboxes checked
    And IMPLEMENTATION_PLAN.md exists
    And I run "./scripts/bump-version.sh 1.0.0"
    And I confirm "yes" to the requirements prompt
    When the script completes
    Then VERSION file should contain "1.0.0"
    And all version files should be updated to "1.0.0"

  # Design Verification Enforcement
  # ================================

  Scenario: Design verification blocks implementation without approval
    Given DESIGN_VERIFICATION.md exists
    And the "Formal verification document complete" checkbox is NOT checked
    When I try to merge a PR with implementation changes
    Then the CI should fail
    And the error message should reference DESIGN_VERIFICATION.md

  Scenario: Strategy chain validation passes
    Given all design documents exist with proper references
    When I run "node scripts/validation/check-strategy-chain.js"
    Then the script should exit with code 0
    And the output should show all reference chains are valid

  Scenario: Strategy chain validation fails with broken reference
    Given docs/omen/strategy.json references a non-existent file
    When I run "node scripts/validation/check-strategy-chain.js"
    Then the script should exit with code 1
    And the output should identify the broken reference

  # Pre-commit Hooks
  # ================

  Scenario: Pre-commit hook runs all validation checks
    Given I have staged changes for commit
    When I run "git commit"
    Then the pre-commit hook should execute
    And it should run:
      | Check | Script | Expected |
      |-------|--------|----------|
      | Secret scanning | scripts/validation/scan-secrets.sh | Pass |
      | Strategy chain | scripts/validation/check-strategy-chain.js | Pass |
      | Toolchain | scripts/validation/validate-toolchain.js | Pass |
      | Date validation | scripts/validation/validate-dates.js | Pass |
      | Version consistency | make verify-versions | Pass |
      | Commit message | scripts/validation/validate-commit-message.sh | Pass |
    And if any check fails, the commit should be aborted

  Scenario: Pre-commit hook blocks commit with secrets
    Given I have staged a file containing "xoxb-1234567890"
    When I run "git commit -m 'test'"
    Then the pre-commit hook should fail
    And the commit should be aborted
    And the error should mention "secret scanning failed"

  Scenario: Pre-commit hook blocks commit with bad message
    Given I have staged changes
    When I run "git commit -m 'fixed stuff'"
    Then the pre-commit hook should fail
    And the commit should be aborted
    And the error should mention "commit message validation failed"

  Scenario: Pre-commit hook blocks commit with date violation
    Given I have staged a file with a manual date "2024-01-01"
    When I run "git commit -m 'test'"
    Then the pre-commit hook should fail
    And the commit should be aborted
    And the error should mention "date validation failed"

  Scenario: Pre-commit hook allows valid commit
    Given I have staged changes that pass all validations
    And my commit message follows conventional commits format
    When I run "git commit -m 'feat: add new feature'"
    Then the commit should succeed
    And all pre-commit checks should pass

  # Contributing Guidelines
  # ======================

  Scenario: CONTRIBUTING.md references all DevX tools
    Given I read CONTRIBUTING.md
    Then it should contain references to:
      | Tool | Reference |
      |------|-----------|
      | Version Policy | docs/SEMANTIC_VERSIONING.md |
      | Design Verification | docs/DESIGN_VERIFICATION.md |
      | Implementation Plan | docs/IMPLEMENTATION_PLAN.md |
      | Pre-commit Hooks | scripts/setup-git-hooks.sh |
      | Validation Scripts | scripts/validation/ |
      | Secret Scanning | .betterleaks.toml |
      | Commit Linting | .commitlintrc.js |

  Scenario: CONTRIBUTING.md explains the workflow
    Given I read CONTRIBUTING.md
    Then it should document the workflow:
      1. Fork the repository
      2. Set up pre-commit hooks
      3. Create a feature branch
      4. Make changes
      5. Run local validations
      6. Commit with conventional commits message
      7. Push to feature branch
      8. Open PR
      9. CI runs all validations
      10. Address feedback
      11. Merge after approval

  # CI/CD Integration
  # ==================

  Scenario: CI pipeline runs all DevX validations
    Given I push changes to a PR branch
    When the CI pipeline runs
    Then it should execute:
      | Stage | Targets | Expected |
      |-------|---------|----------|
      | Lint | make ci-lint | Pass |
      | Test | make ci-test | Pass |
      | Validate | make test-validation | Pass |
      | Strategy Chain | make test-strategy-chain | Pass |
      | Toolchain | make test-toolchain | Pass |
      | Dates | make test-dates | Pass |
      | Versions | make verify-versions | Pass |
      | Secrets | make scan-secrets | Pass |
    And if any stage fails, the pipeline should fail

  Scenario: CI pipeline blocks PR with version mismatch
    Given I push changes where VERSION file is "0.2.0-dev"
    And package.json still has "0.1.0-dev"
    When the CI pipeline runs
    Then the "Versions" stage should fail
    And the PR should be blocked from merging

  Scenario: CI pipeline blocks PR with broken references
    Given I push changes that break a reference in the strategy chain
    When the CI pipeline runs
    Then the "Strategy Chain" stage should fail
    And the PR should be blocked from merging

  # Documentation Linting
  # =====================

  Scenario: Vale linter enforces documentation standards
    Given I have a markdown file with errors
    When I run "make lint-vale"
    Then Vale should report errors
    And the command should fail with exit code 1

  Scenario: Vale linter passes with valid documentation
    Given all markdown files follow the style guide
    When I run "make lint-vale"
    Then Vale should report no errors
    And the command should succeed with exit code 0

  # DevPod Integration
  # ===================

  Scenario: DevPod configuration includes all DevX tools
    Given I examine .devpod/devpod.yaml
    Then it should include:
      | Tool | Version | Purpose |
      |------|---------|---------|
      | Go | 1.21+ | Go development |
      | Node | 18+ | Node.js development |
      | Make | latest | Build tool |
      | Git | latest | Version control |
      | kubectl | latest | Kubernetes CLI |
      | kubebuilder | 3.12.0 | Kubernetes operator SDK |
      | godog | v0.12.6 | BDD testing |
      | betterleaks | latest | Secret scanning |
      | commitlint | latest | Commit message linting |
      | vale | latest | Documentation linting |

  Scenario: DevPod workspace mounts all necessary directories
    Given I examine .devpod/devpod.yaml
    Then it should mount:
      | Source | Destination | Purpose |
      |--------|-------------|---------|
      | . | /workspace | Project files |
      | ~/.gitconfig | /home/user/.gitconfig | Git configuration |
      | ~/.ssh | /home/user/.ssh | SSH keys |
      | /var/run/docker.sock | /var/run/docker.sock | Docker access |
      | ~/.kube | /home/user/.kube | Kubernetes config |

  # End-to-End DevX Workflow
  # ========================

  Scenario: Complete DevX workflow from setup to merge
    Given I am a new contributor
    When I follow the CONTRIBUTING.md workflow:
      1. I fork the repository
      2. I clone my fork
      3. I run "scripts/setup-git-hooks.sh"
      4. I create a feature branch "feat/my-feature"
      5. I make changes to the code
      6. I run "make verify-versions" and it passes
      7. I run "make ci-lint" and it passes
      8. I run "make ci-test" and it passes
      9. I stage my changes
      10. I commit with "git commit -m 'feat: add my feature'"
      11. Pre-commit hooks run and pass
      12. I push to my fork
      13. I open a PR
      14. CI pipeline runs and passes
    Then my PR should be ready for review

  Scenario: DevX workflow catches errors early
    Given I am a contributor making a mistake
    When I try to:
      1. Commit with a bad message "fix: stuff"
      2. Or commit with secrets in the code
      3. Or commit with version mismatch
      4. Or commit with manual dates
      5. Or commit with broken references
    Then the pre-commit hook should catch the error
    And prevent the commit
    And show me a helpful error message

  Scenario: DevX workflow provides helpful error messages
    Given I encounter a validation failure
    When I see the error message
    Then it should include:
      | Error Type | Message Includes |
      |------------|------------------|
      | Version mismatch | "Version mismatch in [file]" |
      | Secret detected | "Secret scanning failed" |
      | Bad commit message | "Commit message validation failed" |
      | Manual date | "Manual date detected" |
      | Broken reference | "Reference not found: [path]" |
    And the message should tell me how to fix it

  # DevX Test Suite
  # ==================

  Scenario: DevX tests verify all automation works
    Given I run "make test-devx"
    When the tests complete
    Then all DevX automation should be verified:
      | Test | Description | Expected |
      |------|-------------|----------|
      | test_version_consistency | Version files match | Pass |
      | test_pre_commit_hooks | Hooks are installed | Pass |
      | test_validation_scripts | Scripts exist and work | Pass |
      | test_strategy_chain | References are valid | Pass |
      | test_toolchain | All 8 tools exist | Pass |
      | test_dates | No manual dates | Pass |
      | test_secrets | No secrets committed | Pass |

  Scenario: DevX tests fail when automation is broken
    Given I break the version consistency
    When I run "make test-devx"
    Then the test_version_consistency test should fail
    And the overall test suite should fail
    And the exit code should be 1
