# Tests

This directory contains all tests for the **ChatBot Operator** project. The test suite is organized to validate functionality at multiple levels: unit tests, integration tests, validation tests, and tool tests.

## 📁 Test Directory Structure

```
tests/
├── devx/              # DevX tool tests
├── schemas/           # JSON Schema definitions for validation
├── tools/             # Tool-specific tests
└── validation/        # Validation tests (BDD, schema, etc.)
```

## 🧪 Test Types

### 1. Unit Tests
- **Location**: Implemented in Go test files (`*_test.go`) throughout the codebase
- **Purpose**: Validate individual functions and methods
- **Framework**: Go's built-in `testing` package
- **Run**: `make test-unit` or `go test ./...`

### 2. DevX Tool Tests
- **Location**: `tests/devx/`
- **Purpose**: Test the development tools and scripts
- **Framework**: Node.js/Jest
- **Run**: `make test-tools`

### 3. Validation Tests
- **Location**: `tests/validation/`
- **Purpose**: Validate strategy documents, ADRs, and architecture decisions
- **Framework**: Jest + AJV (JSON Schema validation)
- **Run**: `make test-validation`

### 4. Security and DLP Tests
- **Location**: `tests/tools/security-dlp.test.js`
- **Purpose**: Test secret scanning and security validation
- **Framework**: Node.js/Jest + Godog (BDD)
- **Run**: `make test-tools` (includes security tests)

## 🚀 Running Tests

### Local Development

#### Run All Tests
```bash
make ci-test
```

#### Run Specific Test Types
```bash
# Unit tests
make test-unit

# DevX tool tests
make test-tools

# Validation tests
make test-validation

# Strategy chain validation
make test-strategy-chain

# Toolchain validation
make test-toolchain

# Date validation
make test-dates

# CNCF compliance validation
make test-cncf-compliance
```

### CI Pipeline

All tests are automatically executed in the CI pipeline:
- **GitHub Actions**: `.github/workflows/ci.yml`
- **GitLab CI**: `.gitlab-ci.yml`
- **Tekton**: `.tekton/pipeline.yaml`

The pipeline enforces the following order:
1. Security scanning (DLP)
2. DevX tool tests
3. Strategy validation
4. Toolchain validation
5. Date validation
6. Unit tests
7. Validation tests
8. CNCF compliance

## 📊 Test Coverage

### Coverage Requirements
- **Minimum**: 80% code coverage for all packages
- **Target**: 90% code coverage
- **Critical paths**: 100% coverage required

### Coverage Reports
- Generated during CI pipeline
- Uploaded as artifacts: `coverage/`
- View with: `make coverage-report`

## 📝 Writing Tests

### Unit Tests (Go)

1. Create a test file alongside the code: `filename_test.go`
2. Use the standard `testing` package
3. Follow the pattern:

```go
package mypackage

import (
    "testing"
)

func TestMyFunction(t *testing.T) {
    // Test cases
    tests := []struct {
        name     string
        input    InputType
        expected OutputType
    }{
        {
            name:     "test case 1",
            input:    InputValue1,
            expected: ExpectedValue1,
        },
        {
            name:     "test case 2",
            input:    InputValue2,
            expected: ExpectedValue2,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := MyFunction(tt.input)
            if result != tt.expected {
                t.Errorf("Expected %v, got %v", tt.expected, result)
            }
        })
    }
}
```

### Validation Tests (Jest/AJV)

1. Create a test file in `tests/validation/`
2. Use Jest for test structure
3. Use AJV for JSON Schema validation

```javascript
const Ajv = require("ajv");
const ajv = new Ajv();

const schema = require("../../tests/schemas/my-schema.json");
const validate = ajv.compile(schema);

describe("My Schema Validation", () => {
    test("should validate correct data", () => {
        const data = { /* valid data */ };
        expect(validate(data)).toBe(true);
        expect(validate.errors).toBeNull();
    });

    test("should reject invalid data", () => {
        const data = { /* invalid data */ };
        expect(validate(data)).toBe(false);
        expect(validate.errors).not.toBeNull();
    });
});
```

### BDD Tests (Godog)

1. Create a feature file in `features/`
2. Define step definitions in `features/step-definitions/`

```gherkin
# features/my-feature.feature
Feature: My Feature
  As a user
  I want to test my feature
  So that I can ensure it works correctly

  Scenario: Successful operation
    Given I have a valid input
    When I perform the operation
    Then I should get the expected output
```

```javascript
// features/step-definitions/my-steps.js
const { Given, When, Then } = require("@cucumber/cucumber");

Given("I have a valid input", function() {
    this.input = { /* valid input */ };
});

When("I perform the operation", function() {
    this.result = myFunction(this.input);
});

Then("I should get the expected output", function() {
    expect(this.result).toEqual(/* expected output */);
});
```

## 🔍 Test Validation

### Pre-push Hooks
- Secret scanning with Gitleaks
- Linting checks
- Basic test validation

### CI Gates
All tests must pass before:
- Merging pull requests
- Deploying to production
- Publishing releases

## 🛠️ Test Utilities

### Test Data
- Use `testdata/` directories for test fixtures
- Keep test data small and focused
- Use realistic but synthetic data

### Mocking
- Use interfaces for easy mocking
- Create mock implementations in `mocks/` directories
- Use `testify/mock` for complex mocks

### Test Helpers
- Common test utilities in `internal/testutils/`
- Assertion helpers
- Context setup helpers
- Cleanup utilities

## ⚡ Performance Testing

### Load Tests
- Run with: `make test-load`
- Configuration in `tests/load/`

### Stress Tests
- Run with: `make test-stress`
- Configuration in `tests/stress/`

## 📋 Test Maintenance

### Adding New Tests
1. Identify the test type (unit, integration, validation)
2. Place in the appropriate directory
3. Follow existing patterns and conventions
4. Add to the Makefile if needed
5. Update documentation

### Updating Tests
1. Update test cases when behavior changes
2. Ensure tests reflect current requirements
3. Verify all tests pass before merging

### Removing Tests
1. Only remove tests for removed functionality
2. Update related documentation
3. Ensure no regressions

## 🎯 Test Quality Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Unit Test Coverage | 90% | [Check CI] |
| Integration Test Coverage | 80% | [Check CI] |
| Validation Test Coverage | 100% | [Check CI] |
| Test Execution Time | < 5 min | [Check CI] |
| Test Success Rate | 100% | [Check CI] |

## 🔗 Related Documentation

- [CI/CD Pipeline Documentation](../docs/devx/IMPLEMENTATION_PLAN.md)
- [ADR-010: Behavior-Driven Development with Godog](../docs/contributors/adr/devx-adrs.md#adr-010-behavior-driven-development-with-godog)
- [ADR-011: JSON Schema Validation with AJV](../docs/contributors/adr/devx-adrs.md#adr-011-json-schema-validation-with-ajv)
- [ADR-012: Makefile as Single Source of Truth for CI/CD](../docs/contributors/adr/devx-adrs.md#adr-012-makefile-as-single-source-of-truth-for-cicd)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## 🚨 Troubleshooting

### Tests Failing in CI but Passing Locally
- Check environment differences
- Verify dependency versions
- Review CI logs for errors
- Run `make ci` locally to match CI environment

### Slow Tests
- Check for unnecessary setup
- Use test caching
- Parallelize independent tests
- Review test complexity

### Flaky Tests
- Add retries for external dependencies
- Increase timeouts
- Investigate race conditions
- Add better error handling

---

**Note**: This test suite is designed to be **platform-agnostic**, working consistently across GitHub Actions, GitLab CI, Tekton, and local development environments. All tests are orchestrated via the Makefile to ensure consistency.