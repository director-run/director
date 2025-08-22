# Release Management with Changesets

This document describes the release process for the Director monorepo using [Changesets](https://github.com/changesets/changesets).

## Overview

Director uses Changesets for automated release management, supporting:

- **NPM Publishing**: `@director.run/cli` and `@director.run/sdk` 
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

### Docker Package (`@director.run/docker`)

- Versions tracked in package.json but not published to npm
- Docker images built and pushed to `barnaby/director:version`
- Both version-specific and `latest` tags created on Docker Hub

## GitHub Configuration

### Required Secrets

Configure these in GitHub repository settings (`Settings > Secrets and variables > Actions`):

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

1. **NPM Token**:
   ```bash
   # Login to npm
   npm login
   
   # Create automation token (or use web interface)
   # Web: https://www.npmjs.com/settings/tokens -> Generate New Token -> Automation
   ```

2. **Docker Hub Token**:
   - Go to https://hub.docker.com/settings/security
   - Click "New Access Token"
   - Name: `director-releases` (or similar)
   - Access Permissions: Read, Write, Delete
   - Copy the generated token

3. **Add to GitHub**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add these secrets:
     - Name: `NPM_TOKEN`, Value: Your npm token
     - Name: `DOCKER_USERNAME`, Value: `barnaby`
     - Name: `DOCKER_PASSWORD`, Value: Your Docker Hub access token

## Changelog Format

Changelogs are generated with Mintlify-compatible formatting:

```markdown
## @director.run/cli@1.2.0

### Minor Changes

- ✨ **Minor**: Add new authentication features ([a1b2c3d](https://github.com/director-run/director/commit/a1b2c3d)) [#123](https://github.com/director-run/director/pull/123) Thanks @username!

### Patch Changes

- 🐛 **Patch**: Fix token validation bug ([d4e5f6g](https://github.com/director-run/director/commit/d4e5f6g)) [#124](https://github.com/director-run/director/pull/124)
```

## Troubleshooting

### Common Issues

1. **NPM Token Invalid**: 
   - Ensure token has correct permissions for `@director.run` organization
   - Check token hasn't expired

2. **Docker Build Fails**:
   - Verify Dockerfile exists in `apps/docker/`
   - Check Docker Hub access token permissions
   - Ensure `DOCKER_USERNAME` and `DOCKER_PASSWORD` are correctly set

3. **Version PR Not Created**:
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
  "ignore": ["@director.run/studio", "@director.run/sandbox", "@director.run/registry"]
}
```

### Custom Changelog

The changelog generator is located at `scripts/changelog.js` and can be customized for different formatting requirements.