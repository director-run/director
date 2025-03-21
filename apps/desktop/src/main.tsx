import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { BackendProvider } from "./providers/BackendProvider";
import "./providers/BackendProvider.css";
import { TRPCProvider } from "./trpc/client";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BackendProvider>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BackendProvider>
  </React.StrictMode>,
);
