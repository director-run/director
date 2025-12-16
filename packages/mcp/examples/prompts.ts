import { z } from "zod";
import { SimpleServer } from "../src/simple-server";
import { serveOverStreamable } from "../src/transport";

async function main() {
  const server = new SimpleServer("prompts-example");

  server
    .tool("greet")
    .schema(
      z.object({
        name: z.string().describe("Name to greet"),
      }),
    )
    .description("A simple greeting tool")
    .handle(({ name }) => {
      return Promise.resolve({
        greeting: `Hello, ${name}!`,
      });
    });

  server
    .prompt("greeting-template")
    .schema(
      z.object({
        name: z.string().describe("Name to include in greeting"),
      }),
    )
    .description("A simple greeting prompt template")
    .handle(({ name }) => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Please greet ${name} in a friendly manner.`,
            },
          },
        ],
      };
    });

  await serveOverStreamable(server, 9001);
}

main();
