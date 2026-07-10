import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { SettingsPage } from "@director.run/design/components/pages/settings.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useState } from "react";
import { kitchenSinkApiKey } from "../fixtures";
import type { KitchenSinkPageState } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GENERATED_API_KEY = "dk_live_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c";

interface SettingsRouteProps {
  pageState: KitchenSinkPageState;
}

export function SettingsRoute({ pageState }: SettingsRouteProps) {
  const [apiKey, setApiKey] = useState<typeof kitchenSinkApiKey | null>(
    kitchenSinkApiKey,
  );
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isRecycling, setIsRecycling] = useState(false);

  const regenerate = async () => {
    setIsRecycling(true);
    await delay(600);
    setApiKey(kitchenSinkApiKey);
    setNewApiKey(GENERATED_API_KEY);
    setIsRecycling(false);
  };

  return (
    <>
      <LayoutBreadcrumbHeader breadcrumbs={[{ title: "Settings" }]} />
      <LayoutViewContent>
        <SettingsPage
          settings={{ Email: "user@director.run" }}
          apiKey={apiKey}
          newApiKey={newApiKey}
          isLoadingApiKey={pageState === "loading"}
          isRecyclingApiKey={isRecycling}
          onCreateApiKey={regenerate}
          onRecycleApiKey={regenerate}
          onClearNewApiKey={() => setNewApiKey(null)}
          onCopyApiKey={(text) => {
            void navigator.clipboard?.writeText(text);
            toast({
              title: "Copied",
              description: "The API key was copied to your clipboard.",
            });
          }}
          onClickLogout={() => {
            toast({
              title: "Signed out",
              description: "You would be returned to the login screen.",
            });
          }}
        />
      </LayoutViewContent>
    </>
  );
}
