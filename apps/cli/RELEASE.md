# How to release the CLI

## Testing

### Installing Locally
```
bun run build
npm link
director --help
npm uninstall -g @working.dev/director
```

### Publish Dry Run
```
bun publish --access public --dry-run
```

## Publish
```
npm login
bun publish --access public
```

### Unpublish
*Important*: Can be done within 72 hours assuming no dependencies in repository.

```
npm unpublish @director.run/cli --force
```

