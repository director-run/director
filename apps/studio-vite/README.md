# Hello World SPA

A modern React TypeScript single-page web application with React Router v7, built with Vite and Express.

## Features

- ⚛️ React 18 with TypeScript for type-safe development
- 🎯 React Router v7 for declarative routing
- 🚀 Fast development with Vite and hot reload
- 📦 Optimized production build with code splitting
- 🔧 Express TypeScript server with middleware architecture
- 🧩 Modular middleware for configuration and SPA hosting
- 💅 Modern CSS styling with animations
- 🏥 Health check endpoint
- 🔍 Full TypeScript support with strict mode

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run TypeScript type checking
npm run typecheck
```

Open http://localhost:3000 to view the app in development mode.

## Production

```bash
# Build the application (includes TypeScript compilation)
npm run build

# Start production server
npm run serve

# Or build and serve in one command
npm start
```

The production server runs on http://localhost:8080 by default.

## Configuration

The Express server injects configuration via environment variables, accessible in React via `window.__APP_CONFIG__`:

- `PORT` - Server port (default: 8080)
- `APP_NAME` - Application name
- `API_URL` - API endpoint URL
- `NODE_ENV` - Environment (development/production)
- `APP_VERSION` - Application version

## API Endpoints

- `GET /api/config` - Returns current configuration
- `GET /health` - Health check endpoint
- `GET /*` - Serves the SPA (catch-all route)

## Project Structure

```
├── src/
│   ├── components/         # React TypeScript components
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx            # Main App component with routing
│   ├── main.tsx           # React entry point
│   ├── index.html         # HTML template
│   └── style.css          # Application styles
├── server/
│   ├── index.ts           # TypeScript Express server
│   ├── types.ts           # Server type definitions
│   └── middleware/        # Express middleware
│       ├── config.ts      # Configuration middleware
│       └── spa.ts         # SPA hosting middleware
├── dist/                  # Built application (generated)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # Node TypeScript configuration
└── vite.config.js         # Vite configuration with React plugin
```

## Routes

- `/` - Home page
- `/about` - About page
- `/contact` - Contact page
- `/*` - 404 Not Found page

All routes support direct navigation and browser back/forward buttons thanks to React Router v7.