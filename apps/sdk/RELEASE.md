# How to release the CLI

## Testing

### Installing Locally
```
bun run build
npm link
npm uninstall -g @director.run/sdk
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
npm unpublish @director.run/sdk --force
```
