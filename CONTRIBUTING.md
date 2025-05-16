
## Contributing

Hello! We welcome any and all contributions and we'd be more than happy to help you get started with the codebase. 

**Note: This project is under active development and the code will likely change pretty significantly. We'll update this message once that's complete!**

### Prerequisites

- [Node.js](https://nodejs.org/) 
- [Bun](https://bun.sh/) 
- [Docker](https://docker.com)

### Development workflow

#### Setup Environment

```bash 
# clone the repo
$ git clone https://github.com/theworkingcompany/director
$ cd director

# Install dependencies
$ bun install

# Setup registry test and development
$ cd apps/registy
$ docker-compose up -d # spin up postgres (ignore if you have it running locally)
$ createdb -h localhost -p 5432 -U postgres director-registry-test # create test db
  password: travel-china-spend-nothing
$ createdb -h localhost -p 5432 -U postgres director-registry-dev # create development db
  password: travel-china-spend-nothing
$ bun run db:push # push schema to development db
$ NODE_ENV=test bun run db:push # push schema to test db
$ bun run cli db:seed # populate the development database with server entries

# Setup the director gateway
$ cd apps/cli
$ bun run cli debug seed # seed the gateway with test config (if the gateway is running, it'll need to be restarted for changes to take effect)
```

#### Running in Development 

```bash
# start the registry
$ cd apps/registry
$ docker-compose up -d # make sure postgres is running
$ bun run cli server:start # start the registry server

# start the director gateway
$ cd apps/cli
$ bun run cli service start

# list the proxies and install one to claude
$ bun run cli ls # list all proxies
$ bun run cli claude install claude-proxy # this will install claude-proxy to claude and restart it (from the seed file)

# now you should see a list of mcp servers in claude, try this prompt: "give me the front page of hackernews"
```

#### Running Tests

```bash
# from project root
$ bun run lint 
$ bun run typecheck
$ bun run test

# Automatically fix lint + prettier issues
$ bun run format
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

Release workflow is handled by a github action that is triggered when a version tag is created

```bash
$ version=$(bun run desktop:version print) 
$ git tag -a "v${version}" -m "Release v${version}" 
$ git push origin "v${version}"
```
