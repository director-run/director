## Install package locally

### Install
```
bun run build
npm link
director --help
npm uninstall -g @working.dev/director
```

### Pack
```
npm pack --dry-run
```

## Publish
```
npm login
bun publish --access public
```

### Unpublish
```
npm unpublish @director.run/cli --force
```

