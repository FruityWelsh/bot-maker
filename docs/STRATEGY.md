# ChatBot Operator - Strategy Document

## Vision
Build a Kubernetes-native application that enables Platform Engineering teams to manage chat bot lifecycles as Kubernetes resources, with automated account creation and configuration for Slack, Matrix, Discord, Twilio, etc., while maintaining strict separation of concerns between Platform Engineering (infrastructure/RBAC) and AppDev (bot configuration/backends).

## Core Principles
- **Strategy First, Code Second**: All implementation must trace back to documented strategy
- **Clean GitOps Workflow**: Feature branches, frequent commits, rebase on dev, conventional commits
- **Secure by Design**: Zero Trust, Cloud Native (CNCF), SLSA compliance
- **Open Standards**: Choice Matters ethos, platform-agnostic CI/CD
- **Hard Links Required**: Each tool must reference upstream tools in the chain

## Toolchain Architecture

```
Omen (JSON Strategy)
    ↓ (hard reference)
ArchiMate (XML/DSL Enterprise Architecture)
    ↓ (hard reference)
BMML (YAML Value Proposition)
    ↓ (hard reference)
Structurizr & ADR (Markdown + YAML frontmatter)
    ↓ (hard reference)
Cube.js (JavaScript/YAML Business Metrics)
    ↓ (hard reference)
react-markdown & gray-matter & Mermaid.js (TSX/Markdown)
    ↓ (hard reference)
Godog & Gherkin (.feature/Go)
    ↓ (hard reference)
Jest & AJV (TypeScript/JSON)
    ↓ (hard reference)
Application Code & Kubernetes CRDs
```

## Target Environment
- **Cluster**: Hardened RKE2 with Linkerd service mesh
- **Preferences**: SUSE/RGS technologies and partners first
- **Releases**: Open, standards-based
- **CI/CD**: Platform-agnostic, open-source first (GitLab, Forgejo, GitHub, Tekton)

## Roles & Responsibilities

### Application Roles (who uses the app)

#### Platform Engineering Team
- **AoR**: Infrastructure setup, RBAC/ABAC backend integration
- **Category**: Application
- **Responsibilities**:
  - Cluster configuration and hardening
  - RBAC/ABAC policy management
  - Service mesh (Linkerd) configuration
  - Monitoring and observability
  - Security policies and compliance

#### Application Development Team
- **AoR**: Bot account creation and backend configuration
- **Category**: Application
- **Responsibilities**:
  - ChatBot CRD definitions
  - Bot account provisioning logic
  - Backend service integrations
  - Bot lifecycle management
  - Testing and validation

### Developer Environment Roles (who builds the app)

#### DevOps Team
- **AoR**: CI/CD pipeline management and developer tooling
- **Category**: Developer Experience
- **Responsibilities**:
  - CI/CD pipeline setup and maintenance
  - Platform-agnostic pipeline design
  - Open-source tool selection and configuration
  - Build automation and artifact management

#### Platform Architect
- **AoR**: Strategy definition and toolchain architecture
- **Category**: Developer Experience
- **Responsibilities**:
  - Strategy First, Code Second enforcement
  - Toolchain design and hard reference validation
  - Architecture decision documentation
  - Development workflow design

## Security & Compliance
- **Zero Trust**: All communications encrypted, mutual TLS via Linkerd
- **SLSA**: Supply chain security with signed artifacts
- **CNCF Standards**: Cloud Native Computing Foundation best practices
- **FOSS Preferences**: Apache, CNCF, Linux Foundation projects with commercial support

## SDLC Build Process
1. **Strategy Definition** (Omen)
2. **Architecture Mapping** (ArchiMate)
3. **Value Proposition** (BMML)
4. **Architecture Decisions** (Structurizr/ADR)
5. **Metrics Definition** (Cube.js)
6. **Documentation & Diagrams** (react-markdown, Mermaid)
7. **Behavior Testing** (Godog, Gherkin)
8. **Validation & Unit Testing** (Jest, AJV)
9. **Implementation** (Application Code)
10. **CI/CD Automation** (Platform-agnostic pipelines)

## Constraints
- Parse strategy first, write code second
- Match exactly to documented strategy
- No match? No build
- Avoid ambiguity - ask for clarification if uncertain
- Each tool must have hard links to upstream tools
- All changes must be traceable through the toolchain
