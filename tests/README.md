# ChatBot Operator Tests

This directory contains all test files for the ChatBot Operator project. The testing strategy follows the **Strategy First, Code Second** principle, ensuring all tests are traceable to defined goals and architecture decisions.

## Test Structure

```
tests/
├── devx/               # DevX and toolchain tests
│   └── ...
├── schemas/            # JSON schemas for validation
│   └── ...
├── tools/              # Tool validation tests
│   └── ...
└── validation/        # Strategy and architecture validation tests
    └── ...
```

## Test Types

### 1. Unit Tests
- **Location**: Implemented in Go test files (`*_test.go`) alongside the code
- **Purpose**: Test individual functions and methods
- **Command**: `make test-unit`
- **Coverage**: Minimum 80% code coverage required

### 2. Validation Tests
- **Location**: `tests/validation/`
- **Purpose**: Validate strategy-to-code alignment and architecture decisions
- **Command**: `make test-validation`
- **Includes**:
  - Strategy chain validation (`test-strategy-chain`)
  - Toolchain validation (`test-toolchain`)
  - Date validation (`test-dates`)
  - CNCF compliance validation (`test-cncf-compliance`)

### 3. DevX Tool Tests
- **Location**: `tests/devx/` and `tests/tools/`
- **Purpose**: Test development tools and CI/CD pipeline components
- **Command**: `make test-tools`
- **Includes**:
  - Security scanning validation
  - Linting tool validation
  - Build tool validation

### 4. Schema Validation Tests
- **Location**: `tests/schemas/`
- **Purpose**: Validate all strategy and architecture documents against JSON schemas
- **Tool**: AJV (Another JSON Schema Validator)
- **Command**: Part of `make test-validation`

## Running Tests

### Local Development
```bash
# Run all tests
make ci

# Run specific test suites
make test-unit       # Unit tests
make test-validation  # Validation tests
make test-tools      # DevX tool tests

# Run with coverage
make test-unit-coverage
```

### CI/CD Pipeline
Tests are automatically run in the GitHub Actions workflow (`.github/workflows/ci.yml`):
- On every push to `main`, `ai-dev`, or `vibe/*` branches
- On every pull request to `main` or `ai-dev`
- Nightly at midnight UTC
- Can be manually triggered via GitHub Actions UI

### Test Phases in CI
The CI pipeline runs tests in the following order (all are HARD BLOCK):

1. **Phase 1: DLP (Data Loss Prevention)**
   - Secret scanning
   - Security scanning
   - Vulnerability scanning

2. **Phase 2: DLP Tests**
   - DevX tool tests

3. **Phase 3: Validation**
   - Strategy chain validation
   - Toolchain validation
   - Date validation
   - Validation tests (Jest/AJV)

4. **Phase 4: Execution**
   - Setup environment
   - Linting
   - Unit tests
   - Build
   - CNCF compliance validation

5. **Phase 5: Artifact Handling**
   - Upload artifacts

## Adding New Tests

### For Unit Tests
1. Create a test file alongside the code: `<name>_test.go`
2. Use the standard Go testing package
3. Reference the relevant strategy goal and ADR in comments
4. Ensure tests cover all public functions

Example:
```go
// Strategy: BMML Goal G001 - Kubernetes CRD Development
// ADR: ADR-002 - Use Kubebuilder Framework
package botmaker

import (
    "testing"
)

func TestChatBotReconciler(t *testing.T) {
    // Test implementation...
}
```

### For Validation Tests
1. Add test files in the appropriate `tests/<category>/` directory
2. Follow the existing test patterns
3. Add the test to the Makefile
4. Reference the relevant strategy and ADR

### For Schema Validation
1. Add or update JSON schemas in `tests/schemas/`
2. Update the validation tests to use the new schemas
3. Reference the schema in the ADR or strategy documentation

## Test Data

Test data should be:
- **Minimal**: Only include what's necessary for the test
- **Isolated**: Tests should not depend on external services or data
- **Deterministic**: Same input should always produce the same output
- **Documented**: Include comments explaining the test purpose and expected behavior

## Test Coverage

### Minimum Requirements
| Component | Coverage Requirement |
|-----------|---------------------|
| Core CRD logic | 90% |
| Controllers | 85% |
| API handlers | 80% |
| Utility functions | 70% |
| Overall | 80% |

### Coverage Reporting
- Coverage reports are generated automatically in CI
- Reports are uploaded as artifacts
- Local coverage: `make test-unit-coverage`

## Troubleshooting

### Test Failing in CI but Passing Locally
1. Check the CI logs for environment differences
2. Ensure all dependencies are installed (`make deps`)
3. Verify the Go version matches (CI uses Go 1.21)
4. Check for platform-specific code paths

### Strategy Validation Failing
1. Ensure all code files have strategy and ADR references
2. Check that referenced strategy files exist
3. Verify that referenced ADRs exist in `docs/contributors/adr/`
4. Run `make test-strategy-chain` locally to debug

### Schema Validation Failing
1. Check that all strategy documents conform to their schemas
2. Run `make test-validation` locally
3. Review the schema files in `tests/schemas/`

## Continuous Improvement

The testing strategy evolves with the project. To propose changes:
1. Create an ADR in `docs/contributors/adr/`
2. Update the relevant strategy documents
3. Implement the changes in the test files
4. Update this README

## References
- [Strategy First, Code Second ADR](../contributors/adr/ADR-001-strategy-first-code-second.md)
- [Platform-Agnostic CI/CD Pipeline ADR](../contributors/adr/devx-adrs.md#adr-007-platform-agnostic-cicd-pipeline)
- [Makefile as Single Source of Truth ADR](../contributors/adr/devx-adrs.md#adr-012-makefile-as-single-source-of-truth-for-cicd)
- [Implementation Plan](../../devx/IMPLEMENTATION_PLAN.md)
