# Contributing to ChatBot Operator

Thank you for your interest in contributing to the ChatBot Operator project! This document provides guidelines for contributing to the project and setting up your development environment.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Git** - Version control system
- **Make** - Build automation tool (required for all platforms)
- **Go** - Version 1.21+ (for the Kubernetes operator)
- **Node.js** - Version 18+ (for validation testing only)
- **npm** - Node package manager (comes with Node.js)
- **Docker** - For container builds (optional for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/FruityWelsh/bot-maker.git
cd bot-maker

# Install Node.js dependencies (for validation testing)
npm install

# Install Go dependencies (for the operator)
make go-deps

# Install development tools
make tools-deps
```

## 📋 Development Workflow

### Strategy First, Code Second

This project follows a strict **Strategy First, Code Second** approach. Before writing any code:

1. **Read the strategy** - Start with `docs/omen/strategy.json`
2. **Review the architecture** - Check `docs/archimate/enterprise-architecture.xml`
3. **Understand the value proposition** - See `docs/bmml/value-proposition.yaml`
4. **Follow the decisions** - Read `docs/adr/architecture-decisions.md`
5. **Reference the diagrams** - Review `docs/diagrams.md`

All code must trace back to the documented strategy with hard references.

### GitOps Workflow

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b vibe/your-feature-description
   ```

2. **Commit frequently** with descriptive messages following Conventional Commits:
   ```bash
   git commit -m "feat: add new bot provisioning feature"
   git commit -m "fix: resolve validation error in ChatBot CRD"
   git commit -m "docs: update architecture diagrams"
   git commit -m "test: add validation tests for new feature"
   ```

3. **Push regularly** to your branch:
   ```bash
   git push origin vibe/your-feature-description
   ```

4. **Rebase on main** frequently to keep your branch up-to-date:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

5. **Create a Pull Request** to `main` when your feature is complete.

### Branch Naming Convention

Use the following format for branch names:
- `vibe/<short-description>-<uuid>` for feature branches
- `fix/<short-description>-<uuid>` for bug fixes
- `docs/<short-description>-<uuid>` for documentation updates

Example: `vibe/add-slack-provisioner-12345678`

## 🏗️ Project Structure

```
bot-maker/
├── docs/                          # Strategy and architecture documents
│   ├── STRATEGY.md               # Overall project strategy
│   ├── omen/
│   │   └── strategy.json         # Omen strategy definition (JSON)
│   ├── archimate/
│   │   └── enterprise-architecture.xml  # ArchiMate enterprise architecture
│   ├── bmml/
│   │   └── value-proposition.yaml        # BMML business motivation model
│   ├── adr/
│   │   └── architecture-decisions.md    # Architecture Decision Records
│   ├── cubejs/
│   │   └── metrics.yaml          # Cube.js business metrics (designed)
│   └── diagrams.md               # Architecture diagrams (Mermaid)
├── features/                      # Behavior-driven tests
│   └── chatbot.feature           # Godog/Gherkin test scenarios
├── tests/                         # Validation tests
│   ├── schemas/
│   │   └── validation.js         # Jest/AJV validation tests
│   └── tools/
│       ├── makefile.test.js     # Makefile tests
│       ├── cicd.test.js         # CI/CD configuration tests
│       └── runner.js            # Tool test runner
├── scripts/                       # Utility scripts
│   └── validation/
│       └── check-strategy-chain.js  # Strategy-to-code chain validator
├── .github/                      # GitHub-specific configurations
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── .gitlab-ci.yml                # GitLab CI/CD configuration
├── .tekton/                      # Tekton pipeline definitions
│   ├── pipeline.yaml            # Tekton pipeline
│   └── tasks.yaml               # Tekton tasks
├── .vscode/                      # VSCode configurations
│   └── tasks.json               # VSCode task configurations
├── Makefile                      # Platform-agnostic build targets
├── package.json                  # Node.js dependencies and scripts
├── VERSION                       # Project version
└── README.md                     # Project overview
```

## 🔧 Development Tools

### Language-Specific Setup

#### Go (Application Development)

The ChatBot Operator is written in Go using the Kubebuilder framework.

```bash
# Install Go 1.21+
# See: https://go.dev/dl/

# Install dependencies
make go-deps

# Build the operator
make go-build

# Run Go tests
make test-unit
```

#### Node.js (Validation Testing Only)

Node.js is used **only** for validation testing (Jest/AJV) and strategy chain validation. It is **not** used in the application runtime.

```bash
# Install Node.js 18+
# See: https://nodejs.org/

# Install dependencies
npm install

# Run validation tests
npm test

# Run strategy chain validation
npm run check:strategy

# Run all tests
npm run validate:all
```

### Platform-Agnostic CI/CD

The project uses a **platform-agnostic CI/CD** approach where:

- **Makefile** contains the actual check definitions
- **GitHub Actions, GitLab CI, Tekton, VSCode** are just wrappers around Make targets

#### Available Make Targets

```bash
# Show all available targets
make help

# Install all dependencies
make deps

# Run linting
make lint

# Run all tests
make test

# Run validation tests (Jest/AJV)
make test-validation

# Run tool tests
make test-tools

# Validate strategy-to-code chain
make test-strategy-chain

# Run full CI pipeline
make ci

# Build the application
make build

# Run security scanning
make scan

# Sign artifacts
make sign

# Package artifacts
make package

# Generate all platform configurations
make all-platforms

# Check development environment
make doctor

# Show version information
make version
```

#### Platform-Specific Commands

```bash
# Generate GitHub Actions workflow
make github-ci

# Generate GitLab CI configuration
make gitlab-ci

# Generate Tekton pipeline manifests
make tekton-ci

# Generate VSCode task configurations
make vscode-tasks
```

## 🧪 Testing

### Test Types

1. **Behavior-Driven Tests** (Godog/Gherkin) - `features/chatbot.feature`
   - Test the application behavior from a user perspective
   - Requires Go and Godog

2. **Validation Tests** (Jest/AJV) - `tests/schemas/validation.js`
   - Validate CRD schemas and toolchain documents
   - Requires Node.js and npm

3. **Tool Tests** - `tests/tools/*.test.js`
   - Validate that the tools themselves work correctly
   - Validate that tools follow the strategy chain
   - Requires Node.js and npm

### Running Tests

```bash
# Run all tests
make test

# Run behavior-driven tests only
make test-behavior

# Run validation tests only
make test-validation

# Run tool tests only
make test-tools

# Run strategy chain validation only
make test-strategy-chain

# Run tests with npm
npm test
npm run test:validation
npm run test:tools
npm run test:all
```

### Test Coverage

All code should have corresponding tests. The project aims for:
- 100% coverage of CRD validation
- 100% coverage of toolchain reference validation
- Comprehensive behavior-driven test scenarios

## 🔗 Strategy-to-Code Chain Validation

The project enforces a strict **Strategy First, Code Second** principle through automated validation:

```
Omen (Strategy) → ArchiMate (Architecture) → BMML (Value) → ADR (Decisions) 
    → Cube.js (Metrics) → Diagrams → Godog (Tests) → Jest (Validation)
```

### Validation Script

The script `scripts/validation/check-strategy-chain.js` validates:
1. All toolchain documents exist
2. All documents have proper hard references to upstream/downstream
3. Application code references strategy documents
4. Tests validate the strategy chain
5. CI/CD pipelines validate the strategy chain
6. No circular references exist

### Running Validation

```bash
# Validate the strategy chain
npm run check:strategy

# Or via Make
make test-strategy-chain

# Or directly
node scripts/validation/check-strategy-chain.js
```

### CI/CD Integration

The strategy chain validation is integrated into all CI/CD platforms:
- **GitHub Actions**: Runs on every push/PR via `make ci`
- **GitLab CI**: Runs on main branch and on demand
- **Tekton**: Runs as a dedicated task in the pipeline

## 📝 Code Guidelines

### Go Code

- Follow Go conventions and idioms
- Use proper error handling
- Include comprehensive documentation
- Follow the existing code patterns

### Documentation

- Use Markdown for all documentation
- Include YAML frontmatter for metadata
- Reference upstream/downstream documents
- Follow the existing documentation patterns

### Testing

- All new features must have corresponding tests
- Tests must reference the strategy documents
- Tests must validate the toolchain references
- Tests must pass before merging

## 🚀 CI/CD Pipeline

The CI/CD pipeline runs the following stages:

1. **Setup** - Install dependencies
2. **Lint** - Code quality checks
3. **Test** - Run all tests
4. **Strategy Validation** - Validate strategy-to-code chain
5. **Build** - Build the application
6. **Scan** - Security scanning
7. **Sign** - Sign artifacts
8. **Package** - Package artifacts

### Pipeline Status

- **GitHub Actions**: `.github/workflows/ci.yml`
- **GitLab CI**: `.gitlab-ci.yml`
- **Tekton**: `.tekton/pipeline.yaml` and `.tekton/tasks.yaml`
- **Local**: `make ci`

### Triggering Pipelines

- **GitHub Actions**: Automatically runs on push/PR to main or vibe/* branches
- **GitLab CI**: Automatically runs on push/PR
- **Tekton**: Can be triggered manually or via Git webhooks
- **Local**: Run `make ci` at any time

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** of the issue
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Environment** (Go version, Node.js version, OS, etc.)
6. **Relevant logs** or error messages

## 📄 Pull Request Guidelines

When submitting a Pull Request:

1. **Follow the branching strategy** - Use `vibe/*` branches
2. **Use Conventional Commits** - Follow the commit message conventions
3. **Include tests** - All new features must have tests
4. **Update documentation** - Update relevant documentation
5. **Validate references** - Ensure all code references the strategy
6. **Pass all tests** - All CI checks must pass
7. **Rebase on main** - Keep your branch up-to-date

### Pull Request Template

```markdown
## Description

[Brief description of the changes]

## Related Issues

[Link to any related issues]

## Changes Made

- [List of changes]

## Testing

- [ ] All existing tests pass
- [ ] New tests added for new features
- [ ] Strategy chain validation passes
- [ ] Linting passes
- [ ] Build succeeds

## Documentation

- [ ] Documentation updated
- [ ] References to strategy documents added
- [ ] Cross-references validated

## Checklist

- [ ] Code follows project conventions
- [ ] Commit messages follow Conventional Commits
- [ ] All tests pass
- [ ] No breaking changes (or documented if intentional)
```

## 📚 Additional Resources

- [Strategy Document](docs/STRATEGY.md) - Overall project strategy
- [Architecture Decisions](docs/adr/architecture-decisions.md) - Technology choices
- [Architecture Diagrams](docs/diagrams.md) - System architecture
- [Behavior Tests](features/chatbot.feature) - Test scenarios
- [Validation Tests](tests/schemas/validation.js) - Schema validation

## 🙏 Code of Conduct

This project follows a **Strategy First, Code Second** approach. Please:

- Respect the documented strategy and architecture
- Follow the established patterns and conventions
- Maintain proper references between documents
- Ensure all code traces back to the strategy
- Help maintain the integrity of the toolchain

## 📄 License

By contributing to this project, you agree to license your contributions under the [Apache License 2.0](LICENSE).

---

**Thank you for contributing to ChatBot Operator!** 🎉

*Last updated: Generated from Git commit date*