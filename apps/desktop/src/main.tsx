import { AppProviders } from "@/components/providers";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { GetStartedView } from "./components/get-started/get-started-view";

import "./global.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppProviders />}>
          <Route index element={<App />} />
          <Route path="get-started" element={<GetStartedView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
