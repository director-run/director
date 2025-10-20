import type { Prompt } from "@director.run/gateway/capabilities/prompt-manager";
import { makeTable } from "@director.run/utilities/cli/index";

export function listPrompts(prompts?: Prompt[]) {
  if (!prompts || prompts.length === 0) {
    console.log("No prompts configured for this playbook.");
  } else {
    const table = makeTable(["name", "title", "description"]);
    table.push(
      ...prompts.map((prompt) => [
        prompt.name,
        prompt.title,
        prompt.description || "",
      ]),
    );
    console.log(table.toString());
  }
}
