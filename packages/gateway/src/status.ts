import { isCommandInPath } from "@director.run/utilities/os";

export function getStatus(cliVersion: string | null) {
  return {
    platform: process.platform,
    dependencies: [
      {
        name: "npx",
        installed: isCommandInPath("npx"),
      },
      {
        name: "uvx",
        installed: isCommandInPath("uvx"),
      },
    ],
    cliVersion,
  };
}
