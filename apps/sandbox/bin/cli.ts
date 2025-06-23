import path from "path";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { makeTable } from "@director.run/utilities/cli/index";
import packageJson from "../package.json";
import { clone } from "../src/commands/clone.ts";
import { create } from "../src/commands/create.ts";
import { destroy } from "../src/commands/destroy.ts";
import { list } from "../src/commands/list.ts";
import { provision } from "../src/commands/provision.ts";
import { ssh } from "../src/commands/ssh.ts";
import { start } from "../src/commands/start.ts";
import { stop } from "../src/commands/stop.ts";

const DEFAULT_IMAGE = "ghcr.io/cirruslabs/ubuntu:latest";
const DEFAULT_USER = "admin";
const DEFAULT_PASSWORD = "admin";
const DEFAULT_MOUNT = `director:${path.join(__dirname, "../../../")}`; // source file

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
    const vm = await create({
      name,
      image: DEFAULT_IMAGE,
    });
    if (options.start) {
      await start(name, {
        mount: DEFAULT_MOUNT,
      });
    } else {
      console.log(vm);
    }
  });

program
  .command("clone <src> <dest>")
  .option("--start", "Start the VM after creation")
  .description("Clone a VM")
  .action(async (src, dest, options) => {
    const vm = await clone({
      src,
      dest,
    });
    if (options.start) {
      await start(dest, {
        mount: DEFAULT_MOUNT,
      });
    } else {
      console.log(vm);
    }
  });

program
  .command("start <name>")
  .description("start a VM")
  .action(async (name) => {
    await start(name, {
      mount: DEFAULT_MOUNT,
    });
  });

program
  .command("stop <name>")
  .description("stop a VM")
  .action(async (name) => {
    await stop(name);
  });

program
  .command("ssh <name>")
  .description("ssh into a VM")
  .action(async (name) => {
    await ssh({
      name,
      user: DEFAULT_USER,
      password: DEFAULT_PASSWORD,
    });
  });

program
  .command("destroy <name>")
  .alias("rm")
  .description("destroy a VM")
  .action(async (name) => {
    await destroy(name);
  });

program
  .command("destroy-all")
  .description("destroy all VMs")
  .action(async () => {
    const vms = await list();
    for (const vm of vms) {
      await destroy(vm.name);
    }
  });

program
  .command("provision <name>")
  .description("provision a VM")
  .action(async (name, options) => {
    await provision({
      name,
      password: DEFAULT_PASSWORD,
      user: DEFAULT_USER,
    });
  });

program.parse();
