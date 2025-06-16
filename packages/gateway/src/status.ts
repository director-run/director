import { allClientStatuses } from "@director.run/client-configurator/index";
import { isCommandInPath } from "@director.run/utilities/os";

export async function getStatus() {
  return {
    platform: process.platform,
    dependencies: {
      npx: isCommandInPath("npx"),
      uvx: isCommandInPath("uvx"),
      //   os: process.versions.os,
      //   node: process.versions.node,
      //   npm: process.versions.npm,
    },
    clients: await allClientStatuses(),
  };
}
