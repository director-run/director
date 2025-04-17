
## Contributing

This project is under active development and the code will likely change pretty significantly. We'll update this message once that's complete!


### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/working-dev/working.dev.git
cd working.dev
bun install
```

### Running the Development Server

```bash
bun run dev
```


### Prerequisites

- [Node.js](https://nodejs.org/) 
- [Bun](https://bun.sh/) 

### Development workflow

- Create a _topic branch_ from `main` – e.g. `feat/interactive-prompt`.
- Keep your changes focused. Multiple unrelated fixes should be opened as separate PRs.
- Use `npm run test` during development for super‑fast feedback.
- We use **Vitest** for unit tests, **ESLint** + **Prettier** for style, and **TypeScript** for type‑checking.
- Before pushing, run the full test/type/lint suite:

### Git Hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality checks:

- **Pre-commit hook**: Automatically runs lint-staged to format and lint files before committing
- **Pre-push hook**: Runs tests and type checking before pushing to the remote

These hooks help maintain code quality and prevent pushing code with failing tests. For more details, see [HUSKY.md](./codex-cli/HUSKY.md).

```bash
npm test && npm run lint && npm run typecheck
```

```bash
# Watch mode (tests rerun on change)
npm run test:watch

# Type‑check without emitting files
npm run typecheck

# Automatically fix lint + prettier issues
npm run lint:fix
npm run format:fix
```

### Writing high‑impact code changes

1. **Start with an issue.** Open a new one or comment on an existing discussion so we can agree on the solution before code is written.
2. **Add or update tests.** Every new feature or bug‑fix should come with test coverage that fails before your change and passes afterwards. 100 % coverage is not required, but aim for meaningful assertions.
3. **Document behaviour.** If your change affects user‑facing behaviour, update the README, inline help (`codex --help`), or relevant example projects.
4. **Keep commits atomic.** Each commit should compile and the tests should pass. This makes reviews and potential rollbacks easier.

### Opening a pull request

- Fill in the PR template (or include similar information) – **What? Why? How?**
- Run **all** checks locally (`bun run test && bun run lint && bun run check-types`). CI failures that could have been caught locally slow down the process.
- Make sure your branch is up‑to‑date with `main` and that you have resolved merge conflicts.
- Mark the PR as **Ready for review** only when you believe it is in a merge‑able state.

### Review process

1. One maintainer will be assigned as a primary reviewer.
2. We may ask for changes – please do not take this personally. We value the work, we just also value consistency and long‑term maintainability.
3. When there is consensus that the PR meets the bar, a maintainer will squash‑and‑merge.

### Community values

- **Be kind and inclusive.** Treat others with respect; we follow the [Contributor Covenant](https://www.contributor-covenant.org/).
- **Assume good intent.** Written communication is hard – err on the side of generosity.
- **Teach & learn.** If you spot something confusing, open an issue or PR with improvements.

### Getting help

If you run into problems setting up the project, would like feedback on an idea, or just want to say _hi_ – please open a Discussion or jump into the relevant issue. We are happy to help.

Together we can make Director an incredible tool. **Happy hacking!** :rocket:

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
