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
=======
#!/bin/bash
# Setup Git Hooks for ChatBot Operator
# ===================================
# This script sets up git hooks for pre-push and pre-commit validation
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

# Setup pre-commit hook for date replacement
echo "Setting up pre-commit hook for date replacement..."
PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"
UPDATE_SCRIPT="$REPO_ROOT/scripts/update-commit-dates.sh"

if [ -f "$PRE_COMMIT_HOOK" ]; then
    echo "  ⚠️  Pre-commit hook already exists, backing up..."
    mv "$PRE_COMMIT_HOOK" "$PRE_COMMIT_HOOK.bak"
fi

# Create the pre-commit hook
cat > "$PRE_COMMIT_HOOK" << 'PRECOMMIT_EOF'
#!/bin/bash
# Pre-commit Hook for Git Commit Date Replacement
# This hook automatically replaces "Generated from Git commit date" placeholders
# with the actual Git commit date before each commit

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get the directory where this hook is located
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Go up two levels to get the repo root (.git/hooks -> .git -> repo root)
REPO_ROOT="$(dirname "$(dirname "$HOOK_DIR")")"

# Path to the update script
UPDATE_SCRIPT="$REPO_ROOT/scripts/update-commit-dates.sh"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Running pre-commit hook: Date Update${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if the update script exists
if [ ! -f "$UPDATE_SCRIPT" ]; then
    echo -e "${RED}[ERROR]${NC} Update script not found: $UPDATE_SCRIPT"
    echo "This hook requires the update-commit-dates.sh script in the scripts/ directory"
    exit 1
fi

# Check if we have any staged files that contain the placeholder
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(md|yaml|yml|json|txt)$' | grep -v '^scripts/')

if [ -z "$STAGED_FILES" ]; then
    echo -e "${BLUE}[INFO]${NC} No staged documentation files to check"
    exit 0
fi

echo -e "${BLUE}[INFO]${NC} Checking staged files for date placeholders..."

# Check if any staged files contain the placeholder
HAS_PLACEHOLDERS=false
for file in $STAGED_FILES; do
    if grep -q "Generated from Git commit date" "$file" 2>/dev/null; then
        HAS_PLACEHOLDERS=true
        echo -e "${YELLOW}[INFO]${NC} Found placeholder in staged file: $file"
    fi
done

if [ "$HAS_PLACEHOLDERS" = false ]; then
    echo -e "${GREEN}[SUCCESS]${NC} No placeholders found in staged files"
    exit 0
fi

echo ""
echo -e "${BLUE}[INFO]${NC} Running date replacement on staged files..."

# Run the update script
cd "$REPO_ROOT"
if ! "$UPDATE_SCRIPT" --verbose; then
    echo -e "${RED}[ERROR]${NC} Date replacement failed"
    exit 1
fi

echo ""
echo -e "${GREEN}[SUCCESS]${NC} Date placeholders replaced with actual commit dates"

# Show what changed
CHANGED_FILES=$(git diff --name-only)
if [ -n "$CHANGED_FILES" ]; then
    echo ""
    echo -e "${BLUE}[INFO]${NC} Modified files:"
    echo "$CHANGED_FILES" | sed 's/^/  - /'
    
    # Stage the changes
    echo ""
    echo -e "${BLUE}[INFO]${NC} Staging updated files..."
    git add $CHANGED_FILES
    
    echo -e "${GREEN}[SUCCESS]${NC} Changes staged for commit"
fi

exit 0
PRECOMMIT_EOF

chmod +x "$PRE_COMMIT_HOOK"
echo "  ✅ Pre-commit hook installed"

# Setup pre-push hook
echo "Setting up pre-push hook..."===================================
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
echo "The pre-commit hook will now automatically replace 'Generated from Git commit date'"
echo "placeholders with actual Git commit dates before each commit."
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
