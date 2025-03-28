import { Command } from "@tauri-apps/api/shell";
import { Child } from "@tauri-apps/api/shell";
import React, { useEffect, useState } from "react";
import { Store } from "tauri-plugin-store-api";
import { getLogger } from "../logger";

// Initialize logger and persistent store
const logger = getLogger("backend");
const store = new Store("state.json");

// Server ready detection string
const SERVER_READY_STRING = "Server running at";

type BackendStatus = "idle" | "starting" | "ready" | "error";

type BackendContextType = {
  status: BackendStatus;
  error: string | null;
  logs: string[];
};

// Create context for backend state
const BackendContext = React.createContext<BackendContextType>({
  status: "idle",
  error: null,
  logs: [],
});

export const useBackend = () => React.useContext(BackendContext);

interface BackendProviderProps {
  children: React.ReactNode;
}

export function BackendProvider({ children }: BackendProviderProps) {
  if (typeof window.__TAURI__ === "undefined") {
    logger.warn(
      "Not running in a Tauri environment, skipping backend provider",
    );
    return <div>{children}</div>;
  } else {
    logger.info(
      "Running in a Tauri environment, initializing backend provider",
    );
  }

  const [status, setStatus] = useState<BackendStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [child, setChild] = useState<Child | null>(null);

  // Start the backend when the component mounts - only once
  useEffect(() => {
    // Flag to track if this is the first mount
    let isMounted = true;

    const startBackend = async () => {
      // Guard to ensure this only runs once and only if still mounted
      if (!isMounted) {
        return;
      }

      console.log("---------   Starting backend...");
      try {
        setStatus("starting");
        setError(null);
        setLogs([]);

        // Check for and kill any existing backend process
        const backendPid = await store.get<number>("backendPid");
        if (backendPid) {
          logger.info(
            `Found existing backend process (PID: ${backendPid}), killing it...`,
          );
          try {
            const existingChild = new Child(backendPid);
            await existingChild.kill();
            logger.info("Successfully killed existing backend process");
          } catch (err) {
            logger.error("Error killing existing process:", String(err));
          }
          await store.delete("backendPid");
          await store.save();
        }

        logger.info("Starting backend process...");
        const command = Command.sidecar("binaries/backend");

        // Set up event listeners
        command.on("close", async (data) => {
          // Only update state if component is still mounted
          if (!isMounted) {
            return;
          }

          const exitMessage = `Backend process exited with code ${data.code}`;
          logger.info(exitMessage);

          // If the process exits with non-zero code or before ready state, mark as error
          if (data.code !== 0 || status !== "ready") {
            setStatus("error");
            setError(exitMessage);
          }

          // Clean up the stored PID
          await store.delete("backendPid");
          await store.save();
          setChild(null);
        });

        command.on("error", (err) => {
          // Only update state if component is still mounted
          if (!isMounted) {
            return;
          }

          const errorMessage = `Backend process error: ${String(err)}`;
          logger.error(errorMessage);
          setStatus("error");
          setError(errorMessage);
          setChild(null);
        });

        // Capture stdout and check for server ready message
        command.stdout.on("data", (line) => {
          // Only update state if component is still mounted
          if (!isMounted) {
            return;
          }

          logger.info(`Backend stdout: ${line}`);

          // Add to logs
          setLogs((prevLogs) => [...prevLogs, line]);

          // Check if server is ready
          if (line.includes(SERVER_READY_STRING)) {
            setStatus("ready");
          }
        });

        command.stderr.on("data", (line) => {
          // Only update state if component is still mounted
          if (!isMounted) {
            return;
          }

          logger.error(`Backend stderr: ${line}`);
          setLogs((prevLogs) => [...prevLogs, `ERROR: ${line}`]);
        });

        // Spawn the process
        const newChild = await command.spawn();

        // Only update state if component is still mounted
        if (!isMounted) {
          // If unmounted during spawn, kill the process immediately
          try {
            await newChild.kill();
            logger.info(
              "Killed backend process because component unmounted during startup",
            );
          } catch (killErr) {
            logger.error(
              "Error killing process after unmount:",
              String(killErr),
            );
          }
          return;
        }

        setChild(newChild);
        logger.info(`Backend process started with PID: ${newChild.pid}`);

        // Store the PID for cleanup on next start
        await store.set("backendPid", newChild.pid);
        await store.save();
      } catch (err) {
        // Only update state if component is still mounted
        if (!isMounted) {
          return;
        }

        const errorMessage = `Failed to start backend: ${String(err)}`;
        logger.error(errorMessage);
        setStatus("error");
        setError(errorMessage);
      }
    };

    // Start the backend process only once
    startBackend();

    // Cleanup function to kill the process when component unmounts
    return () => {
      // Mark as unmounted to prevent state updates after unmount
      isMounted = false;

      if (child) {
        logger.info("Cleaning up backend process on unmount...");

        // Clean up the stored PID
        store
          .delete("backendPid")
          .then(() => store.save())
          .catch((err) =>
            logger.error("Error cleaning up backend PID:", String(err)),
          );

        // Kill the process
        child
          .kill()
          .then(() =>
            logger.info("Backend process killed successfully on unmount"),
          )
          .catch((err) =>
            logger.error(
              "Error killing backend process on unmount:",
              String(err),
            ),
          );
      }
    };
  }, []); // Empty dependency array ensures this effect only runs once

  // Render appropriate UI based on backend status
  const renderContent = () => {
    switch (status) {
      case "idle":
      case "starting":
        return (
          <div className="backend-loading">
            <div className="spinner"></div>
            <h2>Starting backend server...</h2>
            <div className="logs">
              {logs.slice(-5).map((log, i) => (
                <div key={i} className="log-line">
                  {log}
                </div>
              ))}
            </div>
          </div>
        );

      case "error":
        return (
          <div className="backend-error">
            <h2>Backend Error</h2>
            <div className="error-message">{error}</div>
            <div className="logs-container">
              <h3>Logs:</h3>
              <div className="logs">
                {logs.map((log, i) => (
                  <div key={i} className="log-line">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "ready":
        return children;
    }
  };

  return (
    <BackendContext.Provider value={{ status, error, logs }}>
      {renderContent()}
    </BackendContext.Provider>
  );
}
