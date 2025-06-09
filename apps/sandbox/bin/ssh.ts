#!/usr/bin/env zx

import { $ } from "zx";

if (!process.argv[2]) {
  console.error("Usage: zx ssh.ts <vm-name>");
  process.exit(1);
}

const vmName = process.argv[2];
const password = "admin"; // default password is "admin"

try {
  await $({
    stdio: "inherit",
  })`sshpass -p ${password} ssh -o StrictHostKeyChecking=no admin@$(tart ip ${vmName})`;
} catch (error: unknown) {
  console.error(
    "Failed to connect:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
}
