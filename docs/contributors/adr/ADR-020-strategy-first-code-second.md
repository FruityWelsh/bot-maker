---
title: ADR-020 - Strategy First, Code Second
author: Strategy Coder
date: 2026-05-25
status: Accepted
---

# ADR-020: Strategy First, Code Second

**Status**: Accepted  
**Date**: 2026-05-25  
**Author**: Strategy Coder  

## Context

The ChatBot Operator project requires a disciplined approach to development where strategic goals and architectural decisions drive implementation, rather than ad-hoc coding. Without a clear strategy-first approach, the project risks:
- Inconsistent architecture across components
- Technical debt from short-term decisions
- Misalignment with business and technical goals
- Difficulty in maintaining and scaling the codebase

## Decision

Adopt the **Strategy First, Code Second** principle as the foundational approach for all development in the ChatBot Operator project. This means:

1. **All development must be traceable to a defined goal** in the strategy documentation
2. **Architecture decisions must be documented** as ADRs before implementation
3. **Implementation must follow** the defined strategy and architecture
4. **Code changes must reference** the relevant strategy goals and ADRs

## Implementation

### Strategy Documentation Structure
```
docs/
├── strategy/
│   ├── omen/strategy.json          # Top-level strategy (Developer Goal DG002)
│   ├── STRATEGY.md                # Core principles
│   └── cubejs/metrics.yaml        # Metrics and success criteria
└── contributors/
    └── adr/
        ├── architecture-decisions.md  # ADR index
        ├── application-adrs.md       # Application ADRs
        └── devx-adrs.md             # DevX ADRs
```

### Development Workflow
1. **Identify Goal**: Find or create a goal in `docs/strategy/` that the feature addresses
2. **Check ADRs**: Review existing ADRs in `docs/contributors/adr/` for relevant decisions
3. **Create ADR**: If no ADR exists for the architectural decision, create one
4. **Reference in Code**: All code changes must reference the relevant goal and ADR in comments
5. **Validate**: Ensure the implementation aligns with the strategy and ADR

### CI/CD Pipeline Alignment
The CI/CD pipeline enforces this principle by:
- Requiring all pipeline phases to be documented in strategy files
- Validating that code references exist for all strategy and ADR references
- Blocking merges if strategy validation fails

## Consequences

### Positive
- ✅ **Consistent Architecture**: All components align with defined goals and decisions
- ✅ **Reduced Technical Debt**: Decisions are made for the long-term
- ✅ **Better Maintainability**: Clear reasoning behind all code changes
- ✅ **Easier Onboarding**: New contributors understand the "why" behind the code
- ✅ **Strategic Alignment**: Development directly supports business goals

### Trade-offs
- ⚠️ **Slower Initial Development**: Requires upfront strategy and documentation
- ⚠️ **Documentation Overhead**: Maintaining strategy docs and ADRs takes time
- ⚠️ **Learning Curve**: Contributors must understand the strategy-first approach

## References
- [Omen Strategy](../../../strategy/omen/strategy.json) - Developer Goal DG002 - Formal Verification
- [Core Strategy Principles](../../../strategy/STRATEGY.md)
- [Implementation Plan](../../../devx/IMPLEMENTATION_PLAN.md)
- [Architecture Decisions Index](./architecture-decisions.md)

## Validation
The `test-strategy-chain` Make target validates that:
1. All code files reference existing strategy goals
2. All ADR references in code point to existing ADR files
3. No code exists without traceable strategy alignment

## Example

### Good Practice
```go
// Strategy: BMML Goal G001 - Kubernetes CRD Development
// ADR: ADR-002 - Use Kubebuilder Framework
// Implements the ChatBot CRD controller
func (r *ChatBotReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    // Implementation...
}
```

### Bad Practice
```go
// TODO: Add better error handling
func (r *ChatBotReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    // Implementation without strategy or ADR references...
}
```

## Supersedes
This ADR formalizes the existing "Strategy First, Code Second" principle that has been informally followed in the project. All previous development should be reviewed to ensure compliance with this ADR.
