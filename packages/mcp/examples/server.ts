import { z } from "zod";
import { SimpleServer } from "../src/simple-server";
import { serveOverSSE, serveOverStreamable } from "../src/transport";

async function main() {
  const fooServer = new SimpleServer("foo");
  const barServer = new SimpleServer("bar");

  fooServer
    .tool("foo")
    .schema(
      z.object({
        name: z.string(),
        age: z.number(),
      }),
    )
    .description("A test tool")
    .handle(({ name, age }) => {
      return Promise.resolve({
        status: "success",
        data: {
          name,
          age,
          message: `Hello ${name}, you are ${age} years old`,
        },
      });
    });

  barServer
    .tool("bar")
    .schema(z.object({}))
    .description("I print bar")
    .handle(({}) => {
      return Promise.resolve({
        status: "success",
        data: {
          message: `bar response`,
        },
      });
    });

  await serveOverStreamable(fooServer, 9001);
  await serveOverSSE(barServer, 9002);
}

main();
