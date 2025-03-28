import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { BackendWrapper } from "./providers/BackendProvider";
import "./providers/BackendProvider.css";
import { TRPCProvider } from "./trpc/client";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BackendWrapper>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BackendWrapper>
  </React.StrictMode>,
);
