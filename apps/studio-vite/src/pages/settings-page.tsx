import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.tsx";
import { SettingsPage as SettingsPageComponent } from "@director.run/studio/components/pages/settings.tsx";
import { useAuth } from "../contexts/auth-context";

export function SettingsPage() {
  const { user, logout, isAuthenticated, isInitializing } = useAuth();
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
            user: JSON.stringify(user),
            isAuthenticated: JSON.stringify(isAuthenticated),
            isInitializing: JSON.stringify(isInitializing),
          }}
          onClickLogout={logout}
        />
      </LayoutViewContent>
    </>
  );
}
