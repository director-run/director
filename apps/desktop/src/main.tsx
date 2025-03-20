import { Command } from "@tauri-apps/api/shell";
import type { Child } from "@tauri-apps/api/shell";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { getLogger } from "./logger";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

async function startBackend() {
  const logger = getLogger("backend");
  logger.info("Starting backend...");

  const command = Command.sidecar("binaries/backend");
  logger.info("Starting backend process...");

  // Set up event listeners before spawning
  command.on("close", (data) => {
    logger.info({ code: data.code }, "CLI process exited");
  });

  command.on("error", (error) => {
    logger.error({ error }, "CLI process error");
  });

  command.stdout.on("data", (line) => {
    logger.info({ output: line }, "CLI stdout");
  });

  command.stderr.on("data", (line) => {
    logger.error({ output: line }, "CLI stderr");
  });

  // Spawn the process and keep a reference to the child
  const child: Child = await command.spawn();
  logger.info({ pid: child.pid }, "CLI process started");
}

startBackend();
