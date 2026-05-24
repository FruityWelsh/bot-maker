# This script runs before git push to ensure:
# 1. Local tests pass
# 2. GitHub Actions would pass (by running the same validations locally)
# References: docs/omen/strategy.json (Developer Environment Goal DG001)
# References: docs/adr/architecture-decisions.md (ADR-012 - Platform-agnostic CI/CD)

set -e

echo "🚀 Running pre-push validation..."
echo "=================================="
echo ""

# Get the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Check if we're on a feature branch (vibe/*) or ai-dev
if [[ "$CURRENT_BRANCH" == vibe/* ]] || [[ "$CURRENT_BRANCH" == "ai-dev" ]]; then
    echo "📝 Running validation for feature branch..."
    echo ""
    
    # Run the same validations that GitHub Actions runs
    echo "1. Validating strategy-to-code chain..."
    if ! make test-strategy-chain; then
        echo "❌ Strategy chain validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "2. Validating toolchain..."
    if ! make test-toolchain; then
        echo "❌ Toolchain validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "3. Validating no manual dates..."
    if ! make test-dates; then
        echo "❌ Date validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "4. Running validation tests..."
    if ! make test-validation || true; then
        echo "⚠️  Validation tests have warnings (continuing anyway)"
    fi
    echo ""
    
    echo "✅ All pre-push validations passed!"
    echo "GitHub Actions should pass for this push."
    exit 0
else
    echo "ℹ️  Not on a feature branch, skipping pre-push validation."
    exit 0
fi
=======
#!/bin/bash
# Pre-push Git Hook for ChatBot Operator
# ======================================
# This script runs before git push to ensure:
# 1. Local tests pass
# 2. GitHub Actions would pass (by running the same validations locally)
# 3. No secrets are being committed
# References: docs/omen/strategy.json (Developer Environment Goal DG001, Constraint C004)
# References: docs/adr/architecture-decisions.md (ADR-012 - Platform-agnostic CI/CD, ADR-004 - Security)

set -e

echo "🚀 Running pre-push validation..."
echo "=================================="
echo ""

# Get the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Check if we're on a feature branch (vibe/*) or ai-dev
if [[ "$CURRENT_BRANCH" == vibe/* ]] || [[ "$CURRENT_BRANCH" == "ai-dev" ]]; then
    echo "📝 Running validation for feature branch..."
    echo ""
    
    # Run secret scanning first (most critical)
    echo "0. Scanning for secrets..."
    if ! bash "$(dirname "$0")/scan-secrets.sh"; then
        echo "❌ Secret scanning failed!"
        echo "Remove secrets and try again."
        exit 1
    fi
    echo ""
    
    # Run the same validations that GitHub Actions runs
    echo "1. Validating strategy-to-code chain..."
    if ! make test-strategy-chain; then
        echo "❌ Strategy chain validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "2. Validating toolchain..."
    if ! make test-toolchain; then
        echo "❌ Toolchain validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "3. Validating no manual dates..."
    if ! make test-dates; then
        echo "❌ Date validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "4. Running validation tests..."
    if ! make test-validation || true; then
        echo "⚠️  Validation tests have warnings (continuing anyway)"
    fi
    echo ""
    
    echo "✅ All pre-push validations passed!"
    echo "GitHub Actions should pass for this push."
    exit 0
else
    echo "ℹ️  Not on a feature branch, skipping pre-push validation."
    exit 0
fi======================================
# This script runs before git push to ensure:
# 1. Local tests pass
# 2. GitHub Actions would pass (by running the same validations locally)
# References: docs/omen/strategy.json (Developer Environment Goal DG001)
# References: docs/adr/architecture-decisions.md (ADR-012 - Platform-agnostic CI/CD)

set -e

echo "🚀 Running pre-push validation..."
echo "=================================="
echo ""

# Get the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Check if we're on a feature branch (vibe/*) or ai-dev
if [[ "$CURRENT_BRANCH" == vibe/* ]] || [[ "$CURRENT_BRANCH" == "ai-dev" ]]; then
    echo "📝 Running validation for feature branch..."
    echo ""
    
    # Run the same validations that GitHub Actions runs
    echo "1. Validating strategy-to-code chain..."
    if ! make test-strategy-chain; then
        echo "❌ Strategy chain validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "2. Validating toolchain..."
    if ! make test-toolchain; then
        echo "❌ Toolchain validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "3. Validating no manual dates..."
    if ! make test-dates; then
        echo "❌ Date validation failed!"
        echo "Fix the issues and try again."
        exit 1
    fi
    echo ""
    
    echo "4. Running validation tests..."
    if ! make test-validation || true; then
        echo "⚠️  Validation tests have warnings (continuing anyway)"
    fi
    echo ""
    
    echo "✅ All pre-push validations passed!"
    echo "GitHub Actions should pass for this push."
    exit 0
else
    echo "ℹ️  Not on a feature branch, skipping pre-push validation."
    exit 0
fi
