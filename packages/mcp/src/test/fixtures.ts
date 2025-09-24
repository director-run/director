import path from "path";
import { z } from "zod";
import { StdioClient } from "../client/stdio-client";
import { SimpleServer } from "../simple-server";

export function makeEchoServer() {
  const server = new SimpleServer("echo-server");
  server
    .tool("echo")
    .description("Echo a message")
    .schema(z.object({ message: z.string() }))
    .handle(({ message }) => {
      return Promise.resolve({ message });
    });
  return server;
}

export function makeFooBarServer() {
  const server = new SimpleServer("echo-server");
  server
    .tool("foo")
    .description("Foo the bar")
    .schema(z.object({ message: z.string() }))
    .handle(({ message }) => {
      return Promise.resolve({ message });
    });
  return server;
}

export function makeKitchenSinkServer() {
  const server = new SimpleServer("kitchen-sink-server");
  server
    .tool("ping")
    .description("returns a pong message")
    .schema(z.object({}))
    .handle(() => {
      return Promise.resolve({ message: "pong" });
    });

  server
    .tool("add")
    .description("adds two numbers")
    .schema(z.object({ a: z.number(), b: z.number() }))
    .handle(({ a, b }) => {
      return Promise.resolve({ result: a + b });
    });

  server
    .tool("subtract")
    .description("subtracts two numbers")
    .schema(z.object({ a: z.number(), b: z.number() }))
    .handle(({ a, b }) => {
      return Promise.resolve({ result: a - b });
    });

  server
    .tool("multiply")
    .description("multiplies two numbers")
    .schema(z.object({ a: z.number(), b: z.number() }))
    .handle(({ a, b }) => {
      return Promise.resolve({ result: a * b });
    });

  return server;
}

export function makeEchoServerStdioClient(): StdioClient {
  return new StdioClient({
    name: "echo-server-stdio-client",
    command: "bun",
    args: [
      "-e",
      `
          import { makeEchoServer } from '${path.join(__dirname, "fixtures.ts")}'; 
          import { serveOverStdio } from '${path.join(__dirname, "../transport.ts")}'; 
          serveOverStdio(makeEchoServer());
      `,
    ],
  });
}
