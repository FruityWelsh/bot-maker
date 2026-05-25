# Strategy & Values Documentation

## 🎯 Purpose

This section contains high-level strategy, goals, values, and metrics documentation for the ChatBot Operator project. It is designed for **Strategy Coders** who need to define and maintain the project's strategic direction without getting into implementation details.

## 📚 Documentation Contents

| Document | Purpose | Audience |
|----------|---------|----------|
| [STRATEGY.md](./STRATEGY.md) | High-level project strategy, vision, and goals | Strategy Coders |
| [omen/strategy.json](./omen/strategy.json) | Omen strategy definition with toolchain and constraints | Strategy Coders |
| [bmml/value-proposition.yaml](./bmml/value-proposition.yaml) | Business Motivation Model with value propositions and stakeholders | Strategy Coders |
| [cubejs/metrics.yaml](./cubejs/metrics.yaml) | Business metrics and success criteria | Strategy Coders |

## 🔗 High-Level Linkage

This strategy documentation maintains **high-level references** to downstream implementation:

```
Strategy → DevX → Core Application → Operations
         → Integrators → Users
         → Security
```

### Downstream References
- **DevX**: Strategy documents reference DevX workflow requirements
- **Core Application**: High-level architecture decisions link to implementation
- **Metrics**: Success criteria are tracked through Cube.js metrics

### What Strategy Coders Need to Know
1. **Goals Alignment**: All implementation must trace back to strategy goals
2. **Constraints**: Implementation must respect defined constraints (C001, C002, etc.)
3. **Validation**: Strategy includes validation rules (V001, V002, etc.) that must be enforced
4. **Metrics**: Success is measured through defined business metrics

### What Strategy Coders Don't Need to Know
- Implementation details of individual components
- Specific code structure or programming patterns
- CI/CD pipeline configuration
- Deployment procedures
- Platform-specific integration details

## 📋 Quick Navigation

### Strategy Definition
- [STRATEGY.md](./STRATEGY.md) - Main strategy document
- [omen/strategy.json](./omen/strategy.json) - Structured strategy with toolchain

### Business Motivation
- [bmml/value-proposition.yaml](./bmml/value-proposition.yaml) - Value propositions and stakeholders

### Success Metrics
- [cubejs/metrics.yaml](./cubejs/metrics.yaml) - Business metrics and targets

## 🎯 Strategy Validation

Strategy documents are validated against:
- Goal identifier patterns (AG001, DG001)
- Constraint identifier patterns (C001)
- Validation rule identifier patterns (V001)
- Proper upstream/downstream references

See [DevX Documentation](../devx/) for validation implementation details.

## 📊 Metrics Dashboard

Strategy success is measured through:
- Bot provisioning time and success rates
- Resource utilization metrics
- Security compliance metrics
- Contribution quality metrics

All metrics are defined in [cubejs/metrics.yaml](./cubejs/metrics.yaml) and tracked through the monitoring system.

---

**Note**: Strategy documentation focuses on the "what" and "why", while DevX and Core Application documentation focus on the "how".