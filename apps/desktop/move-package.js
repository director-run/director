import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ext = process.platform === "win32" ? ".exe" : "";

const rustInfo = execSync("rustc -vV");
const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
if (!targetTriple) {
  console.error("Failed to determine platform target triple");
}
fs.mkdirSync(path.join(__dirname, "./src-tauri/binaries"), { recursive: true });
fs.renameSync(
  path.join(__dirname, "../cli/dist/cli" + ext),
  path.join(__dirname, "./src-tauri/binaries/cli-" + targetTriple + ext),
);
