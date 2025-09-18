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
import { NotFoundPage } from "./pages/not-found-page";
import { SettingsPage } from "./pages/settings-page";
import { WorkspaceDetailPage } from "./pages/workspace-detail-page";
import { Root } from "./root";

import "./fonts.css";
import "./globals.css";

export const GlobalLoader = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuth();
  return isLoading ? <FullScreenLoader /> : <>{children}</>;
};

export const App = () => {
  return (
    <Root>
      <Routes>
        <Route path="/" element={<Navigate to="/settings" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/workspace" element={<WorkspaceDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Root>
  );
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
