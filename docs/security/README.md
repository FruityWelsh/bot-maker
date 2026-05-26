# Security Documentation

This section contains documentation for **Security Reviewers** (both blue team and red team) who need to review the ChatBot Operator and associated plugins for security vulnerabilities. It focuses on security architecture, threat models, compliance requirements, and **CI/CD security scanning**. 

## 🔒 Purpose

Security is a **first-class concern** in the ChatBot Operator project and is enforced at multiple levels: code, CI/CD, deployment, and operations. This documentation provides comprehensive guidance on all security aspects, with a special focus on **CI/CD pipeline security**. 

## 📚 Documentation Contents

| Document | Purpose | Audience |
|----------|---------|----------|
| [Security Architecture](#-security-architecture) | Overview of security layers and principles | All Contributors |
| [Threat Model](#-threat-model) | Threat categories and actors | Security Reviewers |
| [Security Controls](#-security-controls) | Implemented security measures | Security Reviewers |
| [CI/CD Security](#-cicd-security) | **NEW**: Security scanning in pipelines | All Contributors |
| [Compliance Requirements](#-compliance-requirements) | Standards and metrics | Security Reviewers |

## 🔗 Cross-Reference Linkage

Security documentation maintains **hard references** to all relevant security implementations:

```
Strategy → DevX → Core Application → Operations
         → Integrators → Users
         → Security
```

### Upstream References
- **Strategy**: Security requirements from [../strategy/STRATEGY.md](../strategy/STRATEGY.md)
- **DevX**: Security validation in DevX pipelines from [../devx/DESIGN_VERIFICATION.md](../devx/DESIGN_VERIFICATION.md)
- **Core Application**: Security implementation in core from [../contributors/adr/architecture-decisions.md](../contributors/adr/architecture-decisions.md)
- **Operations**: Security deployment from [../operators/README.md](../operators/README.md)
- **Integrators**: Platform security from [../integrators/README.md](../integrators/README.md)

## 🎯 Security Reviewer Responsibilities

### Blue Team (Defensive Security)
- **Architecture Review**: Verify Zero Trust principles are implemented
- **Control Validation**: Ensure security controls are properly configured
- **Compliance Audit**: Verify compliance with defined security standards
- **Incident Response**: Prepare for and respond to security incidents
- **CI/CD Security**: **NEW**: Validate security scanning in pipelines

### Red Team (Offensive Security)
- **Vulnerability Assessment**: Identify potential vulnerabilities
- **Penetration Testing**: Test security controls and defenses
- **Threat Simulation**: Simulate real-world attack scenarios
- **Exploit Development**: Develop and test exploit scenarios
- **Pipeline Testing**: **NEW**: Test CI/CD security controls

## 🛡️ Security Architecture

### Zero Trust Principles
- **Mutual TLS**: All service-to-service communication via Linkerd
- **Service Authentication**: Proper authentication between all components
- **Network Segmentation**: Network policies restrict unnecessary communication
- **Continuous Verification**: Regular verification of service identities
- **Least Privilege**: Minimum necessary permissions for all components

### Security Layers

For the **Secure by Design** principle implementation, see [../common/principles.md#3-secure-by-design](../common/principles.md#3-secure-by-design).

```
┌─────────────────────────────────────┐
│           Application Layer          │
│  ┌─────────┐  ┌─────────┐  ┌─────┐ │
│  │ RBAC    │  │ ABAC    │  │ OPA  │ │
│  └─────────┘  └─────────┘  └─────┘ │
├─────────────────────────────────────┤
│          Service Mesh Layer           │
│  ┌─────────────────────────────────┐ │
│  │        Linkerd (mTLS)            │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│          Network Layer                │
│  ┌─────────────────────────────────┐ │
│  │     Network Policies & Firewall   │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│          CI/CD Layer (NEW)           │
│  ┌─────────────────────────────────┐ │
│  │   Security Scanning Pipeline     │ │
│  │  - Betterleaks (Secrets)        │ │
│  │  - Gosec (Go Security)          │ │
│  │  - Trivy (Vulnerabilities)      │ │
│  │  - Cosign (Signing)             │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│          Infrastructure Layer          │
│  ┌─────────┐  ┌─────────┐  ┌─────┐ │
│  │  RKE2   │  │  K8s    │  │ ... │ │
│  └─────────┘  └─────────┘  └─────┘ │
└─────────────────────────────────────┘
```

## 🔍 Threat Model

### Threat Categories
1. **Authentication Threats**: Credential theft, session hijacking
2. **Authorization Threats**: Privilege escalation, unauthorized access
3. **Network Threats**: Man-in-the-middle, eavesdropping
4. **Data Threats**: Data leakage, tampering, loss
5. **Supply Chain Threats**: Compromised dependencies, malicious packages
6. **Runtime Threats**: Container escape, code injection
7. **CI/CD Threats (NEW)**: Pipeline tampering, secret exposure in logs

### Threat Actors
- **External Attackers**: Unauthorized access from outside
- **Insider Threats**: Malicious or negligent insiders
- **Supply Chain Attackers**: Compromise of dependencies
- **Compromised Systems**: Systems already under attacker control
- **CI/CD Attackers (NEW)**: Attackers targeting the CI/CD pipeline

## 📋 Security Controls

### Authentication & Authorization
- **Mutual TLS**: Service-to-service authentication via Linkerd
- **RBAC**: Role-Based Access Control for Kubernetes resources
- **ABAC**: Attribute-Based Access Control for fine-grained permissions
- **OPA/Gatekeeper**: Policy enforcement for Kubernetes resources

### Network Security
- **Network Policies**: Restrict pod-to-pod communication
- **Service Mesh**: Linkerd for mTLS and traffic management
- **Ingress Control**: Secure ingress with proper authentication
- **Egress Control**: Restrict outbound connections

### Data Security
- **Encryption at Rest**: Encrypt sensitive data in storage
- **Encryption in Transit**: TLS for all external communications
- **Secret Management**: Secure storage and rotation of credentials
- **Data Classification**: Proper handling of sensitive data

### Supply Chain Security
- **SLSA Level 3+**: Supply chain security compliance
- **SBOM Generation**: Software Bill of Materials for all artifacts
- **Vulnerability Scanning**: Regular scanning of all container images
- **Signature Verification**: Verify artifact signatures before deployment

## 🚀 CI/CD Security (NEW)

The CI/CD pipeline implements **multiple layers of security validation** to ensure code quality and prevent security issues from reaching production. All security checks are **HARD BLOCK** - no bypass is allowed.

### Pipeline Security Phases

```
PHASE 0: Build Security Scanner Container
    ↓
PHASE 1: Data Loss Prevention (DLP) - HARD BLOCK
    ├── Secret Scanning (Betterleaks)
    ├── Security Scanning (Gosec)
    └── Vulnerability Scanning (Trivy, Govulncheck)
    ↓
PHASE 2: DLP Tests - HARD BLOCK
    └── DevX Tool Tests (Validates scan jobs)
    ↓
PHASE 3: Validation - HARD BLOCK
    ├── Strategy Chain Validation
    ├── Toolchain Validation
    └── Date Validation
    ↓
PHASE 4: Execution - HARD BLOCK
    ├── Setup Environment
    ├── Linting
    ├── Unit Tests
    └── Build
    ↓
PHASE 5: Artifact Handling
    ├── CNCF Compliance Validation
    ├── Sign Artifacts (Cosign)
    ├── Publish Artifacts
    └── Deploy to Cluster (Manual)
```

### Phase 1: Data Loss Prevention (DLP)

#### 1. Secret Scanning
- **Tool**: [Betterleaks](https://github.com/betterleaks/betterleaks)
- **Configuration**: `.betterleaks.toml`
- **Purpose**: Prevent accidental commitment of secrets
- **CI Job**: `scan-secrets`
- **HARD BLOCK**: Pipeline fails if secrets are detected

**Configuration File**: `.betterleaks.toml`
- Uses default betterleaks configuration with project-specific filters
- Includes allowlists for false positives
- Regularly updated with new secret patterns

**Example Rule**:
```toml
[[rules]]
id = "github-pat"
description = "GitHub Personal Access Token"
regex = "ghp_[0-9a-zA-Z]{36}"
tags = ["github", "token"]
```

#### 2. Security Scanning
- **Tool**: [Gosec](https://github.com/securego/gosec)
- **Configuration**: Default + project-specific rules
- **Purpose**: Static analysis of Go code for security issues
- **CI Job**: `scan-security`
- **HARD BLOCK**: Pipeline fails if security issues are found

**Checks Include**:
- SQL injection vulnerabilities
- Hardcoded credentials
- Insecure cryptographic functions
- Race conditions
- Error handling issues

#### 3. Vulnerability Scanning
- **Tools**:
  - [Trivy](https://github.com/aquasecurity/trivy) - Container and dependency scanning
  - [Govulncheck](https://github.com/golang/vuln) - Go vulnerability database
- **Purpose**: Identify known vulnerabilities in dependencies
- **CI Job**: `scan-vulnerability`
- **HARD BLOCK**: Pipeline fails if vulnerabilities are detected

**Scanning Scope**:
- Go modules (`go.mod`)
- Container images
- Git repository (for malicious commits)

### Phase 2: DLP Tests

**Purpose**: Validate that the security scan jobs themselves are working correctly.

- **Tool Tests**: Verify Betterleaks, Gosec, Trivy configurations
- **CI Job**: `test-tools`
- **HARD BLOCK**: Pipeline fails if scan jobs are misconfigured

### Phase 3: Validation

**Purpose**: Ensure all strategy and toolchain references are valid before execution.

- **Strategy Chain Validation**: Validates references between strategy docs
- **Toolchain Validation**: Validates DevX tool configurations
- **Date Validation**: Ensures no manual dates in documentation
- **CI Jobs**: `validate-strategy`, `validate-toolchain`, `validate-dates`
- **HARD BLOCK**: Pipeline fails if validation fails

### Phase 4: Execution

**Purpose**: Run application tests in a validated environment.

- **Setup Environment**: Installs Go and Node.js dependencies
- **Linting**: Code style and quality checks
- **Unit Tests**: Application functionality tests
- **Build**: Compile the application
- **HARD BLOCK**: Pipeline fails if any step fails

### Phase 5: Artifact Handling

#### CNCF Compliance Validation
- **Purpose**: Ensure compliance with CNCF best practices
- **Tool**: Custom validation scripts
- **CI Job**: `test-cncf-compliance`
- **HARD BLOCK**: Pipeline fails if non-compliant dependencies are detected

**Validation Checks**:
- Only CNCF graduated/incubating projects as dependencies
- CNCF-standard APIs and patterns
- CNCF-compliant configurations

#### Artifact Signing
- **Tool**: [Cosign](https://github.com/sigstore/cosign)
- **Purpose**: Verify integrity and authenticity of build artifacts
- **CI Job**: `sign-artifacts`
- **Process**:
  1. Sign container images with GitHub OIDC identity
  2. Sign binaries and other artifacts
  3. Publish signatures alongside artifacts

**Verification**:
```bash
cosign verify --key cosign.pub ghcr.io/fruitywelsh/bot-maker:latest
```

#### Artifact Publishing
- **CI Job**: `publish-artifacts`
- **Process**:
  1. Build container images
  2. Push to container registry (GitHub Container Registry, Docker Hub)
  3. Generate and publish SBOM

#### Deployment
- **CI Job**: `deploy`
- **Process**: Manual deployment to production cluster
- **Environment**: Production
- **Trigger**: Manual (after all other jobs pass)
- **Condition**: Only on `main` branch

### Security Scanning Configuration

#### Betterleaks Configuration (`.betterleaks.toml`)

The Betterleaks configuration includes:

**Default Rules**:
- AWS access keys
- GitHub tokens
- Slack tokens
- Private keys
- Password patterns
- API keys
- And many more (100+ rule types)
- Bearer tokens

**Custom Rules**:
Project-specific patterns for:
- Internal API keys
- Custom tokens
- Project-specific secrets

**Allowlist**:
False positive exclusions for:
- Test data
- Documentation examples
- Known safe patterns

#### Gosec Configuration

**Enabled Checks**:
- G101: Look for hardcoded credentials
- G104: Look for hardcoded passwords
- G201: SQL injection
- G202: SQL injection via format strings
- G203: SQL injection via string concatenation
- G204: Auditing use of unsafe functions
- G301: Insecure use of MD5
- G302: Insecure use of DES
- G304: File path traversal
- G306: Poor file permissions
- G401: Detect the use of DES
- G402: Look for TLS/SSL weak cipher suites
- G501: Blacklisted import: crypto/md5
- G502: Blacklisted import: crypto/des
- G503: Blacklisted import: crypto/rc4
- G505: Blacklisted import: crypto/sha1

#### Trivy Configuration

**Scanning Targets**:
- Container images
- Go modules
- File system (for malicious files)

**Severity Levels**:
- CRITICAL: Block pipeline
- HIGH: Block pipeline
- MEDIUM: Warn but continue
- LOW: Informational

**Vulnerability Databases**:
- OS packages
- Language packages (Go, Node.js)
- GitHub Security Advisories
- NVD (National Vulnerability Database)

### SBOM Generation

**Tool**: Syft
**Output**: Software Bill of Materials
**Formats**: SPDX, CycloneDX
**CI Integration**: Generated during build process

**SBOM Contents**:
- All dependencies (direct and transitive)
- Licenses
- Vulnerabilities
- Package metadata

**SBOM Usage**:
- Vulnerability management
- License compliance
- Dependency analysis
- Audit trail

### Security in Makefile

The Makefile contains security-related targets:

| Target | Purpose | CI Usage |
|--------|---------|----------|
| `make scan-secrets` | Run Betterleaks secret scanning | Phase 1 |
| `make scan-security` | Run Gosec security scanning | Phase 1 |
| `make scan-vulnerability` | Run Trivy vulnerability scanning | Phase 1 |
| `make test-tools` | Run DevX tool tests | Phase 2 |
| `make test-strategy-chain` | Validate strategy chain | Phase 3 |
| `make test-toolchain` | Validate toolchain | Phase 3 |
| `make test-dates` | Validate dates | Phase 3 |
| `make test-validation` | Run validation tests | Phase 3 |
| `make test-unit` | Run unit tests | Phase 4 |
| `make test-cncf-compliance` | Validate CNCF compliance | Phase 5 |
| `make ci-sign` | Sign artifacts | Phase 5 |
| `make ci-package` | Package artifacts | Phase 5 |
| `make ci-deploy` | Deploy to cluster | Phase 5 |

### Security Metrics in CI

The CI pipeline tracks and reports:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Secret Scan Pass Rate | 100% | Phase 1 |
| Security Scan Pass Rate | 100% | Phase 1 |
| Vulnerability Scan Pass Rate | 100% | Phase 1 |
| Tool Test Pass Rate | 100% | Phase 2 |
| Validation Test Pass Rate | 100% | Phase 3 |
| Unit Test Pass Rate | 100% | Phase 4 |
| CNCF Compliance Score | 100% | Phase 5 |

## 📊 Compliance Requirements

### Standards Compliance
- **SLSA**: Supply Chain Levels for Software Artifacts (Level 3+)
- **CNCF**: Cloud Native Computing Foundation best practices
- **Open Standards**: Use of open, non-proprietary standards
- **Choice Matters**: Support for multiple platforms and tools

### Security Metrics
- **Vulnerability Count**: Number of open vulnerabilities
- **Mean Time to Patch**: Time to remediate vulnerabilities
- **Security Test Coverage**: Coverage of security testing
- **Incident Response Time**: Time to respond to security incidents
- **CI/CD Security Pass Rate**: Percentage of pipelines passing all security checks

## 🎯 Security Review Checklist

### For Blue Team Reviewers
- [ ] Verify Zero Trust principles are implemented
- [ ] Check all service-to-service communication uses mTLS
- [ ] Validate RBAC/ABAC policies are properly configured
- [ ] Confirm network policies restrict unnecessary communication
- [ ] Verify secret management follows best practices
- [ ] Check monitoring covers all security-relevant events
- [ ] **NEW**: Verify CI/CD security scanning is configured correctly
- [ ] **NEW**: Check all HARD BLOCK jobs are properly enforced

### For Red Team Reviewers
- [ ] Attempt to bypass authentication mechanisms
- [ ] Test for privilege escalation vulnerabilities
- [ ] Look for network policy bypasses
- [ ] Test data exfiltration scenarios
- [ ] Attempt supply chain attacks
- [ ] Test runtime container escape scenarios
- [ ] **NEW**: Test CI/CD pipeline security controls
- [ ] **NEW**: Attempt to bypass security scans

## 🚨 Security Incident Response

### Incident Classification
- **Critical**: Active exploitation, data breach, CI/CD compromise
- **High**: Vulnerability with known exploit
- **Medium**: Vulnerability without known exploit
- **Low**: Potential security improvement

### Response Procedures
1. **Detection**: Identify and confirm security incident
2. **Containment**: Limit impact and prevent spread
3. **Eradication**: Remove threat and fix vulnerability
4. **Recovery**: Restore normal operations
5. **Lessons Learned**: Document and improve processes

### CI/CD-Specific Incident Response

**If CI/CD Pipeline is Compromised**:
1. **Immediate Actions**:
   - Rotate all secrets used in CI/CD
   - Revoke all CI/CD tokens
   - Freeze all deployments
   - Isolate CI/CD runners

2. **Investigation**:
   - Review pipeline logs
   - Check for unauthorized changes
   - Audit all recent deployments
   - Verify artifact signatures

3. **Recovery**:
   - Rebuild CI/CD infrastructure from scratch
   - Re-run all security scans
   - Verify all artifacts
   - Resume deployments with enhanced monitoring

4. **Prevention**:
   - Review and tighten CI/CD permissions
   - Add additional security controls
   - Conduct security audit of CI/CD configuration

## 🔗 Related Documentation

- [ADR-004: Security Architecture with Linkerd](../contributors/adr/application-adrs.md#adr-004-security-architecture-with-linkerd)
- [ADR-005: RBAC/ABAC Integration Strategy](../contributors/adr/application-adrs.md#adr-005-rbacabac-integration-strategy)
- [ADR-018: Secret Scanning with Betterleaks](../contributors/adr/devx-adrs.md#adr-018-secret-scanning-with-betterleaks)
- [ADR-019: CNCF Graduated Project Compliance Validation](../contributors/adr/devx-adrs.md#adr-019-cncf-graduated-project-compliance-validation)
- [CI/CD Pipeline Documentation](../devx/IMPLEMENTATION_PLAN.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

## 📋 Security Checklist

### For Developers
- [ ] I have read and understood the security principles
- [ ] I have run `make scan-secrets` before committing
- [ ] I have not committed any secrets or sensitive data
- [ ] I have used GitHub Secrets for sensitive configuration
- [ ] I have followed the least privilege principle
- [ ] I have added security tests for new functionality
- [ ] I have documented security implications in ADRs

### For Reviewers
- [ ] Code does not contain secrets or sensitive data
- [ ] Security scans pass in CI
- [ ] Dependencies are approved and up-to-date
- [ ] Security best practices are followed
- [ ] Security documentation is updated
- [ ] Incident response procedures are clear

### For Maintainers
- [ ] Security vulnerabilities are triaged promptly
- [ ] Dependencies are updated regularly
- [ ] Security reviews are conducted for major changes
- [ ] Incident response procedures are tested
- [ ] Security metrics are tracked and reported

---

**Note**: Security documentation focuses on security architecture and compliance, while all other documentation sections focus on their specific domains with security considerations. The **CI/CD Security** section provides detailed information on the security scanning pipeline that enforces the project's security standards at every stage of development.

**Security Team**: security@bot-maker.example.com
**Emergency Contact**: +1-555-SECURITY (24/7)