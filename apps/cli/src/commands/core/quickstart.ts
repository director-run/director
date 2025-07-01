import { getStatus } from "@director.run/gateway/status";
import { green, red, whiteBold } from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { loader } from "@director.run/utilities/cli/loader";
import { getLogger } from "@director.run/utilities/logger";
import { select } from "@inquirer/prompts";
import { env } from "../../env";
import { trackEvent } from "../../telemetry";
import { startGateway } from "./serve";
import { openStudio } from "./studio";

const logger = getLogger("quickstart");

export function registerQuickstartCommand(program: DirectorCommand) {
  program
    .command("quickstart")
    .description("Start the gateway and open the studio in your browser")
    .action(
      actionWithErrorHandler(async () => {
        trackEvent("quickstart_started");
        await checkPrerequisites();
        await startGateway(async () => {
          logger.info(
            `gateway started, opening ${env.STUDIO_URL} in your browser...`,
          );
          await openStudio();
        });
      }),
    );
}

async function checkPrerequisites() {
  const spinner = loader();
  spinner.start("checking prerequisites...");
  const status = await getStatus();
  spinner.stop();

  const lines = [];
  const problems = [];

  lines.push("");
  lines.push(whiteBold("Dependency Check"));
  lines.push(
    "The following dependencies are required by some MCP servers that use Stdout. It's best to have them all installed.",
  );
  lines.push("");

  for (const dependency of status.dependencies) {
    lines.push(
      dependecyStatus({
        name: dependency.name,
        installed: dependency.installed,
        successText: `${dependency.name} is installed`,
        failureText: `${dependency.name} is not available in $PATH. ${installationInstructions(dependency)}`,
      }),
    );
  }

  const countInstalledDependencies = status.dependencies.filter(
    (dependency) => dependency.installed,
  ).length;

  if (countInstalledDependencies < status.dependencies.length) {
    problems.push(
      "Some dependencies are not available in $PATH, MCP servers that depend on them will not work.",
    );
  }
  lines.push("");

  lines.push(whiteBold("MCP Clients Check"));
  lines.push(
    "Director can automatically configure the following MCP clients for you. It's best to have at least one installed.",
  );
  lines.push("");

  for (const client of status.clients) {
    lines.push(
      dependecyStatus({
        name: client.name,
        installed: client.installed,
      }),
    );
  }

  const countInstalledClients = status.clients.filter(
    (client) => client.installed,
  ).length;

  if (countInstalledClients === 0) {
    problems.push(
      "No MCP clients found. It's best to have at least one MCP client installed in order to use the automatic client configuration.",
    );
  }

  lines.push("");
  lines.push(whiteBold("Summary"));
  lines.push("");
  console.log(lines.join("\n"));

  if (problems.length > 0) {
    console.log(
      problems.map((problem) => `${red("✗")} ${red(problem)}`).join("\n"),
    );
    console.log("");
    const answer = await select({
      message: "Would you like to continue with a degraded experience?",
      choices: ["No", "Yes"],
    });
    if (answer === "Yes") {
      console.log(green("Continuing with a degraded experience..."));
    } else {
      console.log("Exiting...");
      process.exit(1);
    }
  } else {
    console.log(green("All systems go!"));
    console.log("");
  }
}

function dependecyStatus(dependency: {
  installed: boolean;
  name: string;
  successText?: string;
  failureText?: string;
}) {
  const icon = `[${dependency.installed ? green("✓") : red("✗")}]`;
  const successText =
    dependency.successText ?? `${dependency.name} is installed`;
  const failureText =
    dependency.failureText ?? `${dependency.name} is not installed`;

  return `${icon} ${dependency.installed ? successText : failureText}`;
}

function installationInstructions(dependency: {
  name: string;
}) {
  switch (dependency.name) {
    case "npx":
      return `Follow the installation instructions here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm.`;
    case "uvx":
      return `Follow the installation instructions here: https://docs.astral.sh/uv/getting-started/installation/.`;
    default:
      return undefined;
  }
}
