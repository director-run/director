import type { PlaybookDetail } from "@director.run/design/components/types.ts";

/**
 * In-memory route model for the kitchen-sink mock app. Mirrors the real
 * react-router routes in `apps/studio/src/main.tsx` but drives navigation
 * from local state instead of the URL.
 */
export type KitchenSinkRoute =
  | { name: "playbook"; playbookId: string }
  | { name: "target"; playbookId: string; targetId: string }
  | { name: "library" }
  | { name: "library-entry"; entryName: string }
  | { name: "new-playbook" }
  | { name: "settings" }
  | { name: "get-started" };

/** Forces a route to render its populated, loading, or error variant. */
export type KitchenSinkPageState = "default" | "loading" | "error";

export interface KitchenSinkAppProps {
  /** Route to render first. Defaults to the first playbook's detail view. */
  initialRoute?: KitchenSinkRoute;
  /** Playbooks shown in the sidebar and detail views. */
  initialPlaybooks?: PlaybookDetail[];
  /** Renders the sidebar playbook section in its loading (scramble) state. */
  sidebarLoading?: boolean;
  /** Forces every route into a shared populated/loading/error state. */
  pageState?: KitchenSinkPageState;
}

export type KitchenSinkNavigate = (route: KitchenSinkRoute) => void;
