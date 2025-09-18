import {} from "@director.run/studio/components/split-view.tsx";
import "./fonts.css";
import "./globals.css";
import {} from "@director.run/studio/components/layout/layout.tsx";
import { FullScreenLoader } from "@director.run/studio/components/pages/global/loader.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { useAuth } from "./contexts/auth-context";
import { AboutPage } from "./pages/about-page";
import { LoginPage } from "./pages/login-page";
import { SettingsPage } from "./pages/settings-page";
import { WorkspaceDetailPage } from "./pages/workspace-detail-page";
import { Root } from "./root";

import "./fonts.css";
import "./globals.css";

export const App = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <FullScreenLoader />;
  }
  if (isAuthenticated) {
    return (
      <Root>
        <Routes>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/workspace" element={<WorkspaceDetailPage />} />
          <Route path="*" element={<Navigate to="/settings" replace />} />
        </Routes>
      </Root>
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
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
