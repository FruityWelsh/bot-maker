---
title: ChatBot Operator Architecture Decisions
version: 0.1.0-dev
created: 2026-05-25
author: Strategy Coder
references:
  upstream: ../../../strategy/bmml/value-proposition.yaml
  downstream: ../../../strategy/cubejs/metrics.yaml
---

# Architecture Decision Records

## 📚 ADR Organization

The Architecture Decision Records are now organized into two separate documents for better maintainability and clearer separation of concerns:

### 🏗️ Application ADRs
Focus on the core application architecture and design decisions:
- [Application ADRs](./application-adrs.md) - Core functionality, security, platform integration

### 🛠️ DevX ADRs  
Focus on the development workflow, toolchain, and automation:
- [DevX ADRs](./devx-adrs.md) - CI/CD, testing, documentation, development environment

## 🔗 Complete ADR Index

### Application Architecture Decisions
| ID | Title | Status | Focus |
|----|-------|--------|-------|
| ADR-001 | Use Kubernetes Operator Pattern | ✅ Accepted | Core Architecture |
| ADR-002 | Use Kubebuilder Framework | ✅ Accepted | Core Architecture |
| ADR-003 | Multi-Platform Bot Support Architecture | ✅ Accepted | Core Architecture |
| ADR-004 | Security Architecture with Linkerd | ✅ Accepted | Security |
| ADR-005 | RBAC/ABAC Integration Strategy | ✅ Accepted | Security |
| ADR-008 | Business Metrics with Cube.js | ✅ Accepted | Observability |

### Developer Experience Architecture Decisions
| ID | Title | Status | Focus |
|----|-------|--------|-------|
| ADR-006 | GitOps Workflow Implementation | ✅ Accepted | Deployment |
| ADR-007 | Platform-Agnostic CI/CD Pipeline | ✅ Accepted | CI/CD |
| ADR-009 | Documentation with React-Markdown and Mermaid | ✅ Accepted | Documentation |
| ADR-010 | Behavior-Driven Development with Godog | ✅ Accepted | Testing |
| ADR-011 | JSON Schema Validation with AJV | ✅ Accepted | Validation |
| ADR-012 | Makefile as Single Source of Truth for CI/CD | ✅ Accepted | CI/CD |
| ADR-013 | DevPod for Containerized Development Environment | ✅ Accepted | Development |
| ADR-014 | Pre-push Hooks for Local Validation Gate | ✅ Accepted | Quality Gates |
| ADR-015 | Vale with OpenSUSE Rules for Documentation Linting | ✅ Accepted | Documentation |
| ADR-016 | Stubbed GitLab and Tekton for Local Testing | ✅ Accepted | Testing |
| ADR-017 | Conventional Commits Validation | ✅ Accepted | Git Workflow |
| ADR-018 | Secret Scanning with Betterleaks | ✅ Accepted | Security |
| ADR-019 | CNCF Graduated Project Compliance Validation | ✅ Accepted | Compliance |
| ADR-020 | Strategy First, Code Second | ✅ Accepted | Development Workflow |

## 🎯 ADR Categorization Rationale

### Why Separate Application and DevX ADRs?

1. **Clear Ownership**: Application ADRs are owned by the core development team, while DevX ADRs are owned by the DevX engineering team.

2. **Different Audiences**: 
   - **Application ADRs**: For maintainers and contributors working on core functionality
   - **DevX ADRs**: For DevX engineers and contributors working on toolchain and workflows

3. **Minimized Duplication**: Each ADR is in the most appropriate location, reducing the need to update multiple files when changes occur.

4. **Better Navigation**: Contributors can quickly find the ADRs relevant to their work without sifting through unrelated decisions.

5. **Maintainability**: Changes to application architecture don't require updates to DevX documentation, and vice versa.

## 📋 ADR Template

All ADRs follow this standard template:

```markdown
## ADR-XXX: Title

**Status**: Accepted/Rejected/Deprecated/Proposed   
**Date**: YYYY-MM-DD   
**Context**: Problem statement and background   
**Decision**: The chosen solution   
**Consequences**: 
- ✅ Positive outcomes
- ⚠️ Trade-offs and risks

**References**: 
- Related goals, constraints, or documents
```

## 🔍 ADR Status Definitions

| Status | Description | Usage |
|--------|-------------|-------|
| ✅ Accepted | Decision has been implemented | Current architecture |
| ❌ Rejected | Decision was considered but not chosen | Historical record |
| 🗑️ Deprecated | Decision has been replaced | Obsolete |
| 📝 Proposed | Decision under consideration | Under review |
| 🔄 Superseded | Decision replaced by newer ADR | Historical record |

## 📊 ADR Metrics

| Metric | Application ADRs | DevX ADRs | Total |
|--------|------------------|------------|-------|
| Total ADRs | 6 | 11 | 17 |
| Accepted | 6 | 11 | 17 |
| Rejected | 0 | 0 | 0 |
| Deprecated | 0 | 0 | 0 |

## 🔗 Cross-Reference Navigation

### Application ADRs → DevX ADRs
- ADR-001 (Operator Pattern) enables ADR-007 (CI/CD Pipeline)
- ADR-002 (Kubebuilder) works with ADR-012 (Makefile)
- ADR-003 (Multi-Platform) tested via ADR-010 (Godog)
- ADR-004 (Linkerd) validated by ADR-018 (Betterleaks)
- ADR-005 (RBAC/ABAC) enforced in ADR-017 (Conventional Commits)
- ADR-008 (Cube.js) documented in ADR-009 (React-Markdown)

### DevX ADRs → Application ADRs
- ADR-006 (GitOps) deploys ADR-001 (Operator Pattern)
- ADR-007 (CI/CD) builds ADR-002 (Kubebuilder)
- ADR-009 (Documentation) documents ADR-003 (Multi-Platform)
- ADR-010 (Godog) tests ADR-004 (Linkerd)
- ADR-011 (AJV) validates ADR-005 (RBAC/ABAC)
- ADR-012 (Makefile) orchestrates all ADRs
- ADR-020 (Strategy First) guides all ADRs

## 🎯 Success Criteria

### Application ADRs Success
- **Architecture Stability**: Core architecture decisions remain valid and effective
- **Platform Support**: All supported platforms work correctly
- **Security**: Zero Trust principles are properly implemented
- **Performance**: Bot provisioning and operation meet performance targets

### DevX ADRs Success
- **Developer Experience**: Contributors can easily develop and test changes
- **CI/CD Reliability**: Pipelines run consistently and pass reliably
- **Quality Gates**: All validation and testing catches issues early
- **Documentation**: All documentation is accurate and up-to-date

## 📋 Quick Start

### For Application Developers
Start with [Application ADRs](./application-adrs.md) to understand the core architecture.

### For DevX Engineers
Start with [DevX ADRs](./devx-adrs.md) to understand the development workflow and toolchain.

### For All Contributors
- Review relevant ADRs before making architectural changes
- Reference existing ADRs in merge requests
- Propose new ADRs for significant design decisions
- Update ADRs when decisions change or are replaced

---

**Note**: This document serves as the index for all Architecture Decision Records. The actual ADR content is organized into [Application ADRs](./application-adrs.md) and [DevX ADRs](./devx-adrs.md) for better maintainability and clearer separation of concerns. ADR-020 (Strategy First, Code Second) is the foundational principle that guides all other ADRs.