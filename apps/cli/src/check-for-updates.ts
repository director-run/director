import boxen from "boxen";
import chalk from "chalk";
import updateNotifier from "update-notifier";
import packageJson from "../package.json" assert { type: "json" };

export async function checkForUpdates() {
  const notifier = updateNotifier({
    pkg: packageJson,
    // Check for updates every hour while we ship often
    updateCheckInterval: 1000 * 60 * 60,
  });

  await notifier.fetchInfo();

  if (notifier.update) {
    const defaultTemplate =
      chalk.bold(
        "Update available " +
          chalk.dim(notifier.update.current) +
          chalk.reset(" → ") +
          chalk.green(notifier.update.latest),
      ) +
      " \n\nTo continue using Director, please update to the lastest version.\n\nRun " +
      chalk.cyan("npm install -g @director.run/cli");

    console.log(
      boxen(defaultTemplate, {
        padding: 1,
        borderStyle: "double",
      }),
    );

    process.exit(0);
  }
}
