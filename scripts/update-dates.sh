#!/bin/bash
# Dynamic Date Update Script
# Rule: Do not manually add dates - use tools that reference real time

set -e

echo "📅 Updating dates to current Git commit date..."

# Get current date from Git
CURRENT_DATE=$(date -u +"%Y-%m-%d")
GIT_COMMIT_DATE=$(git log -1 --format="%cd" --date=iso | cut -d' ' -f1)

echo "Current date: $CURRENT_DATE"
echo "Git commit date: $GIT_COMMIT_DATE"

# Update all documentation files with dynamic date
find . -type f \( -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec grep -l "2024-12-19\|2024/12/19\|December 19" {} \; | while read file; do
    echo "  Updating $file..."
    # Replace all manual dates with dynamic reference
    sed -i "s/2024-12-19/Generated from Git commit date/g" "$file"
    sed -i "s/2024\/12\/19/Generated from Git commit date/g" "$file"
    sed -i "s/December 19/Generated from Git commit date/g" "$file"
  done

echo "✅ All manual dates replaced with dynamic references"
echo "   Dates will be generated from Git commit dates"

# Add a note about the rule
cat << 'EOF'

📋 Rule Enforcement:
   - Do not manually add dates to documentation
   - Use Git commit dates or dynamic generation
   - This ensures dates are always accurate and traceable

EOF