#!/bin/bash
# Setup Git Hooks for ChatBot Operator
# ===================================
# This script sets up git hooks for pre-push validation
# References: docs/omen/strategy.json (Developer Environment Goal DG001)
# References: docs/adr/architecture-decisions.md (ADR-012 - Platform-agnostic CI/CD)

set -e

echo "🔧 Setting up Git hooks..."
echo "=========================="
echo ""

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.git/hooks"
SCRIPTS_DIR="$REPO_ROOT/scripts/validation"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Setup pre-push hook
echo "Setting up pre-push hook..."
PRE_PUSH_HOOK="$HOOKS_DIR/pre-push"
PRE_PUSH_SCRIPT="$SCRIPTS_DIR/pre-push-hook.sh"

if [ -f "$PRE_PUSH_HOOK" ]; then
    echo "  ⚠️  Pre-push hook already exists, backing up..."
    mv "$PRE_PUSH_HOOK" "$PRE_PUSH_HOOK.bak"
fi

# Create the pre-push hook
cat > "$PRE_PUSH_HOOK" << 'EOF'
#!/bin/bash
# Pre-push hook for ChatBot Operator
# This runs the pre-push validation script

SCRIPT_DIR="$(dirname "$0")/../../scripts/validation"
if [ -f "$SCRIPT_DIR/pre-push-hook.sh" ]; then
    exec "$SCRIPT_DIR/pre-push-hook.sh"
else
    echo "❌ Pre-push hook script not found!"
    echo "Run: scripts/setup-git-hooks.sh to set up hooks"
    exit 1
fi
EOF

chmod +x "$PRE_PUSH_HOOK"
echo "  ✅ Pre-push hook installed"

echo ""
echo "Git hooks set up successfully!"
echo ""
echo "The pre-push hook will now run validations before each push to:"
echo "  - vibe/* branches"
echo "  - ai-dev branch"
echo ""
echo "Validations include:"
echo "  1. Strategy-to-code chain validation"
echo "  2. Complete toolchain validation"
echo "  3. No manual dates validation"
echo "  4. Validation tests"
echo ""
echo "To skip validation for a specific push, use:"
echo "  git push --no-verify"
