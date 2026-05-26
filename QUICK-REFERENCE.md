# CI/CD IR - Quick Reference

## TL;DR

**One YAML file** (`cicd-ir.yaml`) defines your entire CI/CD pipeline.
**One command** generates configurations for all platforms.
**ALL LOGIC IS IN THE MAKEFILE**

```bash
# Generate everything
python3 generate-cicd.py --platform all
```

## Pipeline Structure

```
Phase 0: Build Security Scanner Container
    └── build-security-container

Phase 1: DLP and Security (HARD BLOCK)
    ├── scan-secrets
    ├── scan-security
    └── scan-vulnerability

Phase 2: DLP Tests (HARD BLOCK)
    └── test-tools

Phase 3: Validation (HARD BLOCK)
    ├── validate-strategy
    ├── validate-toolchain
    ├── validate-dates
    └── test-validation

Phase 4: Execution (HARD BLOCK)
    ├── setup
    ├── lint
    ├── test-unit
    └── build

Phase 5: Artifact Handling
    ├── test-cncf-compliance
    ├── sign-artifacts
    ├── publish-artifacts
    ├── deploy (manual)
    └── upload (always)
```

## Common Commands

```bash
# Generate all platforms
python3 generate-cicd.py --platform all

# Generate specific platform
python3 generate-cicd.py --platform github
python3 generate-cicd.py --platform gitlab
python3 generate-cicd.py --platform tekton

# Validate IR
python3 -c "import yaml; yaml.safe_load(open('cicd-ir.yaml'))"
./validate-ir.sh

# Use Makefile
make -f Makefile-cicd generate-all
make -f Makefile-cicd validate-ir
make -f Makefile-cicd clean
```

## Make Targets Reference

| Job | Make Target | Purpose |
|-----|-------------|---------|
| build-security-container | build-security-container | Build scanner container |
| scan-secrets | scan-secrets | Secret scanning |
| scan-security | scan-security | Security scanning |
| scan-vulnerability | scan-vulnerability | Vulnerability scanning |
| test-tools | test-tools | Validate scan jobs |
| validate-strategy | test-strategy-chain | Strategy validation |
| validate-toolchain | test-toolchain | Toolchain validation |
| validate-dates | test-dates | Date validation |
| test-validation | test-validation | Validation tests |
| setup | deps | Install dependencies |
| lint | ci-lint | Run linting |
| test-unit | test-unit | Run unit tests |
| build | build | Build application |
| test-cncf-compliance | test-cncf-compliance | CNCF compliance |
| sign-artifacts | ci-sign | Sign artifacts |
| publish-artifacts | ci-package | Package artifacts |
| deploy | ci-deploy | Deploy to cluster |
| upload | (special) | Upload artifacts |

## Troubleshooting

### "ModuleNotFoundError: yaml"
```bash
pip install pyyaml
```

### File not found
```bash
cd /path/to/bot-maker
python3 generate-cicd.py --platform all
```

### Need help?
- Read [`README-CICD-IR.md`](README-CICD-IR.md) for full docs
- Read [`THIN-WRAPPER-APPROACH.md`](THIN-WRAPPER-APPROACH.md) for philosophy
- Read [`SUMMARY.md`](SUMMARY.md) for overview
