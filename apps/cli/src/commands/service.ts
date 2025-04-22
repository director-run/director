import { env } from "@director.run/core/config";
import { startService } from "@director.run/core/start-service";
import { Command } from "commander";
import { withErrorHandler } from "../helpers";

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
      withErrorHandler(async () => {
        printDirectorAscii();
        await startService();
      }),
    );

  program
    .command("config")
    .description("Print configuration variables")
    .action(
      withErrorHandler(() => {
        console.log("----------------");
        console.log(`config:`, env);
        console.log("----------------");
      }),
    );
}
