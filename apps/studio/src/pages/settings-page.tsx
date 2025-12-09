import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { SettingsPage as SettingsPageComponent } from "@director.run/design/components/pages/settings.tsx";
import { useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { gatewayClient } from "../contexts/backend-context";

export function SettingsPage() {
  const { logout } = useAuth();
  const utils = gatewayClient.useUtils();

  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  // Use TRPC query to get all settings including API key info
  const settingsQuery = gatewayClient.settings.getAllSettings.useQuery();

  // Use TRPC mutation to regenerate API key
  const regenerateApiKeyMutation =
    gatewayClient.settings.regenerateApiKey.useMutation({
      onSuccess: async (result) => {
        if (result.key) {
          setNewApiKey(result.key);
        }
        await utils.settings.getAllSettings.invalidate();
      },
    });

  const handleCreateApiKey = async () => {
    await regenerateApiKeyMutation.mutateAsync();
  };

  const handleRecycleApiKey = async () => {
    await regenerateApiKeyMutation.mutateAsync();
  };

  const handleCopyApiKey = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  // Map settings query to the expected apiKey format
  const apiKey = settingsQuery.data?.apiKey.hasApiKey
    ? {
        id: "default",
        keyPrefix: settingsQuery.data.apiKey.keyStart ?? "dk_",
        createdAt: settingsQuery.data.apiKey.createdAt?.toISOString() ?? "",
        lastUsedAt: null,
      }
    : null;

  return (
    <>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Settings",
          },
        ]}
      />

      <LayoutViewContent>
        <SettingsPageComponent
          settings={{
            Email: settingsQuery.data?.email ?? "Unknown",
          }}
          onClickLogout={logout}
          apiKey={apiKey}
          newApiKey={newApiKey}
          isLoadingApiKey={settingsQuery.isLoading}
          isRecyclingApiKey={regenerateApiKeyMutation.isPending}
          onCreateApiKey={handleCreateApiKey}
          onRecycleApiKey={handleRecycleApiKey}
          onClearNewApiKey={() => setNewApiKey(null)}
          onCopyApiKey={handleCopyApiKey}
        />
      </LayoutViewContent>
    </>
  );
}
