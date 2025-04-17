
## Contributing

We welcome help and contribuitions 

This project is under active development and the code will likely change pretty significantly. We'll update this message once that's complete!


### Prerequisites

- [Node.js](https://nodejs.org/) 
- [Bun](https://bun.sh/) 

### Installation
```bash
bun install
```

### Development workflow

```bash
# run backend, watch for changes
bun run start:dev

# tests
bun run test
bun run lint 
bun run typecheck

# Automatically fix lint + prettier issues
bun run format
```

### Writing code changes

When you make code changes, please remember 

1. **Add or update tests.** Every new feature or bug‑fix should come with test coverage that fails before your change and passes afterwards. 100 % coverage is not required, but aim for meaningful assertions.
2. **Document behaviour.** If your change affects user‑facing behaviour, update the README or relevant documentation.
3. **Keep commits atomic.** Each commit should compile and the tests should pass. This makes reviews and potential rollbacks easier.

### Opening a pull request

- Fill in the PR template (or include similar information) – **What? Why? How?**
- Run **all** checks locally (`bun run test && bun run lint && bun run check-types`). CI failures that could have been caught locally slow down the process.
- Make sure your branch is up‑to‑date with `main` and that you have resolved merge conflicts.
- Mark the PR as **Ready for review** only when you believe it is in a merge‑able state.

### Releasing `director`

```bash
# Step 1: Make changes on a branch, bump the version
... # make changes
bun run desktop:version bump
... # commit & push version changes
# Step 2: Merge the branch in github ...
# Step 3: Release
git checkout main
git pull
bun run desktop:release
```
