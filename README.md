# Director

## Getting Started

This is a monorepo managed with [Turborepo](https://turbo.build/).

## Folder Structure

Find out more about each application and package in their respective `README.md` files

```
apps/
├── cli                 # cli application
├── backend             # backend for the desktop
├── desktop             # desktop application
└── website             # https://director.run

packages/
├── icons               # We need to replace this because these icons aint opensource, but will leave for now
├── core                # Core business logic and functionality
└── design              # Shared design components
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 
- [Bun](https://bun.sh/) 

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

### Build

TODO

## TODO

- Install to Cursor
- http://localhost:3006/<proxy_name>/sse

## Release

To release a new version of the app, run:

```bash
bun run release.ts <version>
```

Where `<version>` is the new version number of the desktop app (e.g. `0.1.1`). This will automatically update the version of the desktop app and push commits to github.