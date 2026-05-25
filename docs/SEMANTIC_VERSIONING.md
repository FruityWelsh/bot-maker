# Semantic Versioning Policy
// ===========================
// **STRICT ENFORCEMENT**: Version numbers MUST follow semantic versioning
// References: docs/omen/strategy.json (Developer Goal DG001)
// References: docs/adr/architecture-decisions.md (ADR-001)
// 
// **Current Version**: 0.1.0-dev (Pre-release - NOT ready for production)
// **Status**: ACTIVE - All version numbers must comply with this policy

## Versioning Rules

### 1. Pre-Release Versioning (Current State)

**Format**: `0.y.z-dev` or `0.y.z-alpha`, `0.y.z-beta`, `0.y.z-rc`

**Rules**:
- **MAJOR version MUST be 0** until first stable release
- **MINOR version** (y) increments for backward-compatible changes
- **PATCH version** (z) increments for backward-compatible bug fixes
- **Suffix** MUST be `-dev`, `-alpha`, `-beta`, or `-rc` for all pre-release versions
- **NO** version should be `1.0.0` or higher until first stable release

**Current State**: `0.1.0-dev`
- This is a pre-release development version
- NOT ready for production use
- API may change without notice
- Breaking changes are expected

### 2. First Stable Release

**Format**: `1.0.0`

**Requirements** (ALL must be met):
- [ ] All design documents complete and verified (DESIGN_VERIFICATION.md)
- [ ] All validation scripts pass
- [ ] Design review and approval obtained
- [ ] Implementation complete and tested
- [ ] Security audit passed
- [ ] CNCF compliance validated
- [ ] Documentation complete
- [ ] All critical bugs fixed
- [ ] Performance benchmarks met
- [ ] Stakeholder sign-off obtained

**Until ALL requirements are met, version MUST remain 0.x.x**

### 3. Post-1.0.0 Versioning

**Format**: `MAJOR.MINOR.PATCH`

**Rules**:
- **MAJOR version**: Incremented for breaking changes
  - API changes that are not backward-compatible
  - CRD schema changes that require migration
  - Security vulnerabilities that require immediate action
  
- **MINOR version**: Incremented for backward-compatible new features
  - New CRDs
  - New API fields (optional, with defaults)
  - New features that don't break existing functionality
  
- **PATCH version**: Incremented for backward-compatible bug fixes
  - Bug fixes
  - Security patches
  - Performance improvements
  - Documentation updates

## Version Number Locations

All version numbers MUST be synchronized:

### Primary Version (Source of Truth)
- **`VERSION`** file - Single source of truth

### Secondary Versions (Must match VERSION)
- **`package.json`** - `version` field
- **`docs/omen/strategy.json`** - `metadata.version`
- **`docs/bmml/value-proposition.yaml`** - `version` field
- **`docs/adr/architecture-decisions.md`** - `version` field
- **`docs/cubejs/metrics.yaml`** - `version` field
- **`docs/diagrams.md`** - `version` field

### API Versions (Separate from release version)
- **`config/crd/bases/*.yaml`** - CRD API versions (e.g., `v1alpha1`, `v1`)
  - These follow Kubernetes API versioning conventions
  - `v1alpha1` = Alpha (may change)
  - `v1beta1` = Beta (stable but may change)
  - `v1` = Stable (backward-compatible)

### Container Images (Follows release version)
- **Docker images**: Should use the release version as tag
- **Development images**: Can use `0.1.0-dev` or commit SHA

## Enforcement

### Automated Checks

1. **Pre-commit Hook** (`scripts/setup-commit-hooks.sh`)
   ```bash
   #!/bin/bash
   # Check that all version numbers match VERSION file
   CURRENT_VERSION=$(cat VERSION)
   
   # Check package.json
   if ! grep -q "\"version\": \"$CURRENT_VERSION\"" package.json; then
     echo "ERROR: package.json version does not match VERSION file"
     exit 1
   fi
   
   # Check docs/omen/strategy.json
   if ! grep -q "\"version\": \"$CURRENT_VERSION\"" docs/omen/strategy.json; then
     echo "ERROR: docs/omen/strategy.json version does not match VERSION file"
     exit 1
   fi
   
   # Check other documentation files
   for file in docs/bmml/value-proposition.yaml docs/adr/architecture-decisions.md docs/cubejs/metrics.yaml docs/diagrams.md; do
     if ! grep -q "version: \"$CURRENT_VERSION\"" "$file" && ! grep -q "version: $CURRENT_VERSION" "$file"; then
       echo "ERROR: $file version does not match VERSION file"
       exit 1
     fi
   done
   ```

2. **CI/CD Check** (`.github/workflows/ci.yml`)
   ```yaml
   - name: Verify version consistency
     run: |
       VERSION=$(cat VERSION)
       # Verify all files have matching version
       grep -r "version.*$VERSION" docs/ package.json || exit 1
   ```

3. **Make Target**
   ```makefile
   .PHONY: verify-versions
   verify-versions: ## Verify all version numbers match VERSION file
   	@echo "Verifying version consistency..."
   	@VERSION=$$(cat VERSION); \
   files="package.json docs/omen/strategy.json docs/bmml/value-proposition.yaml docs/adr/architecture-decisions.md docs/cubejs/metrics.yaml docs/diagrams.md"; \
   for file in $$files; do \
     if ! grep -q "$$VERSION" "$$file"; then \
       echo "ERROR: Version mismatch in $$file"; \
       exit 1; \
     fi; \
   done
   	@echo "✅ All versions match: $$VERSION"
   ```

### Manual Review

Before any release:
1. Run `make verify-versions`
2. Manually verify all version numbers
3. Ensure VERSION file is updated
4. Ensure CHANGELOG.md is updated (if applicable)
5. Get approval from release manager

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1.0-dev | Current | Development | Initial development version |
| 1.0.0 | TBD | Planned | First stable release (requires all criteria met) |

## Changing the Version

### To Update Version

1. **Update VERSION file**
   ```bash
   echo "0.2.0-dev" > VERSION
   ```

2. **Run version synchronization**
   ```bash
   make sync-versions
   ```
   (This would update all secondary version files automatically)

3. **Commit the change**
   ```bash
   git add VERSION package.json docs/
   git commit -m "chore: bump version to 0.2.0-dev"
   ```

4. **Tag the release** (for stable releases only)
   ```bash
   git tag -a v1.0.0 -m "First stable release"
   git push origin v1.0.0
   ```

### Version Bump Script

Create `scripts/bump-version.sh`:
```bash
#!/bin/bash
set -e

NEW_VERSION=$1
if [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <new-version>"
  exit 1
fi

# Validate version format
if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+)?$'; then
  echo "ERROR: Invalid version format. Use MAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH-SUFFIX"
  exit 1
fi

# Check if this is a stable release (no suffix)
if ! echo "$NEW_VERSION" | grep -q '-'; then
  # Check if we're ready for stable release
  if [ "$NEW_VERSION" != "1.0.0" ] && ! grep -q "1.0.0" VERSION 2>/dev/null; then
    echo "ERROR: Cannot release stable version $NEW_VERSION. First stable release must be 1.0.0"
    exit 1
  fi
  
  # For 1.0.0, check requirements
  if [ "$NEW_VERSION" = "1.0.0" ]; then
    echo "WARNING: Releasing 1.0.0 - First stable release"
    echo "Ensure ALL requirements from SEMANTIC_VERSIONING.md are met:"
    echo "  - All design documents complete and verified"
    echo "  - All validation scripts pass"
    echo "  - Design review and approval obtained"
    echo "  - Implementation complete and tested"
    echo "  - Security audit passed"
    echo "  - CNCF compliance validated"
    echo "  - Documentation complete"
    echo "  - All critical bugs fixed"
    echo "  - Performance benchmarks met"
    echo "  - Stakeholder sign-off obtained"
    read -p "Have all requirements been met? (yes/no): " answer
    if [ "$answer" != "yes" ]; then
      echo "Aborting version bump"
      exit 1
    fi
  fi
fi

# Update VERSION file
echo "$NEW_VERSION" > VERSION

# Update package.json
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" package.json

# Update docs/omen/strategy.json
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" docs/omen/strategy.json

# Update YAML files
for file in docs/bmml/value-proposition.yaml docs/adr/architecture-decisions.md docs/cubejs/metrics.yaml; do
  sed -i "s/version: \"[^\"]*\"/version: \"$NEW_VERSION\"/" "$file"
done

# Update docs/diagrams.md
sed -i "s/version: [0-9.]*/version: $NEW_VERSION/" docs/diagrams.md

echo "✅ Version updated to $NEW_VERSION in all files"
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Commit: git add VERSION package.json docs/ && git commit -m \"chore: bump version to $NEW_VERSION\""
echo "  3. For stable releases: git tag -a v$NEW_VERSION -m \"Release $NEW_VERSION\""
```

## Common Mistakes to Avoid

1. **❌ Don't**: Use `1.0.0` before first stable release
2. **❌ Don't**: Use different versions in different files
3. **❌ Don't**: Forget to update VERSION file
4. **❌ Don't**: Bump major version for backward-compatible changes
5. **❌ Don't**: Bump minor version for bug fixes only
6. **✅ Do**: Always use `0.x.x-dev` for development
7. **✅ Do**: Synchronize all version numbers
8. **✅ Do**: Run `make verify-versions` before committing
9. **✅ Do**: Get approval for 1.0.0 release
10. **✅ Do**: Update CHANGELOG.md for releases

## Questions & Answers

**Q: Why can't we use 1.0.0 yet?**
A: Because we haven't met all the requirements for a stable release. The version `1.0.0` signals that the API is stable and production-ready. Until we have design verification, implementation completion, security audit, and stakeholder approval, we cannot claim stability.

**Q: What about CRD versions like v1alpha1?**
A: CRD API versions are separate from release versions. `v1alpha1` means the API is in alpha state and may change. This is Kubernetes convention, not semantic versioning for the project itself.

**Q: When can we use 1.0.0?**
A: Only when ALL requirements in the "First Stable Release" section are met and verified.

**Q: What if we need to make breaking changes before 1.0.0?**
A: That's expected and acceptable. Since we're at `0.x.x`, breaking changes are allowed. Just bump the MINOR version (e.g., from `0.1.0-dev` to `0.2.0-dev`).

**Q: Should we use semantic versioning for documentation?**
A: Yes, all documentation that has version metadata should use the same version as the project.

---

**ENFORCEMENT**: This policy is **MANDATORY**. Any PR that violates these rules will be blocked.
