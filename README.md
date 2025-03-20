# Director

## Getting Started

This is a monorepo managed with [Turborepo](https://turbo.build/).

## Folder Structure

Find out more about each application and package in their respective `README.md` files

```
apps/
├── cli                 # cli application
├── desktop             # desktop application
└── website             # https://director.run

packages/
├── icons               # We need to replace this because these icons aint opensource, but will leave for now
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