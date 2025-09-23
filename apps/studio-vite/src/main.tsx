import { ChatToUs } from "@director.run/studio/components/chat-to-us.tsx";
import { Toaster } from "@director.run/studio/components/ui/toast.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { GATEWAY_URL, REGISTRY_URL } from "./config";
import { AuthProvider } from "./contexts/auth-context";
import { useAuth } from "./contexts/auth-context";
import { BackendProvider } from "./contexts/backend-context";
import { useWorkspaces } from "./hooks/use-workspaces";
import { GetStartedPage } from "./pages/get-started";
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

export const App = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <div>Initializing Auth...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
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
        </Route>
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="*" element={<DefaultRoute />} />
      </Route>
    </Routes>
  );
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

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <div>Initializing Auth...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={"/login"} replace />;
  }

  return <Outlet />;
}

function DefaultRoute() {
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();

  if (isWorkspacesLoading) {
    return <div>Initializing Auth...</div>;
  }

  if (workspaces?.length && workspaces.length > 0) {
    return <Navigate to={`/${workspaces[0].id}`} replace />;
  } else {
    return <Navigate to={"/get-started"} replace />;
  }
}
