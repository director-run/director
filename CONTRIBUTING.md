
# Contributing

Hello! We welcome any and all contributions and we'd be more than happy to help you get started with the codebase. 

**Note: This project is under active development and the code will likely change pretty significantly. We'll update this message once that's complete!**

## Prerequisites

- [Bun](https://bun.sh/) (tested on 1.2.14+)
- [Docker](https://docker.com)

## Development workflow

### Setup Environment

```bash 
# clone the repo
git clone https://github.com/theworkingcompany/director
cd director

# Setup environment
bun install
docker compose up -d
./scripts/setup-development.sh
bun run test # confirm everything is working

# Teardown environment
docker compose down -v
```

### Running in Development 

```bash
# Running cli in development
bun cli serve # start the gateway
bun cli:dev # watches for changes

# Working with the registry
# Uncomment the lines in this file
vim apps/cli/.director/development/config.env
bun registry
bun cli registry populate # populate the development database with server entries
bun cli registry enrich # populate the development database with server entries
bun cli registry enrich-tools # populate the development database with server entries
```

### Running Tests

```bash
# from project root
$ bun run lint 
$ bun run typecheck
$ bun run test

# Automatically fix lint + prettier issues
$ bun run format
```

## Writing code changes

When you make code changes, please remember 

1. **Add or update tests.** Every new feature or bug‑fix should come with test coverage that fails before your change and passes afterwards. 100 % coverage is not required, but aim for meaningful assertions.
2. **Document behaviour.** If your change affects user‑facing behaviour, update the README or relevant documentation.
3. **Keep commits atomic.** Each commit should compile and the tests should pass. This makes reviews and potential rollbacks easier.

## Opening a pull request

- Fill in the PR template (or include similar information) – **What? Why? How?**
- Run **all** checks locally (`bun run test && bun run lint && bun run check-types`). CI failures that could have been caught locally slow down the process.
- Make sure your branch is up‑to‑date with `main` and that you have resolved merge conflicts.
- Mark the PR as **Ready for review** only when you believe it is in a merge‑able state.

## Releasing `director`

- See apps/cli/RELEASE.md
- Registry & studio deploy automatically