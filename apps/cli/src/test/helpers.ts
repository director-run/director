import path from "node:path";
import { IntegrationTestHarness } from "@director.run/gateway/test/integration";
import { $ } from "zx";

const BIN_PATH = path.join(__dirname, "../../bin/cli.ts");

export function runCLICommand(...command: string[]) {
  const cmd = [`bun`, BIN_PATH, ...command];
  return $({
    env: {
      ...process.env,
      LOG_LEVEL: "debug",
      GATEWAY_URL: `http://localhost:${IntegrationTestHarness.gatewayPort}`,
    },
  })`${cmd[0]} ${cmd.slice(1)}`;
}
