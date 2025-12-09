import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { input, password } from "@inquirer/prompts";
import chalk from "chalk";
import { env } from "../../env";
import { saveAuthToken } from "../../utils/auth";

export function registerSignupCommand(program: DirectorCommand) {
  program
    .command("signup")
    .description("Create a new account")
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
          validate: (value) => {
            if (value.length < 8) {
              return "Password must be at least 8 characters";
            }
            return true;
          },
        });

        const confirmPass = await password({
          message: "Confirm password:",
          mask: "*",
        });

        if (pass !== confirmPass) {
          console.error(chalk.red("Passwords do not match"));
          process.exit(1);
        }

        const baseURL = env.GATEWAY_URL;
        const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password: pass,
            name: email,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.message || `Signup failed: ${response.statusText}`,
          );
        }

        const sessionToken = response.headers.get("set-cookie");
        if (sessionToken) {
          saveAuthToken(sessionToken);
        }

        console.log(chalk.green("✓ Account created successfully!"));
        console.log(chalk.dim(`Signed in as ${email}`));
      }),
    );
}
