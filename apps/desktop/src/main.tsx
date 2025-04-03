import { AppProviders } from "@/components/providers";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, NavLink, Route, Routes } from "react-router";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppProviders />}>
          <Route index element={<App />} />
          <Route
            path="getting-started"
            element={<NavLink to="/">Hello</NavLink>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
