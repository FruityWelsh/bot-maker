#!/bin/bash
# Dynamic Git Commit Date Replacement Script
# Replaces placeholder text "Generated from Git commit date" with actual Git commit dates
#
# Usage:
#   ./scripts/update-commit-dates.sh [--check|--dry-run|--verbose]
#
# Options:
#   --check     Check if placeholders exist and report (exit 1 if found)
#   --dry-run   Show what would be changed without modifying files
#   --verbose   Show detailed output
#   --all       Update all files (default)
#   --file <f>  Update specific file
#
# This script is designed to be:
# - Run as a pre-commit hook
# - Run in CI/CD pipelines
# - Run manually for testing

set -euo pipefail

# Default values
DRY_RUN=false
CHECK_MODE=false
VERBOSE=false
TARGET_FILES=()
ALL_FILES=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --check)
            CHECK_MODE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --all)
            ALL_FILES=true
            shift
            ;;
        --file)
            ALL_FILES=false
            TARGET_FILES+=("$2")
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log_info() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Get the Git commit date in ISO format (YYYY-MM-DD)
# Uses the most recent commit date
get_git_commit_date() {
    # Try to get commit date, fall back to current date if not in a git repo
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        # Get the commit date of HEAD
        local commit_date
        commit_date=$(git log -1 --format="%cd" --date=iso | cut -d' ' -f1)
        
        # If we can't get commit date, use current date
        if [ -z "$commit_date" ]; then
            commit_date=$(date -u +"%Y-%m-%d")
        fi
        
        echo "$commit_date"
    else
        # Not in a git repo, use current date
        date -u +"%Y-%m-%d"
    fi
}

# Get the Git commit date in a readable format
get_git_commit_date_readable() {
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        git log -1 --format="%cd" --date=format:"%B %d, %Y"
    else
        date -u +"%B %d, %Y"
    fi
}

# Function to replace placeholders in a file
replace_placeholders_in_file() {
    local file="$1"
    local commit_date
    commit_date=$(get_git_commit_date)
    
    log_info "Processing file: $file"
    
    # Skip script files to avoid self-modification
    if [[ "$file" == scripts/* ]]; then
        log_info "  Skipping script file: $file"
        return 0
    fi
    
    # Check if file contains the placeholder
    if ! grep -q "Generated from Git commit date" "$file" 2>/dev/null; then
        log_info "  No placeholder found in $file"
        return 0
    fi
    
    # Count occurrences
    local count
    count=$(grep -c "Generated from Git commit date" "$file" 2>/dev/null || echo 0)
    log_info "  Found $count placeholder(s) in $file"
    
    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY RUN] Would replace placeholders in $file with: $commit_date"
        return 0
    fi
    
    if [ "$CHECK_MODE" = true ]; then
        echo "  Placeholder found in: $file"
        return 1
    fi
    
    # Create backup
    local backup_file="${file}.bak"
    cp "$file" "$backup_file"
    
    # Replace the placeholder with the actual commit date
    # Handle various formats that might be in the files
    sed -i "s/Generated from Git commit date/$commit_date/g" "$file"
    
    # Verify the replacement
    if [ "$VERBOSE" = true ]; then
        echo "  Replaced placeholders in $file"
        echo "  Before: $(grep -c "Generated from Git commit date" "$backup_file" 2>/dev/null || echo 0) placeholders"
        echo "  After: $(grep -c "Generated from Git commit date" "$file" 2>/dev/null || echo 0) placeholders"
    fi
    
    # Clean up backup
    rm -f "$backup_file"
    
    return 0
}

# Function to find all files with placeholders
find_files_with_placeholders() {
    # Search for files containing the placeholder
    # Exclude .git directory, scripts, and other common exclusions
    # Use || true to prevent grep from causing set -e to exit
    grep -r --include="*.md" --include="*.yaml" --include="*.yml" --include="*.json" --include="*.txt" \
        --exclude-dir=".git" --exclude-dir="node_modules" --exclude-dir="dist" --exclude-dir="build" \
        --exclude-dir="scripts" \
        "Generated from Git commit date" 2>/dev/null | cut -d: -f1 | sort -u || true
}

# Main execution
main() {
    local commit_date
    commit_date=$(get_git_commit_date)
    
    echo "========================================"
    echo "  Git Commit Date Replacement Script"
    echo "========================================"
    echo ""
    echo "Git commit date: $commit_date"
    echo ""
    
    if [ "$CHECK_MODE" = true ]; then
        echo "Checking for placeholder text 'Generated from Git commit date'..."
        echo ""
        
        local files_with_placeholders
        files_with_placeholders=$(find_files_with_placeholders)
        
        if [ -z "$files_with_placeholders" ]; then
            log_success "No placeholders found!"
            exit 0
        else
            log_error "Found placeholders in the following files:"
            echo "$files_with_placeholders"
            exit 1
        fi
    fi
    
    if [ "$ALL_FILES" = true ]; then
        # Find all files with placeholders
        local files
        files=$(find_files_with_placeholders)
        
        if [ -z "$files" ]; then
            log_info "No files with placeholders found"
            log_success "Nothing to update"
            exit 0
        fi
        
        echo "Found files with placeholders:"
        echo "$files"
        echo ""
        
        # Process each file
        local has_errors=false
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                if ! replace_placeholders_in_file "$file"; then
                    has_errors=true
                fi
            fi
        done <<< "$files"
        
        if [ "$has_errors" = true ]; then
            log_error "Some files could not be processed"
            exit 1
        fi
    else
        # Process specific files
        for file in "${TARGET_FILES[@]}"; do
            if [ ! -f "$file" ]; then
                log_error "File not found: $file"
                exit 1
            fi
            replace_placeholders_in_file "$file"
        done
    fi
    
    echo ""
    log_success "Date replacement completed successfully!"
    
    if [ "$DRY_RUN" = false ] && [ "$CHECK_MODE" = false ]; then
        echo ""
        echo "Files updated with commit date: $commit_date"
        
        # Show git status if in a git repo
        if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
            echo ""
            echo "Git status:"
            git status --short
        fi
    fi
}

# Run main function
main "$@"
