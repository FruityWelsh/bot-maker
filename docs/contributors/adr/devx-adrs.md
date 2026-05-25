---
title: ChatBot Operator DevX Architecture Decisions
version: 0.1.0-dev
created: 2026-05-25
author: Strategy Coder
references:
  upstream: ../../../strategy/bmml/value-proposition.yaml
  upstream: ../../../devx/IMPLEMENTATION_PLAN.md
  downstream: ../../../strategy/cubejs/metrics.yaml

---

# Developer Experience Architecture Decision Records

These ADRs focus on the development workflow, toolchain, and automation for the ChatBot Operator project.

## ADR-006: GitOps Workflow Implementation

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: GitOps is a **design goal** for the project's development lifecycle, not an explicit architectural requirement of the application itself. The application enables GitOps patterns by being implemented as a Kubernetes CRD, allowing any GitOps tool (Argo CD, Fleet, Flux, etc.) to manage its lifecycle.

**Decision**: Use GitOps principles for the project's development workflow, with Argo CD and Fleet as example implementations. The ChatBot Operator CRD itself is GitOps-ready by design - it can be managed by any GitOps tool that supports Kubernetes resources.

**Consequences**: 
- ✅ Application is GitOps-ready by being a Kubernetes CRD
- ✅ Can be managed by Argo CD, Fleet, Flux, or any GitOps tool
- ✅ Declarative Git-based workflow for the project's development
- ✅ Automated synchronization capabilities
- ✅ Audit trail and rollback capability
- ✅ Multi-environment support
- ⚠️ Learning curve for GitOps patterns (mitigated by examples)

**Examples**:
- Argo CD Application manifests for ChatBot Operator
- Fleet Bundle configurations
- Flux HelmRelease or Kustomization resources

**References**: 
- BMML Goal G005: Platform-Agnostic CI/CD
- BMML Process P002: Infrastructure Setup
- BMML Stakeholder S004: DevOps Team requirements

---

## ADR-007: Platform-Agnostic CI/CD Pipeline

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need CI/CD that works across GitLab, Forgejo, GitHub, Tekton, and local development  
**Decision**: Use Makefile as the single source of truth with platform-specific wrappers  
**Consequences**: 
- ✅ Single source of truth for all checks (Makefile)
- ✅ Platforms are just wrappers around Make targets
- ✅ Consistent behavior across all environments
- ✅ Easy to add new platforms
- ✅ Local development uses same targets as CI
- ✅ VSCode tasks, GitHub Actions, GitLab CI, Tekton all wrap the same Make targets
- ⚠️ Requires Make to be available in all environments

**Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Architecture                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Makefile (Core)                         ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │  Actual Check Definitions:                            │││
│  │  │  - make deps        (install dependencies)             │││
│  │  │  - make lint        (linting)                          │││
│  │  │  - make test        (testing)                          │││
│  │  │  - make build       (building)                         │││
│  │  │  - make scan        (security scanning)                │││
│  │  │  - make sign        (artifact signing)                 │││
│  │  │  - make package     (packaging)                        │││
│  │  │  - make deploy      (deployment)                       │││
│  │  │  - make ci          (full pipeline)                    │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │  GitHub Actions  │  │   GitLab CI     │  │   Tekton    ││
│  │  (Wrapper)       │  │   (Wrapper)     │  │  (Wrapper)   ││
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘│
│           │                     │                  │        │
│           └─────────────────────┼──────────────────┘        │
│                             │                              │
│                    ┌────────────┴────────────┐             │
│                    │   VSCode Tasks           │             │
│                    │   (Wrapper)              │             │
│                    └──────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details**:

The Makefile contains the actual check definitions:
```
make deps        # Install dependencies
make lint        # Run linting
make test        # Run tests  
make build       # Build application
make scan        # Security scanning
make sign        # Sign artifacts
make package     # Package artifacts
make deploy      # Deploy application
make ci          # Full pipeline
```

Each platform wraps these targets:
- **GitHub Actions**: `.github/workflows/ci.yml` calls `make ci-lint`, `make ci-test`, etc.
- **GitLab CI**: `.gitlab-ci.yml` calls `make ci-lint`, `make ci-test`, etc.
- **Tekton**: `.tekton/pipeline.yaml` with tasks that call `make ci-lint`, `make ci-test`, etc.
- **VSCode**: `.vscode/tasks.json` with tasks that call `make ci-lint`, `make ci-test`, etc.
- **Local**: `make ci` runs the full pipeline

**Platform Detection**:
The Makefile detects the CI platform via environment variables:
- `CI_PLATFORM=github` (GitHub Actions)
- `CI_PLATFORM=gitlab` (GitLab CI)
- `CI_PLATFORM=tekton` (Tekton)
- `CI_PLATFORM=local` (default)

This allows the same Make targets to adapt their behavior based on the platform.

**References**: 
- BMML Developer Environment Goal DG001: Platform-Agnostic CI/CD
- BMML Metric M004: CI/CD Pipeline Success Rate
- BMML Stakeholder S004: DevOps Team requirements

---

## ADR-009: Documentation with React-Markdown and Mermaid

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need safe rendering of strategy metadata and diagrams  
**Decision**: Use react-markdown for markdown, gray-matter for frontmatter, Mermaid.js for diagrams  
**Consequences**: 
- ✅ Safe rendering of user content
- ✅ Support for YAML frontmatter
- ✅ Interactive diagrams
- ✅ React ecosystem integration
- ✅ Client-side rendering
- ⚠️ Additional frontend dependencies

**References**: 
- BMML Goal G006: Comprehensive Documentation
- BMML Stakeholder S001: Platform Engineering Team requirements

---

## ADR-010: Behavior-Driven Development with Godog

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need executable specifications and tests for the ChatBot Operator  
**Decision**: Use Godog (Gherkin) for behavior-driven development with step definitions in JavaScript  
**Consequences**: 
- ✅ Executable specifications
- ✅ Human-readable test scenarios
- ✅ Integration with Jest testing framework
- ✅ Support for complex test scenarios
- ✅ Living documentation
- ⚠️ Learning curve for Gherkin syntax
- ⚠️ Additional step definition maintenance

**Implementation**:
- **Feature Files**: `features/*.feature` with Gherkin syntax
- **Step Definitions**: `features/step-definitions/*.js` 
- **Test Runner**: Godog CLI for test execution
- **Integration**: Jest for step definition testing

**References**: 
- BMML Goal G007: Automated Testing
- BMML Stakeholder S005: QA Team requirements

---

## ADR-011: JSON Schema Validation with AJV

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need to validate all strategy and architecture documents  
**Decision**: Use AJV (Another JSON Schema Validator) for comprehensive JSON Schema validation  
**Consequences**: 
- ✅ Fast, standards-compliant validation
- ✅ Support for JSON Schema Draft 2020-12
- ✅ Custom format validation
- ✅ Detailed error reporting
- ✅ Integration with Jest testing framework
- ⚠️ Schema maintenance overhead

**Validation Chain**:
```
Omen Strategy → ArchiMate → BMML → ADR → Cube.js → Diagrams → Godog → Jest
   ↓              ↓           ↓       ↓        ↓         ↓        ↓
Schema        XSD        Schema   Schema   Schema   Schema   Schema
```

**Schema Locations**:
- `tests/schemas/omen-strategy-schema.json`
- `tests/schemas/archimate-schema.xsd`
- `tests/schemas/bmml-schema.json`
- `tests/schemas/adr-schema.json`
- `tests/schemas/cubejs-schema.json`
- `tests/schemas/diagrams-schema.json`
- `tests/schemas/gherkin-schema.json`

**References**: 
- BMML Goal G008: Quality Assurance
- BMML Stakeholder S005: QA Team requirements

---

## ADR-012: Makefile as Single Source of Truth for CI/CD

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need consistent CI/CD behavior across all platforms  
**Decision**: Makefile contains all actual check definitions, platforms are just wrappers  
**Consequences**: 
- ✅ Single source of truth for all checks
- ✅ Consistent behavior across platforms
- ✅ Easy to maintain and update
- ✅ Local development matches CI behavior
- ✅ Easy to add new platforms
- ✅ Platform-specific optimizations still possible
- ⚠️ Requires Make expertise

**Files**:
- `Makefile` - Core check definitions
- `.github/workflows/ci.yml` - GitHub Actions wrapper
- `.gitlab-ci.yml` - GitLab CI wrapper  
- `.tekton/pipeline.yaml` - Tekton wrapper
- `.tekton/tasks.yaml` - Tekton task definitions
- `.vscode/tasks.json` - VSCode task wrapper
- `scripts/ci/` - Platform-specific configurations

**Benefits**:
1. **Consistency**: All platforms run the exact same checks
2. **Maintainability**: Update once in Makefile, works everywhere
3. **Extensibility**: Easy to add new platforms by creating new wrappers
4. **Local Development**: Developers can run the same checks locally
5. **Debugging**: Issues found in CI can be reproduced locally with `make <target>`

---

## ADR-013: DevPod for Containerized Development Environment

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need consistent development environments across all contributor systems  
**Decision**: Use DevPod for containerized development environments with pre-configured tooling  
**Consequences**: 
- ✅ Consistent development environment for all contributors
- ✅ Pre-installed and configured tools
- ✅ Isolated from host system
- ✅ Easy to update and maintain
- ✅ Support for multiple IDEs
- ⚠️ Container overhead
- ⚠️ Learning curve for DevPod

**DevPod Configuration**:
- **Container Image**: Pre-built with all required tools
- **VSCode Extension**: For seamless integration
- **Dev Container**: Docker-based development environment
- **Pre-installed Tools**: Node.js, npm, Git, Make, etc.

**References**: 
- BMML Developer Environment Goal DG002: Consistent Development Environment
- BMML Stakeholder S004: DevOps Team requirements

---

## ADR-014: Pre-push Hooks for Local Validation Gate

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need to catch issues before they are pushed to remote repositories  
**Decision**: Implement pre-push Git hooks that run validation checks before allowing pushes  
**Consequences**: 
- ✅ Catches issues early in the development process
- ✅ Reduces CI pipeline failures
- ✅ Immediate feedback for developers
- ✅ Configurable validation levels
- ✅ Can be bypassed with --no-verify for emergency fixes
- ⚠️ Slower push operations
- ⚠️ Hook maintenance overhead

**Hook Implementation**:
- **Location**: `.git/hooks/pre-push`
- **Checks**: Linting, testing, validation
- **Configuration**: `.devpod/hooks/pre-push` for DevPod
- **Bypass**: `git push --no-verify` for emergencies

**References**: 
- BMML Developer Environment Goal DG003: Early Feedback
- BMML Stakeholder S001: Platform Engineering Team requirements

---

## ADR-015: Vale with OpenSUSE Rules for Documentation Linting

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need consistent documentation style and quality  
**Decision**: Use Vale with OpenSUSE style rules for documentation linting  
**Consequences**: 
- ✅ Consistent documentation style
- ✅ Automated documentation quality checks
- ✅ Integration with CI/CD pipeline
- ✅ Customizable rules
- ✅ Support for multiple documentation formats
- ⚠️ Learning curve for Vale configuration

**Configuration**:
- **Vale Config**: `.vale.ini`
- **Styles**: OpenSUSE rules for Markdown
- **Integration**: Pre-push hooks and CI pipeline
- **Custom Rules**: Project-specific style guidelines

**References**: 
- BMML Goal G006: Comprehensive Documentation
- BMML Stakeholder S006: Technical Writing Team requirements

---

## ADR-016: Stubbed GitLab and Tekton for Local Testing

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need to test CI/CD configurations locally without requiring full GitLab/Tekton installations  
**Decision**: Create stubbed versions of GitLab CI and Tekton configurations that can run locally  
**Consequences**: 
- ✅ Local testing of CI/CD configurations
- ✅ Faster iteration on pipeline development
- ✅ No dependency on external CI/CD systems
- ✅ Consistent behavior with production pipelines
- ⚠️ Stub maintenance overhead
- ⚠️ Potential differences from production systems

**Implementation**:
- **GitLab CI Stub**: `.gitlab-ci-stub.yml` with local execution
- **Tekton Stub**: `.tekton/` with local task execution
- **Test Scripts**: `scripts/ci/test-gitlab.sh`, `scripts/ci/test-tekton.sh`

**References**: 
- BMML Developer Environment Goal DG004: Local Testing
- BMML Stakeholder S004: DevOps Team requirements

---

## ADR-017: Conventional Commits Validation

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need consistent commit message format for better changelog generation and release management  
**Decision**: Enforce Conventional Commits standard for all commit messages  
**Consequences**: 
- ✅ Consistent commit message format
- ✅ Automated changelog generation
- ✅ Better release management
- ✅ Integration with semantic versioning
- ✅ Improved commit history readability
- ⚠️ Learning curve for Conventional Commits

**Format**:
```
type(scope): subject

body

footer
```

**Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

**References**: 
- BMML Developer Environment Goal DG005: Consistent Commit History
- BMML Stakeholder S001: Platform Engineering Team requirements

---

## ADR-018: Secret Scanning with Gitleaks

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need to prevent accidental commitment of secrets and sensitive data  
**Decision**: Use Gitleaks for secret scanning in pre-push hooks and CI pipeline  
**Consequences**: 
- ✅ Prevention of secret leaks
- ✅ Comprehensive pattern matching
- ✅ Integration with pre-push hooks
- ✅ Integration with CI pipeline
- ✅ Customizable patterns
- ⚠️ False positives require tuning

**Implementation**:
- **Gitleaks Config**: `.gitleaks.toml`
- **Pre-push Hook**: Secret scanning before push
- **CI Integration**: Secret scanning in all pipelines
- **Custom Patterns**: Project-specific secret patterns

**References**: 
- BMML Security Goal S001: Secret Protection
- BMML Stakeholder S002: Security Team requirements

---

## ADR-019: CNCF Graduated Project Compliance Validation

**Status**: Accepted  
**Date**: 2026-05-25  
**Context**: Need to ensure compliance with CNCF best practices and standards  
**Decision**: Implement automated validation of CNCF compliance for all dependencies and configurations  
**Consequences**: 
- ✅ Compliance with CNCF standards
- ✅ Better interoperability with CNCF ecosystem
- ✅ Improved project quality
- ✅ Automated compliance checking
- ⚠️ Compliance validation overhead

**Validation Areas**:
- **Dependencies**: Only CNCF graduated or incubating projects
- **Configuration**: CNCF-compliant configurations
- **APIs**: CNCF-standard APIs and patterns
- **Security**: CNCF security best practices

**References**: 
- BMML Compliance Goal C001: CNCF Compliance
- BMML Stakeholder S002: Security Team requirements

---

## ADR-020: Strategy First, Code Second

**Status**: Accepted  
**Date**: 2026-05-25  
**Author**: Strategy Coder  
**Context**: The ChatBot Operator project requires a disciplined approach to development where strategic goals and architectural decisions drive implementation, rather than ad-hoc coding. Without a clear strategy-first approach, the project risks inconsistent architecture, technical debt, misalignment with goals, and difficulty in maintaining the codebase.

**Decision**: Adopt the **Strategy First, Code Second** principle as the foundational approach for all development in the ChatBot Operator project. This means:

1. **All development must be traceable to a defined goal** in the strategy documentation
2. **Architecture decisions must be documented** as ADRs before implementation
3. **Implementation must follow** the defined strategy and architecture
4. **Code changes must reference** the relevant strategy goals and ADRs

**Implementation**:

### Strategy Documentation Structure
```
docs/
├── strategy/
│   ├── omen/strategy.json          # Top-level strategy (Developer Goal DG002)
│   ├── STRATEGY.md                # Core principles
│   └── cubejs/metrics.yaml        # Metrics and success criteria
└── contributors/
    └── adr/
        ├── architecture-decisions.md  # ADR index
        ├── application-adrs.md       # Application ADRs
        └── devx-adrs.md             # DevX ADRs
```

### Development Workflow
1. **Identify Goal**: Find or create a goal in `docs/strategy/` that the feature addresses
2. **Check ADRs**: Review existing ADRs in `docs/contributors/adr/` for relevant decisions
3. **Create ADR**: If no ADR exists for the architectural decision, create one
4. **Reference in Code**: All code changes must reference the relevant goal and ADR in comments
5. **Validate**: Ensure the implementation aligns with the strategy and ADR

### CI/CD Pipeline Alignment
The CI/CD pipeline enforces this principle by:
- Requiring all pipeline phases to be documented in strategy files
- Validating that code references exist for all strategy and ADR references
- Blocking merges if strategy validation fails

**Consequences**:

### Positive
- ✅ **Consistent Architecture**: All components align with defined goals and decisions
- ✅ **Reduced Technical Debt**: Decisions are made for the long-term
- ✅ **Better Maintainability**: Clear reasoning behind all code changes
- ✅ **Easier Onboarding**: New contributors understand the "why" behind the code
- ✅ **Strategic Alignment**: Development directly supports business goals

### Trade-offs
- ⚠️ **Slower Initial Development**: Requires upfront strategy and documentation
- ⚠️ **Documentation Overhead**: Maintaining strategy docs and ADRs takes time
- ⚠️ **Learning Curve**: Contributors must understand the strategy-first approach

**References**: 
- [Omen Strategy](../../../strategy/omen/strategy.json) - Developer Goal DG002 - Formal Verification
- [Core Strategy Principles](../../../strategy/STRATEGY.md)
- [Implementation Plan](../../../devx/IMPLEMENTATION_PLAN.md)
- [Architecture Decisions Index](./architecture-decisions.md)

**Validation**: The `test-strategy-chain` Make target validates that:
1. All code files reference existing strategy goals
2. All ADR references in code point to existing ADR files
3. No code exists without traceable strategy alignment

**Example**:

### Good Practice
```go
// Strategy: BMML Goal G001 - Kubernetes CRD Development
// ADR: ADR-002 - Use Kubebuilder Framework
// Implements the ChatBot CRD controller
func (r *ChatBotReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    // Implementation...
}
```

### Bad Practice
```go
// TODO: Add better error handling
func (r *ChatBotReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    // Implementation without strategy or ADR references...
}
```

**Supersedes**: This ADR formalizes the existing "Strategy First, Code Second" principle that has been informally followed in the project. All previous development should be reviewed to ensure compliance with this ADR.

---

## Cross-Reference Linkage

These DevX ADRs maintain hard references to:
- **Upstream**: Strategy documents in [../../../strategy/](../strategy/)
- **Upstream**: DevX implementation in [../../../devx/](../devx/)
- **Downstream**: Metrics definitions in [../../../strategy/cubejs/metrics.yaml](../strategy/cubejs/metrics.yaml)

For application ADRs, see [application-adrs.md](./application-adrs.md).

---

**Note**: DevX ADRs focus on the development workflow, toolchain, and automation, while Application ADRs focus on the core functionality and architecture of the ChatBot Operator. ADR-020 (Strategy First, Code Second) is the foundational principle that guides all development workflow decisions.