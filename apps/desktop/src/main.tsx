import { Command } from "@tauri-apps/api/shell";
import { Child } from "@tauri-apps/api/shell";
import {} from "@trpc/client";
import React from "react";
import ReactDOM from "react-dom/client";
import { Store } from "tauri-plugin-store-api";
import { App } from "./App";
import { getLogger } from "./logger";
import { TRPCProvider } from "./trpc/client";

const logger = getLogger("backend");
const store = new Store("state.json");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TRPCProvider>
      <App />
    </TRPCProvider>
  </React.StrictMode>,
);

async function startBackend() {
  const backendPid = await store.get<number>("backendPid");
  if (backendPid) {
    console.log("Found a running backend, pid=" + backendPid);
    console.log("killing");
    const child = new Child(backendPid);
    await child.kill();
    console.log("killed");
    await store.delete("backendPid");
    await store.save();
  }

  logger.info("Starting backend...");

  const command = Command.sidecar("binaries/backend");
  logger.info("Starting backend process...");

  // Set up event listeners before spawning
  command.on("close", (data) => {
    console.log({ code: data.code }, "CLI process exited");
  });

  command.on("error", (error) => {
    console.error(error);
  });

  command.stdout.on("data", (line) => {
    console.log(line);
  });

  command.stderr.on("data", (line) => {
    console.error(line);
  });

  // Spawn the process and keep a reference to the child
  const child: Child = await command.spawn();
  console.info("Process started, pid=" + child.pid);

  await store.set("backendPid", child.pid);
  await store.save();
}

// console.log(import.meta.env);
// Check if we're in development or production mode
// if (import.meta.env.PROD) {
// In production build mode, start the backend
// startBackend();
startBackend();
// } else {
//   // In development mode, just log a message
//   const logger = getLogger("backend");
//   logger.info("Running in development mode - backend should be started by Tauri dev process");
// }
