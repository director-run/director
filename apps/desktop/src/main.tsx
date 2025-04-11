import { AppProviders } from "@/components/providers";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { GetStartedIndexRoute } from "./routes/get-started/get-started-index";
import { ProxiesGetRoute } from "./routes/proxies/proxies-get";
import { ProxiesNewRoute } from "./routes/proxies/proxies-new";

import "./global.css";
import { MainLayout } from "./components/layout/main-layout";
import { useConnectionContext } from "./components/providers/connection-provider";

function NavigateToFirstProxy() {
  const { servers } = useConnectionContext();

  if (servers.length === 0) {
    return <Navigate to="/get-started" />;
  }

  return <Navigate to={`/${servers[0].id}`} />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route>
            <Route element={<MainLayout />}>
              <Route path="/" element={<NavigateToFirstProxy />} />
              <Route path="get-started" element={<GetStartedIndexRoute />} />
              <Route path="new" element={<ProxiesNewRoute />} />
              <Route path=":proxyId" element={<ProxiesGetRoute />} />
              <Route path="*" element={<div>Not found</div>} />
            </Route>
          </Route>
        </Routes>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>,
);
