# CI/CD Intermediate Representation - Index

## Overview

This directory contains a complete system for managing CI/CD pipelines across multiple platforms using a single Intermediate Representation (IR) YAML file.

**Key Philosophy: ALL LOGIC IS IN THE MAKEFILE**

## Files

### Core Files

| File | Description | Size |
|------|-------------|------|
| [`cicd-ir.yaml`](cicd-ir.yaml) | Main IR definition | ~15KB |
| [`generate-cicd.py`](generate-cicd.py) | Python generator | ~34KB |
| [`Makefile-cicd`](Makefile-cicd) | Makefile wrapper | ~4KB |

### Documentation

| File | Description |
|------|-------------|
| [`README-CICD-IR.md`](README-CICD-IR.md) | Complete guide |
| [`SUMMARY.md`](SUMMARY.md) | Project summary |
| [`THIN-WRAPPER-APPROACH.md`](THIN-WRAPPER-APPROACH.md) | Philosophy |
| [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) | Quick reference |
| [`VERIFICATION.md`](VERIFICATION.md) | Verification guide |
| [`INDEX.md`](INDEX.md) | This file |

### Utilities

| File | Description |
|------|-------------|
| [`validate-ir.sh`](validate-ir.sh) | Shell validation script |

## Quick Start

```bash
# Generate all configurations
python3 generate-cicd.py --platform all

# Validate
./validate-ir.sh
```

## Pipeline Structure

5 phases, 19 jobs - matching the current GitHub workflow.

See [`SUMMARY.md`](SUMMARY.md) for details.

## Documentation

Reading order:
1. [`SUMMARY.md`](SUMMARY.md) - Overview
2. [`THIN-WRAPPER-APPROACH.md`](THIN-WRAPPER-APPROACH.md) - Philosophy
3. [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) - Commands
4. [`README-CICD-IR.md`](README-CICD-IR.md) - Full guide
5. [`VERIFICATION.md`](VERIFICATION.md) - Testing

## Version

- IR Format: v1.0
- Date: 2026-05-26
- Platforms: GitHub Actions, GitLab CI/CD, Tekton

---

**ALL LOGIC IS IN THE MAKEFILE** 🎯
