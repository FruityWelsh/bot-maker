# Toolchain Documentation

## 🔧 Project Toolchain

This document provides a comprehensive overview of the ChatBot Operator toolchain, which is used across multiple documentation sections. When toolchain information is needed in multiple places, reference this document instead of duplicating the content.

## 📋 Toolchain Overview

The ChatBot Operator uses a **strategy-first toolchain** that ensures all implementation traces back to documented strategy and architecture decisions.

### Toolchain Flow

```
Strategy & Architecture
    ↓ (defines requirements)
Developer Experience
    ↓ (enforces validation)
Core Application
    ↓ (implements functionality)
Operations & Deployment
    ↓ (deploys to production)

Parallel Paths:
    ↓
Platform Integration → User Configuration
    ↓
Security Review → Compliance Validation
```

## 🎯 Toolchain by Phase

### Phase 1: Strategy & Architecture (Strategy Coder)
**Purpose**: Define high-level strategy, goals, constraints, and architecture

| Tool | Format | Purpose | Output |
|------|--------|---------|--------|
| [Omen](https://github.com/improving-flow/omen) | JSON | Strategy definition | Strategy documents with goals, constraints, validation rules |
| [ArchiMate](https://www.archimatetool.com/) | XML/DSL | Enterprise architecture | Architecture models with elements, relationships, views |
| [BMML](https://www.omg.org/spec/BMML/) | YAML | Business motivation | Value propositions, stakeholders, influencers |

**References**:
- Strategy: [../strategy/STRATEGY.md](../strategy/STRATEGY.md)
- Omen Schema: [../strategy/omen/strategy.json](../strategy/omen/strategy.json)
- ArchiMate Schema: [../contributors/archimate/enterprise-architecture.xml](../contributors/archimate/enterprise-architecture.xml)
- BMML Schema: [../strategy/bmml/value-proposition.yaml](../strategy/bmml/value-proposition.yaml)

### Phase 2: Design & Documentation (All Roles)
**Purpose**: Document design decisions and create visual documentation

| Tool | Format | Purpose | Output |
|------|--------|---------|--------|
| [Structurizr](https://structurizr.com/) | DSL | Software architecture | C4 model diagrams and documentation |
| [ADR](https://adr.github.io/) | Markdown | Architecture decisions | Architecture Decision Records with context, decisions, consequences |
| [Mermaid.js](https://mermaid.js.org/) | Markdown | Diagramming | Flowcharts, sequence diagrams, class diagrams, C4 diagrams |

**References**:
- ADR Template: [../contributors/adr/architecture-decisions.md](../contributors/adr/architecture-decisions.md)
- Diagrams: [../contributors/diagrams.md](../contributors/diagrams.md)

### Phase 3: Metrics & Analytics (Strategy Coder, DevX Engineer)
**Purpose**: Define and track business metrics and success criteria

| Tool | Format | Purpose | Output |
|------|--------|---------|--------|
| [Cube.js](https://cube.dev/) | YAML | Business metrics | Metrics definitions, targets, data sources |

**References**:
- Metrics: [../strategy/cubejs/metrics.yaml](../strategy/cubejs/metrics.yaml)

### Phase 4: Testing & Validation (DevX Engineer, Maintainers)
**Purpose**: Validate implementation against requirements

| Tool | Format | Purpose | Output |
|------|--------|---------|--------|
| [Godog](https://github.com/cucumber/godog) | Gherkin | Behavior-driven testing | Feature files, step definitions, test scenarios |
| [Gherkin](https://cucumber.io/docs/gherkin/) | Feature files | Test scenarios | Feature files with Given/When/Then steps |
| [Jest](https://jestjs.io/) | JavaScript | Unit testing | Test suites, assertions, mocks |
| [AJV](https://ajv.js.org/) | JSON Schema | Schema validation | JSON Schema validation for all document formats |

**References**:
- Validation Tests: [../../tests/schemas/validation.js](../../tests/schemas/validation.js)
- Gherkin Schema: [../../tests/schemas/gherkin-schema.json](../../tests/schemas/gherkin-schema.json)

### Phase 5: Developer Experience (DevX Engineer)
**Purpose**: Automate workflows and enforce quality

| Tool | Format | Purpose | Output |
|------|--------|---------|--------|
| [GitHub Actions](https://github.com/features/actions) | YAML | CI/CD automation | Workflow files, jobs, steps |
| [GitLab CI](https://docs.gitlab.com/ee/ci/) | YAML | CI/CD automation | Pipeline files, jobs, stages |
| [Tekton](https://tekton.dev/) | YAML | CI/CD automation | Pipeline resources, tasks, pipelines |

**References**:
- CI Pipeline: [../../.github/workflows/ci.yml](../../.github/workflows/ci.yml)

### Phase 6: Core Application (Maintainers, Contributors)
**Purpose**: Implement the operator functionality

| Tool | Format | Purpose | Output |
|------|--------|---------|--------|
| [Kubebuilder](https://book.kubebuilder.io/) | Go | Kubernetes operator SDK | CRDs, controllers, webhooks |
| [Kubernetes API](https://kubernetes.io/docs/reference/kubernetes-api/) | Go | Kubernetes resources | Custom Resource Definitions |

**References**:
- CRD Schemas: [../../tests/schemas/chatbot-crd.json](../../tests/schemas/chatbot-crd.json)

## 🔗 Toolchain Validation Chain

The toolchain includes a comprehensive validation system that ensures all documents and code maintain proper traceability:

```
Strategy Documents (Omen)
    ↓ Validates against
Strategy Schema (JSON Schema)
    ↓ References
Architecture Documents (ArchiMate)
    ↓ Validates against
Architecture Schema (XSD)
    ↓ References
Business Motivation (BMML)
    ↓ Validates against
BMML Schema (JSON Schema)
    ↓ References
Architecture Decisions (ADR)
    ↓ Validates against
ADR Schema (JSON Schema)
    ↓ References
Metrics (Cube.js)
    ↓ Validates against
Cube.js Schema (JSON Schema)
    ↓ References
Diagrams (Mermaid.js)
    ↓ Validates against
Diagrams Schema (JSON Schema)
    ↓ References
Feature Files (Gherkin)
    ↓ Validates against
Gherkin Schema (JSON Schema)
    ↓ References
CRD Definitions
    ↓ Validates against
CRD Schemas (JSON Schema)
```

## 📋 Toolchain Position Matrix

| Position | Tool | Purpose | Schema | Validation |
|----------|------|---------|--------|------------|
| 1 | Omen | Strategy definition | JSON Schema | ✅ Required |
| 2 | ArchiMate | Enterprise architecture | XSD | ✅ Required |
| 3 | BMML | Business motivation | JSON Schema | ✅ Required |
| 4 | Structurizr & ADR | Architecture decisions | JSON Schema | ✅ Required |
| 5 | Cube.js | Business metrics | JSON Schema | ✅ Required |
| 6 | Mermaid.js | Architecture diagrams | JSON Schema | ✅ Required |
| 7 | Godog & Gherkin | Behavior-driven tests | JSON Schema | ✅ Required |
| 8 | Jest & AJV | Unit tests & validation | JSON Schema | ✅ Required |

## 🎯 Toolchain Responsibilities by Role

| Role | Tools Used | Responsibility |
|------|------------|----------------|
| Strategy Coder | Omen, ArchiMate, BMML, Cube.js | Define strategy, architecture, metrics |
| DevX Engineer | All tools | Design workflows, enforce validation |
| Maintainer | All tools | Validate code, ensure quality |
| Contributor | All tools | Implement features, write tests |
| Platform Engineer | Operations tools | Deploy, configure, monitor |
| Chat Platform Integrator | Integration tools | Develop platform plugins |
| End User | User tools | Configure, use bots |
| Security Reviewer | All tools | Audit, test, validate security |

## 📊 Toolchain Success Metrics

| Metric | Tool | Target | Measurement |
|--------|------|--------|-------------|
| Strategy Coverage | Omen | 100% | % of code traceable to strategy |
| Architecture Completeness | ArchiMate | 100% | % of components documented |
| Validation Coverage | AJV | 100% | % of documents with schema validation |
| Test Coverage | Jest, Godog | >80% | % of code covered by tests |
| CI Success Rate | GitHub Actions | >95% | % of CI runs that pass |
| Merge Time | Git workflow | <24h | Average time from PR to merge |

## 🔧 Toolchain Configuration

### Schema Locations
All toolchain schemas are located in [../../tests/schemas/](../../tests/schemas/):

- **Strategy**: `omen-strategy-schema.json`
- **Architecture**: `archimate-schema.xsd`
- **Business Motivation**: `bmml-schema.json`
- **ADR**: `adr-schema.json`
- **Metrics**: `cubejs-schema.json`
- **Diagrams**: `diagrams-schema.json`
- **Testing**: `gherkin-schema.json`
- **CRDs**: `chatbot-crd.json`, `botplatform-crd.json`, etc.

### Validation Commands
```bash
# Validate all schemas
npm run test:validation

# Check strategy chain
npm run check:strategy

# Check toolchain positions
npm run check:toolchain

# Check dates
npm run check:dates

# Check versions
npm run check:versions
```

## 📋 Toolchain Best Practices

### For Strategy Coders
- Define clear, measurable goals
- Document constraints and validation rules
- Maintain proper upstream/downstream references
- Use standard identifiers (AG001, C001, V001, etc.)

### For DevX Engineers
- Enforce all strategy rules in CI/CD
- Maintain schema validation for all document formats
- Ensure cross-reference validation between documents
- Automate as much validation as possible

### For Maintainers
- Validate all merge requests against toolchain requirements
- Ensure proper traceability from code to strategy
- Maintain toolchain documentation
- Monitor toolchain health metrics

### For Contributors
- Follow established toolchain patterns
- Use provided schemas for all documents
- Maintain proper references between documents
- Update toolchain documentation when adding new tools

---

**Note**: This document is the single source of truth for toolchain information. All other documentation should reference this document rather than duplicating toolchain details.