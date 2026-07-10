# TODOS

## Design System

### Sanitize raw HTML in registry markdown rendering

**What:** Filter or sanitize the raw HTML that `packages/design/src/components/ui/markdown.tsx` renders via `rehypeRaw` (e.g. rehype-sanitize, or an `allowElement` allowlist that drops `<style>`, `<script>`, `<iframe>` and inline `style` attributes).

**Why:** Registry readmes and MCP tool descriptions are untrusted third-party content. With `rehypeRaw` unfiltered, a malicious readme can inject `<style>` blocks or inline styles and restyle the entire page — spoof UI, hide consent dialogs, or corrupt theming.

**Context:** Flagged by adversarial review on PR #487 (dark mode). Pre-existing, not introduced by that PR — arbitrary CSS injection is possible regardless of token naming. `Markdown` is used for registry item readmes and tool descriptions. Start at `markdown.tsx` where `rehypeRaw` is registered; decide whether any raw HTML is actually needed (if not, dropping `rehypeRaw` entirely is the simplest fix).

**Effort:** S
**Priority:** P1
**Depends on:** None

### Remove ghost shadcn tokens from form components

**What:** Replace non-resolving utility classes (`border-input`, `ring-ring`, `text-foreground`, `text-muted-foreground`, `shadow-xs`, `decoration-gray-10/12`) in `input.tsx`, `textarea.tsx`, `select-native.tsx`, `switch.tsx`, `typography.tsx`, and `playbook-manual-connection-dialog.tsx` with the semantic tokens from `apps/studio/src/globals.css`.

**Why:** These classes reference shadcn theme variables that were never defined in this codebase, so they compile to nothing or fall back to `currentColor` — focus rings and borders render by accident, not by design. They also contradict the token rule now documented in CLAUDE.md and the design README.

**Context:** Found during PR #487 review (dead-palette class sweep fixed the same bug class elsewhere: `text-green-500`, `border-red-200`, `text-accent-red`). These are the shadcn-derived leftovers. Verify each swap in the kitchen-sink forms stories in both light and dark mode.

**Effort:** S
**Priority:** P2
**Depends on:** None

### Deduplicate the mobile sidebar sheet

**What:** Extract the duplicated mobile sidebar sheet markup (Radix Dialog + `shadow-panel` + close button) shared between `packages/design/src/components/layout/layout.tsx` and `packages/design/src/components/layout/navigation.tsx` into one component.

**Why:** Two near-identical copies already drifted once (the PR #487 shadow swap had to patch both); the next styling change will need to remember both call sites or they diverge visibly.

**Context:** Flagged by the maintainability specialist on PR #487. Compare `LayoutViewSidebar`'s sheet in `layout.tsx` with the sheet in `navigation.tsx`; the diff is small. A story that opens the hamburger nav would also close one of the Chromatic coverage gaps noted below.

**Effort:** M
**Priority:** P3
**Depends on:** None

### Theme the brand SVGs for dark mode

**What:** Make the client/brand logos in `packages/design/src/components/connect/connection-brands.tsx` dark-mode aware (they hardcode `#FFF` / `#F3F3F3` fills and gradient stops).

**Why:** Once the connect flows get dark treatment, near-white logo fills will glare on the dark `surface`; there is currently no DarkMode story covering them so the regression would land silently.

**Context:** Flagged by adversarial review on PR #487 as future scope — the connect empty/update states (`connection-empty-state.tsx`, `connection-update-state.tsx`) render these SVGs. Options: `currentColor`, CSS-variable fills, or per-mode variants. Add a DarkMode story alongside.

**Effort:** M
**Priority:** P3
**Depends on:** None

## Storybook

### Close interaction-gated Chromatic coverage gaps

**What:** Add `play()` functions (or dedicated stories) for the three uncovered visual states from PR #487: the get-started install-server dialog open on mobile, the mobile hamburger sidebar sheet open, and the inactive-tab hover state.

**Why:** These are the only `shadow-hairline`/`shadow-panel` call sites with no Chromatic snapshot in either theme — a dark-mode or elevation regression there ships unseen. Coverage is currently 11/14 paths (~79%).

**Context:** Coverage audit in PR #487's Test Coverage section lists the exact gaps. `@storybook/test` is available for `play()` interactions; the sidebar-sheet story overlaps with the dedup item above.

**Effort:** S
**Priority:** P3
**Depends on:** None

## Completed
