# Director Registry (Next.js)

This folder contains the code for the Director Registry, now implemented as a [Next.js](https://nextjs.org/) application with a [TRPC](https://trpc.io/) API layer. It is hosted at [https://registry.director.run](https://registry.director.run).

The registry provides a searchable, browsable UI for MCP servers, with all entries stored in a Postgres database. The backend logic and API are exposed via TRPC endpoints, integrated directly into the Next.js app. No authentication is required for public access.

We are currently waiting until the official [MCP Registry](https://github.com/modelcontextprotocol/registry) matures before investing more into this project.

---

## Adding a Server to the Registry

The registry is regularly re-populated from the [seed file](./src/db/seed/entries.ts). To add a new entry, edit this file and open a PR. Example entry:

```js
{
  name: "google-drive",
  title: "Google Drive",
  description: "This MCP server integrates with Google Drive to allow listing, reading, and searching over files.",
  isOfficial: true,
  icon: "public/drive.svg",
  homepage: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
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

---

## Development

```bash
# From the monorepo root:
docker compose up -d
./scripts/setup-development.sh

# Start the Next.js app (from this directory):
bun install # or npm install
bun run dev # or npm run dev

# Stop Postgres and remove all containers, networks, and volumes
docker compose down -v
```

- The app uses environment variables for DB and API configuration. See `.env.development` for local setup.
- The UI is available at [http://localhost:3000](http://localhost:3000) by default.

---

## Populating the Registry

To reseed the registry, you need an API key (restricted) and the Director CLI:

```bash
# Configure the environment
REGISTRY_API_URL=https://your.registry.com
REGISTRY_API_KEY=<your-api-key>
ENABLE_DEBUG_COMMANDS=true # registry write commands only appear in debug mode

director registry populate      # Deletes everything & imports the seed file into the database
director registry enrich        # Pulls in the entry README and parses the parameters
director registry enrich-tools  # Starts each server and queries the tools (best used with the sandbox)
```

---

## UI & Features

- **Browse all MCP servers**: Home page lists all registry entries with search and filter options.
- **Server details**: Click an entry to view its description, tools, and README (if available).
- **Tool details**: View tool schemas and descriptions for each server.
- **Internationalization**: Built-in support for locales (currently English).
- **Modern UI**: Built with [@director.run/design](https://github.com/modelcontextprotocol/director/tree/main/packages/design).

---

## Deployment
- Deployed via [Vercel](https://vercel.com/) as a Next.js app.
- Accessible at `https://registry.director.run`.
- Uses Next.js API routes and SSR/SSG for fast, dynamic content.
- To run scripts/commands (e.g., `bun run db:push`), set local environment variables to match those on Vercel and run locally.