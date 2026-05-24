#!/bin/bash
# Setup Vale with OpenSUSE Rules
# ================================
# Downloads and configures Vale with OpenSUSE rules as base
# References: docs/omen/strategy.json (Developer Environment Goal DG001)
# References: docs/adr/architecture-decisions.md (ADR-012 - Platform-agnostic CI/CD)

set -e

echo "📝 Setting up Vale with OpenSUSE rules..."
echo "=========================================="
echo ""

# Create styles directory
mkdir -p .vale/styles

# Download OpenSUSE Vale rules
if [ ! -d ".vale/styles/OpenSUSE" ]; then
    echo "Downloading OpenSUSE Vale rules..."
    git clone https://github.com/openSUSE/vale-style-guide.git .vale/styles/OpenSUSE
    echo "  ✅ OpenSUSE rules downloaded"
else
    echo "  ℹ️  OpenSUSE rules already exist"
fi

# Create a custom styles directory for project-specific rules
mkdir -p .vale/styles/ChatBotOperator

# Create a custom rule for checking references
cat > .vale/styles/ChatBotOperator/References.vale << 'EOF'
# Custom Vale rule for ChatBot Operator
# Checks for proper references between documents

# Rule: Documents should reference strategy
# This is enforced through our validation scripts, but we can add hints
exists["reference"] = yes

# Rule: Check for hard references pattern
# Pattern: "References: docs/" followed by a path
pattern["reference"] = "References: docs/[a-zA-Z0-9_/\-\.]+\.(json|yaml|yml|md|xml)"

# Rule: Check for upstream/downstream references
pattern["upstream"] = "(upstream|downstream): docs/[a-zA-Z0-9_/\-\.]+\.(json|yaml|yml|md|xml)"
EOF

echo "  ✅ Custom rules created"

# Note: Makefile targets for Vale are already defined in the main Makefile

echo ""
echo "✅ Vale setup complete!"
echo ""
echo "To use Vale:"
echo "  1. Install Vale: https://vale.sh/"
echo "  2. Run: make setup-vale (to download OpenSUSE rules)"
echo "  3. Run: make lint-vale (to lint documentation)"
echo ""
echo "Vale will check:"
echo "  - OpenSUSE base rules (spelling, grammar, style)"
echo "  - Custom ChatBot Operator rules (references, terminology)"
echo "  - Custom vocabulary (Kubernetes terms, etc.)"
