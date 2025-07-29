import { z } from "zod";
import { SimpleServer } from "../simple-server";
import type { ProxyTargetAttributes } from "@director.run/utilities/schema";

export function makeEchoServer() {
  const server = new SimpleServer("echo-server");
  server
    .tool("echo")
    .description("Echo a message")
    .schema(z.object({ message: z.string() }))
    .handle(async ({ message }) => {
      return { message };
    });
  return server;
}

export function makeFooBarServer() {
  const server = new SimpleServer("echo-server");
  server
    .tool("foo")
    .description("Foo the bar")
    .schema(z.object({ message: z.string() }))
    .handle(async ({ message }) => {
      return { message };
    });
  return server;
}


export function makeKitchenSinkServer() {
  const server = new SimpleServer("kitchen-sink-server");
  server
    .tool("ping")
    .description("returns a pong message")
    .schema(z.object({}))
    .handle(async () => {
      return { message: "pong" };
    });

  server
    .tool("add")
    .description("adds two numbers")
    .schema(z.object({ a: z.number(), b: z.number() }))
    .handle(async ({ a, b }) => {
      return { result: a + b };
        });

  server
    .tool("subtract")
    .description("subtracts two numbers")
    .schema(z.object({ a: z.number(), b: z.number() }))
    .handle(async ({ a, b }) => {
      return { result: a - b };
    });


  server
    .tool("multiply")
    .description("multiplies two numbers")
    .schema(z.object({ a: z.number(), b: z.number() }))
    .handle(async ({ a, b }) => {
      return { result: a * b };
    });

  return server;
}




export function makeHTTPTargetConfig(params: { name: string; url: string }): ProxyTargetAttributes {
  return {
    name: params.name,
    transport: {
      type: "http",
      url: params.url,
    },
  };
}

