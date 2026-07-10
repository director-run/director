# Director Design Package

Director design component library

## Theming

Components are styled with semantic design tokens defined in
`apps/studio/src/globals.css` (the Tailwind v4 entry point). The default
Tailwind palette is disabled (`--color-*: initial`), so default palette
classes like `text-green-500` or `bg-red-50` produce no CSS — always use
the semantic tokens below.

Every token has a light and a dark value (a warm-charcoal OKLCH palette).
Dark mode is activated by adding the `dark` class to an ancestor element;
`color-scheme` is set per mode.

### Color tokens

| Token                            | Example utilities                       | Use for                      |
| -------------------------------- | --------------------------------------- | ---------------------------- |
| `bg`                             | `bg-bg`                                 | App background               |
| `fg`, `fg-subtle`                | `text-fg`, `text-fg-subtle`             | Text and icons               |
| `surface`                        | `bg-surface`                            | Cards, panels, popovers      |
| `accent`, `accent-subtle`        | `bg-accent`, `bg-accent-subtle`         | Emphasized surfaces          |
| `success`, `success-fg`          | `bg-success`, `text-success-fg`         | Positive states              |
| `destructive`, `destructive-fg`  | `bg-destructive`, `text-destructive-fg` | Errors, destructive actions  |
| `overlay`                        | `bg-overlay`                            | Modal and sheet scrims       |

### Elevation

Use the semantic shadow utilities instead of hardcoded `shadow-[...]`
values. Shadow colors are baked in per mode, so they adapt to dark mode
automatically:

- `shadow-hairline` — 0.5px keyline around flat surfaces
- `shadow-raised` — raised controls (e.g. active tabs)
- `shadow-panel` — sheets and side panels
- `shadow-popover` — popovers, dropdowns, dialogs

### Storybook

Stories run from `apps/studio` (`bun run storybook` at the repo root). The
Storybook toolbar has a light/dark toggle, and a story can pin dark mode
with `globals: { darkMode: true }` — see the `DarkMode` story variants in
`apps/studio/src/kitchen-sink/`.
