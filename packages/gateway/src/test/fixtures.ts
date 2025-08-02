import type { Prompt } from "../capabilities/prompt-manager";
import { faker } from "@faker-js/faker";

export const makeHTTPTargetConfig = (params: { name: string; url: string; headers?: Record<string, string> }) => ({
  name: params.name,
  transport: {
    type: "http" as const,
    url: params.url,
    headers: params.headers,
  },
});

export const makeStdioTargetConfig = (params: {
  name: string;
  command: string;
  args: string[];
}) => ({
  name: params.name,
  transport: {
    type: "stdio" as const,
    command: params.command,
    args: params.args,
  },
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