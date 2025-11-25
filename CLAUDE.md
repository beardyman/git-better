# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`git-better` is a CLI tool suite that extends git with workflow-aware commands for managing branches. It provides opinionated workflows that automatically handle branch creation, updates, finishing, and promotion while ensuring base branches are up-to-date. The tool is installed globally via npm and registers custom git commands that users can run from any git repository.

## Development Commands

### Testing
```bash
npm test                    # Run all tests with coverage
npm run test:base           # Run tests without coverage
npm run test:dev            # Run tests in watch mode with coverage
```

To run a single test file:
```bash
npx mocha test/unit/path/to/test.spec.js
```

### Linting
```bash
npm run lint                # Run ESLint with auto-fix
```

### Building/Installing
The project doesn't require a build step. To test locally:
```bash
npm link                    # Install commands globally for testing
```

## Architecture

### Configuration System

The configuration system is layered and merge-based:

1. **Default config** (`src/config/default.json`) - Base defaults
2. **Global config** (`~/.gbrc.json` or `~/.gbrc.js`) - User-wide settings
3. **Repo config** (`<repo-root>/.gbrc.json` or `<repo-root>/.gbrc.js`) - Per-repository settings

Configs are merged with lodash's `_.merge()`, with repo config overriding global config, which overrides defaults. The config is cached in memory after first load (`src/config/index.js`).

**Key config properties:**
- `defaultBase` - Default base branch (usually "main")
- `defaultRemote` - Remote to push/pull from (usually "origin")
- `alwaysPush` - Whether to automatically push after operations
- `workflows` - Object mapping namespace to workflow config (from/to branches)
- `promotionPaths` - Object mapping source branch to target branch for promotions

### Branch Model

The `Branch` class (`src/model/branch.js`) parses and represents git branch names with namespace and version support:

- **Simple branch**: `feature-name` → `{branch: "feature-name"}`
- **Namespaced branch**: `feature/my-feature` → `{namespace: "feature", branch: "my-feature"}`
- **Versioned branch**: `hotfix/v2.0/fix-name` → `{namespace: "hotfix", version: "v2.0", branch: "fix-name"}`

The namespace is used to look up workflows in the config. For example, a branch named `hotfix/security-patch` will use the `hotfix` workflow from config.

### Command Structure

All commands follow the same pattern:

1. **Bin script** (`bin/git-*.js`) - Entry point that uses `shell-wrapper.js`
2. **Main implementation** (`src/*.js`) - Core logic that exports an async function
3. **Shell wrapper** (`bin/shell-wrapper.js`) - Handles:
   - Argument parsing with `minimist`
   - Update notifications
   - Process exit and error handling
   - Special handling for `push` as both flag and argument

### Common Utilities

`src/utils.js` provides shared functionality used across commands:

- `getRemote()` - Resolves remote from config or CLI options
- `shouldPush()` - Determines if push should happen (config + CLI options)
- `isClean()` - Checks if working directory has uncommitted changes
- `switchToAndUpdateBase()` - Checks out and pulls base branch, optionally returns to original
- `getWorkflow()` - Looks up workflow config by branch namespace
- `getBaseBranch()` - Resolves base branch from workflow or default
- `getAllBaseBranches()` - Extracts all base branches from promotionPaths
- `getUiUrl()` - Converts git remote URL to web UI URL (handles SSH format)

### Workflow Resolution

When a command operates on a branch, it resolves the workflow as follows:

1. Parse branch name to extract namespace (e.g., `feature/my-branch` → `feature`)
2. Look up `config.workflows[namespace]`
3. If found, use `workflow.from` and `workflow.to` for base branches
4. If not found, fall back to `config.defaultBase`

The `to` field in workflows can be:
- A single string (merge into one branch)
- An array of strings (merge into multiple branches sequentially)

### Test Organization

Tests use Mocha + Chai + Sinon with proxyquire for dependency injection:

- **Unit tests** (`test/unit/`) - Mock all dependencies using `proxyquire` and `sinon.stub()`
- Test files mirror source structure: `src/finish.js` → `test/unit/src/finish.spec.js`
- Bin scripts are tested in `test/unit/bin/`
- All `simple-git` calls are stubbed in tests to avoid real git operations

### ESLint Configuration

The project uses ESLint v9 with flat config format (`eslint.config.js`). Key rules:

- **Complexity limit: 5** - Functions exceeding this must be refactored into smaller helpers
- **Max params: 3** - Functions with more parameters should use options objects
- Uses `eslint-plugin-mocha` for test-specific rules
- Enforces JSDoc for all functions (removed in recent test updates but still enforced in source)

## Key Implementation Notes

### Cyclomatic Complexity

The ESLint complexity rule is set to 5. When refactoring complex functions:
- Extract conditional logic into separate helper functions
- Use early returns to reduce nesting
- Move nested if-else blocks into dedicated functions

Example: `src/config/index.js` was refactored to extract `getConfigPath()` and `copyExampleConfig()` helpers.

### Git Operations

All git operations use `simple-git` library. Common patterns:

```javascript
const git = require('simple-git')();

// Get current branch info
const status = await git.status();
const currentBranch = status.current;

// Get repo root
const repoRoot = await git.revparse(['--show-toplevel']);

// Branch operations
await git.checkout(branchName);
await git.pull(remote, branch);
await git.merge([sourceBranch]);
await git.push(remote, branch);
```

### Testing Patterns

When writing tests for functions that use `simple-git`:

```javascript
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const gitStub = {
  checkout: sinon.stub().resolves(),
  pull: sinon.stub().resolves(),
  // ... other methods
};

const moduleUnderTest = proxyquire('../src/module', {
  'simple-git': () => gitStub
});
```

### Argument Parsing

The `shell-wrapper.js` handles common CLI patterns:
- Flags like `-p` and `--push` are aliased
- The word `push` as a positional argument is converted to `--push` flag
- Remote flag: `-R` or `--remote`
- Global flag: `-g` or `--global`
- Branch flag: `-b` or `--branch`

## Command Workflow Summary

**git start** - Creates new branch from base, updates base first
**git update** - Merges base branch into current branch (with optional rebase)
**git finish** - Merges current branch into base(s) defined by workflow
**git promote** - Merges current base branch into next base per promotionPaths
**git rename** - Renames current branch (preserves namespace)
**git open** - Opens repo in web browser
**git pr** - Opens pull request page in browser (pushes first if needed)

## Node Version Support

Requires Node.js >=10. Uses modern async/await throughout but maintains compatibility with older Node versions.
