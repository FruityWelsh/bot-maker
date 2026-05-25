#!/bin/bash
# Commit Message Validation Script
# =================================
# Validates commit messages against Conventional Commits standard
# References: docs/omen/strategy.json (Constraint C004)
# References: docs/adr/architecture-decisions.md (ADR-012)

set -e

# Get the commit message from stdin or argument
if [ $# -eq 0 ]; then
    # Read from stdin (for git hook usage)
    COMMIT_MSG=$(cat)
else
    # Read from argument
    COMMIT_MSG="$*"
fi

# Remove comments and empty lines for validation
CLEAN_MSG=$(echo "$COMMIT_MSG" | grep -v "^#" | grep -v "^$" | head -1)

echo "📝 Validating commit message..."
echo "================================"
echo "Message: $CLEAN_MSG"
echo ""

# Check if message is empty
if [ -z "$CLEAN_MSG" ]; then
    echo "❌ Commit message is empty!"
    echo ""
    echo "Conventional Commit format:"
    echo "  type(scope): subject"
    echo "  [optional body]"
    echo "  [optional footer]"
    exit 1
fi

# Check for conventional commit pattern
# Pattern: type(scope): subject
# or: type: subject
if ! echo "$CLEAN_MSG" | grep -qE '^[a-z]+(#[0-9]+)?(#[0-9]+)?(\([a-z0-9-]+\))?:\s.+$'; then
    echo "❌ Commit message does not follow Conventional Commits format!"
    echo ""
    echo "Expected format:"
    echo "  type(scope): subject"
    echo "  or: type: subject"
    echo ""
    echo "Valid types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test"
    echo ""
    echo "Examples:"
    echo "  feat: add new feature"
    echo "  fix(operator): resolve crash on startup"
    echo "  docs: update README with installation instructions"
    echo "  chore: update dependencies"
    exit 1
fi

# Extract type
COMMIT_TYPE=$(echo "$CLEAN_MSG" | sed 's/^\([a-z]*\).*/\1/')

# Validate type
VALID_TYPES="build chore ci docs feat fix perf refactor revert style test"
if ! echo "$VALID_TYPES" | grep -qw "$COMMIT_TYPE"; then
    echo "❌ Invalid commit type: $COMMIT_TYPE"
    echo ""
    echo "Valid types: $VALID_TYPES"
    exit 1
fi

echo "✅ Commit type '$COMMIT_TYPE' is valid"

# Check subject length (max 72 characters)
SUBJECT=$(echo "$CLEAN_MSG" | sed 's/^[a-z]*(\([^)]*\)):\s*//')
SUBJECT_LENGTH=${#SUBJECT}

if [ "$SUBJECT_LENGTH" -gt 72 ]; then
    echo "❌ Subject exceeds 72 characters (length: $SUBJECT_LENGTH)"
    echo "Subject: $SUBJECT"
    exit 1
fi

echo "✅ Subject length is within limit (72 chars)"

# Check for trailing period
if echo "$CLEAN_MSG" | grep -q '\.$'; then
    echo "❌ Subject should not end with a period"
    exit 1
fi

echo "✅ Subject does not end with period"

# Check for uppercase in subject (should be lowercase)
SUBJECT_FIRST_CHAR=$(echo "$SUBJECT" | head -c 1)
SUBJECT_REMAINDER=$(echo "$SUBJECT" | tail -c +2)

if ! echo "$SUBJECT_FIRST_CHAR" | grep -q '[a-z]'; then
    echo "❌ Subject should start with lowercase letter"
    exit 1
fi

if echo "$SUBJECT_REMAINDER" | grep -q '[A-Z]'; then
    echo "❌ Subject should be in lowercase (except for proper nouns)"
    echo "Found uppercase: $SUBJECT_REMAINDER"
    exit 1
fi

echo "✅ Subject is in lowercase"

# Check for references to strategy/architecture
if echo "$COMMIT_MSG" | grep -qi 'references:'; then
    echo "✅ Commit includes strategy/architecture references"
else
    echo "⚠️  Consider adding 'References:' to link to strategy documents"
fi

echo ""
echo "✅ All commit message validations passed!"
exit 0
