#!/bin/bash
# Version Bump Script
# ===================
# Bumps the version across all files that contain version information
# References: docs/SEMANTIC_VERSIONING.md (Version Bump Script)
# 
# Usage: ./scripts/bump-version.sh <new-version>
# Example: ./scripts/bump-version.sh 0.2.0-dev
# Example: ./scripts/bump-version.sh 1.0.0

set -e

# Check if version argument is provided
NEW_VERSION=$1
if [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <new-version>"
  echo "Example: $0 0.2.0-dev"
  echo "Example: $0 1.0.0"
  exit 1
fi

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Validate version format
if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z]+[0-9]*)?$'; then
  echo "❌ ERROR: Invalid version format. Use MAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH-SUFFIX"
  echo "   Examples: 0.1.0-dev, 0.2.0-alpha, 1.0.0, 2.3.4-rc1"
  exit 1
fi

# Check if this is a stable release (no suffix like -dev, -alpha, -beta, -rc)
if ! echo "$NEW_VERSION" | grep -qE '-[a-zA-Z]+'; then
  # This is a stable release
  echo "🎯 STABLE RELEASE DETECTED: $NEW_VERSION"
  
  # Check if this is 1.0.0 (first stable release)
  if [ "$NEW_VERSION" = "1.0.0" ]; then
    echo "⚠️  WARNING: Releasing 1.0.0 - First stable release"
    echo ""
    echo "📋 Ensure ALL requirements from docs/SEMANTIC_VERSIONING.md are met:"
    echo ""
    echo "  ✓ All design documents complete and verified (DESIGN_VERIFICATION.md)"
    echo "  ✓ All validation scripts pass"
    echo "  ✓ Design review and approval obtained"
    echo "  ✓ Implementation complete and tested"
    echo "  ✓ Security audit passed"
    echo "  ✓ CNCF compliance validated"
    echo "  ✓ Documentation complete"
    echo "  ✓ All critical bugs fixed"
    echo "  ✓ Performance benchmarks met"
    echo "  ✓ Stakeholder sign-off obtained"
    echo ""
    
    # Check if DESIGN_VERIFICATION.md exists and is complete
    if [ ! -f "docs/DESIGN_VERIFICATION.md" ]; then
      echo "❌ ERROR: docs/DESIGN_VERIFICATION.md not found"
      exit 1
    fi
    
    # Check if all verification checkboxes are checked
    if ! grep -q "\- \[x\] Formal verification document complete" docs/DESIGN_VERIFICATION.md; then
      echo "❌ ERROR: Formal verification not complete in DESIGN_VERIFICATION.md"
      exit 1
    fi
    
    # Check if implementation plan exists
    if [ ! -f "docs/IMPLEMENTATION_PLAN.md" ]; then
      echo "❌ ERROR: docs/IMPLEMENTATION_PLAN.md not found"
      exit 1
    fi
    
    read -p "Have ALL requirements been met and verified? (yes/no): " answer
    case "$answer" in
      [yY][eE][sS])
        echo "✅ Proceeding with 1.0.0 release..."
        ;;
      *)
        echo "❌ Aborting version bump"
        exit 1
        ;;
    esac
  else
    # Not 1.0.0, check if we're skipping to a higher stable version
    if [ "$NEW_VERSION" != "1.0.0" ]; then
      echo "❌ ERROR: Cannot release stable version $NEW_VERSION. First stable release must be 1.0.0"
      exit 1
    fi
  fi
else
  # This is a pre-release version
  echo "📦 PRE-RELEASE VERSION: $NEW_VERSION"
  
  # Check if version starts with 0 (pre-release)
  MAJOR=$(echo "$NEW_VERSION" | cut -d. -f1)
  if [ "$MAJOR" != "0" ]; then
    echo "❌ ERROR: Pre-release versions must have MAJOR version 0 (e.g., 0.x.x-dev)"
    exit 1
  fi
fi

# Get current version
CURRENT_VERSION=$(cat VERSION 2>/dev/null || echo "0.0.0-dev")

echo ""
echo "🔄 Bumping version from $CURRENT_VERSION to $NEW_VERSION"
echo ""

# Update VERSION file
echo "$NEW_VERSION" > VERSION
echo "✅ Updated VERSION file"

# Update package.json
if [ -f "package.json" ]; then
  sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" package.json
  echo "✅ Updated package.json"
fi

# Update docs/omen/strategy.json
if [ -f "docs/omen/strategy.json" ]; then
  sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" docs/omen/strategy.json
  echo "✅ Updated docs/omen/strategy.json"
fi

# Update YAML files
for file in docs/bmml/value-proposition.yaml docs/adr/architecture-decisions.md docs/cubejs/metrics.yaml; do
  if [ -f "$file" ]; then
    sed -i "s/version: \"[^\"]*\"/version: \"$NEW_VERSION\"/" "$file"
    echo "✅ Updated $file"
  fi
done

# Update docs/diagrams.md (may use version: without quotes)
if [ -f "docs/diagrams.md" ]; then
  sed -i "s/version: [0-9.]*$/version: $NEW_VERSION/" docs/diagrams.md
  echo "✅ Updated docs/diagrams.md"
fi

echo ""
echo "🎉 Version updated to $NEW_VERSION in all files"
echo ""
echo "📝 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Verify versions: make verify-versions"
echo "  3. Commit: git add VERSION package.json docs/ && git commit -m \"chore: bump version to $NEW_VERSION\""
if ! echo "$NEW_VERSION" | grep -qE '-[a-zA-Z]+'; then
  echo "  4. Tag (stable release): git tag -a v$NEW_VERSION -m \"Release $NEW_VERSION\""
  echo "  5. Push tag: git push origin v$NEW_VERSION"
fi
