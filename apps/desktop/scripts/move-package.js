/**
 * Script to move CLI binary to the desktop app's binaries directory with proper naming
 *
 * Example usage:
 * bun run move-package.js ../cli/dist/cli ./src-tauri/binaries
 *
 * Arguments:
 * 1. Source CLI path (relative to script or absolute)
 * 2. Target directory (relative to script or absolute)
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Get command line arguments
const sourcePath = process.argv[2] || "../../backend/dist/cli";
const targetDir = "../src-tauri/binaries";

// Platform-specific executable extension
const ext = process.platform === "win32" ? ".exe" : "";

// Get the target triple from Rust
const rustInfo = execSync("rustc -vV");
const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
if (!targetTriple) {
  console.error("Failed to determine platform target triple");
  process.exit(1);
}

// Ensure target directory exists
const targetDirFullPath = path.resolve(__dirname, targetDir);
fs.mkdirSync(targetDirFullPath, { recursive: true });

// Resolve source path
const sourceFullPath = path.resolve(__dirname, sourcePath + ext);

// Extract binary name from source path
const binaryName = path.basename(sourcePath).split(".")[0];

// Create target path with triple
const targetFullPath = path.join(
  targetDirFullPath,
  `${binaryName}-${targetTriple}${ext}`,
);

// Move the file
console.log(`Moving ${sourceFullPath} to ${targetFullPath}`);
fs.copyFileSync(sourceFullPath, targetFullPath);
