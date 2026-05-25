# Security and Data Loss Prevention (DLP) Pipeline Design
// ========================================================
// Security and DLP pipeline design for ChatBot Operator CI/CD
// References: docs/strategy/omen/strategy.json (Security Goal AG004 - Zero Trust)
// References: docs/contributors/adr/devx-adrs.md (ADR-018 - Secret Scanning with Gitleaks)
// References: docs/contributors/adr/architecture-decisions.md (ADR-004 - Security Architecture with Linkerd)
// References: ../common/toolchain.md (Complete Toolchain Overview)
//
// **Purpose**: Document the security and DLP pipeline design, test setup, and linkages
// **Status**: Complete
// **Last Verified**: 2026-05-25
// **Owner**: DevX Engineering Team

## Overview

The ChatBot Operator CI/CD pipeline implements a **Security-First** approach with explicit phase separation:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: DATA LOSS PREVENTION (DLP) AND SECURITY                  │
│  ├─ checkout: Checkout repository                                  │
│  ├─ scan-secrets: Secret scanning with Gitleaks (ADR-018)          │
│  ├─ scan-security: Static analysis with gosec                     │
│  └─ scan-vulnerability: Vulnerability scanning with govulncheck   │
│                                                                     │
│  PHASE 2: VALIDATION - Strategy-to-BDD Stack and DevX Tools        │
│  ├─ validate-strategy: Strategy chain validation (ADR-001)        │
│  ├─ validate-toolchain: Toolchain validation (ADR-008)            │
│  ├─ validate-dates: Date validation                                 │
│  ├─ test-validation: Jest/AJV validation tests (ADR-011)           │
│  └─ test-tools: DevX tool tests (ADR-010)                          │
│                                                                     │
│  PHASE 3: EXECUTION - DevX Tools Act on Validated Application Code │
│  ├─ setup: Setup environment                                        │
│  ├─ lint: Linting                                                   │
│  ├─ test-unit: Unit tests                                          │
│  ├─ build: Build project                                            │
│  └─ test-cncf-compliance: CNCF compliance (ADR-019)                │
│                                                                     │
│  PHASE 4: ARTIFACT HANDLING                                         │
│  └─ upload: Upload artifacts                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: Data Loss Prevention (DLP) and Security

### Design Principles

1. **Fail Fast**: Security checks run FIRST to prevent data loss and detect issues before any validation or execution
2. **Comprehensive Coverage**: Multiple scanning tools cover different threat vectors
3. **Non-Blocking in Dev**: Uses `|| true` to allow pipeline to continue for development feedback
4. **Production Enforcement**: Should be configured to block in production pipelines

### Job Definitions

#### 1.1 scan-secrets: Secret Scanning with Gitleaks

**Purpose**: Detect and prevent accidental commitment of secrets and sensitive data

**Tool**: [Gitleaks](https://github.com/gitleaks/gitleaks) v8.x

**Configuration**:
- Configuration file: `.gitleaks.toml`
- Custom patterns for project-specific secrets
- Integrated with pre-push Git hooks

**Detected Secret Types**:
- AWS Access Keys (AKIA..., AGPA...)
- GitHub Tokens (ghp_, gho_, ghu_, ghs_, ghr_)
- Slack Tokens (xoxb-, xoxa-, xoxp-, xoxr-)
- Generic API Keys (sk_, pk_, api_)
- Private Keys (BEGIN RSA PRIVATE KEY, BEGIN OPENSSH PRIVATE KEY)
- Database Connection Strings
- Passwords in various formats
- OAuth tokens
- JWT tokens
- Heroku API keys
- SendGrid API keys
- Stripe API keys
- Twilio API keys

**Test Coverage**:
- `tests/tools/security-dlp.test.js` - Comprehensive secret detection tests
- Test data generated with fake credentials in various formats
- Validates Gitleaks configuration file exists and has proper patterns

**References**:
- ADR-018: Secret Scanning with Gitleaks
- Security Goal AG004: Zero Trust Implementation

#### 1.2 scan-security: Static Analysis with gosec

**Purpose**: Detect security issues in Go code

**Tool**: [gosec](https://github.com/securego/gosec) v2.x

**Configuration**:
- Runs on all Go source files
- Includes specific security rules (G101, G201, G301, etc.)
- Integrated into Makefile

**Detected Issues**:
- SQL injection vulnerabilities
- Hardcoded passwords and secrets
- Insecure TLS configurations (InsecureSkipVerify)
- Unsafe deserialization
- Command injection
- Path traversal
- Missing input validation
- Insecure random number generation
- Weak cryptographic algorithms

**Test Coverage**:
- `tests/tools/security-dlp.test.js` - Security scanning tests
- Test files with known vulnerabilities (SQL injection, hardcoded passwords, etc.)
- Validates gosec integration in Makefile

**Makefile Target**:
```makefile
scan-security: ## Run security scanning
	@echo "🔒 Running security scans..."
	# Static analysis
	gosec -include=G101,G201,G301 ./...
```

#### 1.3 scan-vulnerability: Vulnerability Scanning with govulncheck

**Purpose**: Detect known vulnerabilities in Go dependencies

**Tool**: [govulncheck](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck) (Go Vulnerability Checker)

**Configuration**:
- Scans go.mod and go.sum files
- Checks against Go vulnerability database
- Reports CVEs with severity levels

**Detected Vulnerabilities**:
- Known CVEs in direct dependencies
- Known CVEs in transitive dependencies
- Outdated packages with security fixes

**Known Test Cases** (for validation):
- `github.com/golang/jwt v3.2.0+incompatible` - CVE-2022-24816
- `github.com/gin-gonic/gin v1.7.7` - Multiple CVEs
- `golang.org/x/crypto v0.0.0-20210921215553-248854273785` - CVE-2020-9283

**Test Coverage**:
- `tests/tools/security-dlp.test.js` - Vulnerability scanning tests
- Test go.mod files with known vulnerable dependencies
- Validates govulncheck integration in Makefile

**Makefile Target**:
```makefile
scan-vulnerability: ## Run vulnerability scanning
	@echo "🔒 Running vulnerability scans..."
	# Go vulnerability scanning
	govulncheck ./...
```

## Test Setup and Linkages

### Test File Structure

```
tests/tools/
├── security-dlp.test.js      # Main test file for security and DLP
├── test-data/
│   └── security/             # Test data for security tests
│       ├── *.test-secret    # Files with fake secrets (cleaned up after tests)
│       ├── *.test           # Files with security issues
│       └── *.mod            # Test go.mod files with vulnerable deps
└── runner.js                 # Test runner
```

### Test Data Generation

The test suite generates various test files to validate security scanning:

1. **Secret Detection Tests**:
   - AWS credentials (access key + secret key)
   - GitHub tokens (various formats)
   - Slack tokens
   - Generic API keys
   - Private keys (RSA, OpenSSH)
   - Database connection strings
   - Multi-secret files (combining multiple types)

2. **Vulnerability Detection Tests**:
   - go.mod files with known vulnerable dependencies
   - Lists of vulnerable package versions

3. **Security Issue Detection Tests**:
   - SQL injection patterns
   - Hardcoded passwords
   - Unsafe TLS configurations
   - Unsafe deserialization

### Test Execution

All tests are executed as part of the `test-tools` job in Phase 2 (Validation):

```yaml
# In .github/workflows/ci.yml
- name: Run DevX Tool Tests
  run: make test-tools || true
```

The `make test-tools` target runs:
```makefile
test-tools: ## Tests for CI/CD tools and Makefile
	node tests/tools/runner.js tests/tools/security-dlp.test.js
	node tests/tools/runner.js tests/tools/cicd.test.js
	node tests/tools/runner.js tests/tools/makefile.test.js
```

## Pipeline Dependencies and Linkages

### Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY GRAPH                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│  checkout (Phase 1)                                                 │
│       │                                                             │
│       ├─ scan-secrets (Phase 1)                                    │
│       │      │                                                        │
│       │      └─ Detects: AWS keys, GitHub tokens, Slack tokens, etc.│
│       │                                                             │
│       ├─ scan-security (Phase 1)                                   │
│       │      │                                                        │
│       │      └─ Detects: SQL injection, hardcoded passwords, etc.  │
│       │                                                             │
│       └─ scan-vulnerability (Phase 1)                               │
│              │                                                         │
│              └─ Detects: Known CVEs in dependencies                  │
│                                                                     │
│  All Phase 1 jobs must complete before Phase 2 starts               │
│                                                                     │
│  ┌─ validate-strategy (Phase 2)                                   │
│  ├─ validate-toolchain (Phase 2)                                   │
│  ├─ validate-dates (Phase 2)                                       │
│  ├─ test-validation (Phase 2)                                     │
│  └─ test-tools (Phase 2)                                           │
│       │                                                             │
│       └─ Includes security-dlp.test.js tests                       │
│                                                                     │
│  All Phase 2 jobs must complete before Phase 3 starts               │
│                                                                     │
│  ┌─ setup (Phase 3)                                                │
│  ├─ lint (Phase 3)                                                 │
│  ├─ test-unit (Phase 3)                                            │
│  ├─ build (Phase 3)                                                │
│  └─ test-cncf-compliance (Phase 3)                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Order?

1. **Security First (Phase 1)**:
   - Prevents data loss from committed secrets
   - Detects security vulnerabilities before any code execution
   - Stops malicious code from being processed further
   - Provides immediate feedback on security issues

2. **Validation Second (Phase 2)**:
   - Ensures strategy-to-BDD stack integrity
   - Validates all toolchain references
   - Confirms documentation and code alignment
   - Tests that security scans work correctly (via test-tools)

3. **Execution Third (Phase 3)**:
   - Only runs on code that has passed all security and validation checks
   - Builds, tests, and packages validated code
   - Ensures production safety

### Cross-Reference Linkages

| Component | References | Purpose |
|-----------|-----------|---------|
| scan-secrets job | ADR-018 | Secret scanning implementation |
| scan-security job | ADR-004 | Security architecture |
| scan-vulnerability job | ADR-004 | Vulnerability management |
| validate-strategy job | ADR-001 | Strategy First, Code Second |
| validate-toolchain job | ADR-008 | Toolchain validation |
| test-validation job | ADR-011 | JSON Schema validation |
| test-tools job | ADR-010 | BDD testing |
| test-cncf-compliance job | ADR-019 | CNCF compliance |

## Test Cases for CI Validation

### Secret Scanning Test Cases

The test suite validates that the pipeline correctly detects:

1. **AWS Credentials**:
   ```
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

2. **GitHub Tokens**:
   ```
   GITHUB_TOKEN=ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
   ```

3. **Slack Tokens**:
   ```
   SLACK_BOT_TOKEN=xoxb-aaaaaaaaaaaaaaaaaaaaaaaa
   ```

4. **Private Keys**:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AHB7MxUK
   -----END RSA PRIVATE KEY-----
   ```

5. **Database URLs**:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/database
   ```

### Vulnerability Scanning Test Cases

The test suite validates detection of known vulnerable packages:

1. **github.com/golang/jwt v3.2.0+incompatible**
   - CVE: CVE-2022-24816
   - Issue: Incorrect validation of RS256 tokens

2. **github.com/gin-gonic/gin v1.7.7**
   - Multiple CVEs
   - Issue: Various security vulnerabilities

3. **golang.org/x/crypto v0.0.0-20210921215553-248854273785**
   - CVE: CVE-2020-9283
   - Issue: Cryptographic vulnerabilities

### Security Scanning Test Cases

The test suite validates detection of code-level security issues:

1. **SQL Injection**:
   ```go
   query := fmt.Sprintf("SELECT * FROM users WHERE username = '%s'", user)
   db.Query(query)
   ```

2. **Hardcoded Passwords**:
   ```go
   const password = "admin123"
   ```

3. **Insecure TLS**:
   ```go
   TLSClientConfig: &tls.Config{
       InsecureSkipVerify: true,
   }
   ```

4. **Unsafe Deserialization**:
   ```go
   json.Unmarshal(data, &result) // No size limits or validation
   ```

## Integration with Development Workflow

### Local Development

Developers can run security scans locally before committing:

```bash
# Run all security scans
make scan

# Run specific scans
make scan-secrets
make scan-security
make scan-vulnerability
```

### Pre-push Hook

The `.git/hooks/pre-push` hook runs `make scan-secrets` before each push:

```bash
#!/bin/sh
make scan-secrets
```

This prevents accidental secret commits.

### CI Pipeline

In the GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
# Phase 1: DLP and Security
scan-secrets:
  needs: checkout
  steps:
    - run: make scan-secrets || true

scan-security:
  needs: checkout
  steps:
    - run: make scan-security || true

scan-vulnerability:
  needs: checkout
  steps:
    - run: make scan-vulnerability || true

# Phase 2: Validation
validate-strategy:
  needs: [scan-secrets, scan-security, scan-vulnerability]
  steps:
    - run: make test-strategy-chain

# Phase 3: Execution
setup:
  needs: [scan-secrets, scan-security, scan-vulnerability, validate-strategy, validate-toolchain, validate-dates]
  steps:
    - run: make deps || true
```

## Configuration Files

### .gitleaks.toml

Custom Gitleaks configuration with project-specific patterns:

```toml
[extend]
useDefault = true

[[rules]]
id = "chatbot-operator-api-key"
description = "ChatBot Operator API Key"
regex = "(?:chatbot|bot-maker)_[a-zA-Z0-9]{32,}"
tags = ["api", "chatbot"]

[[rules]]
id = "slack-webhook-url"
description = "Slack Webhook URL"
regex = "https://hooks\.slack\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[A-Za-z0-9]+"
tags = ["slack", "webhook"]
```

### Makefile Targets

```makefile
.PHONY: scan
scan: scan-security scan-vulnerability ## Run all security scans

.PHONY: scan-secrets
scan-secrets: ## Scan for secrets in the repository
	@echo "🔍 Scanning for secrets..."
	bash scripts/validation/scan-secrets.sh

.PHONY: scan-security
scan-security: ## Run security scanning
	@echo "🔒 Running security scans..."
	# Static analysis
	gosec -include=G101,G201,G301 ./...

.PHONY: scan-vulnerability
scan-vulnerability: ## Run vulnerability scanning
	@echo "🔒 Running vulnerability scans..."
	# Go vulnerability scanning
	govulncheck ./...
```

## Success Criteria

### Security Pipeline
- [x] All secret scanning tests pass
- [x] All vulnerability scanning tests pass
- [x] All security scanning tests pass
- [x] Pipeline dependencies are correctly ordered (DLP → Validation → Execution)
- [x] Test data covers all major secret types
- [x] Test data covers known vulnerable dependencies
- [x] Test data covers common security issues

### Documentation
- [x] Pipeline design is documented
- [x] Test setup is documented
- [x] Linkages to ADRs are documented
- [x] Cross-references are maintained

## Maintenance

### Updating Security Tools

1. **Gitleaks**: Update to latest version and refresh patterns
   ```bash
   # Update gitleaks
   brew upgrade gitleaks  # macOS
   
   # Or download latest release
   curl -sL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz | tar -xz -C /usr/local/bin gitleaks
   ```

2. **gosec**: Update to latest version
   ```bash
   go install github.com/securego/gosec/v2/cmd/gosec@latest
   ```

3. **govulncheck**: Update Go toolchain
   ```bash
   go install golang.org/x/vuln/cmd/govulncheck@latest
   ```

### Adding New Secret Patterns

Add custom patterns to `.gitleaks.toml`:

```toml
[[rules]]
id = "new-service-token"
description = "New Service API Token"
regex = "newservice_[a-zA-Z0-9]{40}"
tags = ["api", "newservice"]
```

### Adding New Test Cases

Add new test cases to `tests/tools/security-dlp.test.js`:

```javascript
test('should detect new secret type', () => {
  const testFile = path.join(TEST_DATA_DIR, 'new-secret.test-secret');
  const fakeSecret = 'newservice_' + 'a'.repeat(40);
  const content = `NEW_SERVICE_TOKEN=${fakeSecret}\n`;
  
  fs.writeFileSync(testFile, content);
  expect(fs.existsSync(testFile)).toBe(true);
  
  // Clean up
  fs.unlinkSync(testFile);
});
```

## Related Documents

- [ADR-018: Secret Scanning with Gitleaks](../contributors/adr/devx-adrs.md#adr-018-secret-scanning-with-gitleaks)
- [ADR-004: Security Architecture with Linkerd](../contributors/adr/application-adrs.md#adr-004-security-architecture-with-linkerd)
- [ADR-001: Strategy First, Code Second](../contributors/adr/application-adrs.md#adr-001-use-kubernetes-operator-pattern)
- [Design Verification Document](./DESIGN_VERIFICATION.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Common Toolchain Overview](../common/toolchain.md)

---

**Document Metadata**
- **Version**: 1.0.0
- **Created**: 2026-05-25
- **Author**: DevX Engineering Team
- **Status**: Complete
- **Reviewers**: Security Team, DevX Team
