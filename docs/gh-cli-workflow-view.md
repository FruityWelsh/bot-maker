# GitHub CLI: `gh workflow view` Command
# ==========================================
# Documentation for viewing GitHub Actions workflows from CLI
# References: docs/omen/strategy.json (Developer Environment Goal DG001)
# References: docs/adr/architecture-decisions.md (ADR-012 - Platform-agnostic CI/CD)

## Overview

The `gh workflow view` command allows you to view GitHub Actions workflow files and their status directly from the command line. This is useful for:
- Checking workflow configurations without opening the browser
- Viewing workflow YAML content
- Monitoring workflow runs
- Debugging CI/CD issues

## Installation

Ensure you have the GitHub CLI installed:

```bash
# Install GitHub CLI (gh)
# macOS (Homebrew)
brew install gh

# Linux (Debian/Ubuntu)
sudo apt install gh

# Windows (Winget)
winget install --id GitHub.cli

# Authenticate with GitHub
gh auth login
```

## Basic Usage

### View workflow list

```bash
# List all workflows in the repository
gh workflow list

# Output example:
# ChatBot Operator CI    active    282573697
```

### View workflow YAML

```bash
# View the YAML content of a specific workflow
gh workflow view "ChatBot Operator CI" -y

# Or by workflow ID
gh workflow view 282573697 -y

# Or by filename
gh workflow view .github/workflows/ci.yml -y
```

### View workflow in browser

```bash
# Open workflow in browser
gh workflow view "ChatBot Operator CI" -w

# Or by ID
gh workflow view 282573697 -w
```

## Advanced Usage

### View workflow with specific branch

```bash
# View workflow for a specific branch
gh workflow view "ChatBot Operator CI" -r vibe/nodejs-ci-b7fd6b07 -y
```

### View workflow runs

```bash
# List workflow runs
gh run list

# View specific run details
gh run view <run-id>

# View failed runs only
gh run list --json conclusion -q '.[] | select(.conclusion == "failure")'

# View logs for a specific run
gh run view <run-id> --log

# View only failed steps
gh run view <run-id> --log-failed
```

## Common Patterns

### Check if CI is passing

```bash
# Get the most recent run for the main workflow
LATEST_RUN=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')

# Check its status
gh run view $LATEST_RUN --json conclusion -q '.conclusion'

# Full command to check CI status
CI_STATUS=$(gh run list --limit 1 --json conclusion -q '.[0].conclusion')
if [ "$CI_STATUS" = "success" ]; then
    echo "✅ CI is passing"
else
    echo "❌ CI is failing"
fi
```

### Monitor workflow execution

```bash
# Watch workflow runs in real-time
watch -n 10 "gh run list --limit 5"

# Get detailed information about a running workflow
gh run view <run-id> --json status,conclusion -q '{status: .status, conclusion: .conclusion}'
```

### Compare workflows between branches

```bash
# View workflow from main branch
gh workflow view "ChatBot Operator CI" -r main -y > workflow-main.yml

# View workflow from feature branch
gh workflow view "ChatBot Operator CI" -r vibe/feature-branch -y > workflow-feature.yml

# Compare the two
diff workflow-main.yml workflow-feature.yml
```

## Tips and Tricks

### Use JSON output for scripting

```bash
# Get workflow ID by name
gh workflow list --json name,databaseId -q '.[] | select(.name == "ChatBot Operator CI") | .databaseId'

# Get all workflow names
gh workflow list --json name -q '.[].name'
```

### Filter workflow runs

```bash
# Get runs from the last 24 hours
gh run list --created ">2024-01-01" --json createdAt,conclusion

# Get runs for a specific branch
gh run list --branch vibe/nodejs-ci-b7fd6b07

# Get runs with a specific status
gh run list --json conclusion -q '.[] | select(.conclusion == "success")'
```

### View workflow file directly

```bash
# Instead of using gh, you can also view the file directly
cat .github/workflows/ci.yml

# Or use less for pagination
less .github/workflows/ci.yml
```

## Error Handling

### Workflow not found

```bash
# If you get "workflow argument required", specify the workflow name, ID, or filename
gh workflow view "ChatBot Operator CI" -y
```

### Authentication issues

```bash
# Re-authenticate if you get permission errors
gh auth login

# Check your authentication status
gh auth status
```

### Rate limiting

```bash
# If you hit rate limits, use a personal access token
export GITHUB_TOKEN=your_personal_access_token
gh workflow view "ChatBot Operator CI" -y
```

## Integration with Makefile

The ChatBot Operator project includes Makefile targets for common GitHub CLI operations:

```bash
# View GitHub Actions workflow
make github-ci

# This wraps the gh workflow view command
```

## References

- [GitHub CLI Documentation](https://cli.github.com/)
- [gh workflow view documentation](https://cli.github.com/manual/gh_workflow_view)
- [gh run view documentation](https://cli.github.com/manual/gh_run_view)

## See Also

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guidelines
- [.github/workflows/ci.yml](../.github/workflows/ci.yml) - Main CI workflow
- [Makefile](../Makefile) - Platform-agnostic build targets
