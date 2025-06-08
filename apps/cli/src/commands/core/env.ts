import fs from "node:fs";
import { blue } from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import {
  LOCAL_ENV_FILE_PATH,
  env,
  getEnvFilePath,
  isUsingEnvFile,
} from "../../env";

export function registerEnvCommand(program: DirectorCommand): void {
  program
    .command("env")
    .description("Print environment variables")
    .option(
      "--write",
      "Write the environment variables to .env.local in current working directory",
    )
    .action(
      actionWithErrorHandler((options: { write: boolean }) => {
        if (options.write) {
          console.log(`writing env vars to '${LOCAL_ENV_FILE_PATH}'`);
          const envVars = Object.entries(env)
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");
          fs.writeFileSync(LOCAL_ENV_FILE_PATH, envVars);
        } else {
          isUsingEnvFile() &&
            console.log(blue(`using env file: ${getEnvFilePath()}`));
          console.log();
          console.log(`env`, env);
        }
      }),
    );
}
