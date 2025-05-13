import { env } from "@director.run/config/env";
import { startService } from "@director.run/service/server";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";

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
        await startService();
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
