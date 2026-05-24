#!/bin/bash
# Setup Commit Message Validation Hooks
# ======================================
# Sets up git hooks for Conventional Commits validation
# References: docs/omen/strategy.json (Constraint C004)
# References: docs/adr/architecture-decisions.md (ADR-012)

set -e

echo "🔧 Setting up commit message validation hooks..."
echo "================================================"
echo ""

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.git/hooks"
SCRIPTS_DIR="$REPO_ROOT/scripts/validation"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Setup commit-msg hook
echo "Setting up commit-msg hook..."
COMMIT_MSG_HOOK="$HOOKS_DIR/commit-msg"
COMMIT_MSG_SCRIPT="$SCRIPTS_DIR/validate-commit-message.sh"

if [ -f "$COMMIT_MSG_HOOK" ]; then
    echo "  ⚠️  Commit-msg hook already exists, backing up..."
    mv "$COMMIT_MSG_HOOK" "$COMMIT_MSG_HOOK.bak"
fi

# Create the commit-msg hook
cat > "$COMMIT_MSG_HOOK" << 'EOF'
#!/bin/bash
# Commit-msg hook for ChatBot Operator
# Validates commit messages against Conventional Commits standard

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

SCRIPT_DIR="$(dirname "$0")/../../scripts/validation"
if [ -f "$SCRIPT_DIR/validate-commit-message.sh" ]; then
    echo "$COMMIT_MSG" | "$SCRIPT_DIR/validate-commit-message.sh"
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Commit message validation failed!"
        echo ""
        echo "Please follow Conventional Commits format:"
        echo "  type(scope): subject"
        echo ""
        echo "Valid types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test"
        echo ""
        echo "Examples:"
        echo "  feat: add new feature"
        echo "  fix(operator): resolve crash on startup"
        echo "  docs: update README"
        echo ""
        echo "To skip validation for this commit, use:"
        echo "  git commit --no-verify -m 'your message'"
        exit 1
    fi
else
    echo "❌ Commit message validation script not found!"
    echo "Run: scripts/setup-commit-hooks.sh to set up hooks"
    exit 1
fi
EOF

chmod +x "$COMMIT_MSG_HOOK"
echo "  ✅ Commit-msg hook installed"

# Also update the pre-push hook to include commit message validation
echo ""
echo "Updating pre-push hook to include commit validation..."
PRE_PUSH_HOOK="$HOOKS_DIR/pre-push"
if [ -f "$PRE_PUSH_HOOK" ]; then
    # Add commit validation to pre-push
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
    echo "  ✅ Pre-push hook updated"
fi

echo ""
echo "Commit hooks set up successfully!"
echo ""
echo "The commit-msg hook will now validate commit messages against:"
echo "  - Conventional Commits format"
echo "  - Valid commit types"
echo "  - Subject length (max 72 chars)"
echo "  - Lowercase subject"
echo "  - No trailing period"
echo ""
echo "To skip validation for a specific commit, use:"
echo "  git commit --no-verify -m 'your message'"
echo ""
echo "To test a commit message:"
echo "  echo 'feat: add new feature' | scripts/validation/validate-commit-message.sh"
