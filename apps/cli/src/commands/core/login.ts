import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { input, password } from "@inquirer/prompts";
import chalk from "chalk";
import { getGatewayBaseUrl } from "../../config";
import { saveAuthToken } from "../../utils/auth";

export function registerLoginCommand(program: DirectorCommand) {
  program
    .command("login")
    .description("Log in to your account")
    .action(
      actionWithErrorHandler(async () => {
        const email = await input({
          message: "Email:",
          validate: (value) => {
            if (!value.includes("@")) {
              return "Please enter a valid email address";
            }
            return true;
          },
        });

        const pass = await password({
          message: "Password:",
          mask: "*",
        });

        const baseURL = getGatewayBaseUrl();
        const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password: pass,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.message || `Login failed: ${response.statusText}`,
          );
        }

        const data = await response.json();

        const sessionToken = response.headers.get("set-cookie");
        if (sessionToken) {
          saveAuthToken(sessionToken);
        }

        console.log(chalk.green("✓ Logged in successfully!"));
        console.log(chalk.dim(`Welcome back, ${data.user.name}!`));
      }),
    );
}
