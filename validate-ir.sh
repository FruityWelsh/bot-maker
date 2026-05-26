#!/bin/bash
# CI/CD IR Validation Script
# Validates the structure of cicd-ir.yaml

set -e

IR_FILE="${1:-cicd-ir.yaml}"

echo "Validating IR file: $IR_FILE"
echo ""

if [ ! -f "$IR_FILE" ]; then
    echo "❌ Error: File $IR_FILE not found"
    exit 1
fi

if [ ! -r "$IR_FILE" ]; then
    echo "❌ Error: File $IR_FILE is not readable"
    exit 1
fi

if ! grep -q "^pipeline:" "$IR_FILE"; then
    echo "❌ Error: Missing 'pipeline:' section"
    exit 1
fi

echo "✅ File exists and is readable"
echo ""

echo "Checking required sections..."

REQUIRED_SECTIONS=("pipeline:" "config:" "triggers:" "phases:" "jobs:" "platforms:")

for section in "${REQUIRED_SECTIONS[@]}"; do
    if grep -q "^$section" "$IR_FILE"; then
        echo "✅ Found: $section"
    else
        echo "❌ Missing: $section"
        exit 1
    fi
done

echo ""
echo "Checking phases..."

PHASE_COUNT=$(grep -c "^  - id: phase-" "$IR_FILE" || echo "0")
if [ "$PHASE_COUNT" -lt 5 ]; then
    echo "❌ Error: Expected at least 5 phases, found $PHASE_COUNT"
    exit 1
fi
echo "✅ Found $PHASE_COUNT phase(s)"

echo ""
echo "Checking jobs..."

JOB_COUNT=$(grep -c "make_target:" "$IR_FILE" || echo "0")
if [ "$JOB_COUNT" -lt 15 ]; then
    echo "⚠️  Warning: Only $JOB_COUNT jobs have make_target"
fi
echo "✅ Found $JOB_COUNT jobs with make_target"

echo ""
echo "=========================================="
echo "✅ IR validation complete!"
echo "=========================================="
echo ""
echo "For full validation, run: python3 generate-cicd.py --platform all"
