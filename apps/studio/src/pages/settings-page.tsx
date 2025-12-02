import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { SettingsPage as SettingsPageComponent } from "@director.run/design/components/pages/settings.tsx";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { authClient } from "../lib/auth-client";

type ApiKeyData = {
  id: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export function SettingsPage() {
  const { user, logout, isAuthenticated } = useAuth();

  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);
  const [isRecyclingApiKey, setIsRecyclingApiKey] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoadingApiKey(true);
      const result = await authClient.apiKey.list();
      if (result.data && result.data.length > 0) {
        const key = result.data[0];
        setApiKey({
          id: key.id,
          keyPrefix: key.start ?? key.prefix ?? "dk_",
          createdAt: key.createdAt.toISOString(),
          lastUsedAt: key.lastRequest?.toISOString() ?? null,
        });
      } else {
        setApiKey(null);
      }
    } catch {
      setApiKey(null);
    } finally {
      setIsLoadingApiKey(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApiKeys();
    }
  }, [isAuthenticated, fetchApiKeys]);

  const handleCreateApiKey = async () => {
    try {
      setIsRecyclingApiKey(true);
      const result = await authClient.apiKey.create({ name: "studio-key" });
      if (result.data?.key) {
        setNewApiKey(result.data.key);
        await fetchApiKeys();
      }
    } finally {
      setIsRecyclingApiKey(false);
    }
  };

  const handleRecycleApiKey = async () => {
    try {
      setIsRecyclingApiKey(true);
      // Delete existing key first
      if (apiKey) {
        await authClient.apiKey.delete({ keyId: apiKey.id });
      }
      // Create new key
      const result = await authClient.apiKey.create({ name: "studio-key" });
      if (result.data?.key) {
        setNewApiKey(result.data.key);
        await fetchApiKeys();
      }
    } finally {
      setIsRecyclingApiKey(false);
    }
  };

  const handleCopyApiKey = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

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
            Email: user?.email ?? "Unknown",
          }}
          onClickLogout={logout}
          apiKey={apiKey}
          newApiKey={newApiKey}
          isLoadingApiKey={isLoadingApiKey}
          isRecyclingApiKey={isRecyclingApiKey}
          onCreateApiKey={handleCreateApiKey}
          onRecycleApiKey={handleRecycleApiKey}
          onClearNewApiKey={() => setNewApiKey(null)}
          onCopyApiKey={handleCopyApiKey}
        />
      </LayoutViewContent>
    </>
  );
}
