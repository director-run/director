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

## Release Management

We use github tags to manage releases. Right now we package the entire app as a desktop app and release it as a new version. Here's how to release a new version of the application:

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
