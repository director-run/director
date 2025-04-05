import { AppProviders } from "@/components/providers";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { GetStartedIndexRoute } from "./routes/get-started/get-started-index";
import { ProxiesGetRoute } from "./routes/proxies/proxies-get";
import { ProxiesNewRoute } from "./routes/proxies/proxies-new";

import "./global.css";
import { useConnectionContext } from "./components/connection/connection-provider";
import { MainLayout } from "./components/global/main-layout";
import { SingleLayout } from "./components/global/single-layout";

function NavigateToFirstProxy() {
  const { servers } = useConnectionContext();

  if (servers.length === 0) {
    return <Navigate to="/get-started" />;
  }

  return <Navigate to={`/proxies/${servers[0].name}`} />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppProviders />}>
          <Route path="/" element={<NavigateToFirstProxy />} />
          <Route element={<SingleLayout />}>
            <Route path="get-started" element={<GetStartedIndexRoute />} />
            <Route path="*" element={<div>Not found</div>} />
            <Route path="/proxies/new" element={<ProxiesNewRoute />} />
          </Route>
          <Route path="proxies">
            <Route element={<MainLayout />}>
              <Route index element={<NavigateToFirstProxy />} />
              <Route path=":id" element={<ProxiesGetRoute />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
