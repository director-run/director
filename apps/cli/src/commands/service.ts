import { Gateway } from "@director.run/gateway/gateway";
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

export function createServiceCommands() {
  const command = new Command("service");

  command
    .command("start")
    .description("Start the director service")
    .action(
      actionWithErrorHandler(async () => {
        printDirectorAscii();

        await Gateway.start({
          port: env.GATEWAY_PORT,
          databaseFilePath: env.DB_FILE_PATH,
        });
      }),
    );

  command
    .command("config")
    .description("Print configuration variables")
    .action(
      actionWithErrorHandler(() => {
        console.log(`config:`, env);
      }),
    );

  return command;
}
