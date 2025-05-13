import path from "node:path";
import { startService } from "@director.run/gateway/server";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { env } from "../config";

function printDirectorAscii(): void {
  console.log(`
         _ _               _             
        | (_)             | |            
      __| |_ _ __ ___  ___| |_ ___  _ __ 
     / _' | | '__/ _ \\/ __| __/ _ \\| '__|
    | (_| | | | |  __/ (__| || (_) | |   
     \\__,_|_|_|  \\___|\\___|\\__\\___/|_|   
                                         
                                         `);
}

export function registerServiceCommands(program: Command) {
  program
    .command("start")
    .description("Start the director service")
    .action(
      actionWithErrorHandler(async () => {
        printDirectorAscii();

        await startService({
          port: env.GATEWAY_PORT,
          databaseFilePath: path.join(__dirname, "db.json"),
        });
      }),
    );

  program
    .command("config")
    .description("Print configuration variables")
    .action(
      actionWithErrorHandler(() => {
        console.log(`config:`, env);
      }),
    );
}
