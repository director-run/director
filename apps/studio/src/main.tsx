import { ChatToUs } from "@director.run/design/components/chat-to-us.tsx";
import { Toaster } from "@director.run/design/components/ui/toast.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { BASE_PATH, GATEWAY_URL, REGISTRY_URL } from "./config";
import { AuthProvider } from "./contexts/auth-context";
import { useAuth } from "./contexts/auth-context";
import { BackendProvider } from "./contexts/backend-context";
import { GlobalErrorBoundary } from "./helpers/global-error-boundry";
import { usePlaybooks } from "./hooks/use-playbooks";
import { OAuthCallbackPage } from "./pages/oauth-callback-page";
import { GetStartedPage } from "./pages/onboarding";
import { PlaybookCreatePage } from "./pages/playbook-create-page";
import { PlaybookDetailPage } from "./pages/playbook-detail-page";
import { PlaybookTargetDetailPage } from "./pages/playbook-target-detail-page";
import { RegistryDetailPage } from "./pages/registry-detail-page";
import { RegistryListPage } from "./pages/registry-list-page";
import { RootLayout } from "./root-layout";

import "./fonts.css";
import "./globals.css";
import { ConnectionBoundary } from "./helpers/connection-boundry";

export const App = () => {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <div>Initializing Auth...</div>;
  }

  return (
    <Routes>
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route element={<ProtectedRoute />}> */}
      <Route
        path="/oauth/:playbookId/:targetId/callback"
        element={<OAuthCallbackPage />}
      />
      <Route element={<RootLayout />}>
        <Route path="/library" element={<RegistryListPage />} />
        <Route
          path="/library/mcp/:entryName"
          element={<RegistryDetailPage />}
        />
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
        <Route path="/:playbookId" element={<PlaybookDetailPage />} />
        <Route
          path="/:playbookId/:targetId"
          element={<PlaybookTargetDetailPage />}
        />
        <Route path="/new" element={<PlaybookCreatePage />} />
      </Route>
      <Route path="/get-started" element={<GetStartedPage />} />
      <Route path="*" element={<DefaultRoute />} />
      {/* </Route> */}
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <BrowserRouter basename={BASE_PATH}>
        <BackendProvider gatewayUrl={GATEWAY_URL} registryUrl={REGISTRY_URL}>
          <ConnectionBoundary>
            <AuthProvider>
              <App />
              <Toaster />
              <ChatToUs />
            </AuthProvider>
          </ConnectionBoundary>
        </BackendProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  </React.StrictMode>,
);

function DefaultRoute() {
  const { data: playbooks, isLoading: isPlaybooksLoading } = usePlaybooks();

  if (isPlaybooksLoading) {
    return <div>Initializing Playbooks...</div>;
  }

  if (playbooks?.length && playbooks.length > 0) {
    return <Navigate to={`/${playbooks[0].id}`} replace />;
  } else {
    return <Navigate to={"/get-started"} replace />;
  }
}
