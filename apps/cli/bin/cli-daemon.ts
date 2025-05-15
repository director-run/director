import { spawn } from "child_process";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { program } from "commander";

const PID_FILE = path.join(process.cwd(), ".server.pid");

// Check if server is running by checking PID file
function isServerRunning(): boolean {
  if (!fs.existsSync(PID_FILE)) {
    return false;
  }

  const pid = fs.readFileSync(PID_FILE, "utf-8");

  try {
    // Check if process with PID exists
    process.kill(parseInt(pid, 10), 0);
    return true;
  } catch (e) {
    // If error, process doesn't exist, clean up stale PID file
    fs.unlinkSync(PID_FILE);
    return false;
  }
}

// Start the server normally (foreground)
function startServer() {
  const server = createServer((req, res) => {
    console.log(req.method, req.url);
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello World");
      return;
    }

    // Handle other routes or return 404
    res.writeHead(404);
    res.end();
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return server;
}

// Start server as a daemon (background)
function startDaemon() {
  if (isServerRunning()) {
    console.error(
      'Server is already running. Use "cli.ts stop" to stop it first.',
    );
    process.exit(1);
  }

  console.log("Starting server in daemon mode...");

  // Spawn the process detached from parent
  const child = spawn(
    process.execPath, // node executable
    [path.join(__dirname, "daemon.js")], // daemon script
    {
      stdio: "ignore", // Redirect stdout/stderr to /dev/null
      detached: true, // Allow running independently from parent process
      env: process.env,
    },
  );

  // Unref the child process to allow parent to exit
  child.unref();

  console.log("Server daemon started successfully.");
}

// Stop the running daemon
function stopDaemon() {
  if (!isServerRunning()) {
    console.log("No server is currently running.");
    return;
  }

  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, "utf-8"), 10);
    process.kill(pid, "SIGTERM");
    fs.unlinkSync(PID_FILE);
    console.log("Server stopped successfully.");
  } catch (error) {
    console.error("Failed to stop server:", error);
    process.exit(1);
  }
}

// Configure CLI commands
program
  .command("start")
  .description("Start the server")
  .option("-d, --daemon", "Run server as a daemon (background process)")
  .action((options) => {
    if (options.daemon) {
      startDaemon();
    } else {
      if (isServerRunning()) {
        console.error(
          'Server is already running. Use "cli.ts stop" to stop it first.',
        );
        process.exit(1);
      }
      startServer();
    }
  });

program
  .command("stop")
  .description("Stop the server daemon if running")
  .action(() => {
    stopDaemon();
  });

program
  .command("status")
  .description("Check if server is running")
  .action(() => {
    if (isServerRunning()) {
      const pid = fs.readFileSync(PID_FILE, "utf-8");
      console.log(`Server is running (PID: ${pid})`);
    } else {
      console.log("Server is not running");
    }
  });

program.parse(process.argv);
