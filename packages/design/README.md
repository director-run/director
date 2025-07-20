# @director.run/design

A modern, reusable design system for Director projects, providing accessible React UI components, hooks, utilities, and global styles. Built with Tailwind CSS, Radix UI, and best-in-class open source libraries.

## Features

- **UI Components**: A comprehensive set of composable, accessible React components (buttons, dialogs, forms, tooltips, cards, etc.).
- **UI Primitives**: Low-level building blocks for custom interfaces.
- **Hooks**: Useful React hooks for clipboard, media queries, forms, and more.
- **Utilities**: Helper functions for class management, context creation, and conditional rendering.
- **Global Styles**: Themeable, customizable CSS variables and Tailwind integration.

## Installation

```bash
npm install @director.run/design
# or
yarn add @director.run/design
```

## Usage

### Importing Components

```tsx
import { Button } from "@director.run/design/ui/button";
import { CardGrid } from "@director.run/design/components/card-grid";
import { useCopyToClipboard } from "@director.run/design/hooks/use-copy-to-clipboard";
import { cn } from "@director.run/design/lib/cn";
import "@director.run/design/styles.css"; // Import global styles
```

### Example

```tsx
import { Button } from "@director.run/design/ui/button";

export default function Example() {
  return <Button variant="primary">Click me</Button>;
}
```

## Usage in This Monorepo (Next.js Apps)

To use `@director.run/design` in a Next.js app within this monorepo, follow these steps:

1. **Copy the Example Stylesheet**
   - Copy the example `@styles.css` from `packages/design/styles.css` into your Next.js app's `app` directory (e.g., `apps/studio/app/@styles.css`).
   - Import this stylesheet in your base `layout.tsx`:

     ```tsx
     // apps/studio/app/layout.tsx
     import "./@styles.css";
     ```

2. **Update TypeScript Paths**
   - In your Next.js app's `tsconfig.json`, add the following to the `compilerOptions.paths` section:

     ```json
     {
       "compilerOptions": {
         "paths": {
           "@director.run/design/*": ["../../../packages/design/src/*"]
         }
       }
     }
     ```
   - Adjust the relative path if your directory structure differs.

3. **Transpile the Design Package**
   - In your Next.js app's `next.config.ts`, ensure `@director.run/design` is included in the `transpilePackages` option:

     ```ts
     // next.config.ts
     export default {
       transpilePackages: ['@director.run/design'],
       // ...other config
     };
     ```

This setup ensures you get local, up-to-date components and styles from the design system while developing within the monorepo.

## Directory Structure

- `src/components/`: Layout and section components (e.g., `CardGrid`, `DetailList`, `Shell`, `Section`, `Tooltip`).
- `src/ui/`: UI primitives (e.g., `Button`, `Dialog`, `DropdownMenu`, `Input`, `Badge`, `Avatar`, `Card`, `Chip`).
- `src/hooks/`: React hooks (e.g., `useCopyToClipboard`, `useMediaQuery`, `useZodForm`).
- `src/lib/`: Utilities (e.g., `cn` for classnames, `conditional`, `create-ctx` for context).
- `styles.css`: Global styles, CSS variables, and Tailwind plugins.

## Theming & Customization

- Uses CSS variables for easy theming (light/dark mode supported).
- Built on Tailwind CSS with custom plugins and variants.
- Easily extend or override styles via your own Tailwind config.

## Development

- **Lint:** `bun run lint`
- **Format:** `bun run format`
- **Typecheck:** `bun run typecheck`
- **Clean:** `bun run clean`

## Dependencies

- React 19+
- Tailwind CSS 4+
- Radix UI
- Lucide React
- Zod
- clsx, tailwind-merge, class-variance-authority

## License

MIT 