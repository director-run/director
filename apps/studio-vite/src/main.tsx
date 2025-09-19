import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { useAuth } from "./contexts/auth-context";
import { GatewayProvider } from "./contexts/gateway-context";
import { LoginPage } from "./pages/login-page";
import { RegistryListPage } from "./pages/registry-list-page";
import { SettingsPage } from "./pages/settings-page";
import { NewProxyPage } from "./pages/workspace-create-page";
import { WorkspaceDetailPage } from "./pages/workspace-detail-page";
import { RootLayout } from "./root-layout";

import "./fonts.css";
import "./globals.css";
import { GlobalErrorBoundary } from "./helpers/global-error-boundry";

const GATEWAY_URL = "http://localhost:3673";

export const App = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <div>Initializing Auth...</div>;
  }

  console.log(
    `AUTH: isInitializing=${isInitializing} isAuthenticated=${isAuthenticated}`,
  );

  if (isAuthenticated) {
    return (
      <RootLayout>
        <Routes>
          <Route path="/library" element={<RegistryListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/:workspaceId" element={<WorkspaceDetailPage />} />
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
    <GlobalErrorBoundary>
      <BrowserRouter>
        <GatewayProvider gatewayUrl={GATEWAY_URL}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GatewayProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  </React.StrictMode>,
);
