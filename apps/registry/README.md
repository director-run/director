# Director Registry

This folder contains the code that powers the director registry, which is hosted at [https://registry.director.run](https://registry.director.run). The registry entries are stored in a Postgres database and served over a [TRPC API](./src/routers/trpc). It does not require authentication. We are currently waiting until the official [MCP Registry](https://github.com/modelcontextprotocol/registry) matures before we invest more into this project.

### Adding a Server to the Registry

We re-populate the registry on a regular basis from the [seed file](./src/seed/entries.ts). If you'd like to add a new entry, please add it to the file and open a PR. Here's an example of an entry:

```js
  {
    name: "google-drive",
    title: "Google Drive",
    description:
      "This MCP server integrates with Google Drive to allow listing, reading, and searching over files.",
    isOfficial: true,
    icon: "public/drive.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gdrive"],
      env: {
        GDRIVE_CREDENTIALS_PATH: "<gdrive-server-credentials-path>", // user will be prompted for the value on add
      },
    },
  }
```

### Development

```bash
# Do this from monorepo root
docker compose up -d
./scripts/setup-development.sh

# Stop PG and remove all containers, networks, and volumes
docker compose down -v
```

### Populating the Registry

If you'd like to reseed the registry, you'll need an API key (this part of the API is restricted) and the director cli:

```bash
# Configure the environment
REGISTRY_API_URL=https://your.registry.com
REGISTRY_API_KEY=<your-api-key>
ENABLE_DEBUG_COMMANDS=true # registry write commands only appear in debug mode

director registry populate # deletes everything & imports the seed file into the database
director registry enrich # pulls in the entry README and parses the parameters
director registry enrich-tools # starts each server and queries the tools (it's best to use the sandbox for this)
```

### Deployment
- It deploys using vercel
- It's accessible at `https://registry.director.run`
- It exports one function: `api/index.js`
- To run scripts/commands (e.g: `bun run db:migrate`), set local environment variables to the ones on vercel and run locally