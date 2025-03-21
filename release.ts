#!/usr/bin/env bun

/**
 * Release script for Director Desktop App
 * Usage: bun run release.ts <version>
 * Example: bun run release.ts 0.1.0
 */

import * as semver from "semver";
import { fs, path, $, chalk } from "zx";

// Make zx silent by default (no command echoing)
$.verbose = false;

// Get version from command line arguments
const version = process.argv[2];

if (!version) {
  console.error(chalk.red("Please provide a version number"));
  console.error(chalk.yellow("Usage: bun run release.ts <version>"));
  process.exit(1);
}

// Validate version format using semver
if (!semver.valid(version) || version.startsWith("v")) {
  console.error(chalk.red("Invalid version format"));
  console.error(chalk.yellow("Version must be a valid semver string (e.g., 1.2.3 or 1.2.3-beta.1)"));
  process.exit(1);
}

/**
 * Assert that there are no uncommitted changes
 */
async function assertNoUncommittedChanges() {
  console.log(chalk.blue("📋 Checking for uncommitted changes..."));
  const { stdout: status } = await $`git status --porcelain`;
  if (status.trim() !== "") {
    console.error(chalk.red("❌ There are unstaged or staged changes that have not been committed or pushed."));
    console.error(chalk.yellow("Please commit or stash your changes before releasing."));
    process.exit(1);
  }
}

/**
 * Assert that we're on the main branch
 */
async function assertMainBranch() {
  console.log(chalk.blue("📋 Checking current branch..."));
  const { stdout: currentBranch } = await $`git branch --show-current`;
  if (currentBranch.trim() !== "main") {
    console.error(chalk.red(`❌ Currently on branch ${currentBranch.trim()}, please switch to main before releasing.`));
    process.exit(1);
  }
}

/**
 * Assert that local branch is not ahead of origin
 */
async function assertNotAheadOfOrigin() {
  console.log(chalk.blue("📋 Checking if local branch is ahead of origin..."));
  try {
    const { stdout: gitStatus } = await $`git status -sb`;
    if (gitStatus.includes("ahead")) {
      console.error(chalk.red("❌ Local branch is ahead of origin, please push your changes before releasing."));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red("❌ Error checking git status:"), error);
    process.exit(1);
  }
}

/**
 * Pull latest changes from main
 */
async function pullLatestChanges() {
  console.log(chalk.blue("📥 Pulling latest changes from main..."));
  await $`git pull origin main`;
}

/**
 * Assert that versions in all files are consistent
 */
async function assertVersionConsistency(rootDir: string) {
  console.log(chalk.blue("🔍 Checking if current versions are consistent..."));
  try {
    await checkVersionConsistency(rootDir);
    console.log(chalk.green("✅ All version numbers are consistent."));
  } catch (error) {
    console.error(chalk.red("❌ Version mismatch detected:"));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

/**
 * Assert that new version is higher than current version
 */
async function assertVersionIsHigher(newVersion: string, rootDir: string) {
  const currentVersion = await getCurrentVersion(rootDir);
  console.log(chalk.blue(`🔍 Checking if new version ${newVersion} is higher than current version ${currentVersion}...`));
  if (!semver.gt(newVersion, currentVersion)) {
    console.error(chalk.red(`❌ New version ${newVersion} must be higher than current version ${currentVersion}.`));
    process.exit(1);
  }
  console.log(chalk.green("✅ New version is higher than current version."));
  return currentVersion;
}

/**
 * Commit version changes
 */
async function commitVersionChanges(version: string) {
  console.log(chalk.blue("💾 Committing version changes..."));
  await $`git add apps/desktop/package.json apps/desktop/src-tauri/tauri.conf.json apps/desktop/src-tauri/Cargo.toml`;
  await $`git commit -m "bump version to ${version}"`;
}

/**
 * Push changes to main
 */
async function pushChanges() {
  console.log(chalk.blue("📤 Pushing changes to main..."));
  await $`git push origin main`;
}

/**
 * Create and push tag
 */
async function createAndPushTag(version: string) {
  console.log(chalk.blue(`🏷️ Creating tag v${version}...`));
  await $`git tag -a "v${version}" -m "Release v${version}"`;

  console.log(chalk.blue("📤 Pushing tag..."));
  await $`git push origin "v${version}"`;
}

// Main function to run the release process
async function main() {
  try {
    await assertNoUncommittedChanges();
    await assertMainBranch();
    await assertNotAheadOfOrigin();
    await pullLatestChanges();

    const rootDir = path.join(__dirname, "apps/desktop");
    await assertVersionConsistency(rootDir);
    await assertVersionIsHigher(version, rootDir);

    // Update version numbers across all files
    console.log(chalk.blue(`🔄 Updating version to ${version} in all files...`));
    await updateDesktopAppVersionNumber(version);
    await $`bun run format`;

    await commitVersionChanges(version);
    await pushChanges();
    await createAndPushTag(version);

    console.log(chalk.green(`\n🎉 Successfully released v${version}!`));
    console.log(chalk.green("GitHub Actions workflow should now be triggered to build and publish the release."));
  } catch (error) {
    console.error(chalk.red("❌ Error during release process:"));
    console.error(chalk.red(error));
    process.exit(1);
  }
}

// Run the main function
main();

async function updateDesktopAppVersionNumber(newVersion: string) {
  if (!newVersion) {
    console.error(chalk.red("Please provide a version number"));
    console.error(chalk.yellow("Usage: bun run scripts/update-version.ts <new-version>"));
    process.exit(1);
  }

  // Validate version format using semver
  if (!semver.valid(newVersion)) {
    console.error(chalk.red("Invalid version format"));
    console.error(chalk.yellow("Version must be a valid semver string (e.g., 1.2.3 or 1.2.3-beta.1)"));
    process.exit(1);
  }

  const rootDir = path.join(__dirname, "apps/desktop");

  // Update package.json
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  const oldPackageVersion = packageJson.version;
  packageJson.version = newVersion;
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log(chalk.green(`✅ Updated package.json: ${oldPackageVersion} → ${newVersion}`));

  // Update tauri.conf.json
  const tauriConfPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
  const tauriConf = JSON.parse(await fs.readFile(tauriConfPath, "utf8"));
  const oldTauriVersion = tauriConf.package.version;
  tauriConf.package.version = newVersion;
  await fs.writeFile(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
  console.log(chalk.green(`✅ Updated tauri.conf.json: ${oldTauriVersion} → ${newVersion}`));

  // Update Cargo.toml
  const cargoTomlPath = path.join(rootDir, "src-tauri", "Cargo.toml");
  const cargoToml = await fs.readFile(cargoTomlPath, "utf8");
  const versionMatch = cargoToml.match(/version\s*=\s*"([^"]+)"/);
  if (!versionMatch) {
    throw new Error("Could not find version in Cargo.toml");
  }
  const oldCargoVersion = versionMatch[1];
  const updatedCargoToml = cargoToml.replace(/version\s*=\s*"([^"]+)"/, `version = "${newVersion}"`);
  await fs.writeFile(cargoTomlPath, updatedCargoToml);
  console.log(chalk.green(`✅ Updated Cargo.toml: ${oldCargoVersion} → ${newVersion}`));

  console.log(chalk.green("\n🎉 All version numbers updated successfully!"));
}

/**
 * Check if versions in all files are consistent
 */
async function checkVersionConsistency(rootDir: string): Promise<void> {
  // Get package.json version
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  const packageVersion = packageJson.version;

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

  // Check if versions match
  const versionMismatches: string[] = [];

  if (packageVersion !== tauriVersion) {
    versionMismatches.push(`package.json (${packageVersion}) ≠ tauri.conf.json (${tauriVersion})`);
  }

  if (packageVersion !== cargoVersion) {
    versionMismatches.push(`package.json (${packageVersion}) ≠ Cargo.toml (${cargoVersion})`);
  }

  if (tauriVersion !== cargoVersion) {
    versionMismatches.push(`tauri.conf.json (${tauriVersion}) ≠ Cargo.toml (${cargoVersion})`);
  }

  if (versionMismatches.length > 0) {
    throw new Error(`Version mismatch detected:\n${versionMismatches.join("\n")}`);
  }
}

/**
 * Get the current version from package.json
 */
async function getCurrentVersion(rootDir: string): Promise<string> {
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  return packageJson.version;
}
