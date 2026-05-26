# CI/CD Intermediate Representation - Complete Guide

## 📖 Overview

This system manages CI/CD pipelines across GitHub Actions, GitLab CI/CD, and Tekton using a **single Intermediate Representation (IR) YAML file**.

**Key Philosophy: ALL LOGIC IS IN THE MAKEFILE**

The CI/CD configurations are **thin wrappers** that invoke Make targets. All actual logic (build, test, scan, deploy) lives in the Makefile.

## 🚀 Quick Start

```bash
# Generate all configurations
python3 generate-cicd.py --platform all

# Validate IR
./validate-ir.sh

# Use Makefile
make -f Makefile-cicd generate-all
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Workflow                           │
├─────────────────────────────────────────────────────────────┤
│  1. Edit Makefile (all logic)    2. Update IR    3. Generate CI   │
│                                     (orchestration)    (thin wrappers)│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline Execution                        │
├─────────────────────────────────────────────────────────────┤
│  GitHub Actions ──► make test ──► Makefile: test target            │
│  GitLab CI ───────► make test ──► Makefile: test target            │
│  Tekton ──────────► make test ──► Makefile: test target            │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
.
├── cicd-ir.yaml              # Main IR definition
├── generate-cicd.py          # Python generator
├── Makefile-cicd             # Makefile wrapper
├── INDEX.md                  # File index
├── QUICK-REFERENCE.md         # Quick reference
├── README-CICD-IR.md         # This file
├── SUMMARY.md                # Project summary
├── THIN-WRAPPER-APPROACH.md  # Philosophy
├── VERIFICATION.md           # Verification guide
└── validate-ir.sh             # Shell validation
```

## 📊 Pipeline Structure

### 5 Phases

| Phase | Name | Purpose | Hard Block |
|-------|------|---------|------------|
| 0 | Build Security Scanner Container | Build scanner container first | ✅ |
| 1 | DLP and Security | Early security checks | ✅ |
| 2 | DLP Tests | Validate scan jobs | ✅ |
| 3 | Validation | Strategy & toolchain validation | ✅ |
| 4 | Execution | Build and test application | ✅ |
| 5 | Artifact Handling | Sign, package, deploy | ❌ |

### 19 Jobs

All jobs invoke Make targets. See [`THIN-WRAPPER-APPROACH.md`](THIN-WRAPPER-APPROACH.md) for details.

## 📝 Usage

### Generate Configurations

```bash
# All platforms
python3 generate-cicd.py --platform all

# Specific platform
python3 generate-cicd.py --platform github
python3 generate-cicd.py --platform gitlab
python3 generate-cicd.py --platform tekton

# Custom output directory
python3 generate-cicd.py --platform all --output-dir /tmp/cicd
```

### Use Makefile

```bash
make -f Makefile-cicd generate-all
make -f Makefile-cicd generate-github
make -f Makefile-cicd validate-ir
make -f Makefile-cicd clean
```

### Validate IR

```bash
./validate-ir.sh
python3 -c "import yaml; yaml.safe_load(open('cicd-ir.yaml'))"
```

## 🔄 Making Changes

1. **Add a new Make target** in Makefile
2. **Add the job** to `cicd-ir.yaml` with `make_target`
3. **Add to phase** in `phases` section
4. **Add dependencies** in `make_dependencies`
5. **Generate and test**
6. **Commit IR and generator** (not generated files)

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| [`SUMMARY.md`](SUMMARY.md) | High-level overview |
| [`THIN-WRAPPER-APPROACH.md`](THIN-WRAPPER-APPROACH.md) | Philosophy |
| [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) | Common commands |
| [`VERIFICATION.md`](VERIFICATION.md) | Verification guide |
| [`INDEX.md`](INDEX.md) | File index |

## 🎯 Thin Wrapper Benefits

- ✅ Single source of truth (Makefile)
- ✅ Platform-agnostic
- ✅ Easier maintenance
- ✅ Local dev uses same commands
- ✅ Simpler CI configs
- ✅ Better auditability

## 🔗 References

- [ADR-007: Platform-agnostic CI/CD](docs/contributors/adr/architecture-decisions.md)
- [ADR-012: Platform-agnostic CI/CD](docs/contributors/adr/architecture-decisions.md)
- [Developer Goal DG002](docs/strategy/omen/strategy.json)
- [Strategy First, Code Second](docs/strategy/STRATEGY.md)

---

**ALL LOGIC IS IN THE MAKEFILE** 🎯
