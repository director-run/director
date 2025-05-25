import path from "path";
import { daemon } from "@director.run/utilities/daemonize";
import { startGateway } from "../src/commands/core";

// Example 2: Daemonize an async function
async function example2() {
  //   const myService = async () => {
  //     await startGateway();
  //     // console.log("Service started");

  //     // // Simulate a long-running service
  //     // setInterval(() => {
  //     //   console.log("Service heartbeat:", new Date().toISOString());
  //     // }, 5000);

  //     // // Keep the process alive
  //     // await new Promise(() => {}); // Never resolves
  //   };

  try {
    const result = await daemon(startGateway, {
      pidFile: path.join(process.cwd(), "./service.pid"),
      stdio: "inherit", // Show output
      onError: (error) => {
        console.error("Service error:", error);
      },
    });

    console.log(`Service started with PID: ${result.pid}`);
  } catch (error) {
    console.error(
      "Failed to start service:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

example2();
