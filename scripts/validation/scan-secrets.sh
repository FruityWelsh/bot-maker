#!/bin/bash
# Secret Scanning Script
# =====================
# Scans the repository for secrets before commit
# References: docs/omen/strategy.json (Security Goal AG004)
# References: docs/contributors/adr/architecture-decisions.md (ADR-004 - Security with Linkerd)

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

# Check if betterleaks is installed
if ! command -v betterleaks >/dev/null 2>&1; then
    echo "❌ Betterleaks not found!"
    echo ""
    echo "Install Betterleaks:"
    echo "  macOS: brew install betterleaks"
    echo "  Linux: Download from https://github.com/betterleaks/betterleaks/releases"
    echo "  Or: curl -L https://github.com/betterleaks/betterleaks/releases/latest/download/betterleaks_linux_x86_64.tar.gz | tar -xz -C /usr/local/bin"
    exit 1
fi

# Check for betterleaks configuration
CONFIG_FILE="$REPO_ROOT/.betterleaks.toml"
if [ ! -f "$CONFIG_FILE" ]; then
    # Fallback to gitleaks config for compatibility
    CONFIG_FILE="$REPO_ROOT/.gitleaks.toml"
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo "⚠️  Betterleaks configuration not found at $CONFIG_FILE"
    echo "Using default configuration"
    CONFIG_ARG=""
else
    echo "✅ Using custom Betterleaks configuration: $CONFIG_FILE"
    CONFIG_ARG="--config=$CONFIG_FILE"
fi

echo ""

# Run betterleaks scan
if betterleaks git "$REPO_ROOT" $CONFIG_ARG; then
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
