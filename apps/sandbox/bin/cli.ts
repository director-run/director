import { Command } from "commander";
import packageJson from "../package.json";
import { copyId, create, list, start, stop, trust, provision, destroy, ssh } from "./commands";

const program = new Command();

program.name("computer-cluster")
       .description("A tool for managing a mcp computers on apple silicon")
       .version(packageJson.version);


program.command("list")
       .alias("ls")
       .description("List all computers")
       .action(async () => {
        const vms = await list();
        console.log(vms);
       });


program.command("create <name>")
       .description("Create a new computer")
       .action(async (name) => {
        const vm = await create(name);
        console.log(vm);
       });


program.command("start <name>")
       .description("start a  computer")
       .action(async (name) => {
        const vm = await start(name);
        console.log(vm);
       });

program.command("stop <name>")
       .description("stop a  computer")
       .action(async (name) => {
        const vm = await stop(name);
        console.log(vm);
       });

program.command("destroy <name>")
       .description("destroy a computer")
       .action(async (name) => {
        const vm = await destroy(name);
        console.log(vm);
       });

program.command("trust <name>")
       .description("set up ssh access to a computer")
       .action(async (name) => {
        await trust(name);
        await copyId(name);
       });

program.command("provision <name>")
       .description("provision a computer")
       .action(async (name) => {
        await provision(name);
       });


program.parse();
