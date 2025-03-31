import { promises as fs } from "fs";
import * as path from "path";
import { Command } from "commander";
import * as semver from "semver";

const rootDir = path.resolve(__dirname, "..");
const program = new Command();

program
  .name("version")
  .description("utility to manage the version of the desktop app");

program
  .command("bump")
  .description("Bump the version of the desktop app")
  .option("-n, --new-version <version>", "New version to bump to")
  .action(async (options) => {
    try {
      let newVersion;
      const currentVersion = await getPackageVersion();

      if (options.newVersion) {
        newVersion = options.newVersion;
      } else {
        newVersion = semver.inc(currentVersion, "patch");
      }

      // Check newVersion is valid semver
      if (!semver.valid(newVersion) || newVersion.startsWith("v")) {
        console.error(`❌ Invalid version format: ${newVersion}`);
        console.error(
          "Version must be a valid semver string (e.g., 1.2.3 or 1.2.3-beta.1)",
        );
        process.exit(1);
      }

      // Check if new version is higher than current
      if (!semver.gt(newVersion, currentVersion)) {
        console.error(
          `❌ New version ${newVersion} must be higher than current version ${currentVersion}.`,
        );
        process.exit(1);
      }

      // Update all version files
      await updateVersions(rootDir, newVersion);

      console.log(
        `✅ Successfully bumped version from ${currentVersion} to ${newVersion}`,
      );
    } catch (error) {
      console.error("❌ Error bumping version:");
      console.error(error);
      process.exit(1);
    }
  });

program
  .command("check")
  .description("Make sure the version number is consistent across config files")
  .action(async () => {
    try {
      await checkVersionConsistency();
      console.log("✅ All version numbers are consistent.");
    } catch (error) {
      console.error("❌ Version mismatch detected:");
      console.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .command("print")
  .description("Print the current version number")
  .action(async () => {
    try {
      await checkVersionConsistency();
      console.log(await getPackageVersion());
    } catch (error) {
      console.error("❌ Version mismatch detected:");
      console.error((error as Error).message);
      process.exit(1);
    }
  });

program.parse();

async function checkVersionConsistency(): Promise<void> {
  const packageVersion = await getPackageVersion();

  // Get tauri.conf.json version
  const tauriConfPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
  const tauriConf = JSON.parse(await fs.readFile(tauriConfPath, "utf8"));
  const tauriVersion = tauriConf.package.version;

  // Get Cargo.toml version
  const cargoTomlPath = path.join(rootDir, "src-tauri", "Cargo.toml");
  const cargoToml = await fs.readFile(cargoTomlPath, "utf8");
  const cargoVersionMatch = cargoToml.match(/version\s*=\s*"([^"]+)"/);
  if (!cargoVersionMatch) {
    throw new Error("Could not find version in Cargo.toml");
  }
  const cargoVersion = cargoVersionMatch[1];

  if (cargoVersion !== packageVersion || packageVersion !== tauriVersion) {
    throw new Error(
      `package.json (${packageVersion}) ≠ tauri.conf.json (${tauriVersion}) ≠ Cargo.toml (${cargoVersion})\n`,
    );
  }
}

async function getPackageVersion(): Promise<string> {
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  const packageVersion = packageJson.version;
  return packageVersion;
}

async function updateVersions(
  rootDir: string,
  newVersion: string,
): Promise<void> {
  // Update package.json
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  packageJson.version = newVersion;
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Update tauri.conf.json
  const tauriConfPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
  const tauriConf = JSON.parse(await fs.readFile(tauriConfPath, "utf8"));
  tauriConf.package.version = newVersion;
  await fs.writeFile(tauriConfPath, JSON.stringify(tauriConf, null, 2));

  // Update Cargo.toml
  const cargoTomlPath = path.join(rootDir, "src-tauri", "Cargo.toml");
  const cargoToml = await fs.readFile(cargoTomlPath, "utf8");
  const cargoTomlLines = cargoToml.split("\n");
  for (let i = 0; i < cargoTomlLines.length; i++) {
    if (cargoTomlLines[i].startsWith("version")) {
      cargoTomlLines[i] = `version = "${newVersion}"`;
      break;
    }
  }
  await fs.writeFile(cargoTomlPath, cargoTomlLines.join("\n"));
}
