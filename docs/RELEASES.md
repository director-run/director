# Release Management with Changesets

This document describes the release process for the Director monorepo using [Changesets](https://github.com/changesets/changesets).

## Overview

Director uses Changesets for automated release management, supporting:

- **NPM Publishing**: `@director.run/cli` and `@director.run/sdk` (SDK bundles internal dependencies)
- **Docker Registry**: `@director.run/docker` to Docker Hub as `barnaby/director`
- **Automated Changelogs**: Mintlify-compatible format with GitHub integration

## Developer Workflow

### 1. Making Changes

When making changes that affect packages, you'll need to create a changeset:

```bash
bun run changeset
```

This command will:
- Prompt you to select which packages have changed
- Ask for the semver bump type (major/minor/patch) for each package
- Request a description of the changes

### 2. Changeset Files

Changesets create markdown files in `.changeset/` directory:

```markdown
---
"@director.run/cli": minor
"@director.run/sdk": patch
---

Add new authentication features and fix token validation bug
```

### 3. Release Process

The release happens automatically when changesets are merged to `main`:

1. **Version PR Creation**: Changesets bot creates/updates a PR with version bumps and changelog updates
2. **Manual Review**: Review the version PR for correctness
3. **Merge to Release**: When the version PR is merged, packages are automatically published

## Package Configuration

### NPM Packages (`@director.run/cli`, `@director.run/sdk`)

Both packages are configured with:
- `"publishConfig": { "access": "public" }` in package.json
- Build process runs before publishing via `prepare` script
- SDK bundles internal dependencies (gateway, registry) using tsup

### Private Dependencies (`@director.run/gateway`, `@director.run/registry`)

These packages are:
- Marked as `"private": true` so they won't be published to npm
- Tracked by Changesets for versioning purposes
- Bundled into the SDK at build time using tsup's bundling capabilities

### Docker Package (`@director.run/docker`)

- Versions tracked in package.json but not published to npm
- Docker images built and pushed to `barnaby/director:version`
- Both version-specific and `latest` tags created on Docker Hub

## GitHub Configuration

### Required Secrets

Configure these in GitHub repository settings (`Settings > Secrets and variables > Actions`):

- **`GH_RELEASE_TOKEN`**: Personal Access Token (PAT) with repository access
  - Required to allow CI workflows to run on changesets release PRs
  - Create at https://github.com/settings/tokens (Classic tokens recommended)
  - Select scopes: `repo` (full repository access) and `workflow`
  - Add to repository secrets

- **`NPM_TOKEN`**: npm authentication token with publish access to `@director.run` organization
  - Create at https://www.npmjs.com/settings/tokens
  - Select "Automation" token type
  - Add to repository secrets

- **`DOCKER_USERNAME`**: Docker Hub username (`barnaby`)
  - Should be set to `barnaby`

- **`DOCKER_PASSWORD`**: Docker Hub access token or password
  - Create access token at https://hub.docker.com/settings/security
  - Recommended to use access token instead of password

### Token Creation Steps

1. **GitHub PAT (GH_RELEASE_TOKEN)**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `director-changesets` (or similar)
   - Select scopes: `repo` (full repository access) and `workflow`
   - Copy the generated token

2. **NPM Token**:
   ```bash
   # Login to npm
   npm login
   
   # Create automation token (or use web interface)
   # Web: https://www.npmjs.com/settings/tokens -> Generate New Token -> Automation
   ```

3. **Docker Hub Token**:
   - Go to https://hub.docker.com/settings/security
   - Click "New Access Token"
   - Name: `director-releases` (or similar)
   - Access Permissions: Read, Write, Delete
   - Copy the generated token

4. **Add to GitHub**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add these secrets:
     - Name: `CHANGESETS_TOKEN`, Value: Your GitHub PAT
     - Name: `NPM_TOKEN`, Value: Your npm token
     - Name: `DOCKER_USERNAME`, Value: `barnaby`
     - Name: `DOCKER_PASSWORD`, Value: Your Docker Hub access token

## Changelog Format

A single changelog is maintained at the root of the repository (`CHANGELOG.md`) with:
- Links to GitHub pull requests and commits
- User attribution for contributions
- Consolidated entries for all packages in each release
- Semantic versioning change types (Major, Minor, Patch)
- Fixed versioning ensures all public packages are released together

## Troubleshooting

### Common Issues

1. **CI Not Running on Release PRs**:
   - This happens when using the default `GITHUB_TOKEN` 
   - GitHub's security model prevents workflows from triggering on bot-created PRs
   - Solution: Use `CHANGESETS_TOKEN` (Personal Access Token) instead
   - Ensure the PAT has `repo` and `workflow` scopes

2. **NPM Token Invalid**: 
   - Ensure token has correct permissions for `@director.run` organization
   - Check token hasn't expired

3. **Docker Build Fails**:
   - Verify Dockerfile exists in `apps/docker/`
   - Check Docker Hub access token permissions
   - Ensure `DOCKER_USERNAME` and `DOCKER_PASSWORD` are correctly set

4. **Version PR Not Created**:
   - Ensure changesets exist (check `.changeset/` directory)
   - Verify GitHub Actions are enabled

### Manual Commands

For local testing or manual releases:

```bash
# Create changeset
bun run changeset

# Version packages (updates package.json and CHANGELOG.md)
bun run version-packages

# Publish packages (after versioning)
bun run release-packages
```

### Skipping Releases

To make changes without triggering releases, create an empty changeset:

```bash
bun run changeset --empty
```

## Advanced Configuration

### Ignoring Packages

Certain packages are ignored from releases in `.changeset/config.json`:

```json
{
  "ignore": ["@director.run/studio", "@director.run/sandbox"]
}
```

### Fixed Package Configuration

The packages are configured with "fixed" versioning, meaning:
- All public packages (`@director.run/cli`, `@director.run/sdk`, `@director.run/docker`) are released together
- They share the same version number for consistency
- A single changelog at the root consolidates all changes
- Uses `@changesets/changelog-github` for proper GitHub integration