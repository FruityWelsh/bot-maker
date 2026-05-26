# CI/CD IR Verification

## Quick Verification

```bash
# 1. Validate IR structure
python3 -c "import yaml; yaml.safe_load(open('cicd-ir.yaml'))" && echo "✅ IR is valid YAML"

# 2. Generate all configs
python3 generate-cicd.py --platform all --output-dir /tmp/verify

# 3. Check generated files exist
ls -la /tmp/verify/.github/workflows/ci.yml /tmp/verify/.gitlab-ci.yml /tmp/verify/.tekton/
```

## Detailed Verification

### 1. IR Structure Validation

```bash
# Check for required sections
grep -E "^(pipeline:|config:|triggers:|phases:|jobs:|platforms:)" cicd-ir.yaml
```

Expected: 6 lines (all sections present)

### 2. Phase Verification

```bash
# Count phases
grep -c "^  - id: phase-" cicd-ir.yaml
```

Expected: `6` (phase-0 through phase-5)

### 3. Job Verification

```bash
# Count jobs
grep -c "make_target:" cicd-ir.yaml
```

Expected: 17+ (most jobs have make_target)

### 4. Thin Wrapper Verification

```bash
# Generate GitHub workflow
python3 generate-cicd.py --platform github --output-dir /tmp/v

# Count make invocations
grep -c "run: make " /tmp/v/.github/workflows/ci.yml
```

Expected: Many lines

### 5. Compare with Original

```bash
# Save original
cp .github/workflows/ci.yml /tmp/original.yml

# Generate new
python3 generate-cicd.py --platform github --output-dir /tmp

# Compare (ignoring comments)
diff -I "^#" /tmp/original.yml /tmp/.github/workflows/ci.yml || echo "Differences found (expected - formatting may differ)"
```

**Note**: Some differences are expected (formatting, comments), but functionality should be identical.

## Verification Checklist

- [ ] IR file is valid YAML
- [ ] All required sections present
- [ ] 6 phases defined
- [ ] 19 jobs defined
- [ ] Most jobs have make_target
- [ ] Generated GitHub workflow is valid YAML
- [ ] Generated GitLab CI is valid YAML
- [ ] Generated Tekton files are valid YAML
- [ ] All generated configs contain "make " commands

## Testing

Test Make targets locally:
```bash
make deps
make ci-lint
make test-unit
make build
```

## Summary

The IR is verified when:
1. All required sections are present
2. All phases and jobs are defined
3. Generated configs are valid YAML
4. Generated configs invoke Make targets
5. Local Make targets work
