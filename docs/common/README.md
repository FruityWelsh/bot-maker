# Common Documentation

## 📚 Purpose

This directory contains **shared documentation** that is referenced by multiple audience-specific documentation sections. The goal is to **minimize duplication** and ensure that when information changes, it only needs to be updated in one place.

## 🎯 Principle: DRY Documentation

**Don't Repeat Yourself** - If information applies to multiple audiences or is referenced in multiple documents, it should be placed in this `common/` directory and referenced from the specific documentation.

### When to Use Common Documentation
- **Shared Concepts**: Principles, values, patterns that apply across multiple roles
- **Cross-Cutting Information**: Toolchain, workflows, processes that span multiple areas
- **Reference Material**: Data, specifications, standards that are used by multiple teams
- **Best Practices**: Guidelines that apply to multiple roles or contexts

### When NOT to Use Common Documentation
- **Role-Specific Information**: Information that only applies to one audience
- **Implementation Details**: Specific code or configuration that's unique to one component
- **Procedural Steps**: Step-by-step instructions that are only relevant to one workflow

## 📋 Common Documentation Contents

| Document | Purpose | Referenced By |
|----------|---------|---------------|
| [principles.md](./principles.md) | Core project principles and values | All documentation sections |
| [toolchain.md](./toolchain.md) | Complete toolchain overview and validation | Strategy, DevX, Maintainers, Contributors |

## 🔗 Usage Guidelines

### How to Reference Common Documents

Use **relative paths** from the referencing document:

```markdown
# From strategy/ directory
- See [Core Principles](../common/principles.md) for project values
- For toolchain details, see [Toolchain Documentation](../common/toolchain.md)

# From devx/ directory  
- See [Core Principles](../common/principles.md#1-strategy-first-code-second) for specific principle
- For complete toolchain, see [Toolchain Documentation](../common/toolchain.md)

# From contributors/ directory
- See [Core Principles](../../common/principles.md) for project values
- For toolchain overview, see [Toolchain Documentation](../../common/toolchain.md)
```

### How to Add New Common Documents

1. **Identify Duplication**: Find information that's currently duplicated in multiple places
2. **Create Common Document**: Place the shared information in `docs/common/`
3. **Update References**: Replace duplicated content with references to the common document
4. **Test Links**: Verify all references work correctly from all locations
5. **Document the Change**: Update this README with the new common document

## 📊 Benefits of Common Documentation

### For Documentation Maintainers
- **Single Source of Truth**: Update once, changes propagate everywhere
- **Consistency**: Ensures all references use the same terminology and definitions
- **Easier Maintenance**: Less duplication means less to maintain
- **Better Traceability**: Clear dependencies between documents

### For Documentation Users
- **Consistent Information**: Same information regardless of entry point
- **Better Navigation**: Clear links between related concepts
- **Reduced Confusion**: No conflicting definitions or outdated information
- **Comprehensive Understanding**: Can see how concepts relate across the project

## 🎯 Common Documentation Standards

### Structure
- Each common document should have a clear purpose statement
- Include a **References** section showing where the document is used
- Use consistent formatting and style with the rest of the documentation
- Include a **Last Updated** date and version information

### Content
- Focus on **shared concepts**, not role-specific details
- Avoid **implementation details** that belong in specific documentation
- Use **relative links** for cross-references
- Include **examples** where helpful for understanding

### Maintenance
- Update common documents when shared information changes
- Verify all references still work after changes
- Communicate changes to documentation maintainers
- Review common documents regularly for accuracy

## 📋 Example: Adding a New Principle

### Before (Duplicated)
```markdown
# In strategy/STRATEGY.md
- **New Principle**: All code must follow this new principle

# In devx/README.md  
- **New Principle**: DevX must enforce this new principle

# In maintainers/README.md
- **New Principle**: Maintainers must validate this new principle
```

### After (Common)
```markdown
# In common/principles.md
## 5. New Principle
**Description**: All code must follow this new principle

**References**:
- Strategy: [../strategy/STRATEGY.md](../strategy/STRATEGY.md)
- DevX: [../devx/README.md](../devx/README.md)  
- Maintainers: [../maintainers/README.md](../maintainers/README.md)

# In strategy/STRATEGY.md
- **New Principle**: See [../common/principles.md#5-new-principle](../common/principles.md#5-new-principle)

# In devx/README.md
- **New Principle**: See [../common/principles.md#5-new-principle](../common/principles.md#5-new-principle)

# In maintainers/README.md  
- **New Principle**: See [../common/principles.md#5-new-principle](../common/principles.md#5-new-principle)
```

## 🔍 Current Common Documents

### [principles.md](./principles.md)
- **Purpose**: Define core project principles and values
- **Used By**: All documentation sections
- **Maintainer**: Strategy Coder
- **Last Updated**: 2026-05-25

### [toolchain.md](./toolchain.md)
- **Purpose**: Complete toolchain overview and validation information
- **Used By**: Strategy, DevX, Maintainers, Contributors
- **Maintainer**: DevX Engineer
- **Last Updated**: 2026-05-25

---

**Note**: This directory is the single source of truth for shared documentation. Always reference common documents rather than duplicating information.