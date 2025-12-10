import { faker } from "@faker-js/faker";
import type { Prompt } from "../capabilities/prompt-manager";
import {
  type PlaybookHTTPTarget,
  type PlaybookStdioTarget,
} from "../playbooks/playbook";

export const makeHTTPTargetConfig = (params: {
  name: string;
  url: string;
  headers?: Record<string, string>;
}): PlaybookHTTPTarget => ({
  name: params.name,
  type: "http",
  url: params.url,
  headers: params.headers,
});

export const makeStdioTargetConfig = (params: {
  name: string;
  command: string;
  args: string[];
}): PlaybookStdioTarget => ({
  name: params.name,
  type: "stdio",
  command: params.command,
  args: params.args,
});

export function makeFooBarServerStdioConfig() {
  return makeStdioTargetConfig({
    name: "foo",
    command: "bun",
    args: [
      "-e",
      `
      import { makeFooBarServer } from "@director.run/mcp/test/fixtures";
      import { serveOverStdio } from "@director.run/mcp/transport";
      serveOverStdio(makeFooBarServer());
    `,
    ],
  });
}

export function makePrompt(params: Partial<Prompt> = {}) {
  return {
    name: [faker.company.buzzNoun(), faker.company.buzzVerb()]
      .map((w) => w.toLowerCase())
      .join("-"),
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    ...params,
  };
}
