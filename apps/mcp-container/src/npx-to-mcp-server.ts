import { readFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

function getLocalSlackServerPath(packageName: string): string {
  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve(`${packageName}/package.json`);

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
    bin: Record<string, string> | string;
  };

  const baseDir = dirname(packageJsonPath);

  if (typeof packageJson.bin === "string") {
    return join(baseDir, packageJson.bin);
  } else if (typeof packageJson.bin === "object") {
    const values = Object.values(packageJson.bin);

    if (values.length === 1) {
      return join(baseDir, values[0] as string);
    } else {
      throw new Error(
        `Could not find binary path in ${packageName} package.json`,
      );
    }
  } else {
    throw new Error(
      `Could not find binary path in ${packageName} package.json`,
    );
  }
}

export async function npxToMCPServer(params: {
  packageName: string;
  args?: string[];
  env?: Record<string, string>;
}): Promise<Server> {
  const proxy = new ProxyServer({
    id: "docker-v2",
    servers: [
      new StdioClient({
        name: "docker-v2",
        command: "node",
        args: [
          getLocalSlackServerPath("@modelcontextprotocol/server-slack"),
          ...(params.args || []),
        ],
        env: params.env || {},
      }),
    ],
  });
  console.log("Proxy server create, connecting targets...");

  await proxy.connectTargets();

  return proxy;
}
