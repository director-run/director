import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { makeTable } from "@director.run/utilities/cli/index";
import packageJson from "../package.json";
import { create } from "../src/commands/create.ts";
import {} from "../src/commands/create.ts";
import { destroy, provision, stop } from "../src/commands/index.ts";
import { list } from "../src/commands/list.ts";
import { start } from "../src/commands/start.ts";

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
    const table = makeTable(["Name", "State", "IP"]);
    vms.forEach((vm) => {
      table.push([vm.name, vm.state, vm.ip || "--"]);
    });
    console.log(table.toString());
  });

program
  .command("create <name>")
  .option("--start", "Start the VM after creation")
  .description("Create a new VM")
  .action(async (name, options) => {
    const vm = await create(name);
    if (options.start) {
      await start(name);
    } else {
      console.log(vm);
    }
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
  .command("provision <name>")
  .description("provision a VM")
  .action(async (name) => {
    await provision(name);
  });

program.parse();
