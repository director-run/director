# How to release the CLI

## Testing

### Installing Locally
```
bun run build
npm link
director --help
npm uninstall -g @director.run/cli
```

### Publish Dry Run
```
bun run release --dry-run
```

## Publish
```
npm login
bun run release
```

### Unpublish
*Important*: Can be done within 72 hours assuming no dependencies in repository.

```
npm unpublish @director.run/cli --force
```

## Release

```bash
version=$(node -p "require('./package.json').version")
git tag -a \"v${version}\" -m \"Release v${version}\"
git push origin \"v${version}\""
```