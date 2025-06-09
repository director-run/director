import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import packageJson from "../package.json";
import {
  copyId,
  create,
  destroy,
  list,
  provision,
  start,
  stop,
  trust,
} from "../src/commands";

const program = new DirectorCommand();

program
  .name("director-sandbox")
  .description("A tool for running director inside a VM")
  .version(packageJson.version);

program
  .command("list")
  .alias("ls")
  .description("List all VMs")
  .action(async () => {
    const vms = await list();
    console.log(vms);
  });

program
  .command("create <name>")
  .description("Create a new VM")
  .action(async (name) => {
    const vm = await create(name);
    console.log(vm);
  });

program
  .command("start <name>")
  .description("start a VM")
  .action(async (name) => {
    const vm = await start(name);
    console.log(vm);
  });

program
  .command("stop <name>")
  .description("stop a VM")
  .action(async (name) => {
    const vm = await stop(name);
    console.log(vm);
  });

program
  .command("destroy <name>")
  .description("destroy a VM")
  .action(async (name) => {
    const vm = await destroy(name);
    console.log(vm);
  });

program
  .command("trust <name>")
  .description("set up ssh access to a VM")
  .action(async (name) => {
    await trust(name);
    await copyId(name);
  });

program
  .command("provision <name>")
  .description("provision a VM")
  .action(async (name) => {
    await provision(name);
  });

program.parse();
