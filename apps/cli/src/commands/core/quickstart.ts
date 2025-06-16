import { getStatus } from "@director.run/gateway/status";
import { green, red, whiteBold } from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { loader } from "@director.run/utilities/cli/loader";
import { getLogger } from "@director.run/utilities/logger";

const logger = getLogger("quickstart");

export function registerQuickstartCommand(program: DirectorCommand) {
  program
    .command("quickstart")
    .description("Start the gateway and open the studio in your browser")
    .action(
      actionWithErrorHandler(async () => {
        await checkPrerequisites();
        // await startGateway(async () => {
        //   logger.info(
        //     `gateway started, opening ${env.STUDIO_URL} in your browser...`,
        //   );
        //   await openStudio();
        // });
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
  lines.push("");

  for (const dependency of status.dependencies) {
    lines.push(
      dependecyStatus({
        name: dependency.name,
        installed: dependency.installed,
        successText: `${dependency.name} is installed`,
        failureText: `${dependency.name} is not available in $PATH`,
      }),
    );
  }

  const countInstalledDependencies = status.dependencies.filter(
    (dependency) => dependency.installed,
  ).length;

  if (countInstalledDependencies < status.dependencies.length) {
    problems.push(
      "Some depencies are not available in $PATH, MCP servers that depend on them will not work.",
    );
  }
  lines.push("");

  lines.push(whiteBold("MCP Clients Check"));
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
      "No MCP clients found. You should have at least one MCP client installed in order to use the automatic client installation.",
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
