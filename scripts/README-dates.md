# Dynamic Git Commit Date Replacement

This directory contains scripts for dynamically replacing placeholder text with actual Git commit dates in documentation files.

## Overview

The solution automatically replaces the placeholder text `"Generated from Git commit date"` with the actual Git commit date (in ISO format: `YYYY-MM-DD`) in documentation files.

## Components

### 1. `update-commit-dates.sh` - Main Replacement Script

A Bash script that:
- Finds all files containing the placeholder text
- Replaces placeholders with the actual Git commit date from HEAD
- Supports multiple file formats: `.md`, `.yaml`, `.yml`, `.json`, `.txt`
- Excludes script files and common directories (`.git`, `node_modules`, etc.)

#### Usage

```bash
# Replace all placeholders with actual dates
./scripts/update-commit-dates.sh

# Dry run - show what would be changed
./scripts/update-commit-dates.sh --dry-run

# Check mode - verify no placeholders remain (exits 1 if found)
./scripts/update-commit-dates.sh --check

# Verbose mode - show detailed output
./scripts/update-commit-dates.sh --verbose

# Update specific file
./scripts/update-commit-dates.sh --file path/to/file.md
```

#### Options

- `--check`: Check if placeholders exist and report (exit 1 if found)
- `--dry-run`: Show what would be changed without modifying files
- `--verbose`: Show detailed output
- `--all`: Update all files (default)
- `--file <path>`: Update specific file

### 2. Pre-commit Hook

Located at `.git/hooks/pre-commit`, this hook:
- Runs automatically before each commit
- Checks staged files for placeholders
- Automatically replaces placeholders with commit dates
- Stages the updated files for commit

The hook is already installed and executable. To manually install:

```bash
chmod +x .git/hooks/pre-commit
```

### 3. CI/CD Integration

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes a step to run date replacement after checkout:

```yaml
- name: Update Git commit dates in documentation
  run: |
    chmod +x ./scripts/update-commit-dates.sh
    ./scripts/update-commit-dates.sh --verbose
    git diff --name-only || true
```

### 4. Makefile Targets

Two Makefile targets are available:

```bash
# Replace all placeholders with actual dates
make generate-dates

# Check for remaining placeholders (fails if any found)
make check-dates
```

## Implementation Details

### Date Format

The script uses the Git commit date from HEAD in ISO format (`YYYY-MM-DD`):

```bash
Git commit date: $(git log -1 --format="%cd" --date=iso | cut -d' ' -f1)
```

### File Types Supported

- Markdown (`.md`)
- YAML (`.yaml`, `.yml`)
- JSON (`.json`)
- Text (`.txt`)

### Excluded Directories

- `.git/`
- `node_modules/`
- `dist/`
- `build/`
- `scripts/` (to prevent self-modification)

## Testing

The solution has been tested with:

1. **Dry run mode**: Verifies what would be changed
2. **Actual replacement**: Successfully replaces placeholders
3. **Check mode**: Correctly identifies when no placeholders remain
4. **Pre-commit hook**: Automatically processes files before commit
5. **CI/CD integration**: Works in GitHub Actions workflow
6. **Makefile targets**: Both `generate-dates` and `check-dates` work correctly

## Workflow

### For Developers

1. Make changes to documentation files
2. Add files to staging: `git add .`
3. Commit changes: `git commit -m "feat: update documentation"`
   - The pre-commit hook will automatically replace placeholders
   - Updated files will be automatically staged
4. Push changes: `git push`

### For CI/CD

The GitHub Actions workflow automatically runs date replacement on every push and pull request to the `main` and `vibe/*` branches.

### Manual Usage

To manually update all dates:

```bash
make generate-dates
```

To verify no placeholders remain:

```bash
make check-dates
```

## Best Practices

1. **Use placeholders in templates**: When creating new documentation files, use `"Generated from Git commit date"` as the placeholder
2. **Don't manually edit dates**: Let the automation handle date updates
3. **Run check before PR**: Use `make check-dates` to ensure no placeholders remain
4. **Test locally**: Use `--dry-run` to preview changes before committing

## Troubleshooting

### Script not found

Ensure the script is executable:

```bash
chmod +x ./scripts/update-commit-dates.sh
```

### Pre-commit hook not running

Verify the hook is executable:

```bash
chmod +x .git/hooks/pre-commit
```

### Placeholders not being replaced

Check if files are in excluded directories. Use verbose mode:

```bash
./scripts/update-commit-dates.sh --verbose
```

### Wrong date format

The script uses the Git commit date from HEAD. If you need a different format, modify the `get_git_commit_date()` function in the script.

## Related Files

- `scripts/update-commit-dates.sh` - Main replacement script
- `.git/hooks/pre-commit` - Pre-commit hook
- `.github/workflows/ci.yml` - CI/CD workflow
- `Makefile` - Build targets
