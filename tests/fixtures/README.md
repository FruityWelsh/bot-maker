# Test Fixtures

This directory contains **test fixture files** used by the ChatBot Operator test suite.

## Purpose

Extracting test data into fixture files improves:
- **Readability**: Test files are shorter and more focused
- **Maintainability**: Test data can be updated independently
- **Reusability**: Fixtures can be shared across multiple test files
- **Organization**: Related test data is grouped together

## Directory Structure

```
tests/fixtures/
├── crds/                    # Kubernetes CRD test data
│   ├── chatbot-valid.json    # Valid ChatBot CRD
│   ├── chatbot-invalid.json  # Invalid ChatBot CRD (missing required fields)
│   ├── botplatform-valid.json
│   ├── botconfiguration-valid.json
│   └── botcredential-valid.json
│
├── strategy/               # Strategy document test data
│   ├── omen-valid.json
│   ├── archimate-valid.xml
│   ├── bmml-valid.yaml
│   └── cubejs-valid.yaml
│
└── toolchain/              # Toolchain document test data
    ├── adr-valid.md
    └── diagrams-valid.md
```

## Usage Pattern

### In Test Files

```javascript
// Load fixture
const validChatBot = require('../fixtures/crds/chatbot-valid.json');

// Use in tests
test('should validate valid ChatBot CRD', () => {
  const result = validateChatBot(validChatBot);
  expect(result.valid).toBe(true);
});
```

### Adding New Fixtures

1. Place fixture files in the appropriate subdirectory
2. Use descriptive names (e.g., `chatbot-with-lifecycle-hooks.json`)
3. Keep fixtures focused on specific test scenarios
4. Document the purpose of each fixture in a comment

## Fixture Naming Convention

- **Valid fixtures**: `<resource>-valid.json` or `<resource>-<scenario>.json`
- **Invalid fixtures**: `<resource>-invalid-<reason>.json`
- **Edge cases**: `<resource>-edge-<case>.json`

## Current Fixtures

| **Fixture** | **Purpose** | **Used By** |
|-------------|-------------|-------------|
| `crds/chatbot-valid.json` | Valid ChatBot CRD for testing | `tests/schemas/validation.js` |
| `crds/chatbot-invalid.json` | Invalid ChatBot CRD (missing platform) | `tests/schemas/validation.js` |

## Future Work

- [ ] Extract all CRD test data to fixtures
- [ ] Extract all strategy document test data to fixtures
- [ ] Extract all toolchain document test data to fixtures
- [ ] Update all test files to use fixtures
- [ ] Add fixture validation tests

## References

- [Jest Documentation: Using Matchers](https://jestjs.io/docs/using-matchers)
- [Node.js require()](https://nodejs.org/api/modules.html#modules_require)
- [ADR-020: Strategy First, Code Second](../../docs/contributors/adr/ADR-020-strategy-first-code-second.md)
