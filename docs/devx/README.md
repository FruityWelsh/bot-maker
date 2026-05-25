# Developer Experience (DevX) Documentation
// ==========================================
// Comprehensive documentation for the DevX workflow
// References: features/devx_workflow.feature (BDD scenarios)
// References: tests/devx/devx_workflow_test.js (Unit tests)
// References: docs/CONTRIBUTING.md (Contribution guidelines)
// References: docs/SEMANTIC_VERSIONING.md (Versioning policy)
// References: docs/DESIGN_VERIFICATION.md (Design verification)
// References: docs/IMPLEMENTATION_PLAN.md (Implementation plan)

## Overview

The **Developer Experience (DevX) workflow** is a comprehensive system of policies, automation, and documentation designed to ensure:

1. **Consistency** - All code follows the same standards
2. **Quality** - All changes are validated before commit
3. **Security** - Secrets and sensitive data are never committed
4. **Traceability** - All code traces back to documented strategy
5. **Maintainability** - Clear documentation and automation

## DevX Components

### 1. Policies and Guidelines

| Policy | Document | Description |
|--------|----------|-------------|
| **Semantic Versioning** | [SEMANTIC_VERSIONING.md](../SEMANTIC_VERSIONING.md) | Strict versioning rules for all releases |
| **Design Verification** | [DESIGN_VERIFICATION.md](../DESIGN_VERIFICATION.md) | Formal verification of design documents |
| **Implementation Plan** | [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) | Roadmap and blocking gates for implementation |
| **Strategy First, Code Second** | [ADR-001](../adr/architecture-decisions.md#adr-001) | Core development principle |

### 2. Automation Tools

#### Pre-commit Hooks
Automatically run before every commit to catch errors early:

- **Secret Scanning** (`scripts/validation/scan-secrets.sh`)
  - Scans for API keys, tokens, passwords, etc.
  - Uses `.gitleaks.toml` configuration
  - Blocks commit if secrets detected

- **Strategy Chain Validation** (`scripts/validation/check-strategy-chain.js`)
  - Verifies all design document references are valid
  - Ensures Omen → ArchiMate → BMML → ADR → Cube.js → Diagrams → Godog → Jest/AJV chain is intact
  - Blocks commit if references are broken

- **Toolchain Validation** (`scripts/validation/validate-toolchain.js`)
  - Verifies all 8 toolchain tools exist and are properly referenced
  - Blocks commit if tools are missing

- **Date Validation** (`scripts/validation/validate-dates.js`)
  - Prevents manual dates in documentation
  - Requires dynamic date references (Git commit dates, generated dates)
  - Blocks commit if manual dates found

- **Version Consistency** (`make verify-versions`)
  - Ensures all version numbers match the VERSION file
  - Blocks commit if versions are inconsistent

- **Commit Message Validation** (`scripts/validation/validate-commit-message.sh`)
  - Enforces Conventional Commits format
  - Uses `.commitlintrc.js` configuration
  - Blocks commit if message format is invalid

#### Validation Scripts
Run manually or as part of CI/CD:

```bash
# Run all validations
make ci

# Individual validations
make verify-versions      # Version consistency
make test-strategy-chain   # Strategy chain validation
make test-toolchain        # Toolchain validation
make test-dates           # Date validation
make scan-secrets         # Secret scanning
make lint-vale            # Documentation linting
```

#### Version Management

```bash
# Check current version
cat VERSION
make version

# Verify version consistency
make verify-versions

# Bump version (automated)
./scripts/bump-version.sh 0.2.0-dev

# Bump to stable release (requires confirmation)
./scripts/bump-version.sh 1.0.0
```

### 3. Documentation

#### BDD Feature Files
- **[features/devx_workflow.feature](../features/devx_workflow.feature)**
  - 20+ scenarios covering all DevX automation
  - Tests version policy enforcement
  - Tests design verification enforcement
  - Tests pre-commit hooks
  - Tests CI/CD integration
  - Tests end-to-end workflow

#### Unit Tests
- **[tests/devx/devx_workflow_test.js](../tests/devx/devx_workflow_test.js)**
  - Tests all DevX components exist
  - Tests version consistency
  - Tests design verification references
  - Tests pre-commit hook configuration
  - Tests validation scripts
  - Tests Makefile targets
  - Tests configuration files

### 4. Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `.gitleaks.toml` | Secret scanning configuration | Root |
| `.commitlintrc.js` | Commit message linting | Root |
| `.vale.ini` | Documentation linting | Root |
| `.yamllint.yaml` | YAML linting | Root |
| `.markdownlint.yaml` | Markdown linting | Root |

## DevX Workflow

### Step-by-Step Guide

#### 1. Set Up Development Environment

```bash
# Clone the repository
git clone https://github.com/FruityWelsh/bot-maker.git
cd bot-maker

# Install dependencies
npm install
make go-deps
make tools-deps

# Set up pre-commit hooks (REQUIRED)
./scripts/setup-git-hooks.sh
```

#### 2. Create a Feature Branch

```bash
# Use the branch naming convention
git checkout -b vibe/your-feature-description-uuid
```

Branch naming conventions:
- `vibe/<short-description>-<uuid>` - Feature branches
- `fix/<short-description>-<uuid>` - Bug fixes
- `docs/<short-description>-<uuid>` - Documentation updates

#### 3. Make Changes

Follow the **Strategy First, Code Second** principle:

1. **Review existing design documents**
   - `docs/omen/strategy.json` - Strategy
   - `docs/archimate/enterprise-architecture.xml` - Architecture
   - `docs/bmml/value-proposition.yaml` - Business motivation
   - `docs/adr/architecture-decisions.md` - Architecture decisions

2. **Ensure your code traces back to strategy**
   - Add hard references in code comments
   - Reference specific goals, decisions, or diagrams

3. **Update documentation**
   - Update relevant docs
   - Add hard references to other documents
   - Use dynamic date references (not manual dates)

#### 4. Run Local Validations

```bash
# Run all validations
make ci

# Or run individual validations
make verify-versions      # Check version consistency
make test-strategy-chain   # Check design references
make test-toolchain        # Check all 8 tools exist
make test-dates           # Check for manual dates
make scan-secrets         # Scan for secrets
make lint                 # Run all linters
make test                 # Run all tests
```

#### 5. Commit Changes

```bash
# Stage your changes
git add .

# Commit with Conventional Commits format
git commit -m "feat: add new feature"
# Pre-commit hooks will run automatically
```

Commit message types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `style:` - Code style changes
- `build:` - Build system changes
- `ci:` - CI/CD changes

#### 6. Push and Create PR

```bash
# Push to your fork
git push origin vibe/your-feature-description-uuid

# Open PR on GitHub
# CI pipeline will run all validations
```

#### 7. Address Feedback

- CI will report any validation failures
- Reviewers may request changes
- Update your branch and push again

#### 8. Merge

Once all validations pass and approvals are obtained, your PR can be merged.

## DevX Testing

### Running DevX Tests

```bash
# Run DevX unit tests
npm run test:devx

# Or using make
make test-devx

# Run DevX BDD tests (requires godog)
godog features/devx_workflow.feature

# Run all DevX validations
npm run validate:devx
```

### Test Coverage

The DevX test suite covers:

1. **Version Policy Enforcement**
   - Version consistency across all files
   - Version bump script functionality
   - Stable release blocking

2. **Design Verification**
   - Design document existence
   - Reference chain validation
   - Verification completeness

3. **Pre-commit Hooks**
   - Hook script existence
   - Hook configuration
   - All validation scripts referenced

4. **Validation Scripts**
   - All scripts exist
   - Script content validation
   - Reference checking

5. **Documentation**
   - DevX feature file existence
   - BDD scenario coverage
   - CONTRIBUTING.md references

6. **Makefile Targets**
   - All DevX targets exist
   - Target functionality

7. **Configuration Files**
   - All config files exist
   - Config file content

8. **DevPod Configuration**
   - DevPod files exist
   - Tool references

## DevX UX Principles

### 1. Fail Fast
Errors should be caught as early as possible:
- Pre-commit hooks catch errors before commit
- CI catches errors before merge
- Clear error messages guide users to fixes

### 2. Clear Feedback
Every validation provides:
- ✅ Clear pass/fail indication
- ❌ Specific error messages
- 📝 Actionable guidance

### 3. Consistent Experience
All platforms provide the same experience:
- Local development
- GitHub Actions
- GitLab CI
- Tekton
- VSCode tasks

### 4. Automation First
Manual checks are error-prone:
- Automate everything that can be automated
- Provide clear documentation for manual steps
- Make automation the default

### 5. Traceability
Everything should be traceable:
- Code → Design documents
- Commits → Issues/PRs
- Versions → Releases
- Changes → Rationale

## Troubleshooting

### Common Issues

#### Pre-commit Hook Fails

**Error**: "Secret scanning failed"
**Solution**: Remove secrets from your changes. Use environment variables or Kubernetes Secrets instead.

**Error**: "Version mismatch in package.json"
**Solution**: Run `./scripts/bump-version.sh <new-version>` to update all version files.

**Error**: "Manual date detected"
**Solution**: Replace manual dates with dynamic references like "2026-05-25".

**Error**: "Commit message validation failed"
**Solution**: Use Conventional Commits format. See `.commitlintrc.js` for valid types.

**Error**: "Strategy chain validation failed"
**Solution**: Check that all referenced files in design documents exist.

#### CI Pipeline Fails

**Error**: "Version consistency check FAILED"
**Solution**: Ensure all version files match. Run `make verify-versions` locally.

**Error**: "Strategy chain validation FAILED"
**Solution**: Check design document references. Run `make test-strategy-chain` locally.

**Error**: "Secret scanning detected secrets"
**Solution**: Remove secrets from your code. Use mock values for testing.

### Getting Help

1. **Check the documentation**
   - [CONTRIBUTING.md](../CONTRIBUTING.md)
   - [SEMANTIC_VERSIONING.md](../SEMANTIC_VERSIONING.md)
   - [DESIGN_VERIFICATION.md](../DESIGN_VERIFICATION.md)

2. **Run local validations**
   ```bash
   make ci
   ```

3. **Check the BDD scenarios**
   - [features/devx_workflow.feature](../features/devx_workflow.feature)

4. **Ask for help**
   - Open an issue with the error message
   - Include the command you ran
   - Include the output

## DevX Metrics

The project tracks DevX metrics to ensure a good developer experience:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Pre-commit hook execution time | < 5s | Time to run all hooks |
| CI pipeline execution time | < 10min | Time to run full pipeline |
| False positive rate | < 1% | Valid changes blocked by hooks |
| Developer satisfaction | > 4/5 | Survey score |
| Time to first contribution | < 1 hour | Setup + first PR |

## DevX Roadmap

### Short Term (Current)
- [x] Create DevX BDD feature file
- [x] Update CONTRIBUTING.md with DevX references
- [x] Create DevX unit tests
- [x] Add DevX Makefile targets
- [x] Create DevX documentation

### Medium Term
- [ ] Add DevX metrics to Cube.js
- [ ] Create DevX dashboard
- [ ] Add DevX performance benchmarks
- [ ] Create interactive DevX tutorial

### Long Term
- [ ] AI-powered DevX assistant
- [ ] Automated PR review
- [ ] Predictive error prevention
- [ ] Personalized onboarding

## Links

- [Main Documentation](../README.md)
- [Contribution Guidelines](../CONTRIBUTING.md)
- [Semantic Versioning Policy](../SEMANTIC_VERSIONING.md)
- [Design Verification](../DESIGN_VERIFICATION.md)
- [Implementation Plan](../IMPLEMENTATION_PLAN.md)
- [BDD Feature File](../features/devx_workflow.feature)
- [Unit Tests](../tests/devx/devx_workflow_test.js)

---

**Note**: This DevX workflow is a **UX change** designed to improve the developer experience. All components are linked through BDD scenarios and unit tests to ensure they work together as a cohesive system.
