import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { KitchenSink } from "./KitchenSink.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <KitchenSink />
    </BrowserRouter>
  </React.StrictMode>,
);
