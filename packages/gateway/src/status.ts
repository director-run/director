import { allClientStatuses } from "@director.run/client-configurator/index";
import { isCommandInPath } from "@director.run/utilities/os";

export async function getStatus() {
  return {
    platform: process.platform,
    dependencies: [
      {
        name: "npx",
        installed: isCommandInPath("npx"),
      },
      {
        name: "uvx",
        installed: !isCommandInPath("uvx"),
      },
    ],
    clients: await allClientStatuses(),
  };
}
