import { ChatToUs } from "@director.run/studio/components/chat-to-us.tsx";
import { Toaster } from "@director.run/studio/components/ui/toast.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { useAuth } from "./contexts/auth-context";
import { BackendProvider } from "./contexts/backend-context";
import { LoginPage } from "./pages/login-page";
import { RegistryDetailPage } from "./pages/registry-detail-page";
import { RegistryListPage } from "./pages/registry-list-page";
import { SettingsPage } from "./pages/settings-page";
import { NewProxyPage } from "./pages/workspace-create-page";
import { WorkspaceDetailPage } from "./pages/workspace-detail-page";
import { WorkspaceTargetDetailPage } from "./pages/workspace-target-detail-page";
import { RootLayout } from "./root-layout";

import "./fonts.css";
import "./globals.css";

const GATEWAY_URL = "http://localhost:3673";
const REGISTRY_URL = "https://registry.director.run";

export const App = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <div>Initializing Auth...</div>;
  }

  if (isAuthenticated) {
    return (
      <RootLayout>
        <Routes>
          <Route path="/library" element={<RegistryListPage />} />
          <Route
            path="/library/mcp/:entryName"
            element={<RegistryDetailPage />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/:workspaceId" element={<WorkspaceDetailPage />} />
          <Route
            path="/:workspaceId/:targetId"
            element={<WorkspaceTargetDetailPage />}
          />
          <Route path="/new" element={<NewProxyPage />} />
          <Route path="*" element={<Navigate to="/settings" replace />} />
        </Routes>
      </RootLayout>
    );
  } else {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* <GlobalErrorBoundary> */}
    <BrowserRouter>
      <BackendProvider gatewayUrl={GATEWAY_URL} registryUrl={REGISTRY_URL}>
        <AuthProvider>
          <App />
          <Toaster />
          <ChatToUs />
        </AuthProvider>
      </BackendProvider>
    </BrowserRouter>
    {/* </GlobalErrorBoundary> */}
  </React.StrictMode>,
);
