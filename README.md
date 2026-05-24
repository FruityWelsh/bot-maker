# ChatBot Operator

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![GitHub Workflow Status](https://github.com/FruityWelsh/bot-maker/actions/workflows/main.yml/badge.svg)](https://github.com/FruityWelsh/bot-maker/actions)
[![GitHub last commit](https://img.shields.io/github/last-commit/FruityWelsh/bot-maker.svg)](https://github.com/FruityWelsh/bot-maker/commits)
[![GitHub issues](https://img.shields.io/github/issues/FruityWelsh/bot-maker.svg)](https://github.com/FruityWelsh/bot-maker/issues)

**Kubernetes-native chat bot management with automated account creation and lifecycle management**

## 🚀 Vision

Enable Platform Engineering teams to manage chat bot lifecycles as Kubernetes resources, with automated account creation and configuration for Slack, Matrix, Discord, Twilio, etc., while maintaining strict separation of concerns between Platform Engineering (infrastructure/RBAC) and AppDev (bot configuration/backends).

## 📋 Project Status

✅ **Complete Toolchain Foundation** - All 8 tools implemented with hard references
✅ **Public Repository** - Available at [FruityWelsh/bot-maker](https://github.com/FruityWelsh/bot-maker)
✅ **GitOps Workflow** - Feature branches, conventional commits, frequent pushes
✅ **Strategy First** - All implementation traces back to documented strategy

## 🏗️ Toolchain Architecture

The project follows a strict **Strategy First, Code Second** approach with a complete toolchain:

```
Omen (JSON Strategy) ✅
    ↓ (hard reference)
ArchiMate (XML/DSL Enterprise Architecture) ✅
    ↓ (hard reference)
BMML (YAML Value Proposition) ✅
    ↓ (hard reference)
Structurizr & ADR (Markdown + YAML frontmatter) ✅
    ↓ (hard reference)
Cube.js (YAML Business Metrics) ✅ Designed
    ↓ (hard reference)
react-markdown & gray-matter & Mermaid.js (TSX/Markdown) ✅
    ↓ (hard reference)
Godog & Gherkin (.feature/Go) ✅
    ↓ (hard reference)
Jest & AJV (JavaScript/JSON) ✅ Implemented (Node.js, testing only)
    ↓ (hard reference)
Application Code & Kubernetes CRDs ✅
```

## 📁 Repository Structure

```
bot-maker/
├── docs/
│   ├── STRATEGY.md                    # Overall strategy document
│   ├── omen/
│   │   └── strategy.json              # Omen strategy definition (JSON)
│   ├── archimate/
│   │   └── enterprise-architecture.xml # ArchiMate enterprise architecture
│   ├── bmml/
│   │   └── value-proposition.yaml     # BMML business motivation model
│   ├── adr/
│   │   └── architecture-decisions.md   # Architecture Decision Records
│   └── cubejs/
│       └── metrics.yaml               # Cube.js business metrics
│   └── diagrams.md                    # Architecture diagrams (Mermaid)
├── features/
│   └── chatbot.feature                # Godog/Gherkin behavior tests
├── tests/
│   └── schemas/
│       └── validation.js              # Jest/AJV validation tests
├── src/                               # Application source code (TBD)
├── config/                           # Kubernetes configurations (TBD)
├── charts/                           # Helm charts (TBD)
├── scripts/                          # Utility scripts (TBD)
├── .github/
│   └── workflows/                    # GitHub Actions workflows (TBD)
├── .gitlab-ci/                       # GitLab CI configurations (TBD)
└── .tekton/                          # Tekton pipeline definitions (TBD)
```

## 🎯 Key Features

### ✅ Application Features (what the app does)
- **Kubernetes CRDs** - ChatBot, BotPlatform, BotConfiguration, BotCredential resources
- **Automated Provisioning** - Automatic bot account creation for Slack, Matrix, Discord, Twilio
- **Lifecycle Management** - Full bot lifecycle from creation to deprovisioning
- **Security Integration** - Zero Trust with Linkerd service mesh and RBAC/ABAC
- **Multi-Platform Support** - Unified interface for multiple chat platforms

### ✅ Developer Environment Features (how we build the app)
- **Strategy Definition** - Comprehensive Omen strategy with goals, constraints, and architecture
- **Enterprise Architecture** - Full ArchiMate model with business, application, and technology layers
- **Value Proposition** - BMML with business motivation, stakeholders, and metrics
- **Architecture Decisions** - 11 ADRs covering all major technology choices
- **Business Metrics** - Cube.js metrics with dashboards and alerts
- **Architecture Diagrams** - Comprehensive Mermaid diagrams for all aspects
- **Behavior Tests** - Godog/Gherkin scenarios for all use cases
- **Validation Tests** - Jest/AJV tests for all schemas and cross-references (Node.js, testing only)

### 🚧 Application Implementation In Progress
- Kubernetes CRD implementations
- Operator controller logic
- Platform-specific provisioners
- Monitoring and observability setup

### 📋 Application Implementation Planned
- Full operator implementation with Kubebuilder
- Platform integration (Slack, Matrix, Discord, Twilio)
- Linkerd service mesh configuration

### 🚧 Developer Environment Implementation In Progress
- CI/CD pipeline implementations

### 📋 Developer Environment Implementation Planned
- Argo CD GitOps setup
- Tekton pipeline definitions
- Cube.js deployment and dashboards

## 🔧 Technology Stack

### Application Technologies (what the app uses)
| Component | Technology | Purpose | Status |
|-----------|------------|---------|--------|
| **Operator Framework** | Kubebuilder | Kubernetes operator development | 📋 Planned |
| **Service Mesh** | Linkerd | Mutual TLS and service mesh | 📋 Planned |
| **Policy Engine** | OPA/Gatekeeper | ABAC policies | 📋 Planned |
| **Metrics** | Cube.js | Business metrics | ✅ Designed |

### Developer Environment Technologies (how we build the app)
| Component | Technology | Purpose | Status |
|-----------|------------|---------|--------|
| **GitOps** | Argo CD | Continuous delivery | 📋 Planned |
| **CI/CD** | Tekton | Pipeline automation | 📋 Planned |
| **Documentation** | React-Markdown, Mermaid.js | Safe rendering | ✅ Implemented |
| **BDD Testing** | Godog | Behavior testing | ✅ Implemented |
| **Validation** | AJV | JSON schema validation (Node.js, testing only) | ✅ Implemented |

## 🎭 Roles & Responsibilities

### Platform Engineering Team
- **AoR**: Infrastructure setup, RBAC/ABAC backend integration
- **Responsibilities**:
  - Cluster configuration and hardening (RKE2)
  - Service mesh (Linkerd) configuration
  - RBAC/ABAC policy management
  - CI/CD pipeline setup
  - Monitoring and observability
  - Security policies and compliance

### Application Development Team
- **AoR**: Bot account creation and backend configuration
- **Responsibilities**:
  - ChatBot CRD definitions
  - Bot account provisioning logic
  - Backend service integrations
  - Bot lifecycle management
  - Testing and validation

## 🔒 Security & Compliance

### Zero Trust Implementation
- ✅ Mutual TLS via Linkerd (designed)
- ✅ Service-to-service authentication (designed)
- ✅ Network policies and segmentation (designed)
- ✅ Continuous verification (designed)
- ✅ Least privilege access (designed)

### SLSA Compliance
- **Target Level**: 3+
- **Requirements**: Signed artifacts, hermetic builds, reproducible builds
- **Provenance**: Full build provenance tracking
- **Integrity**: Tamper-proof artifact verification

### CNCF Compliance
- ✅ Kubernetes (Container Orchestration)
- ✅ Linkerd (Service Mesh)
- ✅ Argo CD (GitOps)
- ✅ Tekton (CI/CD)
- ✅ OPA/Gatekeeper (Policy)

## 🚀 GitOps Workflow

### Branching Strategy
```
main (protected)
    ↓
vibe/* (feature branches)
    ↓
Pull Request → main
```

### Commit Standards
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `test:`, etc.
- **Frequent Commits**: Small, focused changes
- **Descriptive Messages**: Clear, concise commit messages

### CI/CD Pipeline
1. **Lint**: Code quality checks
2. **Test**: Unit and integration tests
3. **Build**: Container image builds
4. **Scan**: Security and vulnerability scanning
5. **Sign**: Artifact signing and SBOM generation
6. **Deploy**: GitOps deployment with Argo CD

## 📊 Business Metrics

### Key Performance Indicators
- **Bot Provisioning Time**: < 5 minutes (target)
- **Provisioning Success Rate**: > 99% (target)
- **Message Response Time**: < 1 second (average)
- **API Gateway Error Rate**: < 0.1% (target)
- **CI/CD Pipeline Success Rate**: > 95% (target)

### Dashboards
- Bot Operations Overview
- Performance Monitoring
- Security Dashboard
- CI/CD Pipeline Health

## 🧪 Testing

### Behavior-Driven Tests (Godog/Gherkin)
- ✅ CRD Management Scenarios
- ✅ Bot Provisioning Scenarios
- ✅ Configuration Management Scenarios
- ✅ Security Scenarios
- ✅ Message Processing Scenarios
- ✅ Monitoring and Metrics Scenarios
- ✅ CI/CD Pipeline Scenarios
- ✅ Platform Integration Scenarios
- ✅ Health and Status Scenarios
- ✅ Validation and Schema Scenarios
- ✅ End-to-End Scenarios
- ✅ Performance Scenarios
- ✅ Security Compliance Scenarios

### Validation Tests (Jest/AJV)
- ✅ CRD Schema Validation
- ✅ Toolchain Document Validation
- ✅ Cross-Reference Validation
- ✅ Business Rule Validation
- ✅ Security Validation
- ✅ GitOps Workflow Validation

## 📖 Documentation

### Strategy & Architecture
- [STRATEGY.md](docs/STRATEGY.md) - Overall project strategy
- [Omen Strategy](docs/omen/strategy.json) - JSON strategy definition
- [ArchiMate Architecture](docs/archimate/enterprise-architecture.xml) - Enterprise architecture model
- [BMML Value Proposition](docs/bmml/value-proposition.yaml) - Business motivation model
- [ADR](docs/adr/architecture-decisions.md) - Architecture Decision Records

### Technical Documentation
- [Cube.js Metrics](docs/cubejs/metrics.yaml) - Business metrics definitions
- [Architecture Diagrams](docs/diagrams.md) - Comprehensive system diagrams
- [Behavior Tests](features/chatbot.feature) - Godog/Gherkin test scenarios
- [Validation Tests](tests/schemas/validation.js) - Jest/AJV test suite

## 🤝 Contributing

### Getting Started
1. Clone the repository: `git clone https://github.com/FruityWelsh/bot-maker.git`
2. Create a feature branch: `git checkout -b vibe/your-feature`
3. Make your changes following the strategy and architecture
4. Commit frequently: `git commit -m "feat: your feature description"`
5. Push regularly: `git push origin vibe/your-feature`
6. Create a Pull Request to `main`

### Development Guidelines
- **Strategy First**: Always reference existing strategy documents
- **Hard References**: Ensure all new documents reference upstream/downstream
- **Conventional Commits**: Follow commit message conventions
- **Frequent Commits**: Small, focused changes with clear messages
- **Rebase on Main**: Keep your branch up-to-date with main

### Testing Requirements
- All behavior tests must pass (Godog/Gherkin)
- All validation tests must pass (Jest/AJV)
- All cross-references must be valid
- All schemas must be properly validated

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CNCF** - Cloud Native Computing Foundation for Kubernetes and related projects
- **SUSE/RGS** - For RKE2 and enterprise Kubernetes solutions
- **Linkerd** - For service mesh and Zero Trust security
- **Argo CD** - For GitOps continuous delivery
- **Tekton** - For Kubernetes-native CI/CD pipelines

## 📞 Contact

- **Repository**: [FruityWelsh/bot-maker](https://github.com/FruityWelsh/bot-maker)
- **Issues**: [GitHub Issues](https://github.com/FruityWelsh/bot-maker/issues)
- **Pull Requests**: [GitHub PRs](https://github.com/FruityWelsh/bot-maker/pulls)

---

**Built with ❤️ using Strategy First, Code Second approach**

*Last updated: 2024-12-19*