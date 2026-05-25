#!/bin/bash
# Secret Scanning Script
# =====================
# Scans the repository for secrets before commit
# References: docs/omen/strategy.json (Security Goal AG004)
# References: docs/adr/architecture-decisions.md (ADR-004 - Security with Linkerd)

set -e

echo "🔍 Scanning for secrets..."
echo "========================"
echo ""

# Fix git ownership issue in CI
if [ -d "/__w" ]; then
    git config --global --add safe.directory "/__w/bot-maker/bot-maker" || true
fi

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)

# Check if gitleaks is installed
if ! command -v gitleaks >/dev/null 2>&1; then
    echo "❌ Gitleaks not found!"
    echo ""
    echo "Install Gitleaks:"
    echo "  macOS: brew install gitleaks"
    echo "  Linux: sudo apt install gitleaks"
    echo "  Or download from: https://github.com/gitleaks/gitleaks"
    echo ""
    echo "Alternatively, install using:"
    echo "  curl -sL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz | tar -xz -C /usr/local/bin gitleaks"
    exit 1
fi

# Check for gitleaks configuration
CONFIG_FILE="$REPO_ROOT/.gitleaks.toml"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "⚠️  Gitleaks configuration not found at $CONFIG_FILE"
    echo "Using default configuration"
    CONFIG_ARG=""
else
    echo "✅ Using custom Gitleaks configuration: $CONFIG_FILE"
    CONFIG_ARG="--config=$CONFIG_FILE"
fi

echo ""

# Run gitleaks scan
if gitleaks detect --source="$REPO_ROOT" --verbose $CONFIG_ARG; then
    echo ""
    echo "✅ No secrets detected!"
    exit 0
else
    echo ""
    echo "❌ Secrets detected!"
    echo ""
    echo "To fix:"
    echo "  1. Remove the secrets from your files"
    echo "  2. Add the secrets to .gitignore if they're in config files"
    echo "  3. Use environment variables or secret managers instead"
    echo ""
    echo "To skip this check for this commit, use:"
    echo "  git commit --no-verify"
    exit 1
fi
